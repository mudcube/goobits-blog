import { OAuthProvider } from "./base.js";
import { Google } from "arctic";
import { getLogger } from "../utils/logger.js";
/**
 * Google OAuth Provider
 * Implements OAuth 2.0 authentication with Google
 */
export class GoogleProvider extends OAuthProvider {
    client;
    defaultScopes;
    readTokenValue(value) {
        if (typeof value === "function")
            return value();
        return value ?? null;
    }
    /**
     * @param {Object} config - Configuration
     * @param {string} config.clientId - Google OAuth client ID
     * @param {string} config.clientSecret - Google OAuth client secret
     * @param {string} config.callbackUrl - OAuth callback URL
     * @param {string[]} [config.scopes] - Default OAuth scopes
     */
    constructor(config) {
        super("google", config);
        if (!config.clientId || !config.clientSecret || !config.callbackUrl) {
            throw new Error("GoogleProvider requires clientId, clientSecret, and callbackUrl");
        }
        this.client = new Google(config.clientId, config.clientSecret, config.callbackUrl);
        this.defaultScopes = config.scopes || [
            "openid",
            "profile",
            "email",
        ];
    }
    createAuthorizationURL(state, codeVerifier, scopes = this.defaultScopes) {
        const requestedScopes = scopes || this.defaultScopes;
        return this.client.createAuthorizationURL(state, codeVerifier, requestedScopes);
    }
    async getUserProfile(code, codeVerifier) {
        try {
            const tokens = (await this.client.validateAuthorizationCode(code, codeVerifier));
            const googleUserResponse = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
                headers: {
                    Authorization: `Bearer ${this.readTokenValue(tokens.accessToken) ?? ""}`,
                },
            });
            const googleUser = (await googleUserResponse.json());
            if (!googleUser.verified_email) {
                throw new Error("Google email not verified");
            }
            const profile = {
                id: googleUser.id,
                email: googleUser.email,
                name: googleUser.name,
                verified_email: googleUser.verified_email,
            };
            if (googleUser.picture) {
                profile.picture = googleUser.picture;
            }
            return {
                profile,
                tokens: {
                    accessToken: tokens.data?.access_token ??
                        this.readTokenValue(tokens.accessToken) ??
                        "",
                    refreshToken: tokens.data?.refresh_token ??
                        this.readTokenValue(tokens.refreshToken),
                    scope: tokens.data?.scope ?? tokens.scope ?? null,
                    accessTokenExpiresAt: new Date(Date.now() + (tokens.data?.expires_in ?? tokens.expiresIn ?? 0) * 1000).toISOString(),
                },
            };
        }
        catch (error) {
            getLogger().error?.("Error in GoogleProvider.getUserProfile:", error);
            throw error;
        }
    }
    async refreshAccessToken(refreshToken) {
        const newTokens = (await this.client.refreshAccessToken(refreshToken));
        return {
            accessToken: this.readTokenValue(newTokens.accessToken) ?? "",
            refreshToken: this.readTokenValue(newTokens.refreshToken),
            scope: newTokens.scope ?? newTokens.scopes ?? null,
            accessTokenExpiresAt: new Date(Date.now() + (newTokens.expiresIn ?? newTokens.expires_in ?? 0) * 1000).toISOString(),
        };
    }
}
//# sourceMappingURL=google.js.map