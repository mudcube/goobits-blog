import type { Cookies } from '@sveltejs/kit';
import type { OAuthProfile, OAuthTokens, Session, User, WebAuthnCredential } from '../../types/index.js';
import type { MfaStatus } from '../../types/index.js';
import { UserAdapter } from '../database/base.js';
import { MfaAdapter } from '../mfa/base.js';
import { TokenAdapter } from '../oauth-token/base.js';
import { SessionAdapter } from '../session/base.js';
import { WebAuthnAdapter } from '../webauthn/base.js';
type StoredUser = User & {
    password?: string | null;
};
export declare class MemoryUserAdapter extends UserAdapter {
    #private;
    createUser(profile: OAuthProfile, metadata?: Record<string, unknown>): Promise<User>;
    getUserById(id: string): Promise<User | null>;
    setUser(user: StoredUser): void;
    getUserByEmail(email: string): Promise<User | null>;
    getUserByProviderId(provider: string, providerId: string): Promise<User | null>;
    updateUser(id: string, data: Partial<User> & Record<string, unknown>): Promise<User>;
    deleteUser(id: string): Promise<void>;
    linkOAuthAccount(userId: string, provider: string, providerAccountId: string): Promise<void>;
    getUserWithPasswordHash(email: string): Promise<(User & {
        password?: string | null;
    }) | null>;
}
export declare class MemorySessionAdapter extends SessionAdapter {
    #private;
    constructor({ cookieDomain, cookieName, secureCookies, sessionLifetimeMs, users }: {
        cookieDomain?: string;
        cookieName: string;
        secureCookies: boolean;
        sessionLifetimeMs?: number;
        users: MemoryUserAdapter;
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
export declare class MemoryWebAuthnAdapter extends WebAuthnAdapter {
    #private;
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
export declare class MemoryMfaAdapter extends MfaAdapter {
    #private;
    setSecret(userId: string, secret: string): Promise<void>;
    getSecret(userId: string): Promise<string | null>;
    enableMfa(userId: string): Promise<void>;
    disableMfa(userId: string): Promise<void>;
    setBackupCodes(userId: string, codes: string[]): Promise<void>;
    getBackupCodes(userId: string): Promise<string[]>;
    consumeBackupCode(userId: string, hash: string): Promise<void>;
    getStatus(userId: string): Promise<MfaStatus>;
}
export declare function createMemoryAuthAdapters(input: {
    cookieDomain?: string;
    cookieName: string;
    secureCookies: boolean;
}): {
    session: MemorySessionAdapter;
    mfa: MemoryMfaAdapter;
    user: MemoryUserAdapter;
    webauthn: MemoryWebAuthnAdapter;
};
export declare class MockUserAdapter extends MemoryUserAdapter {
}
export declare class MockSessionAdapter extends MemorySessionAdapter {
    #private;
    constructor();
    setUser(user: User): void;
    setSessionCookie(_cookies: Cookies, _session: Session): void;
    deleteSessionCookie(_cookies: Cookies): void;
}
export declare class MockTokenAdapter extends TokenAdapter {
    #private;
    storeTokens(userId: string, provider: string, tokens: OAuthTokens): Promise<void>;
    getTokens(userId: string, provider: string): Promise<OAuthTokens | null>;
    refreshTokens(userId: string, provider: string): Promise<OAuthTokens | null>;
    deleteTokens(userId: string, provider: string): Promise<void>;
}
export {};
