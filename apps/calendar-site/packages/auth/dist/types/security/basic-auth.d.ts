export type BasicAuthCredentials = {
    username: string;
    password: string;
};
export type BasicAuthPasswordVerifier = (storedHash: string, password: string) => Promise<boolean>;
export type VerifyBasicAuthOptions = {
    authHeader: string | null;
    getPasswordHash: (username: string) => string | null | undefined | Promise<string | null | undefined>;
    verifyPassword: BasicAuthPasswordVerifier;
};
/**
 * Parse an HTTP Basic Authorization header into username/password credentials.
 *
 * @param authHeader - Raw Authorization header value.
 * @returns Parsed credentials, or null when the header is absent or malformed.
 */
export declare function parseBasicAuthHeader(authHeader: string | null): BasicAuthCredentials | null;
/**
 * Verify an HTTP Basic Authorization header against a caller-provided password hash resolver.
 *
 * @param options - Basic auth header, hash resolver, and optional password verifier.
 * @returns The authenticated username, or null when verification fails.
 */
export declare function verifyBasicAuthHeader({ authHeader, getPasswordHash, verifyPassword, }: VerifyBasicAuthOptions): Promise<string | null>;
/**
 * Create a standard Basic-auth challenge response.
 *
 * @param options - Optional response realm and body.
 * @returns A 401 Response with a WWW-Authenticate challenge.
 */
export declare function createBasicAuthResponse({ realm, body, }?: {
    realm?: string;
    body?: BodyInit;
}): Response;
