/**
 * Socket.IO Service for Real-time Location Tracking
 * Fixes BUG-009: No real-time location tracking
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

class SocketService {
    private socket: Socket | null = null;
    private locationSocket: Socket | null = null;

    /**
     * Connect to location tracking namespace
     */
    connectToLocationTracking() {
        if (this.locationSocket?.connected) {
            console.log('Already connected to location tracking');
            return this.locationSocket;
        }

        this.locationSocket = io(`${SOCKET_URL}/locations`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.locationSocket.on('connect', () => {
            console.log('🔌 Connected to location tracking');
        });

        this.locationSocket.on('disconnect', () => {
            console.log('🔌 Disconnected from location tracking');
        });

        this.locationSocket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error);
        });

        return this.locationSocket;
    }

    /**
     * Send location update (for drivers)
     */
    sendLocationUpdate(data: {
        driverId: string;
        lat: number;
        lng: number;
        speed?: number;
        heading?: number;
    }) {
        if (!this.locationSocket?.connected) {
            console.warn('Not connected to location tracking');
            return;
        }

        this.locationSocket.emit('location:update', data);
        console.log('📍 Location sent:', data);
    }

    /**
     * Listen for location updates (for office/executive)
     */
    onLocationUpdate(callback: (data: any) => void) {
        if (!this.locationSocket) {
            this.connectToLocationTracking();
        }

        this.locationSocket?.on('location:updated', callback);
    }

    /**
     * Send driver status update
     */
    sendDriverStatus(data: {
        driverId: string;
        status: string;
        rideId?: string;
    }) {
        if (!this.locationSocket?.connected) {
            console.warn('Not connected to location tracking');
            return;
        }

        this.locationSocket.emit('driver:status', data);
    }

    /**
     * Listen for driver status updates
     */
    onDriverStatusUpdate(callback: (data: any) => void) {
        if (!this.locationSocket) {
            this.connectToLocationTracking();
        }

        this.locationSocket?.on('driver:status:updated', callback);
    }

    /**
     * Disconnect from location tracking
     */
    disconnectLocationTracking() {
        if (this.locationSocket) {
            this.locationSocket.disconnect();
            this.locationSocket = null;
            console.log('🔌 Disconnected from location tracking');
        }
    }

    /**
     * Remove all listeners
     */
    removeAllListeners() {
        this.locationSocket?.removeAllListeners();
    }
}

// Export singleton instance
export const socketService = new SocketService();
