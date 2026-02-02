/**
 * Runtime Configuration
 * 
 * This module provides a unified way to access environment variables
 * that works in both Vite (browser) and Node.js (Jest tests) environments.
 * 
 * Usage:
 *   import { getConfig } from '@/config/runtime';
 *   const socketUrl = getConfig('VITE_SOCKET_URL');
 */

interface RuntimeConfig {
    VITE_SOCKET_URL?: string;
    VITE_API_BASE_URL?: string;
    VITE_BASE?: string;
    NODE_ENV?: string;
}

/**
 * Get a configuration value from the environment.
 * 
 * Priority:
 * 1. Vite's import.meta.env (browser runtime)
 * 2. process.env (Node.js / Jest)
 * 3. Default value (if provided)
 * 
 * @param key - The configuration key (e.g., 'VITE_SOCKET_URL')
 * @param defaultValue - Optional default value if not found
 * @returns The configuration value or undefined
 */
export function getConfig(key: keyof RuntimeConfig, defaultValue?: string): string | undefined {
    // Try Vite's import.meta.env first (browser)
    try {
        // Use dynamic check to avoid Jest parsing issues
        if (typeof window !== 'undefined') {
            // We're in a browser environment
            const viteEnv = (globalThis as any).import?.meta?.env;
            if (viteEnv && viteEnv[key]) {
                return viteEnv[key];
            }

            // Alternative: check if import.meta is available via eval (safer for Jest)
            try {
                const metaEnv = new Function('return typeof import.meta !== "undefined" ? import.meta.env : null')();
                if (metaEnv && metaEnv[key]) {
                    return metaEnv[key];
                }
            } catch {
                // import.meta not available
            }
        }
    } catch {
        // Vite env not available
    }

    // Try process.env (Node.js / Jest)
    try {
        if (typeof process !== 'undefined' && process.env) {
            const value = process.env[key];
            if (value) {
                return value;
            }
        }
    } catch {
        // process.env not available
    }

    // Return default value
    return defaultValue;
}

/**
 * Check if we're in a development environment
 */
export function isDevelopment(): boolean {
    return getConfig('NODE_ENV') === 'development' ||
        (typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1'));
}

/**
 * Check if we're in a test environment (Jest)
 */
export function isTestEnvironment(): boolean {
    try {
        return typeof process !== 'undefined' &&
            (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined);
    } catch {
        return false;
    }
}

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

export default {
    getConfig,
    isDevelopment,
    isTestEnvironment,
    isBrowser
};
