import { timingSafeEqual } from "../utils/crypto.js";
export declare function createAdminApiKey({ prefix, bytes, }?: {
    prefix?: string;
    bytes?: number;
}): Promise<string>;
export declare function hashAdminApiKey(apiKey: string, { salt }?: {
    salt?: string;
}): Promise<string>;
export declare function verifyAdminApiKey(apiKey: string, hashed: string, { salt }?: {
    salt?: string;
}): Promise<boolean>;
export declare function parseApiKeyHeader(value: string | null): string | null;
export { timingSafeEqual };
