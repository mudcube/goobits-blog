import { TokenAdapter } from "./base.js";
import { encryptTokens, decryptTokens } from "../../utils/crypto.js";
export class KVTokenAdapter extends TokenAdapter {
    namespace;
    encrypt;
    encryptionKey;
    keyPrefix;
    constructor(namespace, options = {}) {
        super();
        this.namespace = namespace;
        this.encrypt = options.encrypt !== false;
        this.encryptionKey = options.encryptionKey || null;
        this.keyPrefix = options.keyPrefix || "oauth_tokens";
        if (this.encrypt && !this.encryptionKey) {
            throw new Error("KVTokenAdapter requires encryptionKey when encryption is enabled");
        }
    }
    _key(userId, provider) {
        return `${this.keyPrefix}:${userId}:${provider}`;
    }
    async storeTokens(userId, provider, tokens) {
        const key = this.encryptionKey;
        const tokenData = this.encrypt
            ? await encryptTokens(tokens, key)
            : JSON.stringify(tokens);
        await this.namespace.put(this._key(userId, provider), tokenData);
    }
    async getTokens(userId, provider) {
        const raw = await this.namespace.get(this._key(userId, provider));
        if (!raw)
            return null;
        const key = this.encryptionKey;
        return this.encrypt
            ? await decryptTokens(raw, key)
            : JSON.parse(raw);
    }
    async refreshTokens(_userId, _provider) {
        throw new Error("refreshTokens not implemented - use provider-specific refresh logic");
    }
    async deleteTokens(userId, provider) {
        await this.namespace.delete(this._key(userId, provider));
    }
}
//# sourceMappingURL=kv.js.map