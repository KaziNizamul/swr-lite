import { useCallback, useRef } from 'react';

interface CacheItem<T> {
    data: T;
    expiry: number;
}

const globalCache = new Map<string, CacheItem<any>>();

export const useCache = <T>(key: string, cacheTime: number) => {
    const cacheRef = useRef(globalCache);

    const setCache = useCallback((data: T) => {
        cacheRef.current.set(key, { data, expiry: Date.now() + cacheTime });
    }, [key, cacheTime]);

    const getCache = useCallback((): T | null => {
        const item = cacheRef.current.get(key);
        return item && item.expiry > Date.now() ? item.data : null;
    }, [key]);

    const hasValidCache = useCallback((): boolean => {
        const item = cacheRef.current.get(key);
        return !!item && item.expiry > Date.now();
    }, [key]);

    const invalidateCache = useCallback(() => {
        cacheRef.current.delete(key);
    }, [key]);

    return { setCache, getCache, hasValidCache, invalidateCache };
};