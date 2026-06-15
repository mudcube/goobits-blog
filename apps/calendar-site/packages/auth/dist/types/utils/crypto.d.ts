/**
 * Constant-time string equality. Returns false immediately for length
 * mismatches (length itself is not secret); for equal-length inputs the
 * comparison is a fixed-iteration XOR fold with no branches.
 */
export declare function timingSafeEqual(a: string, b: string): boolean;
declare function getRandomBytes(length: number): Promise<Uint8Array>;
export declare function encryptTokens<T extends Record<string, unknown>>(tokens: T, encryptionKey: string): Promise<string>;
export declare function decryptTokens<T = Record<string, unknown>>(encryptedData: string | null, encryptionKey: string): Promise<T | null>;
export declare function generateEncryptionKey(): Promise<string>;
export declare function generateRandomUUID(): Promise<string>;
export { getRandomBytes };
export declare function sha256Hex(value: string | Uint8Array): Promise<string>;
