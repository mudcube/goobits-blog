import type { AuthConfig, AuthHandlers, SecurityProfile } from "../types/auth.js";
import { type SecurityPolicySettings } from "../security/policy.js";
export type ResolvedSecurity = SecurityPolicySettings & {
    profile: SecurityProfile;
};
export declare function resolveSecurity(config: AuthConfig): ResolvedSecurity;
export declare function applyPolicies(handlers: AuthHandlers, security: ResolvedSecurity): AuthHandlers;
