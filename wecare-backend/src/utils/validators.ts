/**
 * Validation utilities for EMS WeCare
 * Includes JSON validation, data type validation, and field validation
 */

/**
 * Validate JSON field - ensures value is valid JSON
 * @param fieldName - Name of the field being validated
 * @param value - Value to validate
 * @throws Error if JSON is invalid
 */
export const validateJSON = (fieldName: string, value: any): void => {
    if (!value) return; // Allow null/undefined

    try {
        if (typeof value === 'string') {
            // If it's a string, try to parse it
            JSON.parse(value);
        } else if (typeof value === 'object') {
            // If it's already an object, try to stringify it
            JSON.stringify(value);
        } else {
            throw new Error('Value must be a string or object');
        }
    } catch (error: any) {
        throw new Error(`Invalid JSON in field "${fieldName}": ${error.message}`);
    }
};

/**
 * Validate patient data - ensures all JSON fields are valid
 * @param data - Patient data object
 * @throws Error if any JSON field is invalid
 */
export const validatePatientData = (data: any): void => {
    const jsonFields = ['patient_types', 'chronic_diseases', 'allergies', 'special_needs'];

    jsonFields.forEach(field => {
        if (data[field] !== undefined && data[field] !== null) {
            validateJSON(field, data[field]);

            // Ensure it's an array if it's already parsed
            if (typeof data[field] === 'object' && !Array.isArray(data[field])) {
                throw new Error(`Field "${field}" must be an array`);
            }
        }
    });
};

/**
 * Validate ride data - ensures all JSON fields are valid
 * @param data - Ride data object
 * @throws Error if any JSON field is invalid
 */
export const validateRideData = (data: any): void => {
    const jsonFields = ['special_requirements'];

    jsonFields.forEach(field => {
        if (data[field] !== undefined && data[field] !== null) {
            validateJSON(field, data[field]);
        }
    });
};

/**
 * Sanitize JSON field - converts to JSON string if needed
 * @param value - Value to sanitize
 * @returns JSON string or original value
 */
export const sanitizeJSON = (value: any): string | null => {
    if (!value) return null;

    if (typeof value === 'string') {
        // Validate it's proper JSON
        try {
            JSON.parse(value);
            return value;
        } catch {
            throw new Error('Invalid JSON string');
        }
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    throw new Error('Value must be a string or object');
};

/**
 * Validate national ID format (Thai format: 13 digits)
 * @param nationalId - National ID to validate
 * @returns true if valid, false otherwise
 */
export const validateNationalId = (nationalId: string): boolean => {
    if (!nationalId || nationalId.length !== 13) {
        return false;
    }

    // Check if all characters are digits
    if (!/^\d{13}$/.test(nationalId)) {
        return false;
    }

    // Thai national ID checksum validation
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(nationalId.charAt(i)) * (13 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 10;

    return checkDigit === parseInt(nationalId.charAt(12));
};

/**
 * Validate phone number format (Thai format)
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return false;

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Thai phone numbers: 10 digits starting with 0, or 9 digits without leading 0
    return /^0\d{9}$/.test(cleaned) || /^\d{9}$/.test(cleaned);
};

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
    if (!email) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate date is not in the future
 * @param date - Date string to validate
 * @returns true if valid, false otherwise
 */
export const validatePastDate = (date: string): boolean => {
    if (!date) return false;

    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    return inputDate <= today;
};

/**
 * Validate required fields
 * @param data - Data object
 * @param requiredFields - Array of required field names
 * @throws Error if any required field is missing
 */
export const validateRequiredFields = (data: any, requiredFields: string[]): void => {
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
};
