import {
    validateEmail,
    validatePhoneNumber,
    validateNationalId,
    validateJSON,
    validateRequiredFields,
    validatePastDate
} from '../../src/utils/validators';

describe('Validators Utility', () => {
    describe('validateEmail', () => {
        it('should return true for valid email', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name+tag@domain.co.th')).toBe(true);
        });

        it('should return false for invalid email', () => {
            expect(validateEmail('invalid-email')).toBe(false);
            expect(validateEmail('@domain.com')).toBe(false);
            expect(validateEmail('user@')).toBe(false);
            expect(validateEmail('')).toBe(false);
        });
    });

    describe('validatePhoneNumber', () => {
        it('should return true for valid Thai phone number', () => {
            expect(validatePhoneNumber('0812345678')).toBe(true);
            expect(validatePhoneNumber('021234567')).toBe(true); // Landline
        });

        it('should handle formatted numbers', () => {
            expect(validatePhoneNumber('081-234-5678')).toBe(true);
            expect(validatePhoneNumber('(02) 123-4567')).toBe(true);
        });

        it('should return false for invalid phone number', () => {
            expect(validatePhoneNumber('123')).toBe(false);
            expect(validatePhoneNumber('abcdefghij')).toBe(false);
            expect(validatePhoneNumber('')).toBe(false);
        });
    });

    describe('validateNationalId', () => {
        it('should return true for valid Thai National ID', () => {
            // Valid ID example (Checksum logic)
            // 1-2345-67890-12-1
            // 1*13 + 2*12 + 3*11 + 4*10 + 5*9 + 6*8 + 7*7 + 8*6 + 9*5 + 0*4 + 1*3 + 2*2
            // Sum = 13 + 24 + 33 + 40 + 45 + 48 + 49 + 48 + 45 + 0 + 3 + 4 = 352
            // 352 % 11 = 0
            // 11 - 0 = 11 -> 1
            // Check digit = 1
            expect(validateNationalId('1234567890121')).toBe(true);
        });

        it('should return false for invalid format', () => {
            expect(validateNationalId('123')).toBe(false); // Too short
            expect(validateNationalId('abcdefghijklm')).toBe(false); // Not digits
        });

        it('should return false for invalid checksum', () => {
            expect(validateNationalId('1234567890120')).toBe(false); // Wrong check digit
        });
    });

    describe('validateJSON', () => {
        it('should validate valid JSON string', () => {
            expect(() => validateJSON('test', '{"key":"value"}')).not.toThrow();
        });

        it('should validate valid object', () => {
            expect(() => validateJSON('test', { key: 'value' })).not.toThrow();
        });

        it('should throw error for invalid JSON string', () => {
            expect(() => validateJSON('test', '{invalid}')).toThrow();
        });
    });

    describe('validateRequiredFields', () => {
        it('should pass given all required fields', () => {
            const data = { name: 'John', age: 30 };
            expect(() => validateRequiredFields(data, ['name', 'age'])).not.toThrow();
        });

        it('should throw error if field is missing', () => {
            const data = { name: 'John' };
            expect(() => validateRequiredFields(data, ['name', 'age'])).toThrow('Missing required fields: age');
        });
    });
});
