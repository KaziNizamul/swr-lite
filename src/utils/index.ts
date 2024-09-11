import { RetryStrategy } from '../constants/types';

export const defaultRetryStrategy: RetryStrategy = (attempt, error) => {
    if (error.status === 404) return 0; // Don't retry on 404 errors
    return Math.min(1000 * 2 ** attempt, 30000);
};

export const defaultFetchFunction = async (url: string, options?: RequestInit): Promise<any> => {
    const response = await fetch(url, options);
    if (!response.ok) {
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
    }
    return response.json();
};

export const logError = (error: any) => {
    console.error('Fetch error:', error);
};