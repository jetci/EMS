/**
 * Safe Error Response Utility
 * Prevents information leakage in production
 */

/**
 * Sanitize error message for client response
 * @param error - Error object
 * @param isDevelopment - Whether in development mode
 * @returns Safe error message
 */
export const getSafeErrorMessage = (error: any, isDevelopment: boolean = false): string => {
    // In development, return full error for debugging
    if (isDevelopment || process.env.NODE_ENV !== 'production') {
        return error?.message || 'An error occurred';
    }

    // In production, return generic message
    // Log full error server-side but don't expose to client
    console.error('Error occurred:', {
        message: error?.message,
        stack: error?.stack,
        code: error?.code
    });

    return 'An internal error occurred. Please try again later.';
};

/**
 * Send safe error response
 * @param res - Express response object
 * @param statusCode - HTTP status code
 * @param error - Error object
 * @param customMessage - Optional custom message for production
 */
export const sendSafeError = (
    res: any,
    statusCode: number,
    error: any,
    customMessage?: string
) => {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    // Log full error server-side
    console.error(`[${statusCode}] Error:`, {
        message: error?.message,
        stack: error?.stack,
        code: error?.code,
        name: error?.name
    });

    // Send safe response to client
    const message = isDevelopment
        ? (error?.message || 'An error occurred')
        : (customMessage || 'An internal error occurred. Please try again later.');

    res.status(statusCode).json({
        error: message,
        ...(isDevelopment && { stack: error?.stack, code: error?.code })
    });
};

/**
 * Check if error is safe to expose
 * Some errors are safe to show to users (validation errors, not found, etc.)
 * @param error - Error object
 * @returns Whether error is safe to expose
 */
export const isSafeError = (error: any): boolean => {
    const safeErrorTypes = [
        'ValidationError',
        'NotFoundError',
        'UnauthorizedError',
        'ForbiddenError',
        'BadRequestError'
    ];

    return safeErrorTypes.includes(error?.name);
};

/**
 * Get appropriate status code from error
 * @param error - Error object
 * @returns HTTP status code
 */
export const getErrorStatusCode = (error: any): number => {
    if (error?.statusCode) return error.statusCode;
    if (error?.status) return error.status;

    // Map error types to status codes
    const errorTypeMap: Record<string, number> = {
        'ValidationError': 400,
        'NotFoundError': 404,
        'UnauthorizedError': 401,
        'ForbiddenError': 403,
        'BadRequestError': 400,
        'ConflictError': 409
    };

    return errorTypeMap[error?.name] || 500;
};
