import { hashPassword, verifyPassword, needsRehash } from '../../src/utils/password';
import bcrypt from 'bcryptjs';

describe('Password Utility', () => {
    const password = 'TestPassword123!';

    describe('hashPassword', () => {
        it('should hash a password correctly', async () => {
            const hash = await hashPassword(password);
            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash).toMatch(/^\$2[abxy]\$.{56}$/); // Standard bcrypt hash format
        });

        it('should generate different hashes for same password (using salt)', async () => {
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);
            expect(hash1).not.toBe(hash2);
        });
    });

    describe('verifyPassword', () => {
        it('should return true for correct password', async () => {
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(password, hash);
            expect(isValid).toBe(true);
        });

        it('should return false for incorrect password', async () => {
            const hash = await hashPassword(password);
            const isValid = await verifyPassword('WrongPassword', hash);
            expect(isValid).toBe(false);
        });

        it('should return false for empty string', async () => {
            const hash = await hashPassword(password);
            const isValid = await verifyPassword('', hash);
            expect(isValid).toBe(false);
        });
    });

    describe('needsRehash', () => {
        it('should return false for current work factor', async () => {
            const hash = await hashPassword(password);
            const result = needsRehash(hash);
            expect(result).toBe(false);
        });

        it('should return true if hash cost is lower than default', async () => {
            // Generate hash with lower cost (e.g., 4)
            const salt = await bcrypt.genSalt(4);
            const weakHash = await bcrypt.hash(password, salt);
            const result = needsRehash(weakHash);
            expect(result).toBe(true);
        });
    });
});
