import { DrizzleUserAdapter } from "../database/drizzle.js";
import { DrizzleSessionAdapter } from "../session/drizzle.js";
import { DrizzleTokenAdapter } from "../oauth-token/drizzle.js";
import { DrizzleVerificationTokenAdapter } from "../verification-token/drizzle-verification.js";
import { DrizzleMagicLinkAdapter } from "../magic-link/drizzle.js";
import { DrizzleWebAuthnAdapter } from "../webauthn/drizzle.js";
function getTable(key, options) {
    const explicit = options.tables?.[key];
    if (explicit)
        return explicit;
    return options.schema?.[key];
}
function requireTable(key, options) {
    const found = getTable(key, options);
    if (!found) {
        throw new Error(`drizzleAdapter requires '${key}' table. Pass it via options.schema.${key} or options.tables.${key}.`);
    }
    return found;
}
export function drizzleAdapter(db, options = {}) {
    const usersTable = requireTable("users", options);
    const sessionsTable = requireTable("sessions", options);
    const oauthAccountsTable = getTable("oauthAccounts", options);
    const user = new DrizzleUserAdapter(db, {
        usersTable,
        ...(oauthAccountsTable ? { oauthAccountsTable } : {}),
        ...(options.sanitizeUser ? { sanitizeUser: options.sanitizeUser } : {}),
    });
    const session = new DrizzleSessionAdapter(db, {
        sessionsTable,
        usersTable,
        ...(options.session?.sessionLifetime !== undefined
            ? { sessionLifetime: options.session.sessionLifetime }
            : {}),
        ...(options.session?.sessionRefreshThreshold !== undefined
            ? { sessionRefreshThreshold: options.session.sessionRefreshThreshold }
            : {}),
        ...(options.session?.cookieName !== undefined ? { cookieName: options.session.cookieName } : {}),
        ...(options.session?.secureCookies !== undefined
            ? { secureCookies: options.session.secureCookies }
            : {}),
        ...(options.sanitizeUser ? { sanitizeUser: options.sanitizeUser } : {}),
    });
    const oauthTokensTable = getTable("oauthTokens", options);
    const oauthToken = oauthTokensTable
        ? new DrizzleTokenAdapter(db, {
            tokensTable: oauthTokensTable,
            ...(options.oauthTokenEncryptionKey !== undefined
                ? { encryptionKey: options.oauthTokenEncryptionKey }
                : {}),
            encrypt: options.oauthTokenEncrypt ??
                (typeof options.oauthTokenEncryptionKey === "string" &&
                    options.oauthTokenEncryptionKey.length > 0),
        })
        : undefined;
    const verificationTokensTable = getTable("verificationTokens", options);
    const verificationToken = verificationTokensTable
        ? new DrizzleVerificationTokenAdapter(db, {
            tokensTable: verificationTokensTable,
            usersTable,
        })
        : undefined;
    const magicLinkTokensTable = getTable("magicLinkTokens", options);
    const magicLink = magicLinkTokensTable
        ? new DrizzleMagicLinkAdapter(db, { tokensTable: magicLinkTokensTable })
        : undefined;
    const webauthnCredentials = getTable("webauthnCredentials", options);
    const webauthnChallenges = getTable("webauthnChallenges", options);
    const webauthn = webauthnCredentials && webauthnChallenges
        ? new DrizzleWebAuthnAdapter(db, {
            credentialsTable: webauthnCredentials,
            challengesTable: webauthnChallenges,
        })
        : undefined;
    return {
        session,
        user,
        ...(oauthToken ? { oauthToken } : {}),
        ...(verificationToken ? { verificationToken } : {}),
        ...(magicLink ? { magicLink } : {}),
        ...(webauthn ? { webauthn } : {}),
    };
}
//# sourceMappingURL=index.js.map