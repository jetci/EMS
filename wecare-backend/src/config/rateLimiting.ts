/**
 * Rate Limiting Configuration
 * Protects against brute force and DDoS attacks
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiter for authentication endpoints
 * Strict limits to prevent brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes',
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests
  skipFailedRequests: false, // Count failed requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Please try again after 15 minutes',
      retryAfter: 15 * 60,
    });
  },
});

/**
 * Rate limiter for general API endpoints
 * Moderate limits for normal usage
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for health check
    return req.path === '/api/health';
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please slow down and try again later',
      retryAfter: 15 * 60,
    });
  },
});

/**
 * Rate limiter for create/write operations
 * Stricter limits to prevent spam
 */
export const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    error: 'Too many create requests, please slow down',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many create requests',
      message: 'Please wait a moment before creating more records',
      retryAfter: 60,
    });
  },
});

/**
 * Rate limiter for file uploads
 * Very strict limits due to resource usage
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads per minute
  message: {
    error: 'Too many file uploads, please wait',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many file uploads',
      message: 'Please wait before uploading more files',
      retryAfter: 60,
    });
  },
});

/**
 * Rate limiter for password reset
 * Very strict to prevent abuse
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    error: 'Too many password reset attempts',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many password reset attempts',
      message: 'Please try again after 1 hour',
      retryAfter: 60 * 60,
    });
  },
});

console.log('✅ Rate limiters configured');
