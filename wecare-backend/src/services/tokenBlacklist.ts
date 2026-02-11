/**
 * Token Blacklist Service
 * Manages revoked/blacklisted JWT tokens
 */

interface BlacklistedToken {
    token: string;
    userId: string;
    expiresAt: number;
}

class TokenBlacklistService {
    private blacklist: Map<string, BlacklistedToken> = new Map();

    /**
     * Add token to blacklist
     */
    addToBlacklist(token: string, userId: string, expiresAt: number): void {
        this.blacklist.set(token, {
            token,
            userId,
            expiresAt
        });

        console.log(`🚫 Token blacklisted for user ${userId}`);
    }

    /**
     * Check if token is blacklisted
     */
    isBlacklisted(token: string): boolean {
        return this.blacklist.has(token);
    }

    /**
     * Remove expired tokens from blacklist (cleanup)
     */
    cleanup(): void {
        const now = Date.now();
        let removed = 0;

        for (const [token, data] of this.blacklist.entries()) {
            if (data.expiresAt < now) {
                this.blacklist.delete(token);
                removed++;
            }
        }

        if (removed > 0) {
            console.log(`🧹 Cleaned up ${removed} expired blacklisted tokens`);
        }
    }

    /**
     * Blacklist all tokens for a user (force logout all sessions)
     */
    blacklistAllForUser(userId: string): void {
        // Note: This is a placeholder
        // In production, you'd need to track all tokens per user
        console.log(`🚫 Force logout all sessions for user ${userId}`);
    }

    /**
     * Get blacklist size
     */
    getSize(): number {
        return this.blacklist.size;
    }
}

// Singleton instance
export const tokenBlacklist = new TokenBlacklistService();

// Cleanup expired tokens every hour (disabled in test to prevent open handles)
const isJest = typeof process.env.JEST_WORKER_ID === 'string' && process.env.JEST_WORKER_ID.length > 0;
if (process.env.NODE_ENV !== 'test' && !isJest) {
    setInterval(() => {
        tokenBlacklist.cleanup();
    }, 60 * 60 * 1000); // 1 hour
}
