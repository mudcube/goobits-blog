import type { AuthConfig, AuthHandlers, AuthLocals, AuthRoutes, OAuthProviderConfig, SecurityProfile } from "./types/auth.js";
import type { User } from "./types/index.js";
import { type SecurityPolicySettings } from "./security/policy.js";
type ResolvedSecurity = SecurityPolicySettings & {
    profile: SecurityProfile;
};
export declare function createAuth(config: AuthConfig): {
    adapters: {
        session: import("./adapters/index.js").SessionAdapter;
        user?: import("./adapters/index.js").UserAdapter;
        oauthToken?: import("./adapters/index.js").TokenAdapter;
        verificationToken?: import("./adapters/index.js").VerificationTokenAdapter;
        magicLink?: import("./adapters/index.js").MagicLinkAdapter;
        webauthn?: import("./adapters/index.js").WebAuthnAdapter;
    } | ({
        session: import("./adapters/index.js").SessionAdapter;
        user?: import("./adapters/index.js").UserAdapter;
        oauthToken?: import("./adapters/index.js").TokenAdapter;
        verificationToken?: import("./adapters/index.js").VerificationTokenAdapter;
        magicLink?: import("./adapters/index.js").MagicLinkAdapter;
        webauthn?: import("./adapters/index.js").WebAuthnAdapter;
    } & {
        magicLink: import("./adapters/index.js").MagicLinkAdapter;
    }) | ({
        session: import("./adapters/index.js").SessionAdapter;
        user?: import("./adapters/index.js").UserAdapter;
        oauthToken?: import("./adapters/index.js").TokenAdapter;
        verificationToken?: import("./adapters/index.js").VerificationTokenAdapter;
        magicLink?: import("./adapters/index.js").MagicLinkAdapter;
        webauthn?: import("./adapters/index.js").WebAuthnAdapter;
    } & {
        webauthn: import("./adapters/index.js").WebAuthnAdapter;
    }) | ({
        session: import("./adapters/index.js").SessionAdapter;
        user?: import("./adapters/index.js").UserAdapter;
        oauthToken?: import("./adapters/index.js").TokenAdapter;
        verificationToken?: import("./adapters/index.js").VerificationTokenAdapter;
        magicLink?: import("./adapters/index.js").MagicLinkAdapter;
        webauthn?: import("./adapters/index.js").WebAuthnAdapter;
    } & {
        magicLink: import("./adapters/index.js").MagicLinkAdapter;
        webauthn: import("./adapters/index.js").WebAuthnAdapter;
    });
    providers: Record<string, OAuthProviderConfig>;
    urls: {
        login: string;
        afterLogin: string;
        afterLogout: string;
    };
    cookies: {
        secure: boolean;
    };
    profile: SecurityProfile;
    security: ResolvedSecurity;
    hooks: import("./types/auth.js").AuthHooks;
    handlers: AuthHandlers;
    routes: AuthRoutes;
    utils: {
        isAuthenticated: (locals: AuthLocals) => boolean;
        getUser: (locals: AuthLocals) => User | null | undefined;
        getSession: (locals: AuthLocals) => import("./types/core.js").Session | null | undefined;
    };
};
export {};
//# sourceMappingURL=createAuth.d.ts.map