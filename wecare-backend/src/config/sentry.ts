import * as Sentry from '@sentry/node';

/**
 * Sentry Error Monitoring Configuration
 * Provides error tracking for production
 */

// Check if Sentry should be enabled
const isSentryEnabled = () => {
    return !!process.env.SENTRY_DSN && process.env.SENTRY_DSN !== 'your-sentry-dsn-here';
};

/**
 * Initialize Sentry SDK
 * Call this BEFORE importing any other modules
 */
export const initializeSentry = () => {
    if (!isSentryEnabled()) {
        console.log('📊 Sentry: Disabled (no DSN configured)');
        return;
    }

    const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
    const tracesSampleRate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1');

    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment,

        // Performance Monitoring
        tracesSampleRate, // 0.1 = 10% of transactions

        // Filter sensitive data before sending to Sentry
        beforeSend(event) {
            // Remove sensitive data from event
            if (event.request) {
                // Remove sensitive headers
                if (event.request.headers) {
                    delete event.request.headers['authorization'];
                    delete event.request.headers['cookie'];
                    delete event.request.headers['x-csrf-token'];
                }

                // Filter request body
                if (event.request.data) {
                    event.request.data = filterSensitiveData(event.request.data);
                }
            }

            // Filter extra context
            if (event.extra) {
                event.extra = filterSensitiveData(event.extra);
            }

            return event;
        },

        // Ignore certain errors
        ignoreErrors: [
            'Invalid credentials',
            'Unauthorized',
            'NetworkError',
        ],
    });

    console.log(`📊 Sentry: Initialized (${environment})`);
    console.log(`   - Traces Sample Rate: ${tracesSampleRate * 100}%`);
};

/**
 * Filter sensitive data from objects
 */
function filterSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const sensitiveKeys = [
        'password',
        'token',
        'secret',
        'api_key',
        'apiKey',
        'authorization',
        'cookie',
        'csrf',
        'ssn',
        'credit_card',
        'creditCard',
        'cvv',
        'pin',
    ];

    const filtered = Array.isArray(data) ? [...data] : { ...data };

    for (const key in filtered) {
        const lowerKey = key.toLowerCase();

        // Check if key contains sensitive information
        if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
            filtered[key] = '[FILTERED]';
        } else if (typeof filtered[key] === 'object' && filtered[key] !== null) {
            // Recursively filter nested objects
            filtered[key] = filterSensitiveData(filtered[key]);
        }
    }

    return filtered;
}

/**
 * Capture exception to Sentry
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
    if (!isSentryEnabled()) {
        return;
    }

    Sentry.captureException(error, {
        extra: context ? filterSensitiveData(context) : undefined,
    });
};

/**
 * Capture message to Sentry
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
    if (!isSentryEnabled()) {
        return;
    }

    Sentry.captureMessage(message, {
        level,
        extra: context ? filterSensitiveData(context) : undefined,
    });
};

/**
 * Set user context for Sentry
 */
export const setUserContext = (user: { id: string; email?: string; role?: string }) => {
    if (!isSentryEnabled()) {
        return;
    }

    Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.role,
    });
};

/**
 * Clear user context
 */
export const clearUserContext = () => {
    if (!isSentryEnabled()) {
        return;
    }

    Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
    if (!isSentryEnabled()) {
        return;
    }

    Sentry.addBreadcrumb({
        message,
        category,
        data: data ? filterSensitiveData(data) : undefined,
        level: 'info',
    });
};

/**
 * Express error handler middleware
 * Should be added AFTER all routes but BEFORE other error handlers
 */
export const sentryErrorHandler = () => {
    if (!isSentryEnabled()) {
        return (req: any, res: any, next: any) => next();
    }

    // Manual error handler that captures to Sentry
    return (err: any, req: any, res: any, next: any) => {
        captureException(err);
        next(err);
    };
};

/**
 * Express request handler middleware
 * Should be added BEFORE all routes
 */
export const sentryRequestHandler = () => {
    // Return a no-op middleware
    // Sentry will still capture errors via captureException
    return (req: any, res: any, next: any) => next();
};

/**
 * Express tracing handler middleware
 * Should be added AFTER requestHandler but BEFORE routes
 */
export const sentryTracingHandler = () => {
    // Return a no-op middleware
    // Tracing is handled by Sentry.init configuration
    return (req: any, res: any, next: any) => next();
};

/**
 * Flush Sentry events (useful for graceful shutdown)
 */
export const flushSentry = async (timeout: number = 2000): Promise<boolean> => {
    if (!isSentryEnabled()) {
        return true;
    }

    try {
        return await Sentry.close(timeout);
    } catch (error) {
        console.error('Error flushing Sentry:', error);
        return false;
    }
};

// Export Sentry for direct access if needed
export { Sentry };
