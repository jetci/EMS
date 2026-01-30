/**
 * Frontend Validation Utilities
 * Purpose: Validate user input before sending to backend
 * Usage: Import and use in form components
 */

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * Validate Thai National ID (13 digits)
 * Algorithm: MOD 11
 */
export const validateThaiNationalId = (id: string): boolean => {
    if (!id || id.length !== 13) return false;

    // Check if all characters are digits
    if (!/^\d{13}$/.test(id)) return false;

    // MOD 11 algorithm
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(id.charAt(i)) * (13 - i);
    }

    const mod = sum % 11;
    const checkDigit = (11 - mod) % 10;

    return checkDigit === parseInt(id.charAt(12));
};

/**
 * Validate Thai phone number (10 digits, starts with 0)
 */
export const validateThaiPhoneNumber = (phone: string): boolean => {
    if (!phone) return false;

    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');

    // Must be 10 digits and start with 0
    return /^0\d{9}$/.test(cleaned);
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
    if (!email) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate required field
 */
export const validateRequired = (value: any, fieldName: string): ValidationError | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return {
            field: fieldName,
            message: `กรุณากรอก${fieldName}`
        };
    }
    return null;
};

/**
 * Validate string length
 */
export const validateLength = (
    value: string,
    fieldName: string,
    min?: number,
    max?: number
): ValidationError | null => {
    if (!value) return null;

    const length = value.trim().length;

    if (min && length < min) {
        return {
            field: fieldName,
            message: `${fieldName}ต้องมีอย่างน้อย ${min} ตัวอักษร`
        };
    }

    if (max && length > max) {
        return {
            field: fieldName,
            message: `${fieldName}ต้องไม่เกิน ${max} ตัวอักษร`
        };
    }

    return null;
};

/**
 * Validate patient registration data
 */
export const validatePatientData = (data: any): ValidationResult => {
    const errors: ValidationError[] = [];

    // Required fields
    const requiredError = validateRequired(data.firstName, 'ชื่อ');
    if (requiredError) errors.push(requiredError);

    const lastNameError = validateRequired(data.lastName, 'นามสกุล');
    if (lastNameError) errors.push(lastNameError);

    // Name length
    if (data.firstName) {
        const lengthError = validateLength(data.firstName, 'ชื่อ', 2, 50);
        if (lengthError) errors.push(lengthError);
    }

    if (data.lastName) {
        const lengthError = validateLength(data.lastName, 'นามสกุล', 2, 50);
        if (lengthError) errors.push(lengthError);
    }

    // National ID (optional but must be valid if provided)
    if (data.idCard && data.idCard.trim() !== '') {
        if (!validateThaiNationalId(data.idCard)) {
            errors.push({
                field: 'idCard',
                message: 'เลขบัตรประชาชนไม่ถูกต้อง (ต้องเป็น 13 หลัก)'
            });
        }
    }

    // Phone number (required)
    const phoneError = validateRequired(data.contactPhone, 'เบอร์โทรศัพท์');
    if (phoneError) {
        errors.push(phoneError);
    } else if (!validateThaiPhoneNumber(data.contactPhone)) {
        errors.push({
            field: 'contactPhone',
            message: 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็น 10 หลัก เริ่มต้นด้วย 0)'
        });
    }

    // Age (must be positive number)
    if (data.age) {
        const age = parseInt(data.age);
        if (isNaN(age) || age < 0 || age > 150) {
            errors.push({
                field: 'age',
                message: 'อายุไม่ถูกต้อง (ต้องเป็นตัวเลข 0-150)'
            });
        }
    }

    // Gender (required)
    const genderError = validateRequired(data.gender, 'เพศ');
    if (genderError) errors.push(genderError);

    // Latitude/Longitude (must be valid numbers if provided)
    if (data.latitude) {
        const lat = parseFloat(data.latitude);
        if (isNaN(lat) || lat < -90 || lat > 90) {
            errors.push({
                field: 'latitude',
                message: 'ละติจูดไม่ถูกต้อง (-90 ถึง 90)'
            });
        }

        // Check if in Thailand bounds
        if (lat < 5.6 || lat > 20.5) {
            errors.push({
                field: 'latitude',
                message: 'ละติจูดอยู่นอกประเทศไทย (5.6 ถึง 20.5)'
            });
        }
    }

    if (data.longitude) {
        const lng = parseFloat(data.longitude);
        if (isNaN(lng) || lng < -180 || lng > 180) {
            errors.push({
                field: 'longitude',
                message: 'ลองจิจูดไม่ถูกต้อง (-180 ถึง 180)'
            });
        }

        // Check if in Thailand bounds
        if (lng < 97.3 || lng > 105.6) {
            errors.push({
                field: 'longitude',
                message: 'ลองจิจูดอยู่นอกประเทศไทย (97.3 ถึง 105.6)'
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate ride request data
 */
export const validateRideData = (data: any): ValidationResult => {
    const errors: ValidationError[] = [];

    // Patient selection (required)
    const patientError = validateRequired(data.patient_id, 'ผู้ป่วย');
    if (patientError) errors.push(patientError);

    // Destination (required)
    const destError = validateRequired(data.destination, 'จุดหมาย');
    if (destError) errors.push(destError);

    // Appointment time (required)
    const timeError = validateRequired(data.appointment_time, 'วันและเวลานัดหมาย');
    if (timeError) errors.push(timeError);

    // Trip type (required)
    const typeError = validateRequired(data.trip_type, 'ประเภทการเดินทาง');
    if (typeError) errors.push(typeError);

    // Contact phone (required)
    const phoneError = validateRequired(data.contact_phone, 'เบอร์โทรศัพท์ติดต่อ');
    if (phoneError) {
        errors.push(phoneError);
    } else if (!validateThaiPhoneNumber(data.contact_phone)) {
        errors.push({
            field: 'contact_phone',
            message: 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็น 10 หลัก เริ่มต้นด้วย 0)'
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
    if (errors.length === 0) return '';

    return errors.map(err => `• ${err.message}`).join('\n');
};

/**
 * Get error message for a specific field
 */
export const getFieldError = (errors: ValidationError[], fieldName: string): string | null => {
    const error = errors.find(err => err.field === fieldName);
    return error ? error.message : null;
};
