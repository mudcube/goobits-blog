import { eq, and } from 'drizzle-orm';

// src/adapters/verification-token/base.ts
var VerificationTokenAdapter = class {
  /**
   * Atomically find-and-consume a token. Should be the only call site
   * used during verification. The default below is a non-atomic
   * find+delete pair; adapters whose storage supports it (SQL `DELETE
   * ... RETURNING`, in-memory `Map`) should override.
   */
  async consumeByToken(params) {
    const record = await this.findByToken(params);
    if (!record) return null;
    await this.deleteById(record.token.id);
    return record;
  }
};

// src/adapters/drizzle-types.ts
function requireColumn(table, column) {
  const found = table[column];
  if (!found) {
    throw new Error(`Missing column '${column}' in drizzle table configuration`);
  }
  return found;
}
function requireCondition(condition) {
  if (!condition) {
    throw new Error("Missing SQL condition");
  }
  return condition;
}

// src/adapters/verification-token/drizzle-verification.ts
function toToken(row) {
  if (!row) return null;
  const id = row["id"];
  const userId = row["userId"] ?? row["user_id"];
  const type = row["type"];
  const token = row["token"];
  const expiresAt = row["expiresAt"] ?? row["expires_at"];
  const createdAt = row["createdAt"] ?? row["created_at"];
  if (typeof id !== "string" && typeof id !== "number") return null;
  if (typeof userId !== "string" && typeof userId !== "number") return null;
  if (typeof type !== "string") return null;
  if (typeof token !== "string") return null;
  if (!(expiresAt instanceof Date) && typeof expiresAt !== "string") return null;
  const expiresDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (Number.isNaN(expiresDate.getTime())) return null;
  const createdDate = createdAt instanceof Date ? createdAt : typeof createdAt === "string" ? new Date(createdAt) : /* @__PURE__ */ new Date();
  return {
    id: String(id),
    userId: String(userId),
    type,
    token,
    expiresAt: expiresDate,
    createdAt: Number.isNaN(createdDate.getTime()) ? /* @__PURE__ */ new Date() : createdDate
  };
}
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
var DrizzleVerificationTokenAdapter = class extends VerificationTokenAdapter {
  db;
  tokensTable;
  usersTable;
  constructor(db, options = {}) {
    super();
    if (!db) {
      throw new Error("DrizzleVerificationTokenAdapter requires a database instance");
    }
    if (!options.tokensTable) {
      throw new Error("DrizzleVerificationTokenAdapter requires tokensTable option");
    }
    if (!options.usersTable) {
      throw new Error("DrizzleVerificationTokenAdapter requires usersTable option");
    }
    this.db = db;
    this.tokensTable = options.tokensTable;
    this.usersTable = options.usersTable;
  }
  async create({
    userId,
    type,
    token,
    expiresAt
  }) {
    await this.db.insert(this.tokensTable).values({
      userId,
      type,
      token,
      expiresAt
    });
  }
  async findByToken({ token, type }) {
    const [record] = await this.db.select({
      token: this.tokensTable,
      user: this.usersTable
    }).from(this.tokensTable).innerJoin(
      this.usersTable,
      eq(requireColumn(this.tokensTable, "userId"), requireColumn(this.usersTable, "id"))
    ).where(
      requireCondition(and(eq(this.tokensTable.token, token), eq(this.tokensTable.type, type)))
    );
    if (!record) return null;
    const tokenRecord = toToken(record["token"] ?? null);
    const user = toUser(record["user"] ?? null);
    if (!tokenRecord || !user) return null;
    return { token: tokenRecord, user };
  }
  async deleteById(tokenId) {
    await this.db.delete(this.tokensTable).where(eq(requireColumn(this.tokensTable, "id"), tokenId));
  }
  async deleteByUserAndType({ userId, type }) {
    await this.db.delete(this.tokensTable).where(
      requireCondition(
        and(eq(this.tokensTable.userId, userId), eq(this.tokensTable.type, type))
      )
    );
  }
  async consumeByToken({
    token,
    type
  }) {
    const rows = await this.db.delete(this.tokensTable).where(
      requireCondition(and(eq(this.tokensTable.token, token), eq(this.tokensTable.type, type)))
    ).returning();
    const tokenRecord = toToken(rows[0] ?? null);
    if (!tokenRecord) return null;
    const [userRow] = await this.db.select().from(this.usersTable).where(eq(requireColumn(this.usersTable, "id"), tokenRecord.userId));
    const user = toUser(userRow ?? null);
    if (!user) return null;
    return { token: tokenRecord, user };
  }
};

// src/adapters/verification-token/d1.ts
function getOwnOrFallback(row, key, fallback) {
  return Object.prototype.hasOwnProperty.call(row, key) ? row[key] : fallback;
}
var D1VerificationTokenAdapter = class extends VerificationTokenAdapter {
  db;
  tokensTable;
  usersTable;
  columns;
  userColumns;
  constructor(db, options = {}) {
    super();
    this.db = db;
    this.tokensTable = options.tokensTable || "verification_tokens";
    this.usersTable = options.usersTable || "users";
    this.columns = {
      id: options.columns?.["id"] || "id",
      userId: options.columns?.["userId"] || "user_id",
      type: options.columns?.["type"] || "type",
      token: options.columns?.["token"] || "token",
      expiresAt: options.columns?.["expiresAt"] || "expires_at"
    };
    this.userColumns = {
      id: options.userColumns?.["id"] || "id",
      email: options.userColumns?.["email"] || "email",
      name: options.userColumns?.["name"] || "name",
      avatar: options.userColumns?.["avatar"] || "avatar"
    };
  }
  coerceDbId(id) {
    return /^\d+$/.test(id) ? Number(id) : id;
  }
  mapTokenAndUser(row) {
    if (!row) return null;
    const tokenId = row["token_id"] ?? row[this.columns.id];
    const tokenUserId = row["token_user_id"] ?? row[this.columns.userId];
    const type = row["token_type"] ?? row[this.columns.type];
    const token = row["verification_token"] ?? row[this.columns.token];
    const expiresAt = row["token_expires_at"] ?? row[this.columns.expiresAt];
    const userId = row["user_id"] ?? row[this.userColumns.id] ?? tokenUserId;
    const email = row["user_email"] ?? row[this.userColumns.email];
    const name = row["user_name"] ?? row[this.userColumns.name];
    const avatar = getOwnOrFallback(row, "user_avatar", row[this.userColumns.avatar]);
    if (typeof tokenId !== "string" && typeof tokenId !== "number" || typeof tokenUserId !== "string" && typeof tokenUserId !== "number" || typeof userId !== "string" && typeof userId !== "number" || typeof type !== "string" || typeof token !== "string" || typeof expiresAt !== "string" || typeof email !== "string" || typeof name !== "string" || avatar !== null && typeof avatar !== "string") {
      return null;
    }
    const expiresAtDate = new Date(expiresAt);
    if (Number.isNaN(expiresAtDate.getTime())) return null;
    const tokenRecord = {
      id: String(tokenId),
      userId: String(tokenUserId),
      type,
      token,
      expiresAt: expiresAtDate,
      createdAt: /* @__PURE__ */ new Date()
    };
    const user = {
      id: String(userId),
      email,
      name,
      avatar,
      emailVerified: true
    };
    return { token: tokenRecord, user };
  }
  async create({
    userId,
    type,
    token,
    expiresAt
  }) {
    await this.db.prepare(
      `INSERT INTO ${this.tokensTable} (${this.columns.id}, ${this.columns.userId}, ${this.columns.type}, ${this.columns.token}, ${this.columns.expiresAt}) VALUES (?, ?, ?, ?, ?)`
    ).bind(
      crypto.randomUUID(),
      this.coerceDbId(userId),
      type,
      token,
      expiresAt.toISOString()
    ).run();
  }
  async findByToken({ token, type }) {
    const row = await this.db.prepare(
      `SELECT t.${this.columns.id} AS token_id, t.${this.columns.userId} AS token_user_id, t.${this.columns.type} AS token_type, t.${this.columns.token} AS verification_token, t.${this.columns.expiresAt} AS token_expires_at, u.${this.userColumns.id} AS user_id, u.${this.userColumns.email} AS user_email, u.${this.userColumns.name} AS user_name, u.${this.userColumns.avatar} AS user_avatar FROM ${this.tokensTable} t JOIN ${this.usersTable} u ON t.${this.columns.userId} = u.${this.userColumns.id} WHERE t.${this.columns.token} = ? AND t.${this.columns.type} = ? LIMIT 1`
    ).bind(token, type).first();
    return this.mapTokenAndUser(row);
  }
  async deleteById(tokenId) {
    await this.db.prepare(`DELETE FROM ${this.tokensTable} WHERE ${this.columns.id} = ?`).bind(tokenId).run();
  }
  async deleteByUserAndType({ userId, type }) {
    await this.db.prepare(
      `DELETE FROM ${this.tokensTable} WHERE ${this.columns.userId} = ? AND ${this.columns.type} = ?`
    ).bind(this.coerceDbId(userId), type).run();
  }
  async consumeByToken({
    token,
    type
  }) {
    const deletedRow = await this.db.prepare(
      `DELETE FROM ${this.tokensTable} WHERE ${this.columns.token} = ? AND ${this.columns.type} = ? RETURNING *`
    ).bind(token, type).first();
    if (!deletedRow) return null;
    const userId = deletedRow[this.columns.userId];
    if (typeof userId !== "string" && typeof userId !== "number") return null;
    const userRow = await this.db.prepare(`SELECT * FROM ${this.usersTable} WHERE ${this.userColumns.id} = ? LIMIT 1`).bind(this.coerceDbId(String(userId))).first();
    const merged = {
      token_id: deletedRow[this.columns.id] ?? null,
      token_user_id: deletedRow[this.columns.userId] ?? null,
      token_type: deletedRow[this.columns.type] ?? null,
      verification_token: deletedRow[this.columns.token] ?? null,
      token_expires_at: deletedRow[this.columns.expiresAt] ?? null,
      user_id: userRow?.[this.userColumns.id] ?? userId,
      user_email: userRow?.[this.userColumns.email] ?? null,
      user_name: userRow?.[this.userColumns.name] ?? null,
      user_avatar: userRow?.[this.userColumns.avatar] ?? null
    };
    return this.mapTokenAndUser(merged);
  }
};

export { D1VerificationTokenAdapter, DrizzleVerificationTokenAdapter, VerificationTokenAdapter };
