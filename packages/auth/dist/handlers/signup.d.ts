import type { RequestEventLike } from "../types/auth.js";
import type { User } from "../types/index.js";
import type { VerificationTokenAdapter } from "../adapters/verification-token/base.js";
type RateLimitConfig = {
    check?: (key: string) => Promise<{
        allowed: boolean;
    }>;
    key?: (event: RequestEventLike) => string;
    trustProxyHeader?: boolean;
};
/**
 * Create a signup handler for credentials-based authentication
 * @param {Object} config - Handler configuration
 * @param {import('../providers/credentials.ts').CredentialsProvider} config.credentialsProvider - Credentials provider
 * @param {import('../adapters/database/base.ts').UserAdapter} config.userAdapter - User adapter
 * @param {import('../adapters/session/base.ts').SessionAdapter} config.sessionAdapter - Session adapter
 * @param {import('../adapters/verification-token/base.ts').VerificationTokenAdapter} [config.verificationTokenAdapter] - Verification token adapter (optional)
 * @param {Function} [config.onSignup] - Callback after user creation (user) => Promise<void>
 * @param {Function} [config.sendVerificationEmail] - Function to send verification email (email, token) => Promise<void>
 * @param {Object} [config.csrf] - CSRF validation config
 * @param {Function} [config.csrf.validate] - Async function (event) => boolean
 * @param {string} [config.csrf.errorMessage] - Error message for invalid CSRF
 * @param {Object} [config.rateLimit] - Rate limit config
 * @param {Function} [config.rateLimit.check] - Async function (key) => { allowed }
 * @param {Function} [config.rateLimit.key] - Function (event) => string for rate limit key
 * @param {string} [config.redirectTo] - Redirect URL after signup (default: '/')
 * @param {boolean} [config.autoLogin] - Automatically log in user after signup (default: true)
 * @returns {Function} SvelteKit request handler
 */
export declare function createSignupHandler(config: {
    credentialsProvider: {
        signUp: (input: {
            email: string;
            password: string;
            name?: string;
            userAdapter: unknown;
        }) => Promise<User>;
    };
    userAdapter: {
        getUserByEmail: (email: string) => Promise<User | null>;
    };
    sessionAdapter?: {
        createSession: (userId: string) => Promise<{
            id: string;
            expiresAt: Date;
        }>;
        setSessionCookie: (cookies: RequestEventLike["cookies"], session: {
            id: string;
            expiresAt: Date;
        }) => void;
    };
    verificationTokenAdapter?: VerificationTokenAdapter;
    onSignup?: (user: User | null) => Promise<void> | void;
    sendVerificationEmail?: (email: string, token: string) => Promise<void> | void;
    csrf?: {
        validate?: (event: RequestEventLike) => Promise<boolean>;
        errorMessage?: string;
    };
    rateLimit?: RateLimitConfig;
    redirectTo?: string;
    autoLogin?: boolean;
    sanitizeUser?: (user: User | null) => User | null;
}): (event: RequestEventLike) => Promise<{
    error: string;
    success: boolean;
    user?: never;
} | {
    success: boolean;
    user: User | null;
    error?: never;
}>;
export {};
//# sourceMappingURL=signup.d.ts.map