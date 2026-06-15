import type { AuthConfig } from "./types/auth.js";
export declare function createAuth(config: AuthConfig): {
    adapters: {
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
    providers: Record<string, import("./types/auth.js").OAuthProviderConfig>;
    urls: {
        login: string;
        afterLogin: string;
        afterLogout: string;
    };
    cookies: {
        secure: boolean;
    };
    profile: import("./types/auth.js").SecurityProfile;
    security: import("./createAuth/security-setup.js").ResolvedSecurity;
    hooks: import("./types/auth.js").AuthHooks;
    handlers: import("./types/auth.js").AuthHandlers;
    routes: import("./types/auth.js").AuthRoutes;
    utils: {
        isAuthenticated: (locals: import("./types/auth.js").AuthLocals) => boolean;
        getUser: (locals: import("./types/auth.js").AuthLocals) => import("./types/core.ts").User | null | undefined;
        getSession: (locals: import("./types/auth.js").AuthLocals) => import("./types/core.ts").Session | null | undefined;
    };
};
