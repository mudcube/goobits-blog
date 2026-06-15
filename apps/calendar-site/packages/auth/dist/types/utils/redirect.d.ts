export declare function isSafeRedirectPath(value: string): boolean;
export type SafeRedirectOptions = {
    allowedPrefixes?: readonly string[];
    baseUrl?: string;
};
export declare function normalizeSafeRedirectPath(value: unknown, options?: SafeRedirectOptions): string | null;
