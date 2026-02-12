/**
 * Sentry Configuration
 * Error logging and monitoring service
 */

import * as Sentry from '@sentry/react';

export interface SentryConfig {
  dsn?: string;
  environment: string;
  enabled: boolean;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

/**
 * Get Sentry configuration from environment
 */
export function getSentryConfig(): SentryConfig {
  const env = import.meta.env;
  
  return {
    dsn: env.VITE_SENTRY_DSN as string | undefined,
    environment: env.MODE || 'development',
    enabled: env.PROD && !!env.VITE_SENTRY_DSN,
    tracesSampleRate: env.PROD ? 0.1 : 1.0, // 10% in production, 100% in dev
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% when error occurs
  };
}

/**
 * Initialize Sentry
 */
export function initSentry(): void {
  const config = getSentryConfig();

  if (!config.enabled) {
    console.log('[Sentry] Disabled (no DSN or not in production)');
    return;
  }

  console.log('[Sentry] Initializing...', {
    environment: config.environment,
    dsn: config.dsn ? '***' + config.dsn.slice(-10) : 'none',
  });

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    
    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Performance
    tracesSampleRate: config.tracesSampleRate,
    
    // Session Replay
    replaysSessionSampleRate: config.replaysSessionSampleRate,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,
    
    // Release tracking
    release: env.VITE_APP_VERSION || 'unknown',
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out errors from browser extensions
      if (event.exception?.values?.[0]?.value?.includes('chrome-extension://')) {
        return null;
      }
      
      // Filter out network errors (already handled by app)
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        return null;
      }
      
      return event;
    },
    
    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      
      // Network errors (handled by app)
      'NetworkError',
      'Failed to fetch',
      'Load failed',
      
      // User cancelled actions
      'AbortError',
      'User cancelled',
    ],
  });

  console.log('[Sentry] Initialized successfully');
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: {
  id: string;
  email?: string;
  role?: string;
}): void {
  const config = getSentryConfig();
  if (!config.enabled) return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

/**
 * Clear user context
 */
export function clearSentryUser(): void {
  const config = getSentryConfig();
  if (!config.enabled) return;

  Sentry.setUser(null);
}

/**
 * Capture exception manually
 */
export function captureException(
  error: Error,
  context?: Record<string, any>
): void {
  const config = getSentryConfig();
  if (!config.enabled) {
    console.error('[Sentry] Would capture:', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message manually
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
): void {
  const config = getSentryConfig();
  if (!config.enabled) {
    console.log(`[Sentry] Would capture message (${level}):`, message, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
): void {
  const config = getSentryConfig();
  if (!config.enabled) return;

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set custom context
 */
export function setContext(
  name: string,
  context: Record<string, any>
): void {
  const config = getSentryConfig();
  if (!config.enabled) return;

  Sentry.setContext(name, context);
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(
  name: string,
  op: string
): Sentry.Transaction | null {
  const config = getSentryConfig();
  if (!config.enabled) return null;

  return Sentry.startTransaction({
    name,
    op,
  });
}
