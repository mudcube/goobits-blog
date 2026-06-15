import { randomUUID, randomBytes } from 'crypto';

// src/adapters/pg/index.ts

// src/adapters/database/base.ts
var UserAdapter = class {
};

// src/adapters/magic-link/base.ts
var MagicLinkAdapter = class {
  /**
   * Atomically find-and-consume a token by its hash. Should be the only
   * call sites use during verification — the default below is a
   * non-atomic find+delete pair (susceptible to TOCTOU under concurrent
   * verifies of the same token). Backends that can do this atomically
   * (SQL `DELETE ... RETURNING`, in-memory `Map`) should override.
   */
  async consumeByTokenHash(tokenHash) {
    const record = await this.findByTokenHash(tokenHash);
    if (!record) return null;
    const id = record["id"];
    if (typeof id === "string") {
      await this.deleteById(id);
    }
    return record;
  }
  /**
   * Atomically find-and-consume a token by email + OTP hash. Same
   * atomicity caveat as `consumeByTokenHash`.
   */
  async consumeByEmailAndOtpHash(params) {
    const record = await this.findByEmailAndOtpHash(params);
    if (!record) return null;
    const id = record["id"];
    if (typeof id === "string") {
      await this.deleteById(id);
    }
    return record;
  }
};

// src/adapters/mfa/base.ts
var MfaAdapter = class {
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

// src/adapters/pg/index.ts
var PgUserAdapter = class extends UserAdapter {
  #db;
  constructor({ db }) {
    super();
    this.#db = db;
  }
  async createUser(profile, metadata = {}) {
    const id = stringValue(metadata["id"]) || randomUUID();
    const email = normalizeEmail(profile.email);
    const name = stringValue(metadata["name"]) || profile.name || email;
    const password = stringValue(metadata["password"]);
    const row = (await this.#db.query(
      `
			INSERT INTO auth_users (id, email, name, avatar, email_verified, role, settings, password)
			VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
			ON CONFLICT (email) DO UPDATE SET
				name = EXCLUDED.name,
				avatar = COALESCE(EXCLUDED.avatar, auth_users.avatar),
				email_verified = auth_users.email_verified OR EXCLUDED.email_verified,
				updated_at = now()
			RETURNING *
		`,
      [
        id,
        email,
        name,
        profile.picture ?? null,
        Boolean(profile.verified_email),
        stringValue(metadata["role"]),
        JSON.stringify(recordValue(metadata["settings"]) ?? {}),
        password
      ]
    )).rows[0];
    return toUser(requireRow(row));
  }
  async getUserById(id) {
    const row = (await this.#db.query("SELECT * FROM auth_users WHERE id = $1", [id])).rows[0];
    return row ? toUser(row) : null;
  }
  async getUserByEmail(email) {
    const row = (await this.#db.query("SELECT * FROM auth_users WHERE email = $1", [normalizeEmail(email)])).rows[0];
    return row ? toUser(row) : null;
  }
  async getUserByProviderId(provider, providerId) {
    const row = (await this.#db.query(
      `
			SELECT u.*
			FROM auth_users u
			JOIN auth_oauth_accounts a ON a.user_id = u.id
			WHERE a.provider = $1 AND a.provider_account_id = $2
		`,
      [provider, providerId]
    )).rows[0];
    return row ? toUser(row) : null;
  }
  async updateUser(id, data) {
    const existing = await this.getUserById(id);
    if (!existing) {
      throw new Error("User not found");
    }
    const row = (await this.#db.query(
      `
			UPDATE auth_users
			SET email = $2,
				name = $3,
				avatar = $4,
				email_verified = $5,
				role = $6,
				settings = $7::jsonb,
				updated_at = now()
			WHERE id = $1
			RETURNING *
		`,
      [
        id,
        data.email ?? existing.email,
        data.name ?? existing.name,
        data.avatar ?? existing.avatar,
        data.emailVerified ?? existing.emailVerified,
        stringValue(data["role"]),
        JSON.stringify(recordValue(data["settings"]) ?? existing.settings ?? {})
      ]
    )).rows[0];
    return toUser(requireRow(row));
  }
  async deleteUser(id) {
    await this.#db.query("DELETE FROM auth_users WHERE id = $1", [id]);
  }
  async linkOAuthAccount(userId, provider, providerAccountId) {
    await this.#db.query(
      `
			INSERT INTO auth_oauth_accounts (provider, provider_account_id, user_id)
			VALUES ($1, $2, $3)
			ON CONFLICT (provider, provider_account_id) DO UPDATE SET user_id = EXCLUDED.user_id
		`,
      [provider, providerAccountId, userId]
    );
  }
  async getUserWithPasswordHash(email) {
    const row = (await this.#db.query("SELECT * FROM auth_users WHERE email = $1", [normalizeEmail(email)])).rows[0];
    return row ? { ...toUser(row), password: row.password } : null;
  }
};
var PgSessionAdapter = class extends SessionAdapter {
  #cookieDomain;
  #cookieName;
  #db;
  #secureCookies;
  #sessionLifetimeMs;
  constructor({
    cookieDomain,
    cookieName,
    db,
    secureCookies,
    sessionLifetimeMs = 30 * 24 * 60 * 60 * 1e3
  }) {
    super();
    this.#cookieDomain = cookieDomain;
    this.#cookieName = cookieName;
    this.#db = db;
    this.#secureCookies = secureCookies;
    this.#sessionLifetimeMs = sessionLifetimeMs;
  }
  get cookieName() {
    return this.#cookieName;
  }
  async createSession(userId, metadata = {}) {
    const id = randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + this.#sessionLifetimeMs);
    const row = (await this.#db.query(
      `
			INSERT INTO auth_sessions (id, user_id, expires_at, ip, user_agent, fingerprint)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING *
		`,
      [
        id,
        userId,
        expiresAt,
        stringValue(metadata["ip"]),
        stringValue(metadata["userAgent"]),
        stringValue(metadata["fingerprint"])
      ]
    )).rows[0];
    return toSession(requireRow(row));
  }
  async validateSession(sessionId) {
    const row = (await this.#db.query(
      `
			SELECT
				s.id AS id,
				s.user_id,
				s.expires_at,
				s.created_at,
				s.last_active_at,
				s.ip,
				s.user_agent,
				s.fingerprint,
				u.id AS user_id_for_user,
				u.email,
				u.name,
				u.avatar,
				u.email_verified,
				u.role,
				u.settings,
				u.password,
				u.created_at AS user_created_at,
				u.updated_at
			FROM auth_sessions s
			JOIN auth_users u ON u.id = s.user_id
			WHERE s.id = $1
		`,
      [sessionId]
    )).rows[0];
    if (!row) {
      return { session: null, user: null };
    }
    if (row.expires_at.getTime() <= Date.now()) {
      await this.invalidateSession(sessionId);
      return { session: null, user: null };
    }
    await this.#db.query("UPDATE auth_sessions SET last_active_at = now() WHERE id = $1", [sessionId]);
    return {
      session: toSession(row),
      user: toUser({
        ...row,
        created_at: row.user_created_at,
        id: row.user_id_for_user
      })
    };
  }
  async invalidateSession(sessionId) {
    await this.#db.query("DELETE FROM auth_sessions WHERE id = $1", [sessionId]);
  }
  async invalidateUserSessions(userId) {
    await this.#db.query("DELETE FROM auth_sessions WHERE user_id = $1", [userId]);
  }
  async listSessions(userId) {
    const rows = (await this.#db.query(
      "SELECT * FROM auth_sessions WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    )).rows;
    return rows.map(toSession);
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
var PgWebAuthnAdapter = class extends WebAuthnAdapter {
  #db;
  constructor({ db }) {
    super();
    this.#db = db;
  }
  async createChallenge({
    challengeId,
    userId,
    challenge,
    type,
    expiresAt
  }) {
    await this.#db.query(
      `
			INSERT INTO auth_webauthn_challenges (id, user_id, challenge, type, expires_at)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (id) DO UPDATE SET
				user_id = EXCLUDED.user_id,
				challenge = EXCLUDED.challenge,
				type = EXCLUDED.type,
				expires_at = EXCLUDED.expires_at
		`,
      [challengeId, userId ?? null, challenge, type, expiresAt]
    );
  }
  async getChallenge(challengeId) {
    const row = (await this.#db.query(
      "SELECT * FROM auth_webauthn_challenges WHERE id = $1",
      [challengeId]
    )).rows[0];
    return row ? toWebAuthnChallenge(row) : null;
  }
  async deleteChallenge(challengeId) {
    await this.#db.query("DELETE FROM auth_webauthn_challenges WHERE id = $1", [
      challengeId
    ]);
  }
  async createCredential({
    userId,
    credentialId,
    publicKey,
    counter,
    transports,
    name
  }) {
    await this.#db.query(
      `
			INSERT INTO auth_webauthn_credentials
				(user_id, credential_id, public_key, counter, transports, name)
			VALUES ($1, $2, $3, $4, $5::jsonb, $6)
			ON CONFLICT (credential_id) DO UPDATE SET
				user_id = EXCLUDED.user_id,
				public_key = EXCLUDED.public_key,
				counter = EXCLUDED.counter,
				transports = EXCLUDED.transports,
				name = EXCLUDED.name,
				updated_at = now()
		`,
      [
        userId,
        credentialId,
        publicKey,
        counter,
        JSON.stringify(transports ?? null),
        name ?? null
      ]
    );
  }
  async getCredential(credentialId) {
    const row = (await this.#db.query(
      "SELECT * FROM auth_webauthn_credentials WHERE credential_id = $1",
      [credentialId]
    )).rows[0];
    return row ? toWebAuthnCredential(row) : null;
  }
  async listCredentials(userId) {
    const rows = (await this.#db.query(
      "SELECT * FROM auth_webauthn_credentials WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    )).rows;
    return rows.map(toWebAuthnCredential);
  }
  async updateCredential(credentialId, updates) {
    const allowed = /* @__PURE__ */ new Map([
      ["counter", updates["counter"]],
      ["name", updates["name"]],
      ["transports", updates["transports"]]
    ]);
    const fields = [];
    const values = [];
    for (const [key, value] of allowed.entries()) {
      if (value === void 0) continue;
      if (key === "counter" && typeof value !== "number") continue;
      if (key === "name" && value !== null && typeof value !== "string") continue;
      if (key === "transports") {
        if (value !== null && (!Array.isArray(value) || value.some((entry) => typeof entry !== "string"))) {
          continue;
        }
        fields.push(`transports = $${fields.length + 1}::jsonb`);
        values.push(JSON.stringify(value));
        continue;
      }
      fields.push(`${key} = $${fields.length + 1}`);
      values.push(value);
    }
    if (fields.length === 0) {
      return;
    }
    values.push(credentialId);
    await this.#db.query(
      `
			UPDATE auth_webauthn_credentials
			SET ${fields.join(", ")}, updated_at = now()
			WHERE credential_id = $${values.length}
		`,
      values
    );
  }
  async deleteCredential(credentialId) {
    await this.#db.query("DELETE FROM auth_webauthn_credentials WHERE credential_id = $1", [
      credentialId
    ]);
  }
  async deleteUserCredentials(userId) {
    await this.#db.query("DELETE FROM auth_webauthn_credentials WHERE user_id = $1", [
      userId
    ]);
  }
};
var PgMfaAdapter = class extends MfaAdapter {
  #db;
  constructor({ db }) {
    super();
    this.#db = db;
  }
  async setSecret(userId, secret) {
    await this.#db.query(
      `
			INSERT INTO auth_mfa_factors (user_id, secret)
			VALUES ($1, $2)
			ON CONFLICT (user_id) DO UPDATE SET
				secret = EXCLUDED.secret,
				updated_at = now()
		`,
      [userId, secret]
    );
  }
  async getSecret(userId) {
    const row = (await this.#db.query(
      "SELECT user_id, secret, enabled_at FROM auth_mfa_factors WHERE user_id = $1",
      [userId]
    )).rows[0];
    return row?.secret ?? null;
  }
  async enableMfa(userId) {
    await this.#db.query(
      "UPDATE auth_mfa_factors SET enabled_at = COALESCE(enabled_at, now()), updated_at = now() WHERE user_id = $1",
      [userId]
    );
  }
  async disableMfa(userId) {
    await this.#db.query("DELETE FROM auth_mfa_backup_codes WHERE user_id = $1", [userId]);
    await this.#db.query("DELETE FROM auth_mfa_factors WHERE user_id = $1", [userId]);
  }
  async setBackupCodes(userId, codes) {
    await this.#db.query("DELETE FROM auth_mfa_backup_codes WHERE user_id = $1", [userId]);
    for (const hash of codes) {
      await this.#db.query(
        "INSERT INTO auth_mfa_backup_codes (user_id, code_hash) VALUES ($1, $2)",
        [userId, hash]
      );
    }
  }
  async getBackupCodes(userId) {
    const rows = (await this.#db.query(
      "SELECT code_hash FROM auth_mfa_backup_codes WHERE user_id = $1 ORDER BY created_at ASC",
      [userId]
    )).rows;
    return rows.map((row) => row.code_hash);
  }
  async consumeBackupCode(userId, hash) {
    await this.#db.query(
      "DELETE FROM auth_mfa_backup_codes WHERE user_id = $1 AND code_hash = $2",
      [userId, hash]
    );
  }
  async getStatus(userId) {
    const row = (await this.#db.query(
      `
				SELECT
					f.enabled_at,
					COUNT(c.code_hash) AS backup_code_count
				FROM auth_mfa_factors f
				LEFT JOIN auth_mfa_backup_codes c ON c.user_id = f.user_id
				WHERE f.user_id = $1
				GROUP BY f.enabled_at
			`,
      [userId]
    )).rows[0];
    return {
      backupCodeCount: Number(row?.backup_code_count ?? 0),
      enabled: Boolean(row?.enabled_at),
      enabledAt: row?.enabled_at ?? null
    };
  }
};
var PgMagicLinkAdapter = class extends MagicLinkAdapter {
  #db;
  constructor({ db }) {
    super();
    this.#db = db;
  }
  async createToken({
    userId,
    email,
    tokenHash,
    otpHash,
    expiresAt,
    metadata
  }) {
    const row = (await this.#db.query(
      `
			INSERT INTO auth_magic_link_tokens
				(id, user_id, email, token_hash, otp_hash, expires_at, metadata)
			VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
			RETURNING *
		`,
      [
        randomUUID(),
        userId,
        normalizeEmail(email),
        tokenHash,
        otpHash ?? null,
        expiresAt,
        JSON.stringify(metadata ?? {})
      ]
    )).rows[0];
    return toMagicLinkToken(requireRow(row));
  }
  async findByTokenHash(tokenHash) {
    const row = (await this.#db.query(
      "SELECT * FROM auth_magic_link_tokens WHERE token_hash = $1 LIMIT 1",
      [tokenHash]
    )).rows[0];
    return row ? toMagicLinkToken(row) : null;
  }
  async findByEmailAndOtpHash({
    email,
    otpHash
  }) {
    const row = (await this.#db.query(
      "SELECT * FROM auth_magic_link_tokens WHERE email = $1 AND otp_hash = $2 LIMIT 1",
      [normalizeEmail(email), otpHash]
    )).rows[0];
    return row ? toMagicLinkToken(row) : null;
  }
  async deleteById(tokenId) {
    await this.#db.query("DELETE FROM auth_magic_link_tokens WHERE id = $1", [tokenId]);
  }
  async deleteByUserId(userId) {
    await this.#db.query("DELETE FROM auth_magic_link_tokens WHERE user_id = $1", [userId]);
  }
  async deleteByEmail(email) {
    await this.#db.query("DELETE FROM auth_magic_link_tokens WHERE email = $1", [
      normalizeEmail(email)
    ]);
  }
  async consumeByTokenHash(tokenHash) {
    const row = (await this.#db.query(
      "DELETE FROM auth_magic_link_tokens WHERE token_hash = $1 RETURNING *",
      [tokenHash]
    )).rows[0];
    return row ? toMagicLinkToken(row) : null;
  }
  async consumeByEmailAndOtpHash({
    email,
    otpHash
  }) {
    const row = (await this.#db.query(
      "DELETE FROM auth_magic_link_tokens WHERE email = $1 AND otp_hash = $2 RETURNING *",
      [normalizeEmail(email), otpHash]
    )).rows[0];
    return row ? toMagicLinkToken(row) : null;
  }
};
function createPgAuthAdapters(input) {
  return {
    magicLink: new PgMagicLinkAdapter({ db: input.db }),
    mfa: new PgMfaAdapter({ db: input.db }),
    session: new PgSessionAdapter(input),
    user: new PgUserAdapter({ db: input.db }),
    webauthn: new PgWebAuthnAdapter({ db: input.db })
  };
}
var pgAuthSchemaSql = `
CREATE TABLE IF NOT EXISTS auth_users (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	avatar TEXT,
	email_verified BOOLEAN NOT NULL DEFAULT FALSE,
	role TEXT,
	settings JSONB NOT NULL DEFAULT '{}'::jsonb,
	password TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth_oauth_accounts (
	provider TEXT NOT NULL,
	provider_account_id TEXT NOT NULL,
	user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY (provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS auth_oauth_accounts_user_id_idx ON auth_oauth_accounts(user_id);

CREATE TABLE IF NOT EXISTS auth_sessions (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
	expires_at TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	last_active_at TIMESTAMPTZ,
	ip TEXT,
	user_agent TEXT,
	fingerprint TEXT
);

CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS auth_sessions_expires_at_idx ON auth_sessions(expires_at);

CREATE TABLE IF NOT EXISTS auth_mfa_factors (
	user_id TEXT PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
	secret TEXT NOT NULL,
	enabled_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth_mfa_backup_codes (
	user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
	code_hash TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY (user_id, code_hash)
);

CREATE TABLE IF NOT EXISTS auth_webauthn_challenges (
	id TEXT PRIMARY KEY,
	user_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,
	challenge TEXT NOT NULL,
	type TEXT NOT NULL,
	expires_at TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_webauthn_challenges_expires_at_idx ON auth_webauthn_challenges(expires_at);
CREATE INDEX IF NOT EXISTS auth_webauthn_challenges_user_id_idx ON auth_webauthn_challenges(user_id);

CREATE TABLE IF NOT EXISTS auth_webauthn_credentials (
	credential_id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
	public_key TEXT NOT NULL,
	counter INTEGER NOT NULL DEFAULT 0,
	transports JSONB,
	name TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_webauthn_credentials_user_id_idx ON auth_webauthn_credentials(user_id);

CREATE TABLE IF NOT EXISTS auth_magic_link_tokens (
	id TEXT PRIMARY KEY,
	user_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,
	email TEXT NOT NULL,
	token_hash TEXT NOT NULL,
	otp_hash TEXT,
	expires_at TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS auth_magic_link_tokens_email_idx ON auth_magic_link_tokens(email);
CREATE INDEX IF NOT EXISTS auth_magic_link_tokens_token_hash_idx ON auth_magic_link_tokens(token_hash);
CREATE INDEX IF NOT EXISTS auth_magic_link_tokens_otp_hash_idx ON auth_magic_link_tokens(otp_hash);
CREATE INDEX IF NOT EXISTS auth_magic_link_tokens_expires_at_idx ON auth_magic_link_tokens(expires_at);
`;
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
function recordValue(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
function stringValue(value) {
  return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function toSession(row) {
  return {
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    fingerprint: row.fingerprint,
    id: row.id,
    ip: row.ip,
    lastActiveAt: row.last_active_at,
    userAgent: row.user_agent,
    userId: row.user_id
  };
}
function toUser(row) {
  const user = {
    avatar: row.avatar,
    createdAt: row.created_at,
    email: row.email,
    emailVerified: row.email_verified,
    id: row.id,
    name: row.name,
    settings: row.settings,
    updatedAt: row.updated_at
  };
  if (row.role) {
    user.role = row.role;
  }
  return user;
}
function toWebAuthnChallenge(row) {
  return {
    challenge: row.challenge,
    expiresAt: row.expires_at,
    id: row.id,
    type: row.type,
    userId: row.user_id
  };
}
function toWebAuthnCredential(row) {
  return {
    counter: row.counter,
    createdAt: row.created_at,
    credentialId: row.credential_id,
    id: row.credential_id,
    name: row.name,
    publicKey: row.public_key,
    transports: Array.isArray(row.transports) ? row.transports : null,
    updatedAt: row.updated_at,
    userId: row.user_id
  };
}
function toMagicLinkToken(row) {
  return {
    createdAt: row.created_at,
    email: row.email,
    expiresAt: row.expires_at,
    id: row.id,
    otpHash: row.otp_hash,
    tokenHash: row.token_hash,
    userId: row.user_id
  };
}
function requireRow(row) {
  if (!row) {
    throw new Error("Expected database row");
  }
  return row;
}

export { PgMagicLinkAdapter, PgMfaAdapter, PgSessionAdapter, PgUserAdapter, PgWebAuthnAdapter, createPgAuthAdapters, pgAuthSchemaSql };
