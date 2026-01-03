/**
 * Global Error Handler Middleware
 * Catches all errors and returns standardized error responses
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError, sendError } from '../utils/apiResponse';

export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log error for debugging
    console.error('Error caught by global handler:', {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Handle ApiError instances
    if (err instanceof ApiError) {
        return sendError(res, err.message, err.statusCode, err.code, err.details);
    }

    // Handle validation errors (from express-validator or similar)
    if (err.name === 'ValidationError') {
        return sendError(
            res,
            'Validation failed',
            422,
            'VALIDATION_ERROR',
            err.errors || err.details
        );
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return sendError(res, 'Invalid token', 401, 'INVALID_TOKEN');
    }

    if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Token expired', 401, 'TOKEN_EXPIRED');
    }

    // Handle database errors
    if (err.code === 'SQLITE_CONSTRAINT') {
        return sendError(
            res,
            'Database constraint violation',
            409,
            'CONSTRAINT_VIOLATION',
            { constraint: err.message }
        );
    }

    // Handle syntax errors (malformed JSON, etc.)
    if (err instanceof SyntaxError && 'body' in err) {
        return sendError(res, 'Invalid JSON in request body', 400, 'INVALID_JSON');
    }

    // Default error response
    const statusCode = err.statusCode || err.status || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'An unexpected error occurred';

    return sendError(res, message, statusCode, 'INTERNAL_ERROR', {
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * 404 Not Found Handler
 * Catches all requests to undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    sendError(
        res,
        `Route ${req.method} ${req.path} not found`,
        404,
        'ROUTE_NOT_FOUND',
        {
            method: req.method,
            path: req.path
        }
    );
};
