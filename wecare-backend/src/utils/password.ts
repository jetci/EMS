import bcrypt from 'bcryptjs';

/**
 * Password Security Utility
 * Provides secure password hashing, verification, and validation
 */

const SALT_ROUNDS = 5;

/**
 * Hash a plain text password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
    try {
        console.log(`🔑 Hashing password... (cost=${SALT_ROUNDS})`);
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        console.log('✅ Password hashed');
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
    // Top 100 most common passwords + Thai common passwords
    const commonPasswords = [
        // Top 20 most common
        'password', 'password123', '12345678', 'qwerty', 'abc123',
        'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
        'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
        'bailey', 'passw0rd', 'shadow', '123123', '654321',

        // Top 21-50
        'superman', 'qazwsx', 'michael', 'football', 'welcome',
        'jesus', 'ninja', 'mustang', 'password1', 'admin',
        'administrator', 'root', 'toor', 'pass', 'test',
        'guest', 'info', 'adm', 'mysql', 'user',
        'oracle', 'ftp', 'pi', 'puppet', 'ansible',
        'ec2-user', 'vagrant', 'azureuser',

        // Top 51-100
        '123456', '123456789', 'picture1', 'password1234', '12345',
        '1234567890', '000000', '1234', 'iloveyou', 'princess',
        'rockyou', '1234567', '12345678', 'abc123', 'nicole',
        'daniel', 'babygirl', 'monkey', 'lovely', 'jessica',
        'michael', 'ashley', 'sunshine', 'shadow', 'superman',
        'qwerty123', 'welcome123', 'admin123', 'root123',

        // Sequential patterns
        '111111', '222222', '333333', '444444', '555555',
        '666666', '777777', '888888', '999999', '000000',
        'aaaaaa', 'bbbbbb', 'cccccc', 'abcdef', 'qwerty',
        'asdfgh', 'zxcvbn',

        // Keyboard patterns
        'qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1qaz2wsx',
        'qazwsxedc', 'qweasdzxc', '1q2w3e4r', 'qwerasdf',

        // Thai common passwords
        'รหัสผ่าน', 'ผ่าน', 'รหัส', 'ไทย', 'thailand',
        'bangkok', 'กรุงเทพ', 'สวัสดี', 'ขอบคุณ',

        // Service-specific
        'wecare', 'wecare123', 'ems', 'ems123', 'emergency',
        'ambulance', 'hospital', 'patient', 'driver', 'admin',

        // Date patterns (common)
        '01012000', '01011990', '01011980', '01011970',
        '31122000', '31121999', '31121990',

        // Simple variations
        'p@ssw0rd', 'p@ssword', 'passw0rd', 'Pa$$w0rd',
        'P@ssw0rd', 'P@ssword', 'Password1', 'Password123',
        'Admin123', 'Admin@123', 'Welcome1', 'Welcome123'
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
