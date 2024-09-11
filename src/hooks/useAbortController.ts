import { useRef, useCallback } from 'react';

export const useAbortController = () => {
    const abortControllerRef = useRef<AbortController | null>(null);

    const getSignal = useCallback(() => {
        if (!abortControllerRef.current) {
            abortControllerRef.current = new AbortController();
        }
        return abortControllerRef.current.signal;
    }, []);

    const abort = useCallback(() => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
    }, []);

    return {
        signal: getSignal(),
        abort,
    };
};