/**
 * Password Security Utilities
 * Implements password complexity requirements for EMS WeCare
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character (@$!%*?&)
 */

export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong' | 'very-strong';
    score: number; // 0-100
}

/**
 * Validate password complexity
 * @param password - Password to validate
 * @returns Validation result with errors and strength
 */
export function validatePasswordComplexity(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Check minimum length
    if (!password || password.length < 8) {
        errors.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
    } else {
        score += 20;
        // Bonus for longer passwords
        if (password.length >= 12) score += 10;
        if (password.length >= 16) score += 10;
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push('รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)');
    } else {
        score += 20;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push('รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)');
    } else {
        score += 20;
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
        errors.push('รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว (0-9)');
    } else {
        score += 20;
    }

    // Check for special character
    if (!/[@$!%*?&]/.test(password)) {
        errors.push('รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว (@$!%*?&)');
    } else {
        score += 20;
    }

    // Additional security checks
    // Check for common weak passwords
    const commonPasswords = [
        'password', 'password123', '12345678', 'qwerty', 'abc123',
        'admin', 'admin123', 'letmein', 'welcome', 'monkey',
        '1234567890', 'password1', 'qwerty123', 'admin1234'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('รหัสผ่านนี้ถูกใช้บ่อยเกินไป กรุณาเลือกรหัสผ่านที่ปลอดภัยกว่า');
        score = Math.min(score, 30); // Cap score for common passwords
    }

    // Check for sequential characters
    if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
        errors.push('รหัสผ่านไม่ควรมีตัวอักษรที่ต่อเนื่องกัน (เช่น abc, xyz)');
        score -= 10;
    }

    // Check for sequential numbers
    if (/(?:012|123|234|345|456|567|678|789|890)/.test(password)) {
        errors.push('รหัสผ่านไม่ควรมีตัวเลขที่ต่อเนื่องกัน (เช่น 123, 456)');
        score -= 10;
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
        errors.push('รหัสผ่านไม่ควรมีตัวอักษรซ้ำกันติดต่อกันมากกว่า 2 ตัว');
        score -= 10;
    }

    // Ensure score is within 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
    if (score < 40) {
        strength = 'weak';
    } else if (score < 60) {
        strength = 'medium';
    } else if (score < 80) {
        strength = 'strong';
    } else {
        strength = 'very-strong';
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength,
        score
    };
}

/**
 * Get password strength color for UI
 */
export function getPasswordStrengthColor(strength: string): string {
    switch (strength) {
        case 'weak':
            return '#ef4444'; // red
        case 'medium':
            return '#f59e0b'; // orange
        case 'strong':
            return '#10b981'; // green
        case 'very-strong':
            return '#059669'; // dark green
        default:
            return '#6b7280'; // gray
    }
}

/**
 * Get password strength label in Thai
 */
export function getPasswordStrengthLabel(strength: string): string {
    switch (strength) {
        case 'weak':
            return 'อ่อนแอ';
        case 'medium':
            return 'ปานกลาง';
        case 'strong':
            return 'แข็งแรง';
        case 'very-strong':
            return 'แข็งแรงมาก';
        default:
            return 'ไม่ทราบ';
    }
}

/**
 * Format validation errors for display
 */
export function formatPasswordErrors(errors: string[]): string {
    if (errors.length === 0) return '';
    return errors.join('\n');
}

/**
 * Check if password meets minimum requirements (for backend validation)
 */
export function isPasswordValid(password: string): boolean {
    const result = validatePasswordComplexity(password);
    return result.isValid;
}

/**
 * Get password requirements as array (for displaying to users)
 */
export function getPasswordRequirements(): string[] {
    return [
        'อย่างน้อย 8 ตัวอักษร',
        'มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)',
        'มีตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)',
        'มีตัวเลขอย่างน้อย 1 ตัว (0-9)',
        'มีอักขระพิเศษอย่างน้อย 1 ตัว (@$!%*?&)'
    ];
}
