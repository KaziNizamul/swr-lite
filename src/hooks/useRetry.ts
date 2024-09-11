import { useCallback } from 'react';
import { RetryStrategy } from '../constants/types';
import { defaultRetryStrategy } from '../utils';

export const useRetry = (maxRetries: number, strategy: RetryStrategy = defaultRetryStrategy) => {
    const executeWithRetry = useCallback(
        async <T>(callback: () => Promise<T>): Promise<T> => {
            let retryAttempt = 0;

            while (retryAttempt <= maxRetries) {
                try {
                    return await callback();
                } catch (error) {
                    if (retryAttempt < maxRetries) {
                        retryAttempt++;
                        const delay = strategy(retryAttempt, error);
                        if (delay === 0) throw error; // Don't retry if delay is 0
                        await new Promise((resolve) => setTimeout(resolve, delay));
                    } else {
                        throw error;
                    }
                }
            }
            throw new Error('Exceeded maximum retry attempts');
        },
        [maxRetries, strategy]
    );

    return { executeWithRetry };
};