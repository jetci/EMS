import { Request, Response, NextFunction } from 'express';
import { validatePasswordStrength, isCommonPassword } from '../utils/password';
import { db } from '../db';

/**
 * Validation Middleware
 * Provides input validation for user management and other admin operations
 */

interface User {
    id: string;
    email: string;
    password?: string;
    role: string;
    full_name: string;
    status: string;
}

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate user input for create/update operations
 */
export const validateUserInput = (req: Request, res: Response, next: NextFunction) => {
    const { email, password, role, fullName, full_name } = req.body;
    const errors: string[] = [];

    // For POST (create), require email, password, and name
    if (req.method === 'POST') {
        if (!email) {
            errors.push('Email is required');
        }
        if (!password) {
            errors.push('Password is required');
        }
        const name = fullName || full_name;
        if (!name) {
            errors.push('Full name is required');
        }
    }

    // Email validation
    if (email !== undefined) {
        if (!email || email.trim().length === 0) {
            errors.push('Email is required');
        } else if (!isValidEmail(email)) {
            errors.push('Invalid email format');
        }
    }

    // Password validation (only for POST - creating new user)
    if (req.method === 'POST' && password !== undefined) {
        if (!password || password.trim().length === 0) {
            errors.push('Password is required');
        } else {
            const pwdCheck = validatePasswordStrength(password);
            if (!pwdCheck.valid) {
                errors.push(...pwdCheck.errors);
            }

            if (isCommonPassword(password)) {
                errors.push('Password is too common and easily guessable. Please choose a stronger password.');
            }
        }
    }

    // Role validation
    const normalizeRole = (value: any): string | null => {
        if (typeof value !== 'string') return null;
        const raw = value.trim();
        if (!raw) return null;
        const upper = raw.toUpperCase();
        if (upper === 'ADMIN') return 'admin';
        if (upper === 'DEVELOPER') return 'DEVELOPER';
        if (upper === 'EXECUTIVE') return 'EXECUTIVE';
        if (upper === 'OFFICER' || upper === 'OFFICE') return 'OFFICER';
        if (upper === 'RADIO_CENTER' || upper === 'RADIO') return 'radio_center';
        if (upper === 'DRIVER') return 'driver';
        if (upper === 'COMMUNITY') return 'community';
        return null;
    };
    const validRoles = ['admin', 'DEVELOPER', 'OFFICER', 'radio_center', 'driver', 'community', 'EXECUTIVE'];
    if (role !== undefined) {
        const normalizedRole = normalizeRole(role);
        if (!normalizedRole || !validRoles.includes(normalizedRole)) {
            errors.push(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
        } else {
            req.body.role = normalizedRole;
        }
    }

    // Name validation
    const name = fullName || full_name;
    if (name !== undefined) {
        if (!name || name.trim().length < 2) {
            errors.push('Full name must be at least 2 characters long');
        }
        if (name && name.length > 100) {
            errors.push('Full name must not exceed 100 characters');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

/**
 * Check for duplicate email
 */
export const checkDuplicateEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        const userId = req.params.id;

        if (!email) {
            return next();
        }

        const users = await db.all<User>('SELECT * FROM users WHERE email = $1', [email]);

        const duplicate = users.find(u => u.id !== userId);

        if (duplicate) {
            return res.status(409).json({
                error: 'Email already exists',
                details: ['A user with this email address already exists in the system']
            });
        }

        next();
    } catch (error: any) {
        console.error('Error checking duplicate email:', error);
        return res.status(500).json({ error: 'Failed to validate email uniqueness' });
    }
};

/**
 * Validate password reset input
 */
export const validatePasswordReset = (req: Request, res: Response, next: NextFunction) => {
    const { newPassword } = req.body;
    const errors: string[] = [];

    if (!newPassword || newPassword.trim().length === 0) {
        errors.push('New password is required');
    } else {
        const pwdCheck = validatePasswordStrength(newPassword);
        if (!pwdCheck.valid) {
            errors.push(...pwdCheck.errors);
        }

        if (isCommonPassword(newPassword)) {
            errors.push('Password is too common. Please choose a stronger password.');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Password validation failed',
            details: errors
        });
    }

    next();
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    const sanitize = (str: string): string => {
        if (typeof str !== 'string') return str;
        return str
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    };

    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string' && key !== 'password' && key !== 'newPassword') {
                req.body[key] = sanitize(req.body[key]);
            }
        });
    }

    next();
};
