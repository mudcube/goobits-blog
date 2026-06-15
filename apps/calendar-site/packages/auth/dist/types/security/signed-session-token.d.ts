export type SignedSessionTokenClaims = {
    subject: string;
    sessionId: string;
    expiresAt: number;
};
export type CreateSignedSessionTokenOptions = {
    subject: string;
    secret: string;
    sessionId?: string;
    expiresAt?: number;
    ttlMs?: number;
};
export type VerifySignedSessionTokenOptions = {
    secret: string;
};
/**
 * Create a signed, expiring session token with a caller-controlled subject.
 *
 * @param options - Token subject, signing secret, and optional expiry/session id.
 * @returns A signed token string safe for cookie storage.
 */
export declare function createSignedSessionToken({ subject, secret, sessionId, expiresAt, ttlMs, }: CreateSignedSessionTokenOptions): Promise<string>;
/**
 * Verify a signed session token and return its claims.
 *
 * @param token - Signed token returned by createSignedSessionToken.
 * @param options - Verification secret.
 * @returns Token claims, or null when the token is invalid or expired.
 */
export declare function verifySignedSessionToken(token: string, { secret }: VerifySignedSessionTokenOptions): Promise<SignedSessionTokenClaims | null>;
