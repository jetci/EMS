/**
 * Unit Tests for Password Validation Utility
 * Tests password complexity requirements and strength calculation
 */

import {
    validatePasswordComplexity,
    isPasswordValid,
    getPasswordRequirements,
    getPasswordStrengthColor,
    getPasswordStrengthLabel
} from '../../src/utils/passwordValidation';

describe('Password Validation Utility', () => {
    describe('validatePasswordComplexity', () => {
        // Test 1: Weak password - too short
        test('should reject password shorter than 8 characters', () => {
            const result = validatePasswordComplexity('Abc123!');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
            expect(result.strength).toBe('weak');
        });

        // Test 2: Weak password - no uppercase
        test('should reject password without uppercase letter', () => {
            const result = validatePasswordComplexity('password123!');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)');
        });

        // Test 3: Weak password - no lowercase
        test('should reject password without lowercase letter', () => {
            const result = validatePasswordComplexity('PASSWORD123!');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)');
        });

        // Test 4: Weak password - no number
        test('should reject password without number', () => {
            const result = validatePasswordComplexity('Password!');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว (0-9)');
        });

        // Test 5: Weak password - no special character
        test('should reject password without special character', () => {
            const result = validatePasswordComplexity('Password123');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว (@$!%*?&)');
        });

        // Test 6: Valid password - meets all requirements
        test('should accept password meeting all requirements', () => {
            const result = validatePasswordComplexity('Password123!');

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.strength).toMatch(/medium|strong|very-strong/);
            expect(result.score).toBeGreaterThanOrEqual(60);
        });

        // Test 7: Strong password
        test('should rate strong password correctly', () => {
            const result = validatePasswordComplexity('MyP@ssw0rd2024!');

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.strength).toMatch(/strong|very-strong/);
            expect(result.score).toBeGreaterThanOrEqual(70);
        });

        // Test 8: Very strong password
        test('should rate very strong password correctly', () => {
            const result = validatePasswordComplexity('V3ry$tr0ng!P@ssw0rd#2024');

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.strength).toBe('very-strong');
            expect(result.score).toBeGreaterThanOrEqual(80);
        });

        // Test 9: Common password
        test('should reject common passwords', () => {
            const commonPasswords = ['password', 'password123', '12345678', 'qwerty'];

            commonPasswords.forEach(pwd => {
                const result = validatePasswordComplexity(pwd);
                expect(result.isValid).toBe(false);
            });
        });

        // Test 10: Sequential characters
        test('should warn about sequential characters', () => {
            const result = validatePasswordComplexity('Abc123!@#');

            // May still be valid but with reduced score
            expect(result.errors.some(e => e.includes('ต่อเนื่องกัน'))).toBe(true);
        });

        // Test 11: Repeated characters
        test('should warn about repeated characters', () => {
            const result = validatePasswordComplexity('Passs111!!!');

            // May still be valid but with reduced score
            expect(result.errors.some(e => e.includes('ซ้ำกัน'))).toBe(true);
        });

        // Test 12: Empty password
        test('should reject empty password', () => {
            const result = validatePasswordComplexity('');

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        // Test 13: Score calculation
        test('should calculate score correctly', () => {
            const weak = validatePasswordComplexity('abc');
            const medium = validatePasswordComplexity('Password123!');
            const strong = validatePasswordComplexity('MyP@ssw0rd2024!');

            expect(weak.score).toBeLessThan(medium.score);
            expect(medium.score).toBeLessThan(strong.score);
        });
    });

    describe('isPasswordValid', () => {
        test('should return true for valid password', () => {
            expect(isPasswordValid('Password123!')).toBe(true);
        });

        test('should return false for invalid password', () => {
            expect(isPasswordValid('weak')).toBe(false);
        });
    });

    describe('getPasswordRequirements', () => {
        test('should return array of requirements', () => {
            const requirements = getPasswordRequirements();

            expect(Array.isArray(requirements)).toBe(true);
            expect(requirements.length).toBe(5);
            expect(requirements).toContain('อย่างน้อย 8 ตัวอักษร');
        });
    });

    describe('getPasswordStrengthColor', () => {
        test('should return correct color for each strength', () => {
            expect(getPasswordStrengthColor('weak')).toBe('#ef4444');
            expect(getPasswordStrengthColor('medium')).toBe('#f59e0b');
            expect(getPasswordStrengthColor('strong')).toBe('#10b981');
            expect(getPasswordStrengthColor('very-strong')).toBe('#059669');
        });
    });

    describe('getPasswordStrengthLabel', () => {
        test('should return correct Thai label for each strength', () => {
            expect(getPasswordStrengthLabel('weak')).toBe('อ่อนแอ');
            expect(getPasswordStrengthLabel('medium')).toBe('ปานกลาง');
            expect(getPasswordStrengthLabel('strong')).toBe('แข็งแรง');
            expect(getPasswordStrengthLabel('very-strong')).toBe('แข็งแรงมาก');
        });
    });
});
