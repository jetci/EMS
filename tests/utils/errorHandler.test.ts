/**
 * Error Handler Utility - Unit Tests
 * 
 * Tests for standardized error handling functionality
 */

import {
    handleError,
    getErrorMessage,
    isErrorType,
    isNetworkError,
    isAuthError,
    AppError,
    ERROR_CODES,
    ERROR_MESSAGES
} from '../../src/utils/errorHandler';

describe('Error Handler Utility', () => {
    const context = {
        component: 'TestComponent',
        action: 'testAction',
        userId: 'user123'
    };

    describe('handleError', () => {
        test('should handle network errors', () => {
            const error = new Error('fetch failed');
            const result = handleError(error, context);

            expect(result).toBeInstanceOf(AppError);
            expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR);
            expect(result.message).toBe(ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]);
            expect(result.context).toEqual(context);
        });

        test('should handle timeout errors', () => {
            const error = new Error('timeout exceeded');
            const result = handleError(error, context);

            expect(result.code).toBe(ERROR_CODES.TIMEOUT);
            expect(result.message).toBe(ERROR_MESSAGES[ERROR_CODES.TIMEOUT]);
        });

        test('should handle ECONNREFUSED errors', () => {
            const error = new Error('ECONNREFUSED');
            const result = handleError(error, context);

            expect(result.code).toBe(ERROR_CODES.CONNECTION_REFUSED);
        });

        test('should handle 401 unauthorized errors', () => {
            const error = { status: 401, message: 'Unauthorized' };
            const result = handleError(error, context);

            expect(result.code).toBe(ERROR_CODES.UNAUTHORIZED);
            expect(result.message).toBe(ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED]);
        });

        test('should handle 403 forbidden errors', () => {
            const error = { status: 403 };
            const result = handleError(error, context);

            expect(result.code).toBe(ERROR_CODES.FORBIDDEN);
        });

        test('should handle 404 not found errors', () => {
            const error = { status: 404 };
            const result = handleError(error, context);

            expect(result.code).toBe(ERROR_CODES.NOT_FOUND);
        });

        test('should handle 409 conflict errors', () => {
            const error = { status: 409 };
            const result = handleError(error, context);

            expect(result.code).toBe(ERROR_CODES.DUPLICATE);
        });

        test('should handle 422 validation errors', () => {
            const error = { status: 422 };
            const result = handleError(error, context);

            expect(result.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        });

        test('should handle 500 server errors', () => {
            const error = { status: 500 };
            const result = handleError(error, context);

            expect(result.code).toBe(ERROR_CODES.SERVER_ERROR);
        });

        test('should handle validation errors with details', () => {
            const error = {
                details: ['Field is required', 'Invalid format']
            };
            const result = handleError(error, context);

            expect(result.code).toBe(ERROR_CODES.VALIDATION_ERROR);
            expect(result.message).toBe('Field is required, Invalid format');
        });

        test('should handle unknown errors', () => {
            const error = new Error('Something went wrong');
            const result = handleError(error, context);

            expect(result.code).toBe(ERROR_CODES.UNKNOWN);
            expect(result.message).toBe('Something went wrong');
        });

        test('should return AppError as-is', () => {
            const appError = new AppError('Test error', ERROR_CODES.NOT_FOUND, context);
            const result = handleError(appError, context);

            expect(result).toBe(appError);
        });

        test('should preserve original error', () => {
            const originalError = new Error('Original');
            const result = handleError(originalError, context);

            expect(result.originalError).toBe(originalError);
        });
    });

    describe('getErrorMessage', () => {
        test('should get message from AppError', () => {
            const error = new AppError('Test message', ERROR_CODES.NOT_FOUND);
            const message = getErrorMessage(error);

            expect(message).toBe('Test message');
        });

        test('should get message from string', () => {
            const message = getErrorMessage('Error string');

            expect(message).toBe('Error string');
        });

        test('should get message from error object', () => {
            const error = { message: 'Error message' };
            const message = getErrorMessage(error);

            expect(message).toBe('Error message');
        });

        test('should return unknown message for invalid input', () => {
            const message = getErrorMessage(null);

            expect(message).toBe(ERROR_MESSAGES[ERROR_CODES.UNKNOWN]);
        });
    });

    describe('isErrorType', () => {
        test('should return true for matching error type', () => {
            const error = new AppError('Test', ERROR_CODES.NOT_FOUND);

            expect(isErrorType(error, ERROR_CODES.NOT_FOUND)).toBe(true);
        });

        test('should return false for non-matching error type', () => {
            const error = new AppError('Test', ERROR_CODES.NOT_FOUND);

            expect(isErrorType(error, ERROR_CODES.SERVER_ERROR)).toBe(false);
        });

        test('should return false for non-AppError', () => {
            const error = new Error('Test');

            expect(isErrorType(error, ERROR_CODES.NOT_FOUND)).toBe(false);
        });
    });

    describe('isNetworkError', () => {
        test('should return true for network errors', () => {
            const error = new AppError('Test', ERROR_CODES.NETWORK_ERROR);

            expect(isNetworkError(error)).toBe(true);
        });

        test('should return true for timeout errors', () => {
            const error = new AppError('Test', ERROR_CODES.TIMEOUT);

            expect(isNetworkError(error)).toBe(true);
        });

        test('should return true for connection refused errors', () => {
            const error = new AppError('Test', ERROR_CODES.CONNECTION_REFUSED);

            expect(isNetworkError(error)).toBe(true);
        });

        test('should return false for non-network errors', () => {
            const error = new AppError('Test', ERROR_CODES.NOT_FOUND);

            expect(isNetworkError(error)).toBe(false);
        });
    });

    describe('isAuthError', () => {
        test('should return true for unauthorized errors', () => {
            const error = new AppError('Test', ERROR_CODES.UNAUTHORIZED);

            expect(isAuthError(error)).toBe(true);
        });

        test('should return true for forbidden errors', () => {
            const error = new AppError('Test', ERROR_CODES.FORBIDDEN);

            expect(isAuthError(error)).toBe(true);
        });

        test('should return true for session expired errors', () => {
            const error = new AppError('Test', ERROR_CODES.SESSION_EXPIRED);

            expect(isAuthError(error)).toBe(true);
        });

        test('should return false for non-auth errors', () => {
            const error = new AppError('Test', ERROR_CODES.NOT_FOUND);

            expect(isAuthError(error)).toBe(false);
        });
    });

    describe('AppError class', () => {
        test('should create AppError with all properties', () => {
            const originalError = new Error('Original');
            const error = new AppError(
                'Test message',
                ERROR_CODES.NOT_FOUND,
                context,
                originalError
            );

            expect(error.message).toBe('Test message');
            expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
            expect(error.context).toEqual(context);
            expect(error.originalError).toBe(originalError);
            expect(error.name).toBe('AppError');
        });

        test('should be instance of Error', () => {
            const error = new AppError('Test', ERROR_CODES.NOT_FOUND);

            expect(error).toBeInstanceOf(Error);
        });
    });

    describe('ERROR_MESSAGES', () => {
        test('should have Thai messages for all error codes', () => {
            Object.values(ERROR_CODES).forEach(code => {
                expect(ERROR_MESSAGES[code]).toBeDefined();
                expect(typeof ERROR_MESSAGES[code]).toBe('string');
                expect(ERROR_MESSAGES[code].length).toBeGreaterThan(0);
            });
        });
    });
});
