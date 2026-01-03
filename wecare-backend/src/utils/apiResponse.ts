/**
 * Standardized Error Response Format
 * Provides consistent error responses across all API endpoints
 */

import { Response } from 'express';

export interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
}

export interface SuccessResponse<T = any> {
    success: true;
    data: T;
    timestamp: string;
}

/**
 * API Error class with status code
 */
export class ApiError extends Error {
    public statusCode: number;
    public code: string;
    public details?: any;

    constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.code = code || this.getDefaultCode(statusCode);
        this.details = details;

        // Maintains proper stack trace
        Error.captureStackTrace(this, this.constructor);
    }

    private getDefaultCode(statusCode: number): string {
        const codes: Record<number, string> = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'VALIDATION_ERROR',
            429: 'TOO_MANY_REQUESTS',
            500: 'INTERNAL_ERROR',
            503: 'SERVICE_UNAVAILABLE'
        };
        return codes[statusCode] || 'UNKNOWN_ERROR';
    }
}

/**
 * Send error response with standardized format
 */
export const sendError = (
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
): Response => {
    const errorResponse: ErrorResponse = {
        success: false,
        error: {
            code: code || new ApiError('', statusCode).code,
            message,
            details
        },
        timestamp: new Date().toISOString()
    };

    return res.status(statusCode).json(errorResponse);
};

/**
 * Send success response with standardized format
 */
export const sendSuccess = <T = any>(
    res: Response,
    data: T,
    statusCode: number = 200
): Response => {
    const successResponse: SuccessResponse<T> = {
        success: true,
        data,
        timestamp: new Date().toISOString()
    };

    return res.status(statusCode).json(successResponse);
};

/**
 * Common error responses
 */
export const ErrorResponses = {
    // 400 Bad Request
    badRequest: (message: string = 'Invalid request', details?: any) =>
        new ApiError(message, 400, 'BAD_REQUEST', details),

    // 401 Unauthorized
    unauthorized: (message: string = 'Authentication required') =>
        new ApiError(message, 401, 'UNAUTHORIZED'),

    // 403 Forbidden
    forbidden: (message: string = 'Access denied') =>
        new ApiError(message, 403, 'FORBIDDEN'),

    // 404 Not Found
    notFound: (resource: string = 'Resource') =>
        new ApiError(`${resource} not found`, 404, 'NOT_FOUND'),

    // 409 Conflict
    conflict: (message: string = 'Resource already exists') =>
        new ApiError(message, 409, 'CONFLICT'),

    // 422 Validation Error
    validationError: (message: string = 'Validation failed', details?: any) =>
        new ApiError(message, 422, 'VALIDATION_ERROR', details),

    // 429 Too Many Requests
    tooManyRequests: (message: string = 'Too many requests') =>
        new ApiError(message, 429, 'TOO_MANY_REQUESTS'),

    // 500 Internal Server Error
    internal: (message: string = 'Internal server error') =>
        new ApiError(message, 500, 'INTERNAL_ERROR'),

    // 503 Service Unavailable
    serviceUnavailable: (message: string = 'Service temporarily unavailable') =>
        new ApiError(message, 503, 'SERVICE_UNAVAILABLE')
};
