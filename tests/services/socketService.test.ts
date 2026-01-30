/**
 * Socket Service - Memory Leak Prevention Tests
 * 
 * Tests to ensure that Socket.io event listeners are properly cleaned up
 * to prevent memory leaks when components unmount.
 */

import { onLocationUpdated, onDriverStatusUpdated, getSocket, initializeSocket } from '../../src/services/socketService';

// Mock Socket.io
jest.mock('socket.io-client', () => {
    const mockSocket = {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        connected: false,
        listeners: jest.fn((event: string) => [])
    };

    return {
        io: jest.fn(() => mockSocket),
        Socket: jest.fn()
    };
});

describe('socketService - Memory Leak Prevention', () => {
    let mockSocket: any;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Get mock socket instance
        const { io } = require('socket.io-client');
        mockSocket = io();

        // Mock localStorage
        Storage.prototype.getItem = jest.fn(() => 'mock-token');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('onLocationUpdated', () => {
        test('should register event listener', () => {
            const callback = jest.fn();
            onLocationUpdated(callback);

            expect(mockSocket.on).toHaveBeenCalledWith('location:updated', callback);
        });

        test('should return cleanup function', () => {
            const callback = jest.fn();
            const cleanup = onLocationUpdated(callback);

            expect(typeof cleanup).toBe('function');
        });

        test('should remove event listener on cleanup', () => {
            const callback = jest.fn();
            const cleanup = onLocationUpdated(callback);

            // Call cleanup
            cleanup();

            expect(mockSocket.off).toHaveBeenCalledWith('location:updated', callback);
        });

        test('should not leak listeners after multiple subscribe/unsubscribe', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            const callback3 = jest.fn();

            // Subscribe multiple times
            const cleanup1 = onLocationUpdated(callback1);
            const cleanup2 = onLocationUpdated(callback2);
            const cleanup3 = onLocationUpdated(callback3);

            // Unsubscribe all
            cleanup1();
            cleanup2();
            cleanup3();

            // Verify all were removed
            expect(mockSocket.off).toHaveBeenCalledTimes(3);
            expect(mockSocket.off).toHaveBeenCalledWith('location:updated', callback1);
            expect(mockSocket.off).toHaveBeenCalledWith('location:updated', callback2);
            expect(mockSocket.off).toHaveBeenCalledWith('location:updated', callback3);
        });

        test('should handle cleanup being called multiple times', () => {
            const callback = jest.fn();
            const cleanup = onLocationUpdated(callback);

            // Call cleanup multiple times
            cleanup();
            cleanup();
            cleanup();

            // Should not throw error
            expect(mockSocket.off).toHaveBeenCalledTimes(3);
        });
    });

    describe('onDriverStatusUpdated', () => {
        test('should register event listener', () => {
            const callback = jest.fn();
            onDriverStatusUpdated(callback);

            expect(mockSocket.on).toHaveBeenCalledWith('driver:status:updated', callback);
        });

        test('should return cleanup function', () => {
            const callback = jest.fn();
            const cleanup = onDriverStatusUpdated(callback);

            expect(typeof cleanup).toBe('function');
        });

        test('should remove event listener on cleanup', () => {
            const callback = jest.fn();
            const cleanup = onDriverStatusUpdated(callback);

            cleanup();

            expect(mockSocket.off).toHaveBeenCalledWith('driver:status:updated', callback);
        });

        test('should not leak listeners after multiple subscribe/unsubscribe', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            const cleanup1 = onDriverStatusUpdated(callback1);
            const cleanup2 = onDriverStatusUpdated(callback2);

            cleanup1();
            cleanup2();

            expect(mockSocket.off).toHaveBeenCalledTimes(2);
        });
    });

    describe('Mixed event listeners', () => {
        test('should handle multiple different event types', () => {
            const locationCallback = jest.fn();
            const statusCallback = jest.fn();

            const locationCleanup = onLocationUpdated(locationCallback);
            const statusCleanup = onDriverStatusUpdated(statusCallback);

            // Verify both registered
            expect(mockSocket.on).toHaveBeenCalledWith('location:updated', locationCallback);
            expect(mockSocket.on).toHaveBeenCalledWith('driver:status:updated', statusCallback);

            // Cleanup
            locationCleanup();
            statusCleanup();

            // Verify both removed
            expect(mockSocket.off).toHaveBeenCalledWith('location:updated', locationCallback);
            expect(mockSocket.off).toHaveBeenCalledWith('driver:status:updated', statusCallback);
        });

        test('should cleanup independently', () => {
            const locationCallback = jest.fn();
            const statusCallback = jest.fn();

            const locationCleanup = onLocationUpdated(locationCallback);
            const statusCleanup = onDriverStatusUpdated(statusCallback);

            // Cleanup only location
            locationCleanup();

            expect(mockSocket.off).toHaveBeenCalledWith('location:updated', locationCallback);
            expect(mockSocket.off).not.toHaveBeenCalledWith('driver:status:updated', statusCallback);

            // Cleanup status
            statusCleanup();

            expect(mockSocket.off).toHaveBeenCalledWith('driver:status:updated', statusCallback);
        });
    });

    describe('Memory Leak Simulation', () => {
        test('should not accumulate listeners after many mount/unmount cycles', () => {
            const callbacks: Array<() => void> = [];

            // Simulate 100 component mount/unmount cycles
            for (let i = 0; i < 100; i++) {
                const callback = jest.fn();
                const cleanup = onLocationUpdated(callback);
                callbacks.push(cleanup);
            }

            // Cleanup all
            callbacks.forEach(cleanup => cleanup());

            // Verify all were cleaned up
            expect(mockSocket.off).toHaveBeenCalledTimes(100);
        });

        test('should handle rapid subscribe/unsubscribe', async () => {
            const cleanups: Array<() => void> = [];

            // Rapid subscribe
            for (let i = 0; i < 50; i++) {
                const callback = jest.fn();
                const cleanup = onLocationUpdated(callback);
                cleanups.push(cleanup);
            }

            // Rapid unsubscribe
            cleanups.forEach(cleanup => cleanup());

            expect(mockSocket.on).toHaveBeenCalledTimes(50);
            expect(mockSocket.off).toHaveBeenCalledTimes(50);
        });
    });
});
