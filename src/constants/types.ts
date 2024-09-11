export type RetryStrategy = (attempt: number, error: any) => number;

export interface FetcherOptions<TData = unknown, TError = unknown> {
    retryCount?: number;
    retryStrategy?: RetryStrategy;
    cacheTime?: number;
    dedupingInterval?: number;
    fetchFunction?: (url: string, options?: RequestInit) => Promise<TData>;
    onSuccess?: (data: TData) => void;
    onError?: (error: TError) => void;
}

export interface State<TData, TError> {
    data: TData | null;
    error: TError | null;
    isValidating: boolean;
}