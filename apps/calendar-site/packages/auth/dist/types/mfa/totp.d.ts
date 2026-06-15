export declare function generateSecret({ length }?: {
    length?: number;
}): string;
export declare function createOtpAuthURL({ secret, label, issuer, digits, period, }?: {
    secret?: string;
    label?: string;
    issuer?: string;
    digits?: number;
    period?: number;
}): string;
export declare function generateTOTP({ secret, time, digits, period, }?: {
    secret?: string;
    time?: number;
    digits?: number;
    period?: number;
}): Promise<string>;
export declare function verifyTOTP({ secret, token, digits, period, window, time, }?: {
    secret?: string;
    token?: string;
    digits?: number;
    period?: number;
    window?: number;
    time?: number;
}): Promise<boolean>;
