import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import accountLockoutService from '../services/accountLockoutService';

const router = Router();

/**
 * Get Lockout Statistics
 * GET /api/lockout/stats
 * 
 * Returns account lockout statistics
 * Requires: ADMIN or DEVELOPER role
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
    try {
        const stats = accountLockoutService.getLockoutStats();

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Get Locked Accounts
 * GET /api/lockout/locked
 * 
 * Returns list of currently locked accounts
 * Requires: ADMIN or DEVELOPER role
 */
router.get('/locked', async (req: AuthRequest, res: Response) => {
    try {
        const lockedAccounts = accountLockoutService.getLockedAccounts();

        res.json({
            success: true,
            count: lockedAccounts.length,
            accounts: lockedAccounts.map(account => ({
                email: account.email,
                attempts: account.attempts,
                lockedUntil: account.lockedUntil,
                remainingTime: account.lockedUntil
                    ? Math.ceil((account.lockedUntil.getTime() - Date.now()) / 1000)
                    : 0
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Unlock Account
 * POST /api/lockout/unlock
 * 
 * Manually unlock a locked account
 * Requires: ADMIN or DEVELOPER role
 */
router.post('/unlock', async (req: AuthRequest, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const unlocked = accountLockoutService.unlockAccount(email);

        if (unlocked) {
            res.json({
                success: true,
                message: `Account ${email} has been unlocked`,
                email
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Account not found or not locked'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Check Account Status
 * GET /api/lockout/check/:email
 * 
 * Check if an account is locked
 * Requires: ADMIN or DEVELOPER role
 */
router.get('/check/:email', async (req: AuthRequest, res: Response) => {
    try {
        const { email } = req.params;

        const lockStatus = accountLockoutService.isAccountLocked(email);
        const remaining = accountLockoutService.getRemainingAttempts(email);

        res.json({
            success: true,
            email,
            locked: lockStatus.locked,
            attempts: lockStatus.attempts,
            remainingAttempts: remaining,
            remainingTime: lockStatus.remainingTime,
            lockedUntil: lockStatus.locked && lockStatus.remainingTime
                ? new Date(Date.now() + lockStatus.remainingTime * 1000).toISOString()
                : null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Cleanup Expired Attempts
 * POST /api/lockout/cleanup
 * 
 * Manually trigger cleanup of expired attempts
 * Requires: ADMIN or DEVELOPER role
 */
router.post('/cleanup', async (req: AuthRequest, res: Response) => {
    try {
        const cleaned = accountLockoutService.cleanupExpiredAttempts();

        res.json({
            success: true,
            message: `Cleaned up ${cleaned} expired attempt(s)`,
            cleaned
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
