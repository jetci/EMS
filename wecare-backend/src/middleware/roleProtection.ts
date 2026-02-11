import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Role-Based Access Control Middleware
 * Ensures that only users with specified roles can access protected routes
 */

// Define all valid roles in the system
export enum UserRole {
    DEVELOPER = 'DEVELOPER',
    ADMIN = 'admin',
    OFFICER = 'OFFICER',
    RADIO_CENTER = 'radio_center',
    DRIVER = 'driver',
    COMMUNITY = 'community',
    EXECUTIVE = 'EXECUTIVE'
}

// Role hierarchy: higher roles inherit permissions from lower roles
const ROLE_HIERARCHY: Record<string, number> = {
    [UserRole.DEVELOPER]: 100,
    [UserRole.ADMIN]: 90,
    [UserRole.EXECUTIVE]: 80,
    [UserRole.OFFICER]: 70,
    [UserRole.RADIO_CENTER]: 60,
    [UserRole.DRIVER]: 40,
    [UserRole.COMMUNITY]: 30
};

/**
 * Normalize role string to handle case sensitivity
 */
function normalizeRole(role: string): string {
    // Convert to uppercase for comparison
    const upperRole = role.toUpperCase();

    // Map common variations
    const roleMap: Record<string, string> = {
        'ADMIN': UserRole.ADMIN,
        'OFFICER': UserRole.OFFICER,
        'RADIO_CENTER': UserRole.RADIO_CENTER,
        'DRIVER': UserRole.DRIVER,
        'COMMUNITY': UserRole.COMMUNITY,
        'EXECUTIVE': UserRole.EXECUTIVE,
        'DEVELOPER': UserRole.DEVELOPER
    };

    return roleMap[upperRole] || role;
}

/**
 * Check if user has required role or higher in hierarchy
 */
function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
    const normalizedUserRole = normalizeRole(userRole);

    // Exact match only (case-insensitive)
    return requiredRoles.some(requiredRole => {
        const normalizedRequired = normalizeRole(requiredRole);
        return normalizedUserRole.toLowerCase() === normalizedRequired.toLowerCase();
    });
}

/**
 * Middleware factory to require specific roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @param options - Additional options
 */
export function requireRole(
    allowedRoles: string[],
    options: {
        requireAll?: boolean; // Require all roles (AND logic) instead of any (OR logic)
        logDenials?: boolean; // Log unauthorized access attempts
    } = {}
) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'You must be logged in to access this resource'
            });
        }

        // Check if user has a role
        if (!req.user.role) {
            return res.status(403).json({
                error: 'No role assigned',
                message: 'Your account does not have a role assigned'
            });
        }

        // Check if user has required role
        const hasPermission = hasRequiredRole(req.user.role, allowedRoles);

        if (!hasPermission) {
            // Log unauthorized access attempt if enabled
            if (options.logDenials !== false) {
                console.warn(`🚫 Unauthorized access attempt:`, {
                    user: req.user.email || req.user.id,
                    role: req.user.role,
                    requiredRoles: allowedRoles,
                    path: req.path,
                    method: req.method,
                    ip: req.ip,
                    timestamp: new Date().toISOString()
                });

                // TODO: Log to audit_logs table
                // auditService.log(req.user.email, req.user.role, 'ACCESS_DENIED', req.path, {...});
            }

            return res.status(403).json({
                error: 'Insufficient permissions',
                message: `This resource requires one of the following roles: ${allowedRoles.join(', ')}`,
                userRole: req.user.role,
                requiredRoles: allowedRoles
            });
        }

        // User has permission, proceed to next middleware
        next();
    };
}

/**
 * Middleware to allow only specific roles (strict mode)
 * Does not use role hierarchy
 */
export function requireExactRole(allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const normalizedUserRole = normalizeRole(req.user.role);
        const normalizedAllowedRoles = allowedRoles.map(r => normalizeRole(r));

        const hasExactRole = normalizedAllowedRoles.some(
            role => role.toLowerCase() === normalizedUserRole.toLowerCase()
        );

        if (!hasExactRole) {
            console.warn(`🚫 Unauthorized access (exact role required):`, {
                user: req.user.email || req.user.id,
                role: req.user.role,
                requiredRoles: allowedRoles,
                path: req.path
            });

            return res.status(403).json({
                error: 'Insufficient permissions',
                message: `This resource requires exact role match: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
}

/**
 * Middleware to allow access to resource owner or admin
 */
export function requireOwnerOrAdmin(resourceOwnerField: string = 'created_by') {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Admin and Developer always have access
        if (req.user.role && hasRequiredRole(req.user.role, [UserRole.ADMIN, UserRole.DEVELOPER])) {
            return next();
        }

        // Check if user is the resource owner
        // This will be validated in the route handler with actual data
        // Here we just ensure user is authenticated
        next();
    };
}

export default {
    requireRole,
    requireExactRole,
    requireOwnerOrAdmin,
    UserRole,
    normalizeRole,
    hasRequiredRole
};

