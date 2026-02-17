import type { UserAdapter } from "../adapters/database/base.js";
type PasswordValidationResult = {
    valid: boolean;
    errors: string[];
};
type ValidatePasswordFn = (password: string) => PasswordValidationResult;
/**
 * Credentials Provider for email/password authentication
 * Handles signup, signin, and password management
 */
export declare class CredentialsProvider {
    name: string;
    validatePassword?: ValidatePasswordFn;
    /**
     * @param {Object} [options] - Configuration options
     * @param {Function} [options.validatePassword] - Custom password validation function
     */
    constructor(options?: {
        validatePassword?: ValidatePasswordFn;
    });
    /**
     * Authenticate a user with email and password
     * @param {Object} params
     * @param {string} params.email - User email
     * @param {string} params.password - Plain text password
     * @param {import('../adapters/database/base.ts').UserAdapter} params.userAdapter - User adapter
     * @returns {Promise<{user: Object, valid: boolean}>}
     */
    authenticate({ email, password, userAdapter, }: {
        email: string;
        password: string;
        userAdapter: UserAdapter;
    }): Promise<{
        user: Record<string, unknown> | null;
        valid: boolean;
    }>;
    /**
     * Create a new user with email and password
     * @param {Object} params
     * @param {string} params.email - User email
     * @param {string} params.password - Plain text password
     * @param {string} [params.name] - User name
     * @param {Object} [params.metadata] - Additional user data
     * @param {import('../adapters/database/base.ts').UserAdapter} params.userAdapter - User adapter
     * @returns {Promise<Object>} Created user (sanitized)
     */
    signUp({ email, password, name, metadata, userAdapter, }: {
        email: string;
        password: string;
        name?: string;
        metadata?: Record<string, unknown>;
        userAdapter: UserAdapter;
    }): Promise<Record<string, unknown>>;
    /**
     * Update user password
     * @param {Object} params
     * @param {string} params.userId - User ID
     * @param {string} params.newPassword - New plain text password
     * @param {import('../adapters/database/base.ts').UserAdapter} params.userAdapter - User adapter
     * @returns {Promise<Object>} Updated user (sanitized)
     */
    updatePassword({ userId, newPassword, userAdapter, }: {
        userId: string;
        newPassword: string;
        userAdapter: UserAdapter;
    }): Promise<Record<string, unknown>>;
    /**
     * Verify current password before allowing update
     * @param {Object} params
     * @param {string} params.email - User email
     * @param {string} params.currentPassword - Current plain text password
     * @param {string} params.newPassword - New plain text password
     * @param {import('../adapters/database/base.ts').UserAdapter} params.userAdapter - User adapter
     * @returns {Promise<{user: Object, valid: boolean}>}
     */
    changePassword({ email, currentPassword, newPassword, userAdapter, }: {
        email: string;
        currentPassword: string;
        newPassword: string;
        userAdapter: UserAdapter;
    }): Promise<{
        user: Record<string, unknown> | null;
        valid: boolean;
    }>;
}
export {};
//# sourceMappingURL=credentials.d.ts.map