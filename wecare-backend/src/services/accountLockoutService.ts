/**
 * Account Lockout Service
 * Prevents brute force attacks by locking accounts after failed login attempts
 */

interface LoginAttempt {
    email: string;
    attempts: number;
    lastAttempt: Date;
    lockedUntil?: Date;
}

// In-memory storage for login attempts
// In production, this should be stored in database or Redis
const loginAttempts = new Map<string, LoginAttempt>();

// Configuration
const MAX_ATTEMPTS = 5; // Lock after 5 failed attempts
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // Reset attempts after 15 minutes of inactivity

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(email: string): void {
    const normalizedEmail = email.toLowerCase();
    const now = new Date();

    const existing = loginAttempts.get(normalizedEmail);

    if (existing) {
        // Check if we should reset attempts (after window expires)
        const timeSinceLastAttempt = now.getTime() - existing.lastAttempt.getTime();

        if (timeSinceLastAttempt > ATTEMPT_WINDOW_MS) {
            // Reset attempts after window
            loginAttempts.set(normalizedEmail, {
                email: normalizedEmail,
                attempts: 1,
                lastAttempt: now
            });
        } else {
            // Increment attempts
            existing.attempts++;
            existing.lastAttempt = now;

            // Lock account if max attempts reached
            if (existing.attempts >= MAX_ATTEMPTS) {
                existing.lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MS);
                console.log(`🔒 Account locked: ${email} (${existing.attempts} failed attempts)`);
            }
        }
    } else {
        // First failed attempt
        loginAttempts.set(normalizedEmail, {
            email: normalizedEmail,
            attempts: 1,
            lastAttempt: now
        });
    }
}

/**
 * Check if account is locked
 */
export function isAccountLocked(email: string): { locked: boolean; remainingTime?: number; attempts?: number } {
    const normalizedEmail = email.toLowerCase();
    const attempt = loginAttempts.get(normalizedEmail);

    if (!attempt) {
        return { locked: false };
    }

    // Check if locked
    if (attempt.lockedUntil) {
        const now = new Date();

        if (now < attempt.lockedUntil) {
            // Still locked
            const remainingMs = attempt.lockedUntil.getTime() - now.getTime();
            return {
                locked: true,
                remainingTime: Math.ceil(remainingMs / 1000), // seconds
                attempts: attempt.attempts
            };
        } else {
            // Lock expired, reset
            loginAttempts.delete(normalizedEmail);
            return { locked: false };
        }
    }

    return {
        locked: false,
        attempts: attempt.attempts
    };
}

/**
 * Clear failed attempts after successful login
 */
export function clearFailedAttempts(email: string): void {
    const normalizedEmail = email.toLowerCase();
    loginAttempts.delete(normalizedEmail);
    console.log(`✅ Cleared failed attempts for: ${email}`);
}

/**
 * Manually unlock an account (admin function)
 */
export function unlockAccount(email: string): boolean {
    const normalizedEmail = email.toLowerCase();
    const attempt = loginAttempts.get(normalizedEmail);

    if (attempt) {
        loginAttempts.delete(normalizedEmail);
        console.log(`🔓 Account manually unlocked: ${email}`);
        return true;
    }

    return false;
}

/**
 * Get remaining attempts before lockout
 */
export function getRemainingAttempts(email: string): number {
    const normalizedEmail = email.toLowerCase();
    const attempt = loginAttempts.get(normalizedEmail);

    if (!attempt) {
        return MAX_ATTEMPTS;
    }

    // Check if attempts should be reset
    const now = new Date();
    const timeSinceLastAttempt = now.getTime() - attempt.lastAttempt.getTime();

    if (timeSinceLastAttempt > ATTEMPT_WINDOW_MS) {
        return MAX_ATTEMPTS;
    }

    return Math.max(0, MAX_ATTEMPTS - attempt.attempts);
}

/**
 * Get all locked accounts (admin function)
 */
export function getLockedAccounts(): Array<{ email: string; attempts: number; lockedUntil?: Date }> {
    const locked: Array<{ email: string; attempts: number; lockedUntil?: Date }> = [];
    const now = new Date();

    loginAttempts.forEach((attempt) => {
        if (attempt.lockedUntil && now < attempt.lockedUntil) {
            locked.push({
                email: attempt.email,
                attempts: attempt.attempts,
                lockedUntil: attempt.lockedUntil
            });
        }
    });

    return locked;
}

/**
 * Get account lockout statistics
 */
export function getLockoutStats(): {
    totalAttempts: number;
    lockedAccounts: number;
    config: {
        maxAttempts: number;
        lockoutDurationMinutes: number;
        attemptWindowMinutes: number;
    };
} {
    const now = new Date();
    let lockedCount = 0;

    loginAttempts.forEach((attempt) => {
        if (attempt.lockedUntil && now < attempt.lockedUntil) {
            lockedCount++;
        }
    });

    return {
        totalAttempts: loginAttempts.size,
        lockedAccounts: lockedCount,
        config: {
            maxAttempts: MAX_ATTEMPTS,
            lockoutDurationMinutes: LOCKOUT_DURATION_MS / 60000,
            attemptWindowMinutes: ATTEMPT_WINDOW_MS / 60000
        }
    };
}

/**
 * Cleanup expired attempts (run periodically)
 */
export function cleanupExpiredAttempts(): number {
    const now = new Date();
    let cleaned = 0;

    loginAttempts.forEach((attempt, email) => {
        // Remove if lock expired or no activity in attempt window
        const timeSinceLastAttempt = now.getTime() - attempt.lastAttempt.getTime();

        if (attempt.lockedUntil && now >= attempt.lockedUntil) {
            loginAttempts.delete(email);
            cleaned++;
        } else if (!attempt.lockedUntil && timeSinceLastAttempt > ATTEMPT_WINDOW_MS) {
            loginAttempts.delete(email);
            cleaned++;
        }
    });

    if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} expired login attempts`);
    }

    return cleaned;
}

// Start cleanup interval (every 5 minutes) - disabled in test environment to prevent open handles
if (process.env.NODE_ENV !== 'test') {
    setInterval(() => {
        cleanupExpiredAttempts();
    }, 5 * 60 * 1000);
}

export const accountLockoutService = {
    recordFailedAttempt,
    isAccountLocked,
    clearFailedAttempts,
    unlockAccount,
    getRemainingAttempts,
    getLockedAccounts,
    getLockoutStats,
    cleanupExpiredAttempts
};

export default accountLockoutService;
