import { SessionAdapter } from "./base.js";
import { encodeBase64url } from "@oslojs/encoding";
export class D1SessionAdapter extends SessionAdapter {
    db;
    sessionsTable;
    usersTable;
    sessionLifetime;
    sessionRefreshThreshold;
    cookieName;
    secureCookies;
    sanitizeUser;
    columns;
    userColumns;
    constructor(db, options = {}) {
        super();
        this.db = db;
        this.sessionsTable = options.sessionsTable || "sessions";
        this.usersTable = options.usersTable || "users";
        this.sessionLifetime = options.sessionLifetime || 30 * 24 * 60 * 60 * 1000;
        this.sessionRefreshThreshold =
            options.sessionRefreshThreshold || this.sessionLifetime / 2;
        this.cookieName = options.cookieName || "session";
        this.secureCookies = options.secureCookies !== false;
        this.sanitizeUser = options.sanitizeUser || this._defaultSanitizeUser;
        this.columns = {
            sessionId: options.columns?.sessionId || "id",
            userId: options.columns?.userId || "user_id",
            expiresAt: options.columns?.expiresAt || "expires_at",
            createdAt: options.columns?.createdAt || null,
            lastActiveAt: options.columns?.lastActiveAt || null,
            ip: options.columns?.ip || null,
            userAgent: options.columns?.userAgent || null,
        };
        this.userColumns = {
            id: options.userColumns?.id || "id",
            email: options.userColumns?.email || "email",
            name: options.userColumns?.name || "name",
            avatar: options.userColumns?.avatar || "avatar",
            password: options.userColumns?.password || "password",
            emailVerified: options.userColumns?.emailVerified || "email_verified",
        };
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
    _coerceDbId(id) {
        return /^\d+$/.test(id) ? Number(id) : id;
    }
    async createSession(userId, metadata = {}) {
        const sessionId = this._generateSessionId();
        const expiresAt = new Date(Date.now() + this.sessionLifetime);
        const sql = `INSERT INTO ${this.sessionsTable} (${this.columns.sessionId}, ${this.columns.userId}, ${this.columns.expiresAt}) VALUES (?, ?, ?)`;
        await this.db
            .prepare(sql)
            .bind(sessionId, this._coerceDbId(userId), expiresAt.toISOString())
            .run();
        return { id: sessionId, userId, expiresAt, ...metadata };
    }
    async validateSession(sessionId) {
        const sql = `SELECT s.${this.columns.sessionId} as session_id, s.${this.columns.userId} as user_id, s.${this.columns.expiresAt} as expires_at, u.*
		FROM ${this.sessionsTable} s
		JOIN ${this.usersTable} u ON s.${this.columns.userId} = u.${this.userColumns.id}
		WHERE s.${this.columns.sessionId} = ? LIMIT 1`;
        const row = await this.db.prepare(sql).bind(sessionId).first();
        if (!row)
            return { session: null, user: null };
        const expiresAtRaw = row["expires_at"];
        if (typeof expiresAtRaw !== "string")
            return { session: null, user: null };
        const expiresAt = new Date(expiresAtRaw);
        if (Number.isNaN(expiresAt.getTime()))
            return { session: null, user: null };
        if (Date.now() >= expiresAt.getTime()) {
            await this.db
                .prepare(`DELETE FROM ${this.sessionsTable} WHERE ${this.columns.sessionId} = ?`)
                .bind(sessionId)
                .run();
            return { session: null, user: null };
        }
        const shouldRefresh = Date.now() >= expiresAt.getTime() - this.sessionRefreshThreshold;
        let fresh = false;
        let newExpiresAt = expiresAt;
        if (shouldRefresh) {
            newExpiresAt = new Date(Date.now() + this.sessionLifetime);
            await this.db
                .prepare(`UPDATE ${this.sessionsTable} SET ${this.columns.expiresAt} = ? WHERE ${this.columns.sessionId} = ?`)
                .bind(newExpiresAt.toISOString(), sessionId)
                .run();
            fresh = true;
        }
        const user = this.sanitizeUser(this._mapUserRow(row));
        const userIdRaw = row["user_id"];
        if (typeof userIdRaw !== "string" && typeof userIdRaw !== "number") {
            return { session: null, user: null };
        }
        return {
            session: {
                id: sessionId,
                userId: String(userIdRaw),
                expiresAt: newExpiresAt,
                fresh,
            },
            user,
        };
    }
    _mapUserRow(row) {
        const id = row[this.userColumns["id"]] ?? row["id"];
        const email = row[this.userColumns["email"]] ?? row["email"];
        const name = row[this.userColumns["name"]] ?? row["name"];
        // Preserve explicit NULLs from the DB (e.g. avatar_url = null).
        // Using `??` would treat `null` as "missing" and fall back to undefined, failing validation.
        const avatar = Object.prototype.hasOwnProperty.call(row, this.userColumns["avatar"])
            ? row[this.userColumns["avatar"]]
            : row["avatar"];
        const emailVerified = row[this.userColumns.emailVerified] ?? row["email_verified"];
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
    async invalidateSession(sessionId) {
        await this.db
            .prepare(`DELETE FROM ${this.sessionsTable} WHERE ${this.columns.sessionId} = ?`)
            .bind(sessionId)
            .run();
    }
    async invalidateUserSessions(userId) {
        await this.db
            .prepare(`DELETE FROM ${this.sessionsTable} WHERE ${this.columns.userId} = ?`)
            .bind(this._coerceDbId(userId))
            .run();
    }
    async listSessions(userId) {
        const columns = [
            this.columns.sessionId,
            this.columns.userId,
            this.columns.expiresAt,
            this.columns.createdAt,
            this.columns.lastActiveAt,
            this.columns.ip,
            this.columns.userAgent,
        ];
        const unique = [...new Set(columns.filter(Boolean))];
        const sql = `SELECT ${unique.join(", ")} FROM ${this.sessionsTable} WHERE ${this.columns.userId} = ?`;
        const result = await this.db.prepare(sql).bind(this._coerceDbId(userId)).all();
        const sessions = [];
        for (const row of result?.results ?? []) {
            const id = row[this.columns.sessionId] ?? row["id"];
            const uid = row[this.columns.userId] ?? row["user_id"];
            const expiresRaw = row[this.columns["expiresAt"]] ?? row["expires_at"] ?? row["expiresAt"];
            if ((typeof id !== "string" && typeof id !== "number") ||
                (typeof uid !== "string" && typeof uid !== "number") ||
                typeof expiresRaw !== "string") {
                continue;
            }
            const expiresAt = new Date(expiresRaw);
            if (Number.isNaN(expiresAt.getTime()))
                continue;
            sessions.push({
                id: String(id),
                userId: String(uid),
                expiresAt,
            });
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
//# sourceMappingURL=d1.js.map