import { encodeBase64url } from "@oslojs/encoding";
import { getRandomBytes, sha256Hex } from "./crypto.js";
export async function generateMagicLinkToken(bytesLength = 32) {
    const bytes = await getRandomBytes(bytesLength);
    return encodeBase64url(bytes);
}
export async function generateOtp(digits = 6) {
    const max = 10 ** digits;
    const bytes = await getRandomBytes(4);
    const b0 = bytes[0] ?? 0;
    const b1 = bytes[1] ?? 0;
    const b2 = bytes[2] ?? 0;
    const b3 = bytes[3] ?? 0;
    const value = ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;
    const code = value % max;
    return String(code).padStart(digits, "0");
}
export async function hashToken(token) {
    return sha256Hex(token);
}
//# sourceMappingURL=magic-link.js.map