import type { AuthConfig, AuthLocals } from "../types/auth.js";
export type ResolvedDefaults = {
    urlConfig: {
        login: string;
        afterLogin: string;
        afterLogout: string;
    };
    cookieConfig: {
        secure: boolean;
    };
    autoCreateSession: boolean;
    requireVerifiedEmailForLinking: boolean;
    isAuthenticated: (locals: AuthLocals) => boolean;
};
export declare function validateConfig(config: AuthConfig): void;
export declare function resolveDefaults(config: AuthConfig): ResolvedDefaults;
