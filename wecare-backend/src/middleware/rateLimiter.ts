import rateLimit from 'express-rate-limit';

// Rate limiter for authentication endpoints (stricter)
const isProduction = process.env.NODE_ENV === 'production';
const AUTH_MAX = process.env.AUTH_RATE_LIMIT ? parseInt(process.env.AUTH_RATE_LIMIT, 10) : (isProduction ? 5 : 200);
const AUTH_WINDOW_MS = process.env.AUTH_WINDOW_MS ? parseInt(process.env.AUTH_WINDOW_MS, 10) : 15 * 60 * 1000; // 15 minutes

export const authLimiter = rateLimit({
    windowMs: AUTH_WINDOW_MS,
    // In development allow many attempts to avoid blocking tests; keep strict in production
    max: AUTH_MAX,
    message: {
        error: 'Too many login attempts from this IP, please try again after 15 minutes',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Keep counting both successful and failed requests by default; adjust via env if needed
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
});

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
