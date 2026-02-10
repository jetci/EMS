import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Modern CSRF Protection Middleware
 * Uses double-submit cookie pattern (more secure than deprecated csurf)
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';

/**
 * Generate a cryptographically secure random token
 */
const generateToken = (): string => {
    return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
};

/**
 * CSRF token storage (in-memory for development, use Redis in production)
 */
const tokenStore = new Map<string, { token: string; createdAt: number }>();

/**
 * Clean up expired tokens (older than 1 hour)
 */
const cleanupExpiredTokens = () => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [key, value] of tokenStore.entries()) {
        if (value.createdAt < oneHourAgo) {
            tokenStore.delete(key);
        }
    }
};

// Run cleanup every 15 minutes (disabled in test environment to prevent open handles)
if (process.env.NODE_ENV !== 'test') {
    setInterval(cleanupExpiredTokens, 15 * 60 * 1000);
}

/**
 * Generate and set CSRF token
 */
export const generateCsrfToken = (req: Request, res: Response): string => {
    const token = generateToken();
    const sessionId = (req as any).user?.id || req.ip || 'anonymous';

    // Store token
    tokenStore.set(sessionId, {
        token,
        createdAt: Date.now()
    });

    // Set cookie (httpOnly: false so JavaScript can read it)
    res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000 // 1 hour
    });

    return token;
};

/**
 * Middleware to attach CSRF token to response
 */
export const csrfTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log(`🔐 [CSRF Token] ${req.method} ${req.path}`);
    // Generate token if not exists
    const existingToken = req.cookies?.[CSRF_COOKIE_NAME];

    if (!existingToken) {
        generateCsrfToken(req, res);
        console.log(`✅ [CSRF Token] Generated new token`);
    } else {
        console.log(`✅ [CSRF Token] Token exists`);
    }

    next();
};

/**
 * Middleware to validate CSRF token
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF check for safe methods
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
        return next();
    }

    // Get token from header or body
    const headerToken = req.headers[CSRF_HEADER_NAME.toLowerCase()] as string;
    const bodyToken = req.body?._csrf;
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

    const submittedToken = headerToken || bodyToken;

    // Validate token exists
    if (!submittedToken || !cookieToken) {
        return res.status(403).json({
            error: 'CSRF token missing',
            details: ['CSRF token is required for this operation']
        });
    }

    // Validate tokens match
    if (submittedToken !== cookieToken) {
        return res.status(403).json({
            error: 'CSRF token invalid',
            details: ['CSRF token validation failed']
        });
    }

    // Validate token in store
    const sessionId = (req as any).user?.id || req.ip || 'anonymous';
    const storedToken = tokenStore.get(sessionId);

    if (!storedToken || storedToken.token !== submittedToken) {
        return res.status(403).json({
            error: 'CSRF token expired or invalid',
            details: ['Please refresh the page and try again']
        });
    }

    // Token is valid
    next();
};

/**
 * Endpoint to get CSRF token
 */
export const getCsrfToken = (req: Request, res: Response) => {
    const token = generateCsrfToken(req, res);
    res.json({ csrfToken: token });
};

/**
 * Middleware to refresh CSRF token
 */
export const refreshCsrfToken = (req: Request, res: Response, next: NextFunction) => {
    generateCsrfToken(req, res);
    next();
};

/**
 * Clear CSRF token on logout
 */
export const clearCsrfToken = (req: Request, res: Response) => {
    const sessionId = (req as any).user?.id || req.ip || 'anonymous';
    tokenStore.delete(sessionId);
    res.clearCookie(CSRF_COOKIE_NAME);
};

export const manualCsrfCleanup = () => cleanupExpiredTokens();
