import { UserAdapter } from "./base.js";
export class D1UserAdapter extends UserAdapter {
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
        };
        this.oauthColumns = {
            userId: options.oauthColumns?.["userId"] || "user_id",
            provider: options.oauthColumns?.["provider"] || "provider",
            providerAccountId: options.oauthColumns?.["providerAccountId"] || "provider_account_id",
        };
        this.allowedFields = options.allowedFields || [
            "email",
            "name",
            "avatar",
            "emailVerified",
            "password",
        ];
    }
    mapUser(row) {
        if (!row)
            return null;
        const rawId = row[this.columns["id"]] ?? row["id"];
        const email = row[this.columns["email"]] ?? row["email"];
        const rawName = row[this.columns["name"]] ?? row["name"];
        const rawAvatar = row[this.columns["avatar"]] ?? row["avatar"];
        const rawEmailVerified = row[this.columns.emailVerified] ?? row["email_verified"];
        if (rawId === null || rawId === undefined)
            return null;
        if (typeof email !== "string")
            return null;
        // Normalize data from SQLite/D1 which may represent values as numbers/strings.
        const id = typeof rawId === "string" || typeof rawId === "number"
            ? String(rawId)
            : null;
        if (!id)
            return null;
        const name = typeof rawName === "string" ? rawName : email;
        const avatar = typeof rawAvatar === "string" ? rawAvatar : null;
        let emailVerified = false;
        if (typeof rawEmailVerified === "boolean")
            emailVerified = rawEmailVerified;
        else if (rawEmailVerified === 0 || rawEmailVerified === 1)
            emailVerified = Boolean(rawEmailVerified);
        else if (rawEmailVerified === "0" || rawEmailVerified === "1")
            emailVerified = rawEmailVerified === "1";
        return {
            id,
            email,
            name,
            avatar,
            emailVerified,
        };
    }
    _defaultSanitizeUser(user) {
        return user;
    }
    toD1Value(value) {
        if (value === null || value === undefined)
            return null;
        if (typeof value === "boolean")
            return value ? 1 : 0;
        if (typeof value === "string" || typeof value === "number")
            return value;
        return String(value);
    }
    async createUser(profile, metadata = {}) {
        const userData = {
            email: profile.email,
            name: profile.name ?? profile.email,
            avatar: profile.picture ?? null,
            emailVerified: Boolean(profile.verified_email),
            ...metadata,
        };
        const passwordHash = typeof metadata["password"] === "string" ? metadata["password"] : null;
        const cols = [this.columns.email, this.columns.name, this.columns.avatar, this.columns.emailVerified];
        const values = [
            this.toD1Value(userData.email),
            this.toD1Value(userData.name),
            this.toD1Value(userData.avatar),
            this.toD1Value(userData.emailVerified),
        ];
        // Some flows (e.g. credentials sign-in) expect the password hash to be stored at user creation time.
        if (passwordHash && this.columns.password) {
            cols.push(this.columns.password);
            values.push(this.toD1Value(passwordHash));
        }
        const placeholders = cols.map(() => "?").join(", ");
        const sql = `INSERT INTO ${this.usersTable} (${cols.join(", ")}) VALUES (${placeholders})`;
        const result = await this.db.prepare(sql).bind(...values).run();
        // Prefer looking up by email (works even when table IDs aren't rowid-backed).
        const createdByEmail = await this.getUserByEmail(profile.email);
        if (createdByEmail)
            return createdByEmail;
        // Fallback for environments where email is not unique.
        const id = result?.meta?.last_row_id;
        if (id !== undefined) {
            const created = await this.getUserById(String(id), id);
            if (created)
                return created;
        }
        throw new Error("Created user not found");
    }
    async getUserById(id, rawId) {
        const sql = `SELECT * FROM ${this.usersTable} WHERE ${this.columns.id} = ? LIMIT 1`;
        const normalizedRow = await this.db.prepare(sql).bind(id).first();
        if (normalizedRow) {
            return this.sanitizeUser(this.mapUser(normalizedRow));
        }
        if (rawId !== undefined && rawId !== id) {
            const rawRow = await this.db.prepare(sql).bind(rawId).first();
            return this.sanitizeUser(this.mapUser(rawRow));
        }
        return null;
    }
    async getUserByEmail(email) {
        const sql = `SELECT * FROM ${this.usersTable} WHERE ${this.columns.email} = ? LIMIT 1`;
        const row = await this.db.prepare(sql).bind(email).first();
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
            if (!existing)
                throw new Error("User not found");
            return existing;
        }
        for (const field of fields) {
            if (!this.allowedFields.includes(field)) {
                throw new Error(`Field not allowed for update: ${field}`);
            }
        }
        const mappedFields = fields.map((field) => {
            if (field === "id")
                return this.columns.id;
            if (field === "email")
                return this.columns.email;
            if (field === "name")
                return this.columns.name;
            if (field === "avatar")
                return this.columns.avatar;
            if (field === "emailVerified")
                return this.columns.emailVerified;
            if (field === "password")
                return this.columns.password;
            return field;
        });
        const setClause = mappedFields.map((f) => `${f} = ?`).join(", ");
        const values = fields.map((f) => data[f]);
        const sql = `UPDATE ${this.usersTable} SET ${setClause} WHERE ${this.columns.id} = ?`;
        await this.db
            .prepare(sql)
            .bind(...values.map((value) => this.toD1Value(value)), this.toD1Value(id))
            .run();
        const updated = await this.getUserById(id);
        if (!updated)
            throw new Error("Updated user not found");
        return updated;
    }
    async deleteUser(id) {
        await this.db
            .prepare(`DELETE FROM ${this.usersTable} WHERE ${this.columns.id} = ?`)
            .bind(id)
            .run();
    }
    async linkOAuthAccount(userId, provider, providerAccountId) {
        const sql = `INSERT INTO ${this.oauthAccountsTable} (${this.oauthColumns.userId}, ${this.oauthColumns.provider}, ${this.oauthColumns.providerAccountId}) VALUES (?, ?, ?)`;
        await this.db.prepare(sql).bind(userId, provider, providerAccountId).run();
    }
    async getUserWithPasswordHash(email) {
        const sql = `SELECT * FROM ${this.usersTable} WHERE ${this.columns.email} = ? LIMIT 1`;
        const row = await this.db.prepare(sql).bind(email).first();
        const mapped = this.mapUser(row);
        if (!mapped)
            return null;
        const password = row?.[this.columns["password"]] ?? row?.["password"];
        return {
            ...mapped,
            password: typeof password === "string" ? password : null,
        };
    }
}
//# sourceMappingURL=d1.js.map