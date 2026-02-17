import { VerificationTokenAdapter } from "./base.js";
export class D1VerificationTokenAdapter extends VerificationTokenAdapter {
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
            expiresAt: options.columns?.["expiresAt"] || "expires_at",
        };
        this.userColumns = {
            id: options.userColumns?.["id"] || "id",
            email: options.userColumns?.["email"] || "email",
            name: options.userColumns?.["name"] || "name",
            avatar: options.userColumns?.["avatar"] || "avatar",
        };
    }
    coerceDbId(id) {
        return /^\d+$/.test(id) ? Number(id) : id;
    }
    mapTokenAndUser(row) {
        if (!row)
            return null;
        const tokenId = row[this.columns.id];
        const userId = row[this.columns.userId];
        const type = row[this.columns.type];
        const token = row[this.columns.token];
        const expiresAt = row[this.columns.expiresAt];
        const email = row[this.userColumns.email];
        const name = row[this.userColumns.name];
        const avatar = row[this.userColumns.avatar];
        if ((typeof tokenId !== "string" && typeof tokenId !== "number") ||
            (typeof userId !== "string" && typeof userId !== "number") ||
            typeof type !== "string" ||
            typeof token !== "string" ||
            typeof expiresAt !== "string" ||
            typeof email !== "string" ||
            typeof name !== "string" ||
            (avatar !== null && typeof avatar !== "string")) {
            return null;
        }
        const expiresAtDate = new Date(expiresAt);
        if (Number.isNaN(expiresAtDate.getTime()))
            return null;
        const tokenRecord = {
            id: String(tokenId),
            userId: String(userId),
            type,
            token,
            expiresAt: expiresAtDate,
            createdAt: new Date(),
        };
        const user = {
            id: String(userId),
            email,
            name,
            avatar,
            emailVerified: true,
        };
        return { token: tokenRecord, user };
    }
    async create({ userId, type, token, expiresAt, }) {
        await this.db
            .prepare(`INSERT INTO ${this.tokensTable} (${this.columns.id}, ${this.columns.userId}, ${this.columns.type}, ${this.columns.token}, ${this.columns.expiresAt}) VALUES (?, ?, ?, ?, ?)`)
            .bind(crypto.randomUUID(), this.coerceDbId(userId), type, token, expiresAt.toISOString())
            .run();
    }
    async findByToken({ token, type }) {
        const row = await this.db
            .prepare(`SELECT t.*, u.* FROM ${this.tokensTable} t JOIN ${this.usersTable} u ON t.${this.columns.userId} = u.${this.userColumns.id} WHERE t.${this.columns.token} = ? AND t.${this.columns.type} = ? LIMIT 1`)
            .bind(token, type)
            .first();
        return this.mapTokenAndUser(row);
    }
    async deleteById(tokenId) {
        await this.db
            .prepare(`DELETE FROM ${this.tokensTable} WHERE ${this.columns.id} = ?`)
            .bind(tokenId)
            .run();
    }
    async deleteByUserAndType({ userId, type }) {
        await this.db
            .prepare(`DELETE FROM ${this.tokensTable} WHERE ${this.columns.userId} = ? AND ${this.columns.type} = ?`)
            .bind(this.coerceDbId(userId), type)
            .run();
    }
}
//# sourceMappingURL=d1.js.map