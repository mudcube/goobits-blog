import { MagicLinkAdapter } from "./base.js";
export class D1MagicLinkAdapter extends MagicLinkAdapter {
    db;
    tokensTable;
    columns;
    constructor(db, options = {}) {
        super();
        this.db = db;
        this.tokensTable = options.tokensTable || "magic_link_tokens";
        this.columns = {
            id: options.columns?.["id"] || "id",
            userId: options.columns?.["userId"] || "user_id",
            email: options.columns?.["email"] || "email",
            tokenHash: options.columns?.["tokenHash"] || "token_hash",
            otpHash: options.columns?.["otpHash"] || "otp_hash",
            expiresAt: options.columns?.["expiresAt"] || "expires_at",
            createdAt: options.columns?.["createdAt"] || "created_at",
        };
    }
    async createToken({ userId, email, tokenHash, otpHash, expiresAt, metadata, }) {
        const sql = `INSERT INTO ${this.tokensTable} (${this.columns.userId}, ${this.columns.email}, ${this.columns.tokenHash}, ${this.columns.otpHash}, ${this.columns.expiresAt}) VALUES (?, ?, ?, ?, ?)`;
        await this.db
            .prepare(sql)
            .bind(userId, email, tokenHash, otpHash ?? null, expiresAt.toISOString())
            .run();
        return {
            id: crypto.randomUUID(),
            userId,
            email,
            tokenHash,
            otpHash: otpHash ?? null,
            expiresAt,
            createdAt: new Date(),
            ...metadata,
        };
    }
    async findByTokenHash(tokenHash) {
        const sql = `SELECT * FROM ${this.tokensTable} WHERE ${this.columns.tokenHash} = ? LIMIT 1`;
        const row = await this.db.prepare(sql).bind(tokenHash).first();
        return this.mapRow(row);
    }
    async findByEmailAndOtpHash({ email, otpHash, }) {
        const sql = `SELECT * FROM ${this.tokensTable} WHERE ${this.columns.email} = ? AND ${this.columns.otpHash} = ? LIMIT 1`;
        const row = await this.db.prepare(sql).bind(email, otpHash).first();
        return this.mapRow(row);
    }
    async deleteById(tokenId) {
        await this.db
            .prepare(`DELETE FROM ${this.tokensTable} WHERE ${this.columns.id} = ?`)
            .bind(tokenId)
            .run();
    }
    async deleteByUserId(userId) {
        await this.db
            .prepare(`DELETE FROM ${this.tokensTable} WHERE ${this.columns.userId} = ?`)
            .bind(userId)
            .run();
    }
    async deleteByEmail(email) {
        await this.db
            .prepare(`DELETE FROM ${this.tokensTable} WHERE ${this.columns.email} = ?`)
            .bind(email)
            .run();
    }
    mapRow(row) {
        if (!row)
            return null;
        const id = row[this.columns["id"]] ?? row["id"];
        const userId = row[this.columns.userId] ?? row["user_id"];
        const email = row[this.columns["email"]] ?? row["email"];
        const tokenHash = row[this.columns.tokenHash] ?? row["token_hash"];
        const otpHash = row[this.columns.otpHash] ?? row["otp_hash"];
        const expiresAt = row[this.columns.expiresAt] ?? row["expires_at"];
        const createdAt = row[this.columns.createdAt] ?? row["created_at"];
        if (typeof id !== "string")
            return null;
        if (userId !== null && typeof userId !== "string")
            return null;
        if (typeof email !== "string")
            return null;
        if (typeof tokenHash !== "string")
            return null;
        if (otpHash !== null && typeof otpHash !== "string")
            return null;
        if (typeof expiresAt !== "string")
            return null;
        const expiresAtDate = new Date(expiresAt);
        if (Number.isNaN(expiresAtDate.getTime()))
            return null;
        const createdAtDate = typeof createdAt === "string" && !Number.isNaN(new Date(createdAt).getTime())
            ? new Date(createdAt)
            : new Date();
        return {
            id,
            userId,
            email,
            tokenHash,
            otpHash,
            expiresAt: expiresAtDate,
            createdAt: createdAtDate,
        };
    }
}
//# sourceMappingURL=d1.js.map