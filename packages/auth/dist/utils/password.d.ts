/**
 * Hash a password using Argon2id
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Verify a password against its hash
 * @param {string} storedHash - Hashed password from database
 * @param {string} password - Plain text password to verify
 * @returns {Promise<boolean>} True if password matches
 */
export declare function verifyPassword(storedHash: string, password: string): Promise<boolean>;
/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export declare function validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=password.d.ts.map