/**
 * Socket.io Service with Reliability Features
 * - Acknowledgment (ACK)
 * - Retry Logic
 * - Message Queue
 * - Auto-Reconnect
 * - Fallback HTTP
 */

import { io, Socket } from 'socket.io-client';

// ============================================
// Types
// ============================================

export interface LocationData {
    driverId?: string;
    lat: number;
    lng: number;
    status?: string;
    timestamp?: string;
}

interface QueuedMessage {
    data: LocationData;
    retries: number;
    timestamp: number;
}

// ============================================
// Configuration
// ============================================

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second
const ACK_TIMEOUT = 5000; // 5 seconds
const FALLBACK_INTERVAL = 10000; // 10 seconds

// ============================================
// Socket.io Client
// ============================================

let socket: Socket | null = null;
let socketConnected = false;
let fallbackInterval: NodeJS.Timeout | null = null;

/**
 * Get authentication token
 */
function getToken(): string | null {
    return localStorage.getItem('wecare_token');
}

/**
 * Initialize Socket.io connection
 */
export function initializeSocket(): Socket {
    if (socket) {
        return socket;
    }

    const token = getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const backendUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : window.location.origin;

    socket = io(`${backendUrl}/locations`, {
        auth: {
            token: token
        },
        // ✅ Reconnection Configuration
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        transports: ['websocket', 'polling']
    });

    // ✅ Event Handlers
    socket.on('connect', () => {
        console.log('✅ Socket.io connected');
        socketConnected = true;

        // Stop fallback polling
        if (fallbackInterval) {
            clearInterval(fallbackInterval);
            fallbackInterval = null;
        }

        // Resend pending messages
        processQueue();
    });

    socket.on('disconnect', (reason) => {
        console.warn('⚠️ Socket.io disconnected:', reason);
        socketConnected = false;

        if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect manually
            socket?.connect();
        }

        // Start fallback HTTP polling
        startFallbackPolling();
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log(`✅ Reconnected after ${attemptNumber} attempts`);
        socketConnected = true;

        // Resend pending messages
        processQueue();
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    socket.on('reconnect_error', (error) => {
        console.error('❌ Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
        console.error('❌ Reconnection failed after all attempts');

        // Notify user
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณา Refresh หน้าเว็บ');
    });

    socket.on('error', (error) => {
        console.error('❌ Socket.io error:', error);
    });

    return socket;
}

/**
 * Get Socket instance
 */
export function getSocket(): Socket {
    if (!socket) {
        return initializeSocket();
    }
    return socket;
}

/**
 * Disconnect Socket
 */
export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
        socketConnected = false;
    }

    if (fallbackInterval) {
        clearInterval(fallbackInterval);
        fallbackInterval = null;
    }
}

// ============================================
// Message Queue
// ============================================

const messageQueue: QueuedMessage[] = [];
let processing = false;

/**
 * Add message to queue
 */
function addToQueue(data: LocationData): void {
    messageQueue.push({
        data,
        retries: 0,
        timestamp: Date.now()
    });

    processQueue();
}

/**
 * Process message queue
 */
async function processQueue(): Promise<void> {
    if (processing || messageQueue.length === 0) {
        return;
    }

    processing = true;

    while (messageQueue.length > 0) {
        const message = messageQueue[0];

        try {
            await sendLocationUpdateInternal(message.data);
            // Success - remove from queue
            messageQueue.shift();
        } catch (error) {
            console.error('Failed to send location:', error);

            message.retries++;

            if (message.retries >= MAX_RETRIES) {
                console.error('Max retries reached, using HTTP fallback');
                try {
                    await fallbackToHTTP(message.data);
                    messageQueue.shift(); // Remove from queue
                } catch (httpError) {
                    console.error('HTTP fallback also failed:', httpError);
                    // Keep in queue for next attempt
                    break;
                }
            } else {
                // Wait before retry (exponential backoff)
                await sleep(RETRY_DELAY_BASE * Math.pow(2, message.retries - 1));
            }
        }
    }

    processing = false;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Location Update with ACK
// ============================================

/**
 * Send location update (internal with ACK)
 */
function sendLocationUpdateInternal(data: LocationData): Promise<void> {
    return new Promise((resolve, reject) => {
        const socket = getSocket();

        if (!socketConnected) {
            reject(new Error('Socket not connected'));
            return;
        }

        // Send with acknowledgment
        socket.emit('location:update', data, (ack: any) => {
            if (ack && ack.status === 'ok') {
                resolve();
            } else {
                reject(new Error(ack?.message || 'Failed to send location'));
            }
        });

        // Timeout after ACK_TIMEOUT
        setTimeout(() => {
            reject(new Error('ACK timeout'));
        }, ACK_TIMEOUT);
    });
}

/**
 * Send location update (public API with queue)
 */
export function sendLocationUpdate(data: LocationData): void {
    addToQueue(data);
}

// ============================================
// Fallback HTTP
// ============================================

let currentLocation: LocationData | null = null;

/**
 * Fallback to HTTP API
 */
async function fallbackToHTTP(data: LocationData): Promise<void> {
    const token = getToken();
    if (!token) {
        throw new Error('No authentication token');
    }

    const response = await fetch('/api/driver-locations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
}

/**
 * Start fallback HTTP polling
 */
function startFallbackPolling(): void {
    if (fallbackInterval) {
        return; // Already started
    }

    console.log('🔄 Starting HTTP fallback polling...');

    fallbackInterval = setInterval(() => {
        if (!socketConnected && currentLocation) {
            console.log('📡 Sending location via HTTP fallback...');
            fallbackToHTTP(currentLocation).catch(error => {
                console.error('HTTP fallback error:', error);
            });
        }
    }, FALLBACK_INTERVAL);
}

/**
 * Update current location (for fallback)
 */
export function updateCurrentLocation(data: LocationData): void {
    currentLocation = data;
}

// ============================================
// Event Listeners
// ============================================

/**
 * Listen for location updates
 * @returns Cleanup function to remove the listener
 */
export function onLocationUpdated(callback: (data: any) => void): () => void {
    const socket = getSocket();
    socket.on('location:updated', callback);

    // Return cleanup function
    return () => {
        socket.off('location:updated', callback);
    };
}

/**
 * Listen for driver status updates
 * @returns Cleanup function to remove the listener
 */
export function onDriverStatusUpdated(callback: (data: any) => void): () => void {
    const socket = getSocket();
    socket.on('driver:status:updated', callback);

    // Return cleanup function
    return () => {
        socket.off('driver:status:updated', callback);
    };
}

/**
 * Listen for general notifications
 * @returns Cleanup function to remove the listener
 */
export function onNotification(callback: (data: any) => void): () => void {
    const socket = getSocket();
    socket.on('notification:new', callback);

    // Return cleanup function
    return () => {
        socket.off('notification:new', callback);
    };
}

/**
 * Remove event listener
 */
export function off(event: string, callback?: (...args: any[]) => void): void {
    const socket = getSocket();
    if (callback) {
        socket.off(event, callback);
    } else {
        socket.off(event);
    }
}

// ============================================
// Export
// ============================================

export default {
    initializeSocket,
    getSocket,
    disconnectSocket,
    sendLocationUpdate,
    updateCurrentLocation,
    onLocationUpdated,
    onDriverStatusUpdated,
    onNotification,
    off
};
