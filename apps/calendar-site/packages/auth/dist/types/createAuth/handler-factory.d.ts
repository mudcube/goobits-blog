import type { AuthConfig, AuthHandlers, AuthLocals, AuthRoutes } from "../types/auth.js";
import type { User } from "../types/index.js";
import type { ResolvedDefaults } from "./config.js";
import type { ResolvedSecurity } from "./security-setup.js";
export declare function createHandlers(config: AuthConfig, defaults: ResolvedDefaults, security: ResolvedSecurity): AuthHandlers;
export declare function buildRoutes(handlers: AuthHandlers): AuthRoutes;
export declare function createUtils(isAuthenticated: (locals: AuthLocals) => boolean): {
    isAuthenticated: (locals: AuthLocals) => boolean;
    getUser: (locals: AuthLocals) => User | null | undefined;
    getSession: (locals: AuthLocals) => import("../types/core.ts").Session | null | undefined;
};
