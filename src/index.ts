import { useState, useEffect, useCallback, useRef } from 'react';
import { FetcherOptions, State } from './constants/types';
import { useCache } from './hooks/useCache';
import { useRetry } from './hooks/useRetry';
import { useAbortController } from './hooks/useAbortController';
import { defaultFetchFunction } from './utils';

export function useSWRLite<TData = unknown, TError = unknown>(
    key: string,
    url: string,
    options: FetcherOptions<TData, TError> = {}
): State<TData, TError> & { mutate: (data?: TData) => Promise<void> } {
    const {
        retryCount = 3,
        retryStrategy,
        cacheTime = 5 * 60 * 1000, // 5 minutes
        dedupingInterval = 2000, // 2 seconds
        fetchFunction = defaultFetchFunction,
        onSuccess,
        onError,
    } = options;

    const [state, setState] = useState<State<TData, TError>>({
        data: null,
        error: null,
        isValidating: false,
    });

    const cacheHandler = useCache(key, cacheTime);
    const retryHandler = useRetry(retryCount, retryStrategy);
    const abortHandler = useAbortController();

    const fetchRef = useRef(0);

    const fetchData = useCallback(async (shouldRevalidate = false) => {
        const currentFetch = ++fetchRef.current;

        if (!shouldRevalidate && cacheHandler.hasValidCache()) {
            setState((prev: any) => ({ ...prev, data: cacheHandler.getCache() }));
            return;
        }

        setState(prev => ({ ...prev, isValidating: true }));

        try {
            const data = await retryHandler.executeWithRetry(() =>
                fetchFunction(url, { signal: abortHandler.signal })
            );

            if (currentFetch === fetchRef.current) {
                cacheHandler.setCache(data);
                setState({ data, error: null, isValidating: false });
                onSuccess?.(data);
            }
        } catch (error) {
            if (currentFetch === fetchRef.current) {
                setState(prev => ({ ...prev, error, isValidating: false }));
                onError?.(error);
            }
        }
    }, [url, cacheHandler, retryHandler, abortHandler, fetchFunction, onSuccess, onError]);

    useEffect(() => {
        fetchData();

        const intervalId = setInterval(() => fetchData(true), dedupingInterval);

        return () => {
            clearInterval(intervalId);
            abortHandler.abort();
        };
    }, [fetchData, dedupingInterval, abortHandler]);

    const mutate = useCallback(async (data?: TData) => {
        if (data) {
            cacheHandler.setCache(data);
            setState((prev: any) => ({ ...prev, data }));
        } else {
            await fetchData(true);
        }
    }, [cacheHandler, fetchData]);

    return { ...state, mutate };
}

export { useCache, useRetry, useAbortController };