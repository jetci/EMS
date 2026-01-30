import { Request, Response, NextFunction } from 'express';

/**
 * SQL Injection Prevention Middleware
 * Detects and blocks common SQL injection patterns
 */

const SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|\*\/|\/\*)/g,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
    /(;|\||&)/g,
    /(0x[0-9a-f]+)/gi,
    /(CHAR\(|CHR\(|ASCII\()/gi,
    /(CONCAT\(|GROUP_CONCAT\()/gi,
    /(LOAD_FILE\(|INTO\s+OUTFILE|INTO\s+DUMPFILE)/gi,
    /(BENCHMARK\(|SLEEP\(|WAITFOR\s+DELAY)/gi,
];

/**
 * Check if a string contains SQL injection patterns
 */
const containsSQLInjection = (value: string): boolean => {
    if (typeof value !== 'string') return false;

    return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(value));
};

/**
 * Check if string is base64 encoded data (e.g., image)
 */
const isBase64Data = (value: string): boolean => {
    // Check for data URI scheme (data:image/...)
    if (value.startsWith('data:image/') || value.startsWith('data:application/')) {
        return true;
    }
    // Check for pure base64 string (long string with base64 characters)
    if (value.length > 100 && /^[A-Za-z0-9+/=]+$/.test(value)) {
        return true;
    }
    return false;
};

/**
 * Recursively check object for SQL injection
 */
const checkObjectForSQLInjection = (obj: any, path: string = '', skipFields: string[] = []): string | null => {
    if (typeof obj === 'string') {
        // Skip validation for base64 encoded data
        if (isBase64Data(obj)) {
            return null;
        }
        // Skip validation for whitelisted fields
        const fieldName = path.split('.').pop() || '';
        if (skipFields.includes(fieldName)) {
            return null;
        }
        if (containsSQLInjection(obj)) {
            return path || 'root';
        }
    } else if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            const result = checkObjectForSQLInjection(obj[i], `${path}[${i}]`, skipFields);
            if (result) return result;
        }
    } else if (obj && typeof obj === 'object') {
        for (const key in obj) {
            const result = checkObjectForSQLInjection(obj[key], path ? `${path}.${key}` : key, skipFields);
            if (result) return result;
        }
    }
    return null;
};

/**
 * SQL Injection Prevention Middleware
 */
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction) => {
    console.log(`🛡️ [SQL Injection] ${req.method} ${req.path}`);
    try {
        // Check query parameters
        if (req.query && Object.keys(req.query).length > 0) {
            const suspiciousField = checkObjectForSQLInjection(req.query, 'query');
            if (suspiciousField) {
                console.log(`❌ [SQL Injection] BLOCKED - Query param: ${suspiciousField}`);
                return res.status(400).json({
                    error: 'Invalid input detected',
                    details: [`Suspicious pattern detected in query parameter: ${suspiciousField}`]
                });
            }
        }

        // Check body parameters
        if (req.body && Object.keys(req.body).length > 0) {
            const suspiciousField = checkObjectForSQLInjection(req.body, 'body');
            if (suspiciousField) {
                console.log(`❌ [SQL Injection] BLOCKED - Body field: ${suspiciousField}`);
                return res.status(400).json({
                    error: 'Invalid input detected',
                    details: [`Suspicious pattern detected in request body: ${suspiciousField}`]
                });
            }
        }

        // Check URL parameters
        if (req.params && Object.keys(req.params).length > 0) {
            const suspiciousField = checkObjectForSQLInjection(req.params, 'params');
            if (suspiciousField) {
                console.log(`❌ [SQL Injection] BLOCKED - URL param: ${suspiciousField}`);
                return res.status(400).json({
                    error: 'Invalid input detected',
                    details: [`Suspicious pattern detected in URL parameter: ${suspiciousField}`]
                });
            }
        }

        console.log(`✅ [SQL Injection] PASSED`);
        next();
    } catch (error) {
        console.error('❌ [SQL Injection] ERROR:', error);
        next(); // Don't block request on middleware error
    }
};

/**
 * Validate ID format (e.g., USR-001, DRV-001)
 */
export const validateIdFormat = (id: string, prefix: string): boolean => {
    const pattern = new RegExp(`^${prefix}-\\d{3,}$`);
    return pattern.test(id);
};

/**
 * Validate numeric input
 */
export const validateNumeric = (value: any, min?: number, max?: number): boolean => {
    const num = Number(value);
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
};

/**
 * Validate date format (ISO 8601)
 */
export const validateDateFormat = (dateString: string): boolean => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validate phone number (Thai format)
 */
export const validatePhoneNumber = (phone: string): boolean => {
    // Thai phone: 0X-XXXX-XXXX or 0XXXXXXXXX
    const patterns = [
        /^0\d{1}-\d{4}-\d{4}$/,  // 0X-XXXX-XXXX
        /^0\d{9}$/,               // 0XXXXXXXXX
        /^\+66\d{9}$/,            // +66XXXXXXXXX
    ];
    return patterns.some(pattern => pattern.test(phone));
};

/**
 * Validate coordinates
 */
export const validateCoordinates = (lat: number, lng: number): boolean => {
    return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180
    );
};

/**
 * Sanitize filename for upload
 */
export const sanitizeFilename = (filename: string): string => {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .substring(0, 255);
};

/**
 * Validate file extension
 */
export const validateFileExtension = (filename: string, allowedExtensions: string[]): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? allowedExtensions.includes(ext) : false;
};
