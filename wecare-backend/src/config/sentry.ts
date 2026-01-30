/**
 * Sentry Error Tracking Configuration
 * Real-time error monitoring and alerting
 */

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Express } from 'express';

const SENTRY_DSN = process.env.SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

/**
 * Initialize Sentry
 */
export const initSentry = (app: Express) => {
  if (!SENTRY_DSN) {
    console.warn('⚠️  SENTRY_DSN not set, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    
    // Performance monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    
    // Profiling
    profilesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    integrations: [
      new ProfilingIntegration(),
    ],

    // Release tracking
    release: process.env.npm_package_version,

    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }

      // Remove sensitive data from extra
      if (event.extra) {
        delete event.extra.password;
        delete event.extra.token;
        delete event.extra.nationalId;
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network request failed',
    ],
  });

  // Request handler (must be first)
  app.use(Sentry.Handlers.requestHandler());

  // Tracing handler
  app.use(Sentry.Handlers.tracingHandler());

  console.log('✅ Sentry initialized');
};

/**
 * Error handler (must be after routes)
 */
export const sentryErrorHandler = Sentry.Handlers.errorHandler();

/**
 * Capture exception manually
 */
export const captureException = (error: Error, context?: any) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Capture message
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

/**
 * Set user context
 */
export const setUser = (user: { id: string; email?: string; role?: string }) => {
  Sentry.setUser(user);
};

/**
 * Add breadcrumb
 */
export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb);
};

/**
 * Start transaction for performance monitoring
 */
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({ name, op });
};
