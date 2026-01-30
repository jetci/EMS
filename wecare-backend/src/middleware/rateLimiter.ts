import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Rate limiter for authentication endpoints (stricter)
const isProduction = process.env.NODE_ENV === 'production';
const AUTH_MAX = process.env.AUTH_RATE_LIMIT ? parseInt(process.env.AUTH_RATE_LIMIT, 10) : (isProduction ? 5 : 200);
const AUTH_WINDOW_MS = process.env.AUTH_WINDOW_MS ? parseInt(process.env.AUTH_WINDOW_MS, 10) : 15 * 60 * 1000; // 15 minutes

// IP-based rate limiter (first layer)
export const authLimiter = rateLimit({
    windowMs: AUTH_WINDOW_MS,
    max: AUTH_MAX,
    message: {
        error: 'Too many login attempts from this IP, please try again after 15 minutes',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
});

// User-based rate limiter (second layer - prevents bypass via IP rotation)
const userAttempts = new Map<string, { count: number; firstAttempt: number; lockedUntil?: number }>();

export const userBasedAuthLimiter = (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email?.toLowerCase();

    if (!email) {
        return next(); // Let validation handle missing email
    }

    const now = Date.now();
    const maxAttempts = isProduction ? 5 : 200;
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const lockoutDuration = 30 * 60 * 1000; // 30 minutes lockout

    let userRecord = userAttempts.get(email);

    // Check if account is locked
    if (userRecord?.lockedUntil && now < userRecord.lockedUntil) {
        const remainingMinutes = Math.ceil((userRecord.lockedUntil - now) / 60000);
        return res.status(429).json({
            error: `Account temporarily locked due to too many failed login attempts. Please try again in ${remainingMinutes} minutes.`,
            retryAfter: `${remainingMinutes} minutes`,
            lockedUntil: new Date(userRecord.lockedUntil).toISOString()
        });
    }

    // Reset if window expired
    if (!userRecord || (now - userRecord.firstAttempt) > windowMs) {
        userRecord = { count: 0, firstAttempt: now };
        userAttempts.set(email, userRecord);
    }

    // Increment attempt count
    userRecord.count++;

    // Lock account if max attempts exceeded
    if (userRecord.count > maxAttempts) {
        userRecord.lockedUntil = now + lockoutDuration;
        userAttempts.set(email, userRecord);

        console.warn(`⚠️ Account locked: ${email} (${userRecord.count} failed attempts)`);

        return res.status(429).json({
            error: `Too many failed login attempts for this account. Account locked for 30 minutes.`,
            retryAfter: '30 minutes',
            lockedUntil: new Date(userRecord.lockedUntil).toISOString()
        });
    }

    // Attach cleanup function to response
    (res as any).clearUserAttempts = () => {
        userAttempts.delete(email);
    };

    next();
};

// Cleanup old entries periodically (every hour)
setInterval(() => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;

    for (const [email, record] of userAttempts.entries()) {
        // Remove if window expired and not locked
        if ((now - record.firstAttempt) > windowMs && (!record.lockedUntil || now > record.lockedUntil)) {
            userAttempts.delete(email);
        }
    }

    console.log(`🧹 Cleaned up user rate limit records. Active: ${userAttempts.size}`);
}, 60 * 60 * 1000); // 1 hour

// Rate limiter for general API endpoints
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        error: 'Too many requests from this IP, please slow down',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for resource creation endpoints (moderate)
export const createLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 creates per minute
    message: {
        error: 'Too many creation requests, please slow down',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for file upload endpoints (strictest)
export const uploadLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 uploads per 5 minutes
    message: {
        error: 'Too many file uploads, please try again later',
        retryAfter: '5 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
