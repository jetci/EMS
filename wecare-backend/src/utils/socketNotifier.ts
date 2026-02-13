/**
 * Socket.IO Notification Utility
 * 
 * Centralizes socket notification logic to ensure consistent
 * notification delivery across all roles.
 */

import { Server as SocketIOServer, Namespace } from 'socket.io';

/**
 * Socket room names for each role
 * Uses consistent UPPERCASE naming
 */
export const SOCKET_ROLES = {
    OFFICER: 'role:OFFICER',
    RADIO_CENTER: 'role:RADIO_CENTER',
    ADMIN: 'role:ADMIN',
    DEVELOPER: 'role:DEVELOPER',
    EXECUTIVE: 'role:EXECUTIVE',
    DRIVER: 'role:DRIVER',
    COMMUNITY: 'role:COMMUNITY'
} as const;

/**
 * Notification payload interface
 */
export interface NotificationPayload {
    eventType: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    rideId?: string;
    status?: string;
    [key: string]: any;
}

/**
 * Notify operational roles (OFFICER, RADIO_CENTER, ADMIN, DEVELOPER)
 * Used for ride management, dispatch, and operational events
 */
export function notifyOperationalRoles(ns: Namespace, payload: NotificationPayload): void {
    const roles = [
        SOCKET_ROLES.OFFICER,
        SOCKET_ROLES.RADIO_CENTER,
        SOCKET_ROLES.ADMIN,
        SOCKET_ROLES.DEVELOPER
    ];

    roles.forEach(role => {
        ns.to(role).emit('notification:new', payload);
    });
}

/**
 * Notify all roles
 * Used for system-wide announcements
 */
export function notifyAllRoles(ns: Namespace, payload: NotificationPayload): void {
    Object.values(SOCKET_ROLES).forEach(role => {
        ns.to(role).emit('notification:new', payload);
    });
}

/**
 * Notify specific roles
 * 
 * @param ns - Socket.IO namespace
 * @param roles - Array of role names (will be normalized)
 * @param payload - Notification payload
 */
export function notifyRoles(ns: Namespace, roles: string[], payload: NotificationPayload): void {
    roles.forEach(role => {
        const roomName = `role:${role.toUpperCase()}`;
        ns.to(roomName).emit('notification:new', payload);
    });
}

/**
 * Notify a specific user
 * 
 * @param ns - Socket.IO namespace
 * @param userId - User ID
 * @param payload - Notification payload
 */
export function notifyUser(ns: Namespace, userId: string, payload: NotificationPayload): void {
    ns.to(`user:${userId}`).emit('notification:new', payload);
}

/**
 * Get socket room name for a role
 * Ensures consistent naming with UPPERCASE
 */
export function getRoleRoom(role: string): string {
    const upper = role.toUpperCase();
    const roleKey = upper as keyof typeof SOCKET_ROLES;
    return SOCKET_ROLES[roleKey] || `role:${upper}`;
}
