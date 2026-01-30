/**
 * XSS (Cross-Site Scripting) Prevention Utility
 * Sanitizes user input to prevent XSS attacks
 */

/**
 * HTML entities to escape
 */
const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
};

/**
 * Escape HTML special characters
 * @param text - Text to escape
 * @returns Escaped text
 */
export const escapeHtml = (text: string): string => {
    if (typeof text !== 'string') return text;

    return text.replace(/[&<>"'\/]/g, (char) => HTML_ENTITIES[char] || char);
};

/**
 * Remove HTML tags from string
 * @param text - Text to strip
 * @returns Text without HTML tags
 */
export const stripHtmlTags = (text: string): string => {
    if (typeof text !== 'string') return text;

    return text.replace(/<[^>]*>/g, '');
};

/**
 * Sanitize user input for safe storage and display
 * @param input - Input to sanitize
 * @param options - Sanitization options
 * @returns Sanitized input
 */
export const sanitizeInput = (
    input: string,
    options: {
        allowHtml?: boolean;
        maxLength?: number;
        trim?: boolean;
    } = {}
): string => {
    if (typeof input !== 'string') return input;

    let sanitized = input;

    // Trim whitespace
    if (options.trim !== false) {
        sanitized = sanitized.trim();
    }

    // Remove HTML tags if not allowed
    if (!options.allowHtml) {
        sanitized = stripHtmlTags(sanitized);
        sanitized = escapeHtml(sanitized);
    }

    // Limit length
    if (options.maxLength) {
        sanitized = sanitized.substring(0, options.maxLength);
    }

    return sanitized;
};

/**
 * Sanitize object recursively
 * @param obj - Object to sanitize
 * @param options - Sanitization options
 * @returns Sanitized object
 */
export const sanitizeObject = (obj: any, options = {}): any => {
    if (typeof obj === 'string') {
        return sanitizeInput(obj, options);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item, options));
    }

    if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
            sanitized[key] = sanitizeObject(obj[key], options);
        }
        return sanitized;
    }

    return obj;
};

/**
 * Check if string contains XSS patterns
 * @param text - Text to check
 * @returns True if XSS detected
 */
export const containsXSS = (text: string): boolean => {
    if (typeof text !== 'string') return false;

    const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /<iframe[^>]*>.*?<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,  // onclick, onload, etc.
        /<embed[^>]*>/gi,
        /<object[^>]*>/gi,
        /eval\s*\(/gi,
        /expression\s*\(/gi,
        /vbscript:/gi,
        /data:text\/html/gi
    ];

    return xssPatterns.some(pattern => pattern.test(text));
};

/**
 * Validate and sanitize email
 * @param email - Email to validate
 * @returns Sanitized email or null if invalid
 */
export const sanitizeEmail = (email: string): string | null => {
    if (typeof email !== 'string') return null;

    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const sanitized = email.trim().toLowerCase();

    if (!emailRegex.test(sanitized)) {
        return null;
    }

    // Check for XSS in email
    if (containsXSS(sanitized)) {
        return null;
    }

    return sanitized;
};

/**
 * Sanitize URL
 * @param url - URL to sanitize
 * @returns Sanitized URL or null if invalid
 */
export const sanitizeUrl = (url: string): string | null => {
    if (typeof url !== 'string') return null;

    const sanitized = url.trim();

    // Only allow http, https, and relative URLs
    const allowedProtocols = ['http://', 'https://', '/'];
    const isAllowed = allowedProtocols.some(protocol =>
        sanitized.toLowerCase().startsWith(protocol)
    );

    if (!isAllowed && !sanitized.startsWith('/')) {
        return null;
    }

    // Block javascript: and data: URLs
    if (/^(javascript|data|vbscript):/i.test(sanitized)) {
        return null;
    }

    return sanitized;
};

/**
 * Sanitize Thai text (allow Thai characters)
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export const sanitizeThaiText = (text: string): string => {
    if (typeof text !== 'string') return text;

    // Allow: Thai characters, English, numbers, common punctuation
    const allowedPattern = /[^\u0E00-\u0E7Fa-zA-Z0-9\s\-.,!?()]/g;

    return text.replace(allowedPattern, '').trim();
};
