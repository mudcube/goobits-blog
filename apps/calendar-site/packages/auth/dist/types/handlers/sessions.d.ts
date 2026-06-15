import type { AuthLocals, RequestEventLike } from "../types/auth.js";
import type { Session } from "../types/index.js";
import type { SessionAdapter } from "../adapters/session/base.js";
type SessionManagementAdapter = Partial<Pick<SessionAdapter, "listSessions" | "invalidateSession" | "invalidateUserSessions" | "deleteSessionCookie">>;
type SessionHandlerConfig = {
    sessionAdapter: SessionManagementAdapter;
    isAuthenticated?: (locals: AuthLocals) => boolean;
    getUser?: (locals: AuthLocals) => {
        id: string;
    };
    getSession?: (locals: AuthLocals) => Session | null;
};
export declare function createSessionListHandler(config: SessionHandlerConfig): (event: RequestEventLike) => Promise<Response>;
export declare function createSessionRevokeHandler(config: SessionHandlerConfig): (event: RequestEventLike) => Promise<Response>;
export {};
