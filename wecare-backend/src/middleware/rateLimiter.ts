import rateLimit from 'express-rate-limit';

// Rate limiter for authentication endpoints (stricter)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        error: 'Too many login attempts from this IP, please try again after 15 minutes',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: false, // Count successful requests
    skipFailedRequests: false, // Count failed requests
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
