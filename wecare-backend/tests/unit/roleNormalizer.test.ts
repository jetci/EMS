/**
 * Unit Tests for Role Normalizer Utility
 */

import { normalizeRole, hasRole, UserRole } from '../../src/utils/roleNormalizer';

describe('roleNormalizer', () => {
    describe('normalizeRole', () => {
        test('should normalize OFFICER variations', () => {
            expect(normalizeRole('OFFICER')).toBe('OFFICER');
            expect(normalizeRole('officer')).toBe('OFFICER');
            expect(normalizeRole('OFFICE')).toBe('OFFICER');
            expect(normalizeRole('office')).toBe('OFFICER');
        });

        test('should normalize RADIO_CENTER variations', () => {
            expect(normalizeRole('RADIO_CENTER')).toBe('RADIO_CENTER');
            expect(normalizeRole('radio_center')).toBe('RADIO_CENTER');
            expect(normalizeRole('RADIO')).toBe('RADIO_CENTER');
            expect(normalizeRole('radio')).toBe('RADIO_CENTER');
        });

        test('should normalize ADMIN variations', () => {
            expect(normalizeRole('ADMIN')).toBe('ADMIN');
            expect(normalizeRole('admin')).toBe('ADMIN');
        });

        test('should normalize other roles', () => {
            expect(normalizeRole('DEVELOPER')).toBe('DEVELOPER');
            expect(normalizeRole('developer')).toBe('DEVELOPER');
            expect(normalizeRole('DRIVER')).toBe('DRIVER');
            expect(normalizeRole('driver')).toBe('DRIVER');
            expect(normalizeRole('COMMUNITY')).toBe('COMMUNITY');
            expect(normalizeRole('community')).toBe('COMMUNITY');
            expect(normalizeRole('EXECUTIVE')).toBe('EXECUTIVE');
            expect(normalizeRole('executive')).toBe('EXECUTIVE');
        });

        test('should handle undefined and empty strings', () => {
            expect(normalizeRole(undefined)).toBe('');
            expect(normalizeRole('')).toBe('');
            expect(normalizeRole('   ')).toBe('');
        });

        test('should trim whitespace', () => {
            expect(normalizeRole('  OFFICER  ')).toBe('OFFICER');
            expect(normalizeRole('  officer  ')).toBe('OFFICER');
        });
    });

    describe('hasRole', () => {
        test('should check if role is in allowed list', () => {
            expect(hasRole('OFFICER', ['OFFICER', 'ADMIN'])).toBe(true);
            expect(hasRole('officer', ['OFFICER', 'ADMIN'])).toBe(true);
            expect(hasRole('OFFICE', ['OFFICER', 'ADMIN'])).toBe(true);
            expect(hasRole('DRIVER', ['OFFICER', 'ADMIN'])).toBe(false);
        });

        test('should handle case-insensitive comparison', () => {
            expect(hasRole('officer', ['officer', 'admin'])).toBe(true);
            expect(hasRole('OFFICER', ['officer', 'admin'])).toBe(true);
        });

        test('should handle undefined role', () => {
            expect(hasRole(undefined, ['OFFICER', 'ADMIN'])).toBe(false);
        });
    });

    describe('UserRole constants', () => {
        test('should have all role constants', () => {
            expect(UserRole.ADMIN).toBe('ADMIN');
            expect(UserRole.DEVELOPER).toBe('DEVELOPER');
            expect(UserRole.OFFICER).toBe('OFFICER');
            expect(UserRole.RADIO_CENTER).toBe('RADIO_CENTER');
            expect(UserRole.DRIVER).toBe('DRIVER');
            expect(UserRole.COMMUNITY).toBe('COMMUNITY');
            expect(UserRole.EXECUTIVE).toBe('EXECUTIVE');
        });
    });
});
