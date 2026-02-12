/**
 * Error Handler Utility
 * 
 * Provides standardized error handling across the application
 * with user-friendly error messages and proper logging
 */

import { captureException as sentryCaptureException, addBreadcrumb } from '../config/sentry';

export interface ErrorContext {
    component: string;
    action: string;
    userId?: string;
}

export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public context?: ErrorContext,
        public originalError?: any
    ) {
        super(message);
        this.name = 'AppError';

        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
}

// Error codes
export const ERROR_CODES = {
    // Network Errors
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    CONNECTION_REFUSED: 'CONNECTION_REFUSED',

    // Authentication Errors
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

    // Validation Errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    REQUIRED_FIELD: 'REQUIRED_FIELD',
    INVALID_FORMAT: 'INVALID_FORMAT',

    // Business Logic Errors
    NOT_FOUND: 'NOT_FOUND',
    DUPLICATE: 'DUPLICATE',
    CONFLICT: 'CONFLICT',

    // Server Errors
    SERVER_ERROR: 'SERVER_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',

    // Unknown
    UNKNOWN: 'UNKNOWN'
} as const;

// User-friendly error messages in Thai
export const ERROR_MESSAGES: Record<string, string> = {
    // Network
    [ERROR_CODES.NETWORK_ERROR]: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
    [ERROR_CODES.TIMEOUT]: 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง',
    [ERROR_CODES.CONNECTION_REFUSED]: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาติดต่อผู้ดูแลระบบ',

    // Authentication
    [ERROR_CODES.UNAUTHORIZED]: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
    [ERROR_CODES.FORBIDDEN]: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
    [ERROR_CODES.SESSION_EXPIRED]: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
    [ERROR_CODES.INVALID_CREDENTIALS]: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',

    // Validation
    [ERROR_CODES.VALIDATION_ERROR]: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
    [ERROR_CODES.REQUIRED_FIELD]: 'กรุณากรอกข้อมูลให้ครบถ้วน',
    [ERROR_CODES.INVALID_FORMAT]: 'รูปแบบข้อมูลไม่ถูกต้อง',

    // Business Logic
    [ERROR_CODES.NOT_FOUND]: 'ไม่พบข้อมูลที่ต้องการ',
    [ERROR_CODES.DUPLICATE]: 'ข้อมูลนี้มีอยู่ในระบบแล้ว',
    [ERROR_CODES.CONFLICT]: 'เกิดข้อขัดแย้งในการดำเนินการ กรุณาลองใหม่อีกครั้ง',

    // Server
    [ERROR_CODES.SERVER_ERROR]: 'เกิดข้อผิดพลาดในระบบ กรุณาติดต่อผู้ดูแลระบบ',
    [ERROR_CODES.DATABASE_ERROR]: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง',

    // Unknown
    [ERROR_CODES.UNKNOWN]: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
};

/**
 * Handle and transform errors into AppError
 */
export function handleError(
    error: any,
    context: ErrorContext
): AppError {
    // Log error for debugging
    console.error(`[${context.component}] ${context.action} failed:`, error);

    // Add breadcrumb for Sentry
    addBreadcrumb(
        `${context.action} failed`,
        context.component,
        { error: error?.message || 'Unknown error' }
    );

    // Already an AppError
    if (error instanceof AppError) {
        return error;
    }

    // Network errors
    if (error.message?.toLowerCase().includes('fetch') ||
        error.message?.toLowerCase().includes('network')) {
        return new AppError(
            ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
            ERROR_CODES.NETWORK_ERROR,
            context,
            error
        );
    }

    if (error.message?.toLowerCase().includes('timeout')) {
        return new AppError(
            ERROR_MESSAGES[ERROR_CODES.TIMEOUT],
            ERROR_CODES.TIMEOUT,
            context,
            error
        );
    }

    if (error.message?.toLowerCase().includes('econnrefused')) {
        return new AppError(
            ERROR_MESSAGES[ERROR_CODES.CONNECTION_REFUSED],
            ERROR_CODES.CONNECTION_REFUSED,
            context,
            error
        );
    }

    // HTTP status errors
    if (error.status || error.statusCode) {
        const status = error.status || error.statusCode;

        switch (status) {
            case 401:
                return new AppError(
                    ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED],
                    ERROR_CODES.UNAUTHORIZED,
                    context,
                    error
                );

            case 403:
                return new AppError(
                    ERROR_MESSAGES[ERROR_CODES.FORBIDDEN],
                    ERROR_CODES.FORBIDDEN,
                    context,
                    error
                );

            case 404:
                return new AppError(
                    ERROR_MESSAGES[ERROR_CODES.NOT_FOUND],
                    ERROR_CODES.NOT_FOUND,
                    context,
                    error
                );

            case 409:
                return new AppError(
                    ERROR_MESSAGES[ERROR_CODES.DUPLICATE],
                    ERROR_CODES.DUPLICATE,
                    context,
                    error
                );

            case 422:
                return new AppError(
                    ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
                    ERROR_CODES.VALIDATION_ERROR,
                    context,
                    error
                );

            case 500:
            case 502:
            case 503:
                return new AppError(
                    ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR],
                    ERROR_CODES.SERVER_ERROR,
                    context,
                    error
                );
        }
    }

    // Validation errors
    if (error.details || error.errors) {
        const details = error.details || error.errors;
        const message = Array.isArray(details)
            ? details.join(', ')
            : ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR];

        return new AppError(
            message,
            ERROR_CODES.VALIDATION_ERROR,
            context,
            error
        );
    }

    // Default: use error message or unknown
    const message = error.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN];

    const appError = new AppError(
        message,
        ERROR_CODES.UNKNOWN,
        context,
        error
    );

    // Send to Sentry for unknown errors
    sentryCaptureException(appError, {
        component: context.component,
        action: context.action,
        userId: context.userId,
        originalError: error,
    });

    return appError;
}

/**
 * Get user-friendly error message from any error
 */
export function getErrorMessage(error: any): string {
    if (error instanceof AppError) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error?.message) {
        return error.message;
    }

    return ERROR_MESSAGES[ERROR_CODES.UNKNOWN];
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error: any, code: string): boolean {
    return error instanceof AppError && error.code === code;
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: any): boolean {
    return isErrorType(error, ERROR_CODES.NETWORK_ERROR) ||
        isErrorType(error, ERROR_CODES.TIMEOUT) ||
        isErrorType(error, ERROR_CODES.CONNECTION_REFUSED);
}

/**
 * Check if error is authentication-related
 */
export function isAuthError(error: any): boolean {
    return isErrorType(error, ERROR_CODES.UNAUTHORIZED) ||
        isErrorType(error, ERROR_CODES.FORBIDDEN) ||
        isErrorType(error, ERROR_CODES.SESSION_EXPIRED);
}
