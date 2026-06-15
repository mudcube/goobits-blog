import type { OnLoginMode, RequestEventLike } from "../types/auth.js";
import type { SessionAdapter } from "../adapters/session/base.js";
type SessionLoginAdapter = Pick<SessionAdapter, "createSession"> & Partial<Pick<SessionAdapter, "setSessionCookie">>;
export declare function ensureSessionAfterLogin(input: {
    event: RequestEventLike;
    sessionAdapter: SessionLoginAdapter;
    userId: string | null;
    autoCreateSession?: boolean;
    onLoginMode?: OnLoginMode;
}): Promise<string>;
export {};
