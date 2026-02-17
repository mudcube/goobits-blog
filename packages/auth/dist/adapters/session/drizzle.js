import { SessionAdapter } from "./base.js";
import { encodeBase64url } from "@oslojs/encoding";
import { eq } from "drizzle-orm";
function toUser(row) {
    if (!row)
        return null;
    const id = row["id"];
    const email = row["email"];
    const name = row["name"];
    const avatar = row["avatar"] ?? null;
    const emailVerified = row["emailVerified"] ?? row["email_verified"] ?? false;
    if (typeof id !== "string" && typeof id !== "number")
        return null;
    if (typeof email !== "string")
        return null;
    if (typeof name !== "string")
        return null;
    if (avatar !== null && typeof avatar !== "string")
        return null;
    if (typeof emailVerified !== "boolean" &&
        emailVerified !== 0 &&
        emailVerified !== 1) {
        return null;
    }
    return {
        id: String(id),
        email,
        name,
        avatar,
        emailVerified: Boolean(emailVerified),
    };
}
function toSession(row) {
    if (!row)
        return null;
    const id = row["id"];
    const userId = row["userId"] ?? row["user_id"];
    const expiresAt = row["expiresAt"] ?? row["expires_at"];
    if (typeof id !== "string")
        return null;
    if (typeof userId !== "string" && typeof userId !== "number")
        return null;
    if (!(expiresAt instanceof Date) && typeof expiresAt !== "string")
        return null;
    const expiresDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
    if (Number.isNaN(expiresDate.getTime()))
        return null;
    return {
        id,
        userId: String(userId),
        expiresAt: expiresDate,
    };
}
function pickSessionMetadata(metadata) {
    const values = {};
    for (const [key, value] of Object.entries(metadata)) {
        values[key] = value;
    }
    return values;
}
export class DrizzleSessionAdapter extends SessionAdapter {
    db;
    sessionsTable;
    usersTable;
    sessionLifetime;
    sessionRefreshThreshold;
    cookieName;
    secureCookies;
    sanitizeUser;
    constructor(db, options = {}) {
        super();
        if (!options.sessionsTable || !options.usersTable) {
            throw new Error("DrizzleSessionAdapter requires sessionsTable and usersTable options");
        }
        this.db = db;
        this.sessionsTable = options.sessionsTable;
        this.usersTable = options.usersTable;
        this.sessionLifetime = options.sessionLifetime || 30 * 24 * 60 * 60 * 1000;
        this.sessionRefreshThreshold =
            options.sessionRefreshThreshold || this.sessionLifetime / 2;
        this.cookieName = options.cookieName || "session";
        this.secureCookies = options.secureCookies !== false;
        this.sanitizeUser = options.sanitizeUser || this._defaultSanitizeUser;
    }
    _defaultSanitizeUser(user) {
        return user;
    }
    _generateSessionId() {
        const bytes = new Uint8Array(20);
        crypto.getRandomValues(bytes);
        // Cookie values are not reliably percent-decoded by all runtimes. Avoid '=' padding
        // so we never emit values that need encoding like `%3D`.
        return encodeBase64url(bytes).replace(/=+$/g, "");
    }
    async createSession(userId, metadata = {}) {
        const sessionId = this._generateSessionId();
        const expiresAt = new Date(Date.now() + this.sessionLifetime);
        await this.db.insert(this.sessionsTable).values({
            id: sessionId,
            userId,
            expiresAt,
            ...pickSessionMetadata(metadata),
        });
        return { id: sessionId, userId, expiresAt };
    }
    async validateSession(sessionId) {
        const [result] = await this.db
            .select({
            user: this.usersTable,
            session: this.sessionsTable,
        })
            .from(this.sessionsTable)
            .innerJoin(this.usersTable, eq(this.sessionsTable.userId, this.usersTable.id))
            .where(eq(this.sessionsTable.id, sessionId));
        if (!result)
            return { session: null, user: null };
        const session = toSession(result["session"] ?? null);
        if (!session)
            return { session: null, user: null };
        if (Date.now() >= session.expiresAt.getTime()) {
            await this.db
                .delete(this.sessionsTable)
                .where(eq(this.sessionsTable.id, sessionId));
            return { session: null, user: null };
        }
        const shouldRefresh = Date.now() >= session.expiresAt.getTime() - this.sessionRefreshThreshold;
        if (shouldRefresh) {
            session.expiresAt = new Date(Date.now() + this.sessionLifetime);
            session.fresh = true;
            await this.db
                .update(this.sessionsTable)
                .set({ expiresAt: session.expiresAt })
                .where(eq(this.sessionsTable.id, sessionId));
        }
        return {
            session,
            user: this.sanitizeUser(toUser(result["user"] ?? null)),
        };
    }
    async invalidateSession(sessionId) {
        await this.db
            .delete(this.sessionsTable)
            .where(eq(this.sessionsTable.id, sessionId));
    }
    async invalidateUserSessions(userId) {
        await this.db
            .delete(this.sessionsTable)
            .where(eq(this.sessionsTable.userId, userId));
    }
    async listSessions(userId) {
        const rows = await this.db
            .select()
            .from(this.sessionsTable)
            .where(eq(this.sessionsTable.userId, userId));
        const sessions = [];
        for (const row of rows) {
            const session = toSession(row);
            if (session)
                sessions.push(session);
        }
        return sessions;
    }
    setSessionCookie(cookies, session) {
        cookies.set(this.cookieName, session.id, {
            httpOnly: true,
            secure: this.secureCookies,
            sameSite: "lax",
            path: "/",
            expires: session.expiresAt,
        });
    }
    deleteSessionCookie(cookies) {
        cookies.delete(this.cookieName, {
            path: "/",
        });
    }
}
//# sourceMappingURL=drizzle.js.map