/**
 * useErrorHandler Hook
 * 
 * Custom React hook for standardized error handling
 * Provides error state management and notification integration
 */

import { useState, useCallback } from 'react';
import { handleError, AppError, ErrorContext, getErrorMessage } from '../utils/errorHandler';

export interface UseErrorHandlerOptions {
    component: string;
    onError?: (error: AppError) => void;
    showNotification?: boolean;
}

export interface UseErrorHandlerReturn {
    error: AppError | null;
    errorMessage: string | null;
    handleApiError: (err: any, action: string, customHandler?: (error: AppError) => void) => AppError;
    clearError: () => void;
    setError: (error: AppError | string) => void;
}

/**
 * Hook for handling errors in components
 * 
 * @example
 * ```typescript
 * const { error, handleApiError, clearError } = useErrorHandler({
 *   component: 'PatientList',
 *   onError: (err) => {
 *     addNotification({
 *       type: 'error',
 *       message: err.message,
 *       isRead: false
 *     });
 *   }
 * });
 * 
 * try {
 *   const data = await api.getPatients();
 * } catch (e) {
 *   handleApiError(e, 'loadPatients');
 * }
 * ```
 */
export function useErrorHandler(options: UseErrorHandlerOptions): UseErrorHandlerReturn {
    const { component, onError, showNotification = true } = options;

    const [error, setErrorState] = useState<AppError | null>(null);

    /**
     * Handle API errors with standard pattern
     */
    const handleApiError = useCallback((
        err: any,
        action: string,
        customHandler?: (error: AppError) => void
    ): AppError => {
        const context: ErrorContext = {
            component,
            action,
            userId: localStorage.getItem('wecare_user') || undefined
        };

        const appError = handleError(err, context);
        setErrorState(appError);

        // Call custom handler if provided
        if (customHandler) {
            customHandler(appError);
        }

        // Call default error handler
        if (onError && showNotification) {
            onError(appError);
        }

        return appError;
    }, [component, onError, showNotification]);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setErrorState(null);
    }, []);

    /**
     * Set error manually
     */
    const setError = useCallback((error: AppError | string) => {
        if (typeof error === 'string') {
            const appError = new AppError(error, 'MANUAL_ERROR', { component, action: 'manual' });
            setErrorState(appError);
        } else {
            setErrorState(error);
        }
    }, [component]);

    return {
        error,
        errorMessage: error ? getErrorMessage(error) : null,
        handleApiError,
        clearError,
        setError
    };
}

/**
 * Hook for async operations with error handling
 * 
 * @example
 * ```typescript
 * const { execute, loading, error } = useAsyncError({
 *   component: 'PatientList',
 *   onError: (err) => console.error(err)
 * });
 * 
 * const loadData = async () => {
 *   await execute(async () => {
 *     const data = await api.getPatients();
 *     setPatients(data);
 *   }, 'loadPatients');
 * };
 * ```
 */
export interface UseAsyncErrorReturn extends UseErrorHandlerReturn {
    loading: boolean;
    execute: <T>(
        asyncFn: () => Promise<T>,
        action: string,
        onSuccess?: (result: T) => void
    ) => Promise<T | null>;
}

export function useAsyncError(options: UseErrorHandlerOptions): UseAsyncErrorReturn {
    const errorHandler = useErrorHandler(options);
    const [loading, setLoading] = useState(false);

    const execute = useCallback(async <T,>(
        asyncFn: () => Promise<T>,
        action: string,
        onSuccess?: (result: T) => void
    ): Promise<T | null> => {
        setLoading(true);
        errorHandler.clearError();

        try {
            const result = await asyncFn();

            if (onSuccess) {
                onSuccess(result);
            }

            return result;
        } catch (err: any) {
            errorHandler.handleApiError(err, action);
            return null;
        } finally {
            setLoading(false);
        }
    }, [errorHandler]);

    return {
        ...errorHandler,
        loading,
        execute
    };
}
