import { SessionAdapter } from "../adapters/session/base.js";
import { UserAdapter } from "../adapters/database/base.js";
import { TokenAdapter } from "../adapters/oauth-token/base.js";
export class MockSessionAdapter extends SessionAdapter {
    sessions = new Map();
    users = new Map();
    setUser(user) {
        this.users.set(String(user.id), user);
    }
    async createSession(userId) {
        const session = {
            id: `session:${crypto.randomUUID()}`,
            userId,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
        this.sessions.set(session.id, session);
        return session;
    }
    async validateSession(sessionId) {
        const session = this.sessions.get(sessionId) ?? null;
        const user = session ? this.users.get(session.userId) ?? null : null;
        return { session, user };
    }
    async invalidateSession(sessionId) {
        this.sessions.delete(sessionId);
    }
    async invalidateUserSessions(userId) {
        for (const [sessionId, session] of this.sessions.entries()) {
            if (session.userId === userId)
                this.sessions.delete(sessionId);
        }
    }
    async listSessions(userId) {
        return [...this.sessions.values()].filter((session) => session.userId === userId);
    }
    setSessionCookie() { }
    deleteSessionCookie() { }
}
export class MockUserAdapter extends UserAdapter {
    users = new Map();
    oauthIndex = new Map();
    async createUser(profile, metadata = {}) {
        const id = String(metadata["id"] ?? profile.id ?? profile.email);
        const user = {
            id,
            email: profile.email,
            name: profile.name ?? profile.email,
            avatar: profile.picture ?? null,
            emailVerified: Boolean(profile.verified_email),
            ...(typeof metadata["password"] === "string"
                ? { password: metadata["password"] }
                : {}),
        };
        this.users.set(id, user);
        return this.sanitize(user) ?? user;
    }
    async getUserById(id) {
        const user = this.users.get(String(id)) ?? null;
        return this.sanitize(user);
    }
    async getUserByEmail(email) {
        for (const user of this.users.values()) {
            if (user.email === email)
                return this.sanitize(user);
        }
        return null;
    }
    async getUserByProviderId(provider, providerId) {
        const userId = this.oauthIndex.get(`${provider}:${providerId}`);
        if (!userId)
            return null;
        return this.getUserById(userId);
    }
    async updateUser(id, data) {
        const user = this.users.get(String(id));
        if (!user)
            throw new Error("User not found");
        const next = { ...user, ...data };
        this.users.set(String(id), next);
        return this.sanitize(next) ?? next;
    }
    async deleteUser(id) {
        this.users.delete(String(id));
    }
    async linkOAuthAccount(userId, provider, providerAccountId) {
        this.oauthIndex.set(`${provider}:${providerAccountId}`, String(userId));
    }
    async getUserWithPasswordHash(email) {
        for (const user of this.users.values()) {
            if (user.email === email)
                return user;
        }
        return null;
    }
    sanitize(user) {
        if (!user)
            return null;
        const { password: _password, ...safe } = user;
        return safe;
    }
}
export class MockTokenAdapter extends TokenAdapter {
    tokens = new Map();
    async storeTokens(userId, provider, tokens) {
        this.tokens.set(`${userId}:${provider}`, tokens);
    }
    async getTokens(userId, provider) {
        return this.tokens.get(`${userId}:${provider}`) ?? null;
    }
    async refreshTokens(userId, provider) {
        return this.getTokens(userId, provider);
    }
    async deleteTokens(userId, provider) {
        this.tokens.delete(`${userId}:${provider}`);
    }
}
//# sourceMappingURL=mock-adapters.js.map