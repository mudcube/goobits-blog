import { type Handle, type RequestHandler } from "@sveltejs/kit";
import type { AuthConfig, RequestEventLike } from "./types/auth.js";
import type { Session, User } from "./types/index.js";
type AuthPrincipal = {
    session: Session;
    user: User;
};
type AuthHandlersBundle = {
    GET: RequestHandler;
    POST: RequestHandler;
};
type RoleResolver = (user: User) => string[];
export type GoobitsAuthRoutingConfig = {
    basePath?: string;
    signInPath?: string;
    signOutPath?: string;
};
export type GoobitsAuthConfig = Omit<AuthConfig, "adapters"> & {
    adapter: AuthConfig["adapters"];
    routing?: GoobitsAuthRoutingConfig;
};
export declare class GoobitsAuth {
    private readonly core;
    private readonly routing;
    private readonly defaultHandlers;
    constructor(config: GoobitsAuthConfig);
    get adapter(): {
        session: import("./adapters/index.ts").SessionAdapter;
        user?: import("./adapters/index.ts").UserAdapter;
        oauthToken?: import("./adapters/index.ts").TokenAdapter;
        verificationToken?: import("./adapters/index.ts").VerificationTokenAdapter;
        magicLink?: import("./adapters/index.ts").MagicLinkAdapter;
        mfa?: import("./adapters/index.ts").MfaAdapter;
        webauthn?: import("./adapters/index.ts").WebAuthnAdapter;
    } | ({
        session: import("./adapters/index.ts").SessionAdapter;
        user?: import("./adapters/index.ts").UserAdapter;
        oauthToken?: import("./adapters/index.ts").TokenAdapter;
        verificationToken?: import("./adapters/index.ts").VerificationTokenAdapter;
        magicLink?: import("./adapters/index.ts").MagicLinkAdapter;
        mfa?: import("./adapters/index.ts").MfaAdapter;
        webauthn?: import("./adapters/index.ts").WebAuthnAdapter;
    } & {
        magicLink: import("./adapters/index.ts").MagicLinkAdapter;
    }) | ({
        session: import("./adapters/index.ts").SessionAdapter;
        user?: import("./adapters/index.ts").UserAdapter;
        oauthToken?: import("./adapters/index.ts").TokenAdapter;
        verificationToken?: import("./adapters/index.ts").VerificationTokenAdapter;
        magicLink?: import("./adapters/index.ts").MagicLinkAdapter;
        mfa?: import("./adapters/index.ts").MfaAdapter;
        webauthn?: import("./adapters/index.ts").WebAuthnAdapter;
    } & {
        webauthn: import("./adapters/index.ts").WebAuthnAdapter;
    }) | ({
        session: import("./adapters/index.ts").SessionAdapter;
        user?: import("./adapters/index.ts").UserAdapter;
        oauthToken?: import("./adapters/index.ts").TokenAdapter;
        verificationToken?: import("./adapters/index.ts").VerificationTokenAdapter;
        magicLink?: import("./adapters/index.ts").MagicLinkAdapter;
        mfa?: import("./adapters/index.ts").MfaAdapter;
        webauthn?: import("./adapters/index.ts").WebAuthnAdapter;
    } & {
        magicLink: import("./adapters/index.ts").MagicLinkAdapter;
        webauthn: import("./adapters/index.ts").WebAuthnAdapter;
    });
    get providers(): Record<string, import("./types/auth.js").OAuthProviderConfig>;
    get handlers(): AuthHandlersBundle;
    /**
     * Creates a SvelteKit handle hook that validates sessions and populates auth locals.
     */
    handle(): Handle;
    createHandlers(options?: {
        basePath?: string;
    }): AuthHandlersBundle;
    /**
     * Reads the current request session and caches the principal on event locals.
     */
    getSession(event: RequestEventLike): Promise<AuthPrincipal | null>;
    /**
     * Returns the current user or redirects to the configured sign-in route.
     */
    requireUser(event: RequestEventLike): Promise<User>;
    /**
     * Returns the current user when they have any required role, otherwise throws a 403.
     */
    requireRole(event: RequestEventLike, role: string | string[], options?: {
        resolveRoles?: RoleResolver;
    }): Promise<User>;
    private resolveTarget;
}
export type Auth = GoobitsAuth;
export {};
