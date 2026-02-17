import { redirect, error } from "@sveltejs/kit";
import { OAuth2RequestError } from "arctic";
import { handleOAuthCallback } from "../utils/oauth.js";
import { getLogger } from "../utils/logger.js";
import { AuthPrincipalResolutionError } from "../errors/auth.js";
/**
 * Create a callback route handler for OAuth providers
 *
 * @param {Object} config - Handler configuration
 * @param {Object.<string, import('../providers/base.ts').OAuthProvider>} config.providers - Provider instances mapped by name
 * @param {string} [config.redirectAfterLogin] - URL to redirect to after successful auth
 * @param {Function} [config.isAuthenticated] - Function to check if user is authenticated (receives event.locals)
 * @param {Function} config.onAuthenticated - Called with (event, profile, tokens) after successful auth
 * @param {Function} [config.onError] - Optional error handler, called with (event, error)
 * @returns {import('@sveltejs/kit').RequestHandler}
 *
 * @example
 * // In src/routes/auth/[provider]/callback/+server.ts
 * import { createCallbackHandler } from '@goobits/auth/handlers';
 * import { GoogleProvider } from '@goobits/auth/providers';
 *
 * const googleProvider = new GoogleProvider({...});
 *
 * export const GET = createCallbackHandler({
 *   providers: { google: googleProvider },
 *   redirectAfterLogin: '/dashboard',
 *   isAuthenticated: (locals) => !!locals.user,
 *   onAuthenticated: async (event, profile, tokens) => {
 *     // Store tokens, create/update user, start session
 *     const user = await findOrCreateUser(profile);
 *     await sessionAdapter.createSession(user.id);
 *   }
 * });
 */
export function createCallbackHandler(config) {
    const { providers, redirectAfterLogin = "/", isAuthenticated = (locals) => !!locals.user, onAuthenticated, onError, } = config;
    const log = getLogger();
    const isStatusError = (value) => typeof value === "object" &&
        value !== null &&
        "status" in value &&
        typeof value.status === "number";
    return async (event) => {
        const { params, locals, url: _url } = event;
        try {
            // Already authenticated - redirect
            if (isAuthenticated(locals)) {
                throw redirect(302, redirectAfterLogin);
            }
            const providerName = String(params["provider"] ?? "");
            const providerInstance = providers[providerName];
            if (!providerInstance) {
                throw error(400, "Invalid OAuth provider");
            }
            // Extract Apple user data and callback params if present (POST form data)
            let appleUserData = null;
            let overrideParams = null;
            if (providerName === "apple" && event.request.method === "POST") {
                const formData = await event.request.formData();
                appleUserData = formData.get("user")?.toString() ?? null;
                overrideParams = {
                    code: formData.get("code")?.toString() ?? null,
                    state: formData.get("state")?.toString() ?? null,
                };
            }
            // Handle OAuth callback
            const callbacks = {
                onAuthenticated: async (userProfile, tokens) => {
                    await onAuthenticated(event, userProfile, tokens);
                },
                ...(onError
                    ? { onError: async (err) => onError(event, err) }
                    : {}),
            };
            await handleOAuthCallback({
                event,
                provider: providerName,
                providerInstance,
                appleUserData,
                overrideParams,
                callbacks,
            });
            throw redirect(302, redirectAfterLogin);
        }
        catch (err) {
            // Handle OAuth2 errors
            if (err instanceof OAuth2RequestError) {
                throw error(400, "OAuth authentication failed");
            }
            // Re-throw redirects and errors
            if (isStatusError(err)) {
                throw err;
            }
            if (err instanceof AuthPrincipalResolutionError) {
                throw error(err.status, err.message);
            }
            // Log and throw generic error
            log.error?.("Authentication error:", err);
            throw error(500, "Authentication system error");
        }
    };
}
//# sourceMappingURL=callback.js.map