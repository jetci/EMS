import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/auditService';

/**
 * Role Protection Middleware
 * Prevents privilege escalation and unauthorized role modifications
 */

/**
 * Prevent privilege escalation when creating or updating users
 * - Admin cannot create/modify DEVELOPER users
 * - Users cannot change their own role
 * - Users cannot elevate their privileges
 */
export const preventPrivilegeEscalation = (req: Request, res: Response, next: NextFunction) => {
    const currentUser = (req as any).user;
    const { role: targetRole } = req.body;
    const targetUserId = req.params.id;

    if (!currentUser) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // RULE 1: Only DEVELOPER can create/modify DEVELOPER users
    if (targetRole === 'DEVELOPER' && currentUser.role !== 'DEVELOPER') {
        auditService.log(
            currentUser.email,
            currentUser.role,
            'PRIVILEGE_ESCALATION_ATTEMPT',
            targetUserId || 'new',
            {
                attemptedRole: 'DEVELOPER',
                reason: 'Non-DEVELOPER tried to create/modify DEVELOPER user'
            }
        );

        return res.status(403).json({
            error: 'Forbidden',
            details: ['Only DEVELOPER users can create or modify DEVELOPER accounts']
        });
    }

    // RULE 2: Admin cannot view or modify DEVELOPER users
    if (currentUser.role === 'admin' && targetUserId) {
        // Check if target user is DEVELOPER (for updates)
        try {
            const { sqliteDB } = require('../db/sqliteDB');
            const targetUser = sqliteDB.get('SELECT * FROM users WHERE id = ?', [targetUserId]);

            if (targetUser && targetUser.role === 'DEVELOPER') {
                auditService.log(
                    currentUser.email,
                    currentUser.role,
                    'PRIVILEGE_ESCALATION_ATTEMPT',
                    targetUserId,
                    {
                        reason: 'Admin tried to modify DEVELOPER user'
                    }
                );

                return res.status(403).json({
                    error: 'Forbidden',
                    details: ['Admin users cannot modify DEVELOPER accounts']
                });
            }
        } catch (error) {
            console.error('Error checking target user role:', error);
        }
    }

    // RULE 3: Users cannot change their own role
    if (targetUserId === currentUser.id && targetRole && targetRole !== currentUser.role) {
        auditService.log(
            currentUser.email,
            currentUser.role,
            'PRIVILEGE_ESCALATION_ATTEMPT',
            currentUser.id,
            {
                currentRole: currentUser.role,
                attemptedRole: targetRole,
                reason: 'User tried to change own role'
            }
        );

        return res.status(403).json({
            error: 'Forbidden',
            details: ['You cannot change your own role. Contact an administrator.']
        });
    }

    // RULE 4: Role hierarchy - users can only create/modify users with strictly lower privileges
    const roleHierarchy: { [key: string]: number } = {
        'DEVELOPER': 100,
        'admin': 90,
        'EXECUTIVE': 85,  // Special executive privileges
        'OFFICER': 75,    // Special officer privileges
        'office': 60,
        'radio_center': 50,
        'driver': 40,
        'community': 30
    };

    const currentUserLevel = roleHierarchy[currentUser.role] || 0;
    const targetRoleLevel = roleHierarchy[targetRole] || 0;

    // Users can only create/modify users with STRICTLY LOWER privilege level
    if (targetRole && targetRoleLevel >= currentUserLevel) {
        auditService.log(
            currentUser.email,
            currentUser.role,
            'PRIVILEGE_ESCALATION_ATTEMPT',
            targetUserId || 'new',
            {
                currentRole: currentUser.role,
                currentLevel: currentUserLevel,
                attemptedRole: targetRole,
                attemptedLevel: targetRoleLevel,
                reason: 'User tried to create/modify user with equal or higher privileges'
            }
        );

        return res.status(403).json({
            error: 'Forbidden',
            details: [`You cannot create or modify users with role '${targetRole}' as it has equal or higher privileges than your current role`]
        });
    }

    next();
};

/**
 * Prevent users from deleting themselves
 */
export const preventSelfDeletion = (req: Request, res: Response, next: NextFunction) => {
    const currentUser = (req as any).user;
    const targetUserId = req.params.id;

    if (!currentUser) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (targetUserId === currentUser.id) {
        auditService.log(
            currentUser.email,
            currentUser.role,
            'SELF_DELETION_ATTEMPT',
            currentUser.id,
            { reason: 'User tried to delete own account' }
        );

        return res.status(403).json({
            error: 'Forbidden',
            details: ['You cannot delete your own account. Contact an administrator.']
        });
    }

    next();
};

/**
 * Prevent deletion of DEVELOPER users by non-DEVELOPER users
 */
export const preventDeveloperDeletion = (req: Request, res: Response, next: NextFunction) => {
    const currentUser = (req as any).user;
    const targetUserId = req.params.id;

    if (!currentUser) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (currentUser.role !== 'DEVELOPER') {
        try {
            const { sqliteDB } = require('../db/sqliteDB');
            const targetUser = sqliteDB.get('SELECT * FROM users WHERE id = ?', [targetUserId]);

            if (targetUser && targetUser.role === 'DEVELOPER') {
                auditService.log(
                    currentUser.email,
                    currentUser.role,
                    'DEVELOPER_DELETION_ATTEMPT',
                    targetUserId,
                    { reason: 'Non-DEVELOPER tried to delete DEVELOPER user' }
                );

                return res.status(403).json({
                    error: 'Forbidden',
                    details: ['Only DEVELOPER users can delete DEVELOPER accounts']
                });
            }
        } catch (error) {
            console.error('Error checking target user for deletion:', error);
        }
    }

    next();
};

/**
 * Ensure at least one admin user exists
 */
export const ensureAdminExists = (req: Request, res: Response, next: NextFunction) => {
    const targetUserId = req.params.id;

    try {
        const { sqliteDB } = require('../db/sqliteDB');

        // Check if target user is admin
        const targetUser = sqliteDB.get('SELECT * FROM users WHERE id = ?', [targetUserId]);

        if (targetUser && (targetUser.role === 'admin' || targetUser.role === 'DEVELOPER')) {
            // Count remaining admin/developer users
            const adminCount = sqliteDB.all(
                'SELECT COUNT(*) as count FROM users WHERE (role = ? OR role = ?) AND id != ? AND status = ?',
                ['admin', 'DEVELOPER', targetUserId, 'Active']
            );

            if (adminCount[0].count === 0) {
                const currentUser = (req as any).user;
                auditService.log(
                    currentUser?.email || 'unknown',
                    currentUser?.role || 'unknown',
                    'LAST_ADMIN_DELETION_ATTEMPT',
                    targetUserId,
                    { reason: 'Attempted to delete last admin/developer user' }
                );

                return res.status(403).json({
                    error: 'Forbidden',
                    details: ['Cannot delete the last admin or developer user. At least one must remain.']
                });
            }
        }
    } catch (error) {
        console.error('Error checking admin count:', error);
    }

    next();
};
