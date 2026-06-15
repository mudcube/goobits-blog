export type RateLimitStore = {
    get: (key: string) => Promise<{
        count: number;
        resetAt: number;
    } | null>;
    set: (key: string, value: {
        count: number;
        resetAt: number;
    }, ttlMs?: number) => Promise<void>;
    delete: (key: string) => Promise<void>;
};
export declare class MemoryRateLimitStore implements RateLimitStore {
    private _data;
    private maxSize;
    constructor(options?: {
        maxSize?: number;
    });
    get(key: string): Promise<{
        count: number;
        resetAt: number;
    } | null>;
    set(key: string, value: {
        count: number;
        resetAt: number;
    }): Promise<void>;
    delete(key: string): Promise<void>;
    private compact;
    private evictOldest;
}
type KVNamespaceLike = {
    get: (key: string, options?: {
        type: "json";
    }) => Promise<unknown>;
    put: (key: string, value: string, options?: {
        expirationTtl: number;
    }) => Promise<void>;
    delete: (key: string) => Promise<void>;
};
export declare class KVRateLimitStore {
    private namespace;
    private ttlSeconds;
    constructor(namespace: KVNamespaceLike, options?: {
        ttlSeconds?: number | null;
    });
    get(key: string): Promise<{
        count: number;
        resetAt: number;
    } | null>;
    set(key: string, value: {
        count: number;
        resetAt: number;
    }, ttlMs?: number): Promise<void>;
    delete(key: string): Promise<void>;
}
type RateLimiterConfig = {
    store?: RateLimitStore;
    windowMs?: number;
    max?: number;
    keyPrefix?: string;
};
type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    resetAt: number;
};
export declare function createRateLimiter({ store, windowMs, max, keyPrefix, }?: RateLimiterConfig): (key: string) => Promise<RateLimitResult>;
export {};
