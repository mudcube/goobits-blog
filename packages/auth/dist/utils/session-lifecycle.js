import { AuthPrincipalResolutionError } from "../errors/auth.js";
export async function ensureSessionAfterLogin(input) {
    const { event, sessionAdapter, userId, autoCreateSession = true, onLoginMode = "augment", } = input;
    if (!userId) {
        throw new AuthPrincipalResolutionError();
    }
    if (autoCreateSession && onLoginMode === "augment") {
        const session = await sessionAdapter.createSession(userId);
        sessionAdapter.setSessionCookie?.(event.cookies, session);
    }
    return userId;
}
//# sourceMappingURL=session-lifecycle.js.map