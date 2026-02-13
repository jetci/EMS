/**
 * Role Normalization Utility
 * 
 * Centralizes role name normalization logic to ensure consistency
 * across the entire application.
 */

/**
 * Role aliases mapping
 * Maps alternative role names to their canonical forms
 */
const ROLE_ALIASES: Record<string, string> = {
    'OFFICE': 'OFFICER',
    'RADIO': 'RADIO_CENTER',
    'ADMIN': 'ADMIN',
    'admin': 'ADMIN',
    'developer': 'DEVELOPER',
    'officer': 'OFFICER',
    'radio_center': 'RADIO_CENTER',
    'driver': 'DRIVER',
    'community': 'COMMUNITY',
    'executive': 'EXECUTIVE'
};

/**
 * Normalize a role string to its canonical uppercase form
 * 
 * @param role - The role string to normalize (can be undefined)
 * @returns Normalized role in UPPERCASE, or empty string if invalid
 * 
 * @example
 * normalizeRole('officer') // returns 'OFFICER'
 * normalizeRole('OFFICE') // returns 'OFFICER'
 * normalizeRole('admin') // returns 'ADMIN'
 */
export function normalizeRole(role: string | undefined): string {
    if (!role) return '';

    const trimmed = String(role).trim();
    const upper = trimmed.toUpperCase();

    // Check if there's an alias mapping
    if (ROLE_ALIASES[trimmed]) {
        return ROLE_ALIASES[trimmed];
    }

    if (ROLE_ALIASES[upper]) {
        return ROLE_ALIASES[upper];
    }

    // Return uppercase version if no alias found
    return upper;
}

/**
 * Check if a role has a specific permission level
 * 
 * @param role - The role to check
 * @param allowedRoles - Array of allowed roles
 * @returns true if role is in allowed list
 */
export function hasRole(role: string | undefined, allowedRoles: string[]): boolean {
    const normalized = normalizeRole(role);
    const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));
    return normalizedAllowed.includes(normalized);
}

/**
 * Standard role constants for type safety
 */
export const UserRole = {
    ADMIN: 'ADMIN',
    DEVELOPER: 'DEVELOPER',
    OFFICER: 'OFFICER',
    RADIO_CENTER: 'RADIO_CENTER',
    DRIVER: 'DRIVER',
    COMMUNITY: 'COMMUNITY',
    EXECUTIVE: 'EXECUTIVE'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];
