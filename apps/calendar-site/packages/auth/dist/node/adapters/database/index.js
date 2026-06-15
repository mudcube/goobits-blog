import { eq, and } from 'drizzle-orm';

// src/adapters/database/base.ts
var UserAdapter = class {
};

// src/adapters/drizzle-types.ts
function requireCondition(condition) {
  if (!condition) {
    throw new Error("Missing SQL condition");
  }
  return condition;
}

// src/adapters/database/drizzle.ts
function toUser(row) {
  if (!row) return null;
  const id = row["id"];
  const email = row["email"];
  const name = row["name"];
  const avatar = row["avatar"] ?? null;
  const emailVerified = row["emailVerified"] ?? row["email_verified"] ?? false;
  if (typeof id !== "string" && typeof id !== "number") return null;
  if (typeof email !== "string") return null;
  if (typeof name !== "string") return null;
  if (avatar !== null && typeof avatar !== "string") return null;
  if (typeof emailVerified !== "boolean" && emailVerified !== 0 && emailVerified !== 1) {
    return null;
  }
  return {
    id: String(id),
    email,
    name,
    avatar,
    emailVerified: Boolean(emailVerified)
  };
}
function toDrizzleRow(values) {
  return values;
}
var DrizzleUserAdapter = class extends UserAdapter {
  db;
  usersTable;
  oauthAccountsTable;
  sanitizeUser;
  constructor(db, options = {}) {
    super();
    if (!options.usersTable) {
      throw new Error("DrizzleUserAdapter requires usersTable option");
    }
    this.db = db;
    this.usersTable = options.usersTable;
    this.oauthAccountsTable = options.oauthAccountsTable ?? null;
    this.sanitizeUser = options.sanitizeUser ?? this._defaultSanitizeUser;
  }
  _defaultSanitizeUser(user) {
    return user;
  }
  async createUser(profile, metadata = {}) {
    const userData = {
      email: profile.email,
      name: profile.name ?? profile.email,
      avatar: profile.picture ?? null,
      emailVerified: Boolean(profile.verified_email),
      ...metadata
    };
    await this.db.insert(this.usersTable).values(toDrizzleRow(userData));
    const user = await this.getUserByEmail(profile.email);
    if (!user) throw new Error("Created user not found");
    return user;
  }
  async getUserById(id) {
    const [row] = await this.db.select().from(this.usersTable).where(eq(this.usersTable.id, id));
    return this.sanitizeUser(toUser(row ?? null));
  }
  async getUserByEmail(email) {
    const [row] = await this.db.select().from(this.usersTable).where(eq(this.usersTable.email, email));
    return this.sanitizeUser(toUser(row ?? null));
  }
  async getUserByProviderId(provider, providerId) {
    if (!this.oauthAccountsTable) {
      throw new Error(
        "OAuth accounts table not configured. Set oauthAccountsTable in adapter options."
      );
    }
    const [result] = await this.db.select({ user: this.usersTable }).from(this.oauthAccountsTable).innerJoin(
      this.usersTable,
      eq(this.oauthAccountsTable.userId, this.usersTable.id)
    ).where(requireCondition(
      and(
        eq(this.oauthAccountsTable.provider, provider),
        eq(this.oauthAccountsTable.providerAccountId, providerId)
      )
    ));
    return this.sanitizeUser(toUser(result?.["user"] ?? null));
  }
  async updateUser(id, data) {
    if (Object.keys(data).length > 0) {
      await this.db.update(this.usersTable).set(toDrizzleRow(data)).where(eq(this.usersTable.id, id));
    }
    const updated = await this.getUserById(id);
    if (!updated) throw new Error("Updated user not found");
    return updated;
  }
  async deleteUser(id) {
    await this.db.delete(this.usersTable).where(eq(this.usersTable.id, id));
  }
  async linkOAuthAccount(userId, provider, providerAccountId) {
    if (!this.oauthAccountsTable) {
      throw new Error(
        "OAuth accounts table not configured. Set oauthAccountsTable in adapter options."
      );
    }
    await this.db.insert(this.oauthAccountsTable).values({
      userId,
      provider,
      providerAccountId
    });
  }
  async getUserWithPasswordHash(email) {
    const [row] = await this.db.select().from(this.usersTable).where(eq(this.usersTable.email, email));
    if (!row) return null;
    const user = toUser(row);
    if (!user) return null;
    const password = row["password"];
    return {
      ...user,
      password: typeof password === "string" ? password : null
    };
  }
};

// src/adapters/database/d1.ts
var D1UserAdapter = class extends UserAdapter {
  db;
  usersTable;
  oauthAccountsTable;
  sanitizeUser;
  columns;
  oauthColumns;
  allowedFields;
  constructor(db, options = {}) {
    super();
    this.db = db;
    this.usersTable = options.usersTable || "users";
    this.oauthAccountsTable = options.oauthAccountsTable || "oauth_accounts";
    this.sanitizeUser = options.sanitizeUser || this._defaultSanitizeUser;
    this.columns = {
      id: options.columns?.["id"] || "id",
      email: options.columns?.["email"] || "email",
      name: options.columns?.["name"] || "name",
      avatar: options.columns?.["avatar"] || "avatar",
      emailVerified: options.columns?.["emailVerified"] || "email_verified",
      password: options.columns?.["password"] || "password",
      role: options.columns?.["role"] || "role",
      settings: options.columns?.["settings"] || "settings",
      createdAt: options.columns?.["createdAt"] || "created_at",
      updatedAt: options.columns?.["updatedAt"] || "updated_at"
    };
    this.oauthColumns = {
      userId: options.oauthColumns?.["userId"] || "user_id",
      provider: options.oauthColumns?.["provider"] || "provider",
      providerAccountId: options.oauthColumns?.["providerAccountId"] || "provider_account_id"
    };
    this.allowedFields = options.allowedFields || [
      "email",
      "name",
      "avatar",
      "emailVerified",
      "password",
      "role",
      "settings",
      "createdAt",
      "updatedAt"
    ];
  }
  mapUser(row) {
    if (!row) return null;
    const rawId = row[this.columns["id"]] ?? row["id"];
    const email = row[this.columns["email"]] ?? row["email"];
    const rawName = row[this.columns["name"]] ?? row["name"];
    const rawAvatar = row[this.columns["avatar"]] ?? row["avatar"];
    const rawEmailVerified = row[this.columns.emailVerified] ?? row["email_verified"];
    const rawRole = row[this.columns.role] ?? row["role"];
    const rawSettings = row[this.columns.settings] ?? row["settings"];
    const rawCreatedAt = row[this.columns.createdAt] ?? row["created_at"];
    const rawUpdatedAt = row[this.columns.updatedAt] ?? row["updated_at"];
    if (rawId === null || rawId === void 0) return null;
    if (typeof email !== "string") return null;
    const id = typeof rawId === "string" || typeof rawId === "number" ? String(rawId) : null;
    if (!id) return null;
    const name = typeof rawName === "string" ? rawName : email;
    const avatar = typeof rawAvatar === "string" ? rawAvatar : null;
    let emailVerified = false;
    if (typeof rawEmailVerified === "boolean") emailVerified = rawEmailVerified;
    else if (rawEmailVerified === 0 || rawEmailVerified === 1) emailVerified = Boolean(rawEmailVerified);
    else if (rawEmailVerified === "0" || rawEmailVerified === "1") emailVerified = rawEmailVerified === "1";
    const role = typeof rawRole === "string" ? rawRole : void 0;
    let parsedSettings;
    if (typeof rawSettings === "string" && rawSettings.trim().length > 0) {
      try {
        const decoded = JSON.parse(rawSettings);
        if (decoded && typeof decoded === "object" && !Array.isArray(decoded)) {
          parsedSettings = decoded;
        }
      } catch {
      }
    }
    const createdAt = typeof rawCreatedAt === "string" && !Number.isNaN(new Date(rawCreatedAt).getTime()) ? new Date(rawCreatedAt) : void 0;
    const updatedAt = typeof rawUpdatedAt === "string" && !Number.isNaN(new Date(rawUpdatedAt).getTime()) ? new Date(rawUpdatedAt) : void 0;
    return {
      id,
      email,
      name,
      avatar,
      emailVerified,
      ...role ? { role } : {},
      ...parsedSettings ? { settings: parsedSettings } : {},
      ...createdAt ? { createdAt } : {},
      ...updatedAt ? { updatedAt } : {}
    };
  }
  _defaultSanitizeUser(user) {
    return user;
  }
  mapFieldToColumn(field) {
    if (field === "id") return this.columns.id;
    if (field === "email") return this.columns.email;
    if (field === "name") return this.columns.name;
    if (field === "avatar") return this.columns.avatar;
    if (field === "emailVerified") return this.columns.emailVerified;
    if (field === "password") return this.columns.password;
    if (field === "role") return this.columns.role;
    if (field === "settings") return this.columns.settings;
    if (field === "createdAt") return this.columns.createdAt;
    if (field === "updatedAt") return this.columns.updatedAt;
    return field;
  }
  toD1Value(value) {
    if (value === null || value === void 0) return null;
    if (typeof value === "boolean") return value ? 1 : 0;
    if (typeof value === "string" || typeof value === "number") return value;
    if (value && typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }
  async createUser(profile, metadata = {}) {
    const normalizedEmail = profile.email.trim().toLowerCase();
    const userData = {
      email: normalizedEmail,
      name: profile.name ?? normalizedEmail,
      avatar: profile.picture ?? null,
      emailVerified: Boolean(profile.verified_email)
    };
    for (const [key, value] of Object.entries(metadata)) {
      if (!this.allowedFields.includes(key)) continue;
      userData[key] = value;
    }
    const fields = Object.keys(userData);
    const columns = fields.map((field) => this.mapFieldToColumn(field));
    const placeholders = fields.map(() => "?").join(", ");
    const values = fields.map((field) => this.toD1Value(userData[field]));
    const sql = `INSERT INTO ${this.usersTable} (${columns.join(", ")}) VALUES (${placeholders})`;
    const result = await this.db.prepare(sql).bind(...values).run();
    const createdByEmail = await this.getUserByEmail(normalizedEmail);
    if (createdByEmail) return createdByEmail;
    const id = result?.meta?.last_row_id;
    if (id !== void 0) {
      const created = await this.getUserById(String(id), id);
      if (created) return created;
    }
    throw new Error("Created user not found");
  }
  async getUserById(id, rawId) {
    const sql = `SELECT * FROM ${this.usersTable} WHERE ${this.columns.id} = ? LIMIT 1`;
    const normalizedRow = await this.db.prepare(sql).bind(id).first();
    if (normalizedRow) {
      return this.sanitizeUser(this.mapUser(normalizedRow));
    }
    if (rawId !== void 0 && rawId !== id) {
      const rawRow = await this.db.prepare(sql).bind(rawId).first();
      return this.sanitizeUser(this.mapUser(rawRow));
    }
    return null;
  }
  async getUserByEmail(email) {
    const sql = `SELECT * FROM ${this.usersTable} WHERE lower(${this.columns.email}) = lower(?) ORDER BY ${this.columns.id} ASC LIMIT 1`;
    const row = await this.db.prepare(sql).bind(email.trim()).first();
    return this.sanitizeUser(this.mapUser(row));
  }
  async getUserByProviderId(provider, providerId) {
    const sql = `SELECT u.* FROM ${this.oauthAccountsTable} o
			JOIN ${this.usersTable} u ON o.${this.oauthColumns.userId} = u.${this.columns.id}
			WHERE o.${this.oauthColumns.provider} = ? AND o.${this.oauthColumns.providerAccountId} = ? LIMIT 1`;
    const row = await this.db.prepare(sql).bind(provider, providerId).first();
    return this.sanitizeUser(this.mapUser(row));
  }
  async updateUser(id, data) {
    const fields = Object.keys(data);
    if (fields.length === 0) {
      const existing = await this.getUserById(id);
      if (!existing) throw new Error("User not found");
      return existing;
    }
    for (const field of fields) {
      if (!this.allowedFields.includes(field)) {
        throw new Error(`Field not allowed for update: ${field}`);
      }
    }
    const mappedFields = fields.map((field) => this.mapFieldToColumn(field));
    const setClause = mappedFields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((field) => this.toD1Value(data[field]));
    const sql = `UPDATE ${this.usersTable} SET ${setClause} WHERE ${this.columns.id} = ?`;
    await this.db.prepare(sql).bind(
      ...values,
      this.toD1Value(id)
    ).run();
    const updated = await this.getUserById(id);
    if (!updated) throw new Error("Updated user not found");
    return updated;
  }
  async deleteUser(id) {
    await this.db.prepare(`DELETE FROM ${this.usersTable} WHERE ${this.columns.id} = ?`).bind(id).run();
  }
  async linkOAuthAccount(userId, provider, providerAccountId) {
    const sql = `INSERT INTO ${this.oauthAccountsTable} (${this.oauthColumns.userId}, ${this.oauthColumns.provider}, ${this.oauthColumns.providerAccountId}) VALUES (?, ?, ?)`;
    await this.db.prepare(sql).bind(userId, provider, providerAccountId).run();
  }
  async getUserWithPasswordHash(email) {
    const sql = `SELECT * FROM ${this.usersTable} WHERE lower(${this.columns.email}) = lower(?) ORDER BY ${this.columns.id} ASC LIMIT 1`;
    const row = await this.db.prepare(sql).bind(email.trim()).first();
    const mapped = this.mapUser(row);
    if (!mapped) return null;
    const password = row?.[this.columns["password"]] ?? row?.["password"];
    return {
      ...mapped,
      password: typeof password === "string" ? password : null
    };
  }
};

export { D1UserAdapter, DrizzleUserAdapter, UserAdapter };
