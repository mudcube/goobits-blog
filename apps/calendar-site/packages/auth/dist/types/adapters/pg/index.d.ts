import type { Cookies } from '@sveltejs/kit';
import type { OAuthProfile, Session, User } from '../../types/index.js';
import type { MagicLinkToken, MfaStatus } from '../../types/index.js';
import type { WebAuthnCredential } from '../../types/index.js';
import { UserAdapter } from '../database/base.js';
import { MagicLinkAdapter } from '../magic-link/base.js';
import { MfaAdapter } from '../mfa/base.js';
import { SessionAdapter } from '../session/base.js';
import { WebAuthnAdapter } from '../webauthn/base.js';
export type PgPoolLike = {
    query<T extends Record<string, unknown> = Record<string, unknown>>(text: string, values?: readonly unknown[]): Promise<{
        rows: T[];
    }>;
};
export declare class PgUserAdapter extends UserAdapter {
    #private;
    constructor({ db }: {
        db: PgPoolLike;
    });
    createUser(profile: OAuthProfile, metadata?: Record<string, unknown>): Promise<User>;
    getUserById(id: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    getUserByProviderId(provider: string, providerId: string): Promise<User | null>;
    updateUser(id: string, data: Partial<User> & Record<string, unknown>): Promise<User>;
    deleteUser(id: string): Promise<void>;
    linkOAuthAccount(userId: string, provider: string, providerAccountId: string): Promise<void>;
    getUserWithPasswordHash(email: string): Promise<(User & {
        password?: string | null;
    }) | null>;
}
export declare class PgSessionAdapter extends SessionAdapter {
    #private;
    constructor({ cookieDomain, cookieName, db, secureCookies, sessionLifetimeMs }: {
        cookieDomain?: string;
        cookieName: string;
        db: PgPoolLike;
        secureCookies: boolean;
        sessionLifetimeMs?: number;
    });
    get cookieName(): string;
    createSession(userId: string, metadata?: Record<string, unknown>): Promise<Session>;
    validateSession(sessionId: string): Promise<{
        session: Session | null;
        user: User | null;
    }>;
    invalidateSession(sessionId: string): Promise<void>;
    invalidateUserSessions(userId: string): Promise<void>;
    listSessions(userId: string): Promise<Session[]>;
    setSessionCookie(cookies: Cookies, session: Session): void;
    deleteSessionCookie(cookies: Cookies): void;
}
export declare class PgWebAuthnAdapter extends WebAuthnAdapter {
    #private;
    constructor({ db }: {
        db: PgPoolLike;
    });
    createChallenge({ challengeId, userId, challenge, type, expiresAt }: {
        challengeId: string;
        userId?: string | null;
        challenge: string;
        type: string;
        expiresAt: Date;
    }): Promise<void>;
    getChallenge(challengeId: string): Promise<Record<string, unknown> | null>;
    deleteChallenge(challengeId: string): Promise<void>;
    createCredential({ userId, credentialId, publicKey, counter, transports, name }: {
        userId: string;
        credentialId: string;
        publicKey: string;
        counter: number;
        transports?: string[] | null;
        name?: string | null;
    }): Promise<void>;
    getCredential(credentialId: string): Promise<WebAuthnCredential | null>;
    listCredentials(userId: string): Promise<WebAuthnCredential[]>;
    updateCredential(credentialId: string, updates: Record<string, unknown>): Promise<void>;
    deleteCredential(credentialId: string): Promise<void>;
    deleteUserCredentials(userId: string): Promise<void>;
}
export declare class PgMfaAdapter extends MfaAdapter {
    #private;
    constructor({ db }: {
        db: PgPoolLike;
    });
    setSecret(userId: string, secret: string): Promise<void>;
    getSecret(userId: string): Promise<string | null>;
    enableMfa(userId: string): Promise<void>;
    disableMfa(userId: string): Promise<void>;
    setBackupCodes(userId: string, codes: string[]): Promise<void>;
    getBackupCodes(userId: string): Promise<string[]>;
    consumeBackupCode(userId: string, hash: string): Promise<void>;
    getStatus(userId: string): Promise<MfaStatus>;
}
export declare class PgMagicLinkAdapter extends MagicLinkAdapter {
    #private;
    constructor({ db }: {
        db: PgPoolLike;
    });
    createToken({ userId, email, tokenHash, otpHash, expiresAt, metadata }: {
        userId: string | null;
        email: string;
        tokenHash: string;
        otpHash?: string | null;
        expiresAt: Date;
        metadata?: Record<string, unknown>;
    }): Promise<MagicLinkToken>;
    findByTokenHash(tokenHash: string): Promise<MagicLinkToken | null>;
    findByEmailAndOtpHash({ email, otpHash }: {
        email: string;
        otpHash: string;
    }): Promise<MagicLinkToken | null>;
    deleteById(tokenId: string): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
    deleteByEmail(email: string): Promise<void>;
    consumeByTokenHash(tokenHash: string): Promise<MagicLinkToken | null>;
    consumeByEmailAndOtpHash({ email, otpHash }: {
        email: string;
        otpHash: string;
    }): Promise<MagicLinkToken | null>;
}
export declare function createPgAuthAdapters(input: {
    cookieDomain?: string;
    cookieName: string;
    db: PgPoolLike;
    secureCookies: boolean;
}): {
    magicLink: PgMagicLinkAdapter;
    mfa: PgMfaAdapter;
    session: PgSessionAdapter;
    user: PgUserAdapter;
    webauthn: PgWebAuthnAdapter;
};
export declare const pgAuthSchemaSql = "\nCREATE TABLE IF NOT EXISTS auth_users (\n\tid TEXT PRIMARY KEY,\n\temail TEXT NOT NULL UNIQUE,\n\tname TEXT NOT NULL,\n\tavatar TEXT,\n\temail_verified BOOLEAN NOT NULL DEFAULT FALSE,\n\trole TEXT,\n\tsettings JSONB NOT NULL DEFAULT '{}'::jsonb,\n\tpassword TEXT,\n\tcreated_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n\tupdated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE TABLE IF NOT EXISTS auth_oauth_accounts (\n\tprovider TEXT NOT NULL,\n\tprovider_account_id TEXT NOT NULL,\n\tuser_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,\n\tcreated_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n\tPRIMARY KEY (provider, provider_account_id)\n);\n\nCREATE INDEX IF NOT EXISTS auth_oauth_accounts_user_id_idx ON auth_oauth_accounts(user_id);\n\nCREATE TABLE IF NOT EXISTS auth_sessions (\n\tid TEXT PRIMARY KEY,\n\tuser_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,\n\texpires_at TIMESTAMPTZ NOT NULL,\n\tcreated_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n\tlast_active_at TIMESTAMPTZ,\n\tip TEXT,\n\tuser_agent TEXT,\n\tfingerprint TEXT\n);\n\nCREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx ON auth_sessions(user_id);\nCREATE INDEX IF NOT EXISTS auth_sessions_expires_at_idx ON auth_sessions(expires_at);\n\nCREATE TABLE IF NOT EXISTS auth_mfa_factors (\n\tuser_id TEXT PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,\n\tsecret TEXT NOT NULL,\n\tenabled_at TIMESTAMPTZ,\n\tcreated_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n\tupdated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE TABLE IF NOT EXISTS auth_mfa_backup_codes (\n\tuser_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,\n\tcode_hash TEXT NOT NULL,\n\tcreated_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n\tPRIMARY KEY (user_id, code_hash)\n);\n\nCREATE TABLE IF NOT EXISTS auth_webauthn_challenges (\n\tid TEXT PRIMARY KEY,\n\tuser_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,\n\tchallenge TEXT NOT NULL,\n\ttype TEXT NOT NULL,\n\texpires_at TIMESTAMPTZ NOT NULL,\n\tcreated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX IF NOT EXISTS auth_webauthn_challenges_expires_at_idx ON auth_webauthn_challenges(expires_at);\nCREATE INDEX IF NOT EXISTS auth_webauthn_challenges_user_id_idx ON auth_webauthn_challenges(user_id);\n\nCREATE TABLE IF NOT EXISTS auth_webauthn_credentials (\n\tcredential_id TEXT PRIMARY KEY,\n\tuser_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,\n\tpublic_key TEXT NOT NULL,\n\tcounter INTEGER NOT NULL DEFAULT 0,\n\ttransports JSONB,\n\tname TEXT,\n\tcreated_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n\tupdated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX IF NOT EXISTS auth_webauthn_credentials_user_id_idx ON auth_webauthn_credentials(user_id);\n\nCREATE TABLE IF NOT EXISTS auth_magic_link_tokens (\n\tid TEXT PRIMARY KEY,\n\tuser_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,\n\temail TEXT NOT NULL,\n\ttoken_hash TEXT NOT NULL,\n\totp_hash TEXT,\n\texpires_at TIMESTAMPTZ NOT NULL,\n\tcreated_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n\tmetadata JSONB NOT NULL DEFAULT '{}'::jsonb\n);\n\nCREATE INDEX IF NOT EXISTS auth_magic_link_tokens_email_idx ON auth_magic_link_tokens(email);\nCREATE INDEX IF NOT EXISTS auth_magic_link_tokens_token_hash_idx ON auth_magic_link_tokens(token_hash);\nCREATE INDEX IF NOT EXISTS auth_magic_link_tokens_otp_hash_idx ON auth_magic_link_tokens(otp_hash);\nCREATE INDEX IF NOT EXISTS auth_magic_link_tokens_expires_at_idx ON auth_magic_link_tokens(expires_at);\n";
