import { UserAdapter } from "./base.js";
import { and, eq } from "drizzle-orm";
import { requireCondition, } from "../drizzle-types.js";
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
function toDrizzleRow(values) {
    return values;
}
export class DrizzleUserAdapter extends UserAdapter {
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
            ...metadata,
        };
        await this.db.insert(this.usersTable).values(toDrizzleRow(userData));
        const user = await this.getUserByEmail(profile.email);
        if (!user)
            throw new Error("Created user not found");
        return user;
    }
    async getUserById(id) {
        const [row] = await this.db
            .select()
            .from(this.usersTable)
            .where(eq(this.usersTable.id, id));
        return this.sanitizeUser(toUser(row ?? null));
    }
    async getUserByEmail(email) {
        const [row] = await this.db
            .select()
            .from(this.usersTable)
            .where(eq(this.usersTable.email, email));
        return this.sanitizeUser(toUser(row ?? null));
    }
    async getUserByProviderId(provider, providerId) {
        if (!this.oauthAccountsTable) {
            throw new Error("OAuth accounts table not configured. Set oauthAccountsTable in adapter options.");
        }
        const [result] = await this.db
            .select({ user: this.usersTable })
            .from(this.oauthAccountsTable)
            .innerJoin(this.usersTable, eq(this.oauthAccountsTable.userId, this.usersTable.id))
            .where(requireCondition(and(eq(this.oauthAccountsTable.provider, provider), eq(this.oauthAccountsTable.providerAccountId, providerId))));
        return this.sanitizeUser(toUser(result?.["user"] ?? null));
    }
    async updateUser(id, data) {
        if (Object.keys(data).length > 0) {
            await this.db
                .update(this.usersTable)
                .set(toDrizzleRow(data))
                .where(eq(this.usersTable.id, id));
        }
        const updated = await this.getUserById(id);
        if (!updated)
            throw new Error("Updated user not found");
        return updated;
    }
    async deleteUser(id) {
        await this.db.delete(this.usersTable).where(eq(this.usersTable.id, id));
    }
    async linkOAuthAccount(userId, provider, providerAccountId) {
        if (!this.oauthAccountsTable) {
            throw new Error("OAuth accounts table not configured. Set oauthAccountsTable in adapter options.");
        }
        await this.db.insert(this.oauthAccountsTable).values({
            userId,
            provider,
            providerAccountId,
        });
    }
    async getUserWithPasswordHash(email) {
        const [row] = await this.db
            .select()
            .from(this.usersTable)
            .where(eq(this.usersTable.email, email));
        if (!row)
            return null;
        const user = toUser(row);
        if (!user)
            return null;
        const password = row["password"];
        return {
            ...user,
            password: typeof password === "string" ? password : null,
        };
    }
}
//# sourceMappingURL=drizzle.js.map