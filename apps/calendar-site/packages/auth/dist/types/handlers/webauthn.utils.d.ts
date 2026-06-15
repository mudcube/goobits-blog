import { type AuthenticationResponseJSON, type AuthenticatorTransportFuture, type RegistrationResponseJSON } from "@simplewebauthn/server";
import { z } from "zod";
export type ChallengeRecord = {
    id: string;
    userId: string | null;
    challenge: string;
    type: string;
    expiresAt: string | number | Date;
};
export type CredentialRecord = {
    credentialId: string;
    userId: string;
    publicKey: string;
    counter: number;
    transports?: string[] | null;
};
export declare function toUint8Array(value: unknown): Uint8Array;
export declare function encodeCredential(value: unknown): string;
export declare const registrationResponseSchema: z.ZodCustom<RegistrationResponseJSON, RegistrationResponseJSON>;
export declare const authenticationResponseSchema: z.ZodCustom<AuthenticationResponseJSON, AuthenticationResponseJSON>;
export declare const registerVerifyRequestSchema: z.ZodObject<{
    challengeId: z.ZodString;
    credential: z.ZodCustom<RegistrationResponseJSON, RegistrationResponseJSON>;
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const loginOptionsRequestSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const loginVerifyRequestSchema: z.ZodObject<{
    challengeId: z.ZodString;
    credential: z.ZodCustom<AuthenticationResponseJSON, AuthenticationResponseJSON>;
}, z.core.$strip>;
export declare function toChallengeRecord(value: Record<string, unknown> | null): ChallengeRecord | null;
export declare function toCredentialRecord(value: Record<string, unknown> | null): CredentialRecord | null;
export declare function credentialDescriptorFromRecord(cred: Record<string, unknown>): {
    id: string;
    transports?: AuthenticatorTransportFuture[];
} | null;
export declare function toAuthenticatorTransports(transports: string[] | null | undefined): AuthenticatorTransportFuture[] | undefined;
