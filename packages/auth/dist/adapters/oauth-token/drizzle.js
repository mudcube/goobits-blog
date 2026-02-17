import { TokenAdapter } from "./base.js";
import { and, eq } from "drizzle-orm";
import { decryptTokens, encryptTokens } from "../../utils/crypto.js";
import { requireCondition, requireColumn, } from "../drizzle-types.js";
function normalizeOAuthTokens(value) {
    if (!value || typeof value !== "object" || Array.isArray(value) || value instanceof Date) {
        return null;
    }
    const accessTokenRaw = value["accessToken"];
    const refreshTokenRaw = value["refreshToken"];
    const scopeRaw = value["scope"];
    const accessTokenExpiresAtRaw = value["accessTokenExpiresAt"];
    if (typeof accessTokenRaw !== "string")
        return null;
    const refreshToken = typeof refreshTokenRaw === "string" || refreshTokenRaw === null
        ? refreshTokenRaw
        : null;
    const scope = typeof scopeRaw === "string" || scopeRaw === null
        ? scopeRaw
        : null;
    let accessTokenExpiresAt;
    if (typeof accessTokenExpiresAtRaw === "string") {
        accessTokenExpiresAt = accessTokenExpiresAtRaw;
    }
    else if (accessTokenExpiresAtRaw instanceof Date) {
        accessTokenExpiresAt = accessTokenExpiresAtRaw.toISOString();
    }
    else {
        accessTokenExpiresAt = new Date().toISOString();
    }
    return {
        accessToken: accessTokenRaw,
        refreshToken,
        scope,
        accessTokenExpiresAt,
    };
}
export class DrizzleTokenAdapter extends TokenAdapter {
    db;
    tokensTable;
    encryptionKey;
    encrypt;
    constructor(db, options = {}) {
        super();
        if (!options.tokensTable) {
            throw new Error("DrizzleTokenAdapter requires tokensTable option");
        }
        this.db = db;
        this.tokensTable = options.tokensTable;
        this.encryptionKey = options.encryptionKey ?? null;
        this.encrypt = options.encrypt !== false;
        if (this.encrypt && !this.encryptionKey) {
            throw new Error("DrizzleTokenAdapter requires encryptionKey when encryption is enabled");
        }
    }
    getEncryptionKey() {
        if (!this.encryptionKey) {
            throw new Error("Encryption key is required");
        }
        return this.encryptionKey;
    }
    async storeTokens(userId, provider, tokens) {
        const key = this.getEncryptionKey();
        const tokenData = this.encrypt
            ? await encryptTokens(tokens, key)
            : JSON.stringify(tokens);
        await this.db
            .delete(this.tokensTable)
            .where(requireCondition(and(eq(requireColumn(this.tokensTable, "userId"), userId), eq(requireColumn(this.tokensTable, "provider"), provider))));
        await this.db.insert(this.tokensTable).values({
            userId,
            provider,
            tokens: tokenData,
        });
    }
    async getTokens(userId, provider) {
        const [row] = await this.db
            .select()
            .from(this.tokensTable)
            .where(requireCondition(and(eq(requireColumn(this.tokensTable, "userId"), userId), eq(requireColumn(this.tokensTable, "provider"), provider))));
        if (!row)
            return null;
        const raw = row["tokens"];
        if (typeof raw !== "string")
            return null;
        if (this.encrypt) {
            const decrypted = await decryptTokens(raw, this.getEncryptionKey());
            return decrypted ? normalizeOAuthTokens(decrypted) : null;
        }
        const parsed = JSON.parse(raw);
        return normalizeOAuthTokens(parsed);
    }
    async refreshTokens(_userId, _provider) {
        throw new Error("refreshTokens not implemented - use provider-specific refresh logic");
    }
    async deleteTokens(userId, provider) {
        await this.db
            .delete(this.tokensTable)
            .where(requireCondition(and(eq(requireColumn(this.tokensTable, "userId"), userId), eq(requireColumn(this.tokensTable, "provider"), provider))));
    }
}
//# sourceMappingURL=drizzle.js.map