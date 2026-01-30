/**
 * Encryption Utilities Tests
 */

import { encrypt, decrypt, encryptArray, decryptArray, isEncrypted } from '../src/utils/encryption';

// Set test encryption key
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('Encryption Utilities', () => {
  describe('encrypt()', () => {
    test('should encrypt text successfully', () => {
      const plainText = 'Hello World';
      const encrypted = encrypt(plainText);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plainText);
      expect(encrypted).toContain(':'); // Should have iv:data format
    });

    test('should produce different ciphertext for same input (random IV)', () => {
      const plainText = '1234567890123';
      const encrypted1 = encrypt(plainText);
      const encrypted2 = encrypt(plainText);
      
      expect(encrypted1).not.toBe(encrypted2); // Different IV each time
    });

    test('should throw error for empty text', () => {
      expect(() => encrypt('')).toThrow('Cannot encrypt empty text');
    });

    test('should encrypt Thai text correctly', () => {
      const thaiText = 'สวัสดีครับ';
      const encrypted = encrypt(thaiText);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(thaiText);
    });

    test('should encrypt special characters', () => {
      const specialText = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./';
      const encrypted = encrypt(specialText);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(specialText);
    });
  });

  describe('decrypt()', () => {
    test('should decrypt text successfully', () => {
      const plainText = 'Hello World';
      const encrypted = encrypt(plainText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plainText);
    });

    test('should decrypt Thai text correctly', () => {
      const thaiText = 'ทดสอบการเข้ารหัส';
      const encrypted = encrypt(thaiText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(thaiText);
    });

    test('should decrypt long text correctly', () => {
      const longText = 'A'.repeat(1000);
      const encrypted = encrypt(longText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(longText);
    });

    test('should throw error for empty text', () => {
      expect(() => decrypt('')).toThrow('Cannot decrypt empty text');
    });

    test('should throw error for invalid format', () => {
      expect(() => decrypt('invalid')).toThrow('Invalid encrypted text format');
    });

    test('should throw error for wrong IV length', () => {
      expect(() => decrypt('abc:def')).toThrow();
    });
  });

  describe('encrypt() and decrypt() together', () => {
    test('should handle national ID', () => {
      const nationalId = '1234567890123';
      const encrypted = encrypt(nationalId);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(nationalId);
      expect(encrypted).not.toBe(nationalId);
    });

    test('should handle phone number', () => {
      const phone = '0812345678';
      const encrypted = encrypt(phone);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(phone);
    });

    test('should handle multiple encryptions', () => {
      const data = ['test1', 'test2', 'test3'];
      const encrypted = data.map(d => encrypt(d));
      const decrypted = encrypted.map(e => decrypt(e));
      
      expect(decrypted).toEqual(data);
    });
  });

  describe('encryptArray()', () => {
    test('should encrypt array of strings', () => {
      const items = ['เบาหวาน', 'ความดันโลหิตสูง', 'หัวใจ'];
      const encrypted = encryptArray(items);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).toContain(':');
      expect(encrypted).not.toContain('เบาหวาน');
    });

    test('should handle empty array', () => {
      const items: string[] = [];
      const encrypted = encryptArray(items);
      
      expect(encrypted).toBeDefined();
    });

    test('should handle single item array', () => {
      const items = ['ยาปฏิชีวนะ'];
      const encrypted = encryptArray(items);
      
      expect(encrypted).toBeDefined();
    });
  });

  describe('decryptArray()', () => {
    test('should decrypt array of strings', () => {
      const items = ['เบาหวาน', 'ความดันโลหิตสูง', 'หัวใจ'];
      const encrypted = encryptArray(items);
      const decrypted = decryptArray(encrypted);
      
      expect(decrypted).toEqual(items);
    });

    test('should handle empty encrypted array', () => {
      const items: string[] = [];
      const encrypted = encryptArray(items);
      const decrypted = decryptArray(encrypted);
      
      expect(decrypted).toEqual([]);
    });

    test('should return empty array for empty string', () => {
      const decrypted = decryptArray('');
      expect(decrypted).toEqual([]);
    });

    test('should handle decryption errors gracefully', () => {
      const decrypted = decryptArray('invalid:data');
      expect(decrypted).toEqual([]);
    });
  });

  describe('isEncrypted()', () => {
    test('should return true for encrypted text', () => {
      const encrypted = encrypt('test');
      expect(isEncrypted(encrypted)).toBe(true);
    });

    test('should return false for plain text', () => {
      expect(isEncrypted('plain text')).toBe(false);
    });

    test('should return false for empty string', () => {
      expect(isEncrypted('')).toBe(false);
    });

    test('should return false for invalid format', () => {
      expect(isEncrypted('no:colon:here')).toBe(false);
      expect(isEncrypted('notencrypted')).toBe(false);
    });
  });

  describe('Error handling', () => {
    test('should throw error if ENCRYPTION_KEY is not set', () => {
      const originalKey = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;
      
      expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY is not set');
      
      process.env.ENCRYPTION_KEY = originalKey;
    });

    test('should throw error if ENCRYPTION_KEY has wrong length', () => {
      const originalKey = process.env.ENCRYPTION_KEY;
      process.env.ENCRYPTION_KEY = 'tooshort';
      
      expect(() => encrypt('test')).toThrow('must be 64 characters');
      
      process.env.ENCRYPTION_KEY = originalKey;
    });

    test('should throw error if ENCRYPTION_KEY is not hex', () => {
      const originalKey = process.env.ENCRYPTION_KEY;
      process.env.ENCRYPTION_KEY = 'g'.repeat(64); // Invalid hex
      
      expect(() => encrypt('test')).toThrow('must be a valid hex string');
      
      process.env.ENCRYPTION_KEY = originalKey;
    });
  });

  describe('Performance', () => {
    test('should encrypt/decrypt 1000 items in reasonable time', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        const encrypted = encrypt(`test-${i}`);
        decrypt(encrypted);
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete in < 5 seconds
    });
  });
});
