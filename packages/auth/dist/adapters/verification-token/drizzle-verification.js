import { and, eq } from "drizzle-orm";
import { VerificationTokenAdapter } from "./base.js";
import { requireCondition, requireColumn, } from "../drizzle-types.js";
function toToken(row) {
    if (!row)
        return null;
    const id = row["id"];
    const userId = row["userId"] ?? row["user_id"];
    const type = row["type"];
    const token = row["token"];
    const expiresAt = row["expiresAt"] ?? row["expires_at"];
    const createdAt = row["createdAt"] ?? row["created_at"];
    if (typeof id !== "string" && typeof id !== "number")
        return null;
    if (typeof userId !== "string" && typeof userId !== "number")
        return null;
    if (typeof type !== "string")
        return null;
    if (typeof token !== "string")
        return null;
    if (!(expiresAt instanceof Date) && typeof expiresAt !== "string")
        return null;
    const expiresDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
    if (Number.isNaN(expiresDate.getTime()))
        return null;
    const createdDate = createdAt instanceof Date
        ? createdAt
        : typeof createdAt === "string"
            ? new Date(createdAt)
            : new Date();
    return {
        id: String(id),
        userId: String(userId),
        type,
        token,
        expiresAt: expiresDate,
        createdAt: Number.isNaN(createdDate.getTime()) ? new Date() : createdDate,
    };
}
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
export class DrizzleVerificationTokenAdapter extends VerificationTokenAdapter {
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
    async create({ userId, type, token, expiresAt, }) {
        await this.db.insert(this.tokensTable).values({
            userId,
            type,
            token,
            expiresAt,
        });
    }
    async findByToken({ token, type }) {
        const [record] = await this.db
            .select({
            token: this.tokensTable,
            user: this.usersTable,
        })
            .from(this.tokensTable)
            .innerJoin(this.usersTable, eq(requireColumn(this.tokensTable, "userId"), requireColumn(this.usersTable, "id")))
            .where(requireCondition(and(eq(this.tokensTable.token, token), eq(this.tokensTable.type, type))));
        if (!record)
            return null;
        const tokenRecord = toToken(record["token"] ?? null);
        const user = toUser(record["user"] ?? null);
        if (!tokenRecord || !user)
            return null;
        return { token: tokenRecord, user };
    }
    async deleteById(tokenId) {
        await this.db
            .delete(this.tokensTable)
            .where(eq(requireColumn(this.tokensTable, "id"), tokenId));
    }
    async deleteByUserAndType({ userId, type }) {
        await this.db
            .delete(this.tokensTable)
            .where(requireCondition(and(eq(this.tokensTable.userId, userId), eq(this.tokensTable.type, type))));
    }
}
//# sourceMappingURL=drizzle-verification.js.map