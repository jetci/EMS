import bcrypt from 'bcrypt';

/**
 * Password Security Utility
 * Provides secure password hashing, verification, and validation
 */

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        return hash;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
};

/**
 * Verify a plain text password against a hashed password
 * @param password - Plain text password to verify
 * @param hash - Hashed password to compare against
 * @returns True if password matches, false otherwise
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    try {
        const isMatch = await bcrypt.compare(password, hash);
        return isMatch;
    } catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
};

/**
 * Validate password strength according to security requirements
 * @param password - Password to validate
 * @returns Validation result with errors if any
 */
export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!password || password.length === 0) {
        errors.push('Password is required');
        return { valid: false, errors };
    }

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Generate a random secure password
 * @param length - Length of password (default: 12)
 * @returns Random secure password
 */
export const generateSecurePassword = (length: number = 12): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}';
    const all = uppercase + lowercase + numbers + special;

    let password = '';

    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Check if a password has been compromised (basic check)
 * In production, this should integrate with Have I Been Pwned API
 * @param password - Password to check
 * @returns True if password appears to be compromised
 */
export const isCommonPassword = (password: string): boolean => {
    const commonPasswords = [
        'password', 'password123', '12345678', 'qwerty', 'abc123',
        'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
        'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
        'bailey', 'passw0rd', 'shadow', '123123', '654321'
    ];

    return commonPasswords.includes(password.toLowerCase());
};

/**
 * Calculate password strength score (0-100)
 * @param password - Password to evaluate
 * @returns Strength score
 */
export const calculatePasswordStrength = (password: string): number => {
    let score = 0;

    if (!password) return 0;

    // Length bonus
    score += Math.min(password.length * 4, 40);

    // Character variety
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;

    // Penalty for common patterns
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/^[0-9]+$/.test(password)) score -= 20; // Only numbers
    if (/^[a-zA-Z]+$/.test(password)) score -= 10; // Only letters

    // Penalty for common passwords
    if (isCommonPassword(password)) score -= 30;

    return Math.max(0, Math.min(100, score));
};
