import { encodeBase64url } from '@oslojs/encoding';

// src/adapters/memory/index.ts

// src/adapters/database/base.ts
var UserAdapter = class {
};

// src/adapters/mfa/base.ts
var MfaAdapter = class {
};

// src/adapters/oauth-token/base.ts
var TokenAdapter = class {
};

// src/adapters/session/base.ts
var SessionAdapter = class {
};

// src/adapters/webauthn/base.ts
var WebAuthnAdapter = class {
  /**
   * Atomically find-and-consume a challenge. Should be the only call
   * site used during verification. The default below is a non-atomic
   * get+delete pair; adapters whose storage supports it should override
   * with a single `DELETE ... RETURNING` so two concurrent verifies of
   * the same challenge cannot both succeed.
   */
  async consumeChallenge(challengeId) {
    const record = await this.getChallenge(challengeId);
    if (record) {
      await this.deleteChallenge(challengeId);
    }
    return record;
  }
};

// src/adapters/memory/index.ts
var MemoryUserAdapter = class extends UserAdapter {
  #oauthIndex = /* @__PURE__ */ new Map();
  #users = /* @__PURE__ */ new Map();
  async createUser(profile, metadata = {}) {
    const email = profile.email.trim().toLowerCase();
    const id = stringValue(metadata["id"]) || stringValue(profile.id) || crypto.randomUUID();
    const role = stringValue(metadata["role"]);
    const user = {
      avatar: profile.picture ?? null,
      createdAt: /* @__PURE__ */ new Date(),
      email,
      emailVerified: Boolean(profile.verified_email),
      id,
      name: stringValue(metadata["name"]) || profile.name || email,
      password: stringValue(metadata["password"]) ?? null,
      settings: recordValue(metadata["settings"]) ?? {},
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (role) {
      user.role = role;
    }
    this.#users.set(id, user);
    return sanitizeUser(user) ?? user;
  }
  async getUserById(id) {
    return sanitizeUser(this.#users.get(id) ?? null);
  }
  setUser(user) {
    this.#users.set(user.id, user);
  }
  async getUserByEmail(email) {
    const normalized = email.trim().toLowerCase();
    for (const user of this.#users.values()) {
      if (user.email === normalized) {
        return sanitizeUser(user);
      }
    }
    return null;
  }
  async getUserByProviderId(provider, providerId) {
    const userId = this.#oauthIndex.get(`${provider}:${providerId}`);
    return userId ? this.getUserById(userId) : null;
  }
  async updateUser(id, data) {
    const existing = this.#users.get(id);
    if (!existing) {
      throw new Error("User not found");
    }
    const next = {
      ...existing,
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.#users.set(id, next);
    return sanitizeUser(next) ?? next;
  }
  async deleteUser(id) {
    this.#users.delete(id);
  }
  async linkOAuthAccount(userId, provider, providerAccountId) {
    this.#oauthIndex.set(`${provider}:${providerAccountId}`, userId);
  }
  async getUserWithPasswordHash(email) {
    const normalized = email.trim().toLowerCase();
    for (const user of this.#users.values()) {
      if (user.email === normalized) {
        return user;
      }
    }
    return null;
  }
};
var MemorySessionAdapter = class extends SessionAdapter {
  #cookieDomain;
  #cookieName;
  #secureCookies;
  #sessionLifetimeMs;
  #sessions = /* @__PURE__ */ new Map();
  #users;
  constructor({
    cookieDomain,
    cookieName,
    secureCookies,
    sessionLifetimeMs = 30 * 24 * 60 * 60 * 1e3,
    users
  }) {
    super();
    this.#cookieDomain = cookieDomain;
    this.#cookieName = cookieName;
    this.#secureCookies = secureCookies;
    this.#sessionLifetimeMs = sessionLifetimeMs;
    this.#users = users;
  }
  get cookieName() {
    return this.#cookieName;
  }
  async createSession(userId, metadata = {}) {
    const session = {
      expiresAt: new Date(Date.now() + this.#sessionLifetimeMs),
      fingerprint: stringValue(metadata["fingerprint"]) ?? null,
      id: randomSessionId(),
      ip: stringValue(metadata["ip"]) ?? null,
      userAgent: stringValue(metadata["userAgent"]) ?? null,
      userId
    };
    this.#sessions.set(session.id, session);
    return session;
  }
  async validateSession(sessionId) {
    const session = this.#sessions.get(sessionId);
    if (!session) {
      return { session: null, user: null };
    }
    if (session.expiresAt.getTime() <= Date.now()) {
      this.#sessions.delete(sessionId);
      return { session: null, user: null };
    }
    return {
      session,
      user: await this.#users.getUserById(session.userId)
    };
  }
  async invalidateSession(sessionId) {
    this.#sessions.delete(sessionId);
  }
  async invalidateUserSessions(userId) {
    for (const [id, session] of this.#sessions.entries()) {
      if (session.userId === userId) {
        this.#sessions.delete(id);
      }
    }
  }
  async listSessions(userId) {
    return [...this.#sessions.values()].filter((session) => session.userId === userId);
  }
  setSessionCookie(cookies, session) {
    cookies.set(this.#cookieName, session.id, {
      ...this.#cookieDomain ? { domain: this.#cookieDomain } : {},
      expires: session.expiresAt,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: this.#secureCookies
    });
  }
  deleteSessionCookie(cookies) {
    cookies.delete(this.#cookieName, {
      ...this.#cookieDomain ? { domain: this.#cookieDomain } : {},
      path: "/"
    });
  }
};
var MemoryWebAuthnAdapter = class extends WebAuthnAdapter {
  #challenges = /* @__PURE__ */ new Map();
  #credentials = /* @__PURE__ */ new Map();
  async createChallenge({
    challengeId,
    userId,
    challenge,
    type,
    expiresAt
  }) {
    this.#challenges.set(challengeId, {
      challenge,
      expiresAt,
      id: challengeId,
      type,
      userId: userId ?? null
    });
  }
  async getChallenge(challengeId) {
    return this.#challenges.get(challengeId) ?? null;
  }
  async deleteChallenge(challengeId) {
    this.#challenges.delete(challengeId);
  }
  async createCredential({
    userId,
    credentialId,
    publicKey,
    counter,
    transports,
    name
  }) {
    const now = /* @__PURE__ */ new Date();
    this.#credentials.set(credentialId, {
      counter,
      createdAt: now,
      credentialId,
      id: credentialId,
      name: name ?? null,
      publicKey,
      transports: transports ?? null,
      updatedAt: now,
      userId
    });
  }
  async getCredential(credentialId) {
    return this.#credentials.get(credentialId) ?? null;
  }
  async listCredentials(userId) {
    return [...this.#credentials.values()].filter((credential) => credential.userId === userId);
  }
  async updateCredential(credentialId, updates) {
    const existing = this.#credentials.get(credentialId);
    if (!existing) {
      return;
    }
    const next = {
      ...existing,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (typeof updates["counter"] === "number") {
      next.counter = updates["counter"];
    }
    if (updates["name"] === null || typeof updates["name"] === "string") {
      next.name = updates["name"];
    }
    if (updates["transports"] === null || Array.isArray(updates["transports"]) && updates["transports"].every((entry) => typeof entry === "string")) {
      next.transports = updates["transports"];
    }
    this.#credentials.set(credentialId, next);
  }
  async deleteCredential(credentialId) {
    this.#credentials.delete(credentialId);
  }
  async deleteUserCredentials(userId) {
    for (const [credentialId, credential] of this.#credentials.entries()) {
      if (credential.userId === userId) {
        this.#credentials.delete(credentialId);
      }
    }
  }
};
var MemoryMfaAdapter = class extends MfaAdapter {
  #backupCodes = /* @__PURE__ */ new Map();
  #factors = /* @__PURE__ */ new Map();
  async setSecret(userId, secret) {
    const existing = this.#factors.get(userId);
    this.#factors.set(userId, {
      enabledAt: existing?.enabledAt ?? null,
      secret
    });
  }
  async getSecret(userId) {
    return this.#factors.get(userId)?.secret ?? null;
  }
  async enableMfa(userId) {
    const existing = this.#factors.get(userId);
    if (!existing) {
      return;
    }
    this.#factors.set(userId, {
      ...existing,
      enabledAt: /* @__PURE__ */ new Date()
    });
  }
  async disableMfa(userId) {
    this.#factors.delete(userId);
    this.#backupCodes.delete(userId);
  }
  async setBackupCodes(userId, codes) {
    this.#backupCodes.set(userId, new Set(codes));
  }
  async getBackupCodes(userId) {
    return [...this.#backupCodes.get(userId) ?? []];
  }
  async consumeBackupCode(userId, hash) {
    this.#backupCodes.get(userId)?.delete(hash);
  }
  async getStatus(userId) {
    const factor = this.#factors.get(userId);
    return {
      backupCodeCount: this.#backupCodes.get(userId)?.size ?? 0,
      enabled: Boolean(factor?.enabledAt),
      enabledAt: factor?.enabledAt ?? null
    };
  }
};
function createMemoryAuthAdapters(input) {
  const user = new MemoryUserAdapter();
  return {
    session: new MemorySessionAdapter({
      ...input.cookieDomain ? { cookieDomain: input.cookieDomain } : {},
      cookieName: input.cookieName,
      secureCookies: input.secureCookies,
      users: user
    }),
    mfa: new MemoryMfaAdapter(),
    user,
    webauthn: new MemoryWebAuthnAdapter()
  };
}
var MockUserAdapter = class extends MemoryUserAdapter {
};
var MockSessionAdapter = class extends MemorySessionAdapter {
  #users;
  constructor() {
    const users = new MemoryUserAdapter();
    super({
      cookieName: "session",
      secureCookies: false,
      users
    });
    this.#users = users;
  }
  setUser(user) {
    this.#users.setUser(user);
  }
  setSessionCookie(_cookies, _session) {
  }
  deleteSessionCookie(_cookies) {
  }
};
var MockTokenAdapter = class extends TokenAdapter {
  #tokens = /* @__PURE__ */ new Map();
  async storeTokens(userId, provider, tokens) {
    this.#tokens.set(`${userId}:${provider}`, tokens);
  }
  async getTokens(userId, provider) {
    return this.#tokens.get(`${userId}:${provider}`) ?? null;
  }
  async refreshTokens(userId, provider) {
    return this.getTokens(userId, provider);
  }
  async deleteTokens(userId, provider) {
    this.#tokens.delete(`${userId}:${provider}`);
  }
};
function recordValue(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
function sanitizeUser(user) {
  if (!user) {
    return null;
  }
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
function stringValue(value) {
  return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function randomSessionId() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return encodeBase64url(bytes).replace(/=+$/g, "");
}

export { MemoryMfaAdapter, MemorySessionAdapter, MemoryUserAdapter, MemoryWebAuthnAdapter, MockSessionAdapter, MockTokenAdapter, MockUserAdapter, createMemoryAuthAdapters };
