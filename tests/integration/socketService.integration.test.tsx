/**
 * Socket Service - Integration Tests
 * 
 * Tests to verify that Socket.io cleanup works correctly
 * when used in React components
 */

import React, { useEffect, useState } from 'react';
import { render, unmount as unmountComponent, waitFor } from '@testing-library/react';
import { onLocationUpdated, onDriverStatusUpdated } from '../../src/services/socketService';

// Mock Socket.io
jest.mock('socket.io-client', () => {
    const mockSocket = {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        connected: false
    };

    return {
        io: jest.fn(() => mockSocket),
        Socket: jest.fn()
    };
});

// Test Component that uses Socket.io
const TestLocationComponent = () => {
    const [location, setLocation] = useState<any>(null);

    useEffect(() => {
        const cleanup = onLocationUpdated((data) => {
            setLocation(data);
        });

        // Cleanup on unmount
        return cleanup;
    }, []);

    return (
        <div data-testid="location-component">
            {location ? JSON.stringify(location) : 'No location'}
        </div>
    );
};

const TestStatusComponent = () => {
    const [status, setStatus] = useState<string>('');

    useEffect(() => {
        const cleanup = onDriverStatusUpdated((data) => {
            setStatus(data.status);
        });

        return cleanup;
    }, []);

    return (
        <div data-testid="status-component">
            Status: {status || 'Unknown'}
        </div>
    );
};

const TestMultipleListenersComponent = () => {
    const [location, setLocation] = useState<any>(null);
    const [status, setStatus] = useState<string>('');

    useEffect(() => {
        const locationCleanup = onLocationUpdated((data) => {
            setLocation(data);
        });

        const statusCleanup = onDriverStatusUpdated((data) => {
            setStatus(data.status);
        });

        // Cleanup both
        return () => {
            locationCleanup();
            statusCleanup();
        };
    }, []);

    return (
        <div data-testid="multi-component">
            <div>Location: {location ? JSON.stringify(location) : 'None'}</div>
            <div>Status: {status || 'None'}</div>
        </div>
    );
};

describe('Socket Service - Integration Tests', () => {
    let mockSocket: any;

    beforeEach(() => {
        jest.clearAllMocks();
        const { io } = require('socket.io-client');
        mockSocket = io();
        Storage.prototype.getItem = jest.fn(() => 'mock-token');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Single Component Lifecycle', () => {
        test('should cleanup socket listeners on component unmount', () => {
            const { unmount } = render(<TestLocationComponent />);

            // Verify listener was registered
            expect(mockSocket.on).toHaveBeenCalledWith(
                'location:updated',
                expect.any(Function)
            );

            // Unmount component
            unmount();

            // Verify cleanup was called
            expect(mockSocket.off).toHaveBeenCalledWith(
                'location:updated',
                expect.any(Function)
            );
        });

        test('should cleanup status listener on unmount', () => {
            const { unmount } = render(<TestStatusComponent />);

            expect(mockSocket.on).toHaveBeenCalledWith(
                'driver:status:updated',
                expect.any(Function)
            );

            unmount();

            expect(mockSocket.off).toHaveBeenCalledWith(
                'driver:status:updated',
                expect.any(Function)
            );
        });
    });

    describe('Multiple Components', () => {
        test('should cleanup all listeners from multiple components', () => {
            const { unmount: unmount1 } = render(<TestLocationComponent />);
            const { unmount: unmount2 } = render(<TestStatusComponent />);

            // Verify both registered
            expect(mockSocket.on).toHaveBeenCalledTimes(2);

            // Unmount both
            unmount1();
            unmount2();

            // Verify both cleaned up
            expect(mockSocket.off).toHaveBeenCalledTimes(2);
        });

        test('should cleanup independently', () => {
            const { unmount: unmount1 } = render(<TestLocationComponent />);
            const { unmount: unmount2 } = render(<TestStatusComponent />);

            // Unmount only first component
            unmount1();

            expect(mockSocket.off).toHaveBeenCalledTimes(1);
            expect(mockSocket.off).toHaveBeenCalledWith(
                'location:updated',
                expect.any(Function)
            );

            // Unmount second component
            unmount2();

            expect(mockSocket.off).toHaveBeenCalledTimes(2);
        });
    });

    describe('Component with Multiple Listeners', () => {
        test('should cleanup all listeners from single component', () => {
            const { unmount } = render(<TestMultipleListenersComponent />);

            // Verify both listeners registered
            expect(mockSocket.on).toHaveBeenCalledTimes(2);
            expect(mockSocket.on).toHaveBeenCalledWith(
                'location:updated',
                expect.any(Function)
            );
            expect(mockSocket.on).toHaveBeenCalledWith(
                'driver:status:updated',
                expect.any(Function)
            );

            // Unmount
            unmount();

            // Verify both cleaned up
            expect(mockSocket.off).toHaveBeenCalledTimes(2);
        });
    });

    describe('Remount Scenarios', () => {
        test('should handle component remounting', () => {
            // Mount
            const { unmount } = render(<TestLocationComponent />);
            expect(mockSocket.on).toHaveBeenCalledTimes(1);

            // Unmount
            unmount();
            expect(mockSocket.off).toHaveBeenCalledTimes(1);

            // Remount
            const { unmount: unmount2 } = render(<TestLocationComponent />);
            expect(mockSocket.on).toHaveBeenCalledTimes(2);

            // Unmount again
            unmount2();
            expect(mockSocket.off).toHaveBeenCalledTimes(2);
        });

        test('should not accumulate listeners after multiple mount/unmount cycles', () => {
            // Simulate 10 mount/unmount cycles
            for (let i = 0; i < 10; i++) {
                const { unmount } = render(<TestLocationComponent />);
                unmount();
            }

            // Verify equal number of on/off calls
            expect(mockSocket.on).toHaveBeenCalledTimes(10);
            expect(mockSocket.off).toHaveBeenCalledTimes(10);
        });
    });

    describe('Error Scenarios', () => {
        test('should handle cleanup even if socket.off throws error', () => {
            mockSocket.off.mockImplementationOnce(() => {
                throw new Error('Socket error');
            });

            const { unmount } = render(<TestLocationComponent />);

            // Should not throw
            expect(() => unmount()).not.toThrow();
        });

        test('should handle double unmount gracefully', () => {
            const { unmount } = render(<TestLocationComponent />);

            // Unmount twice
            unmount();

            // Should not throw
            expect(() => unmount()).not.toThrow();
        });
    });

    describe('Performance Tests', () => {
        test('should handle rapid mount/unmount without memory leak', () => {
            const components: Array<() => void> = [];

            // Rapidly mount 50 components
            for (let i = 0; i < 50; i++) {
                const { unmount } = render(<TestLocationComponent />);
                components.push(unmount);
            }

            // Rapidly unmount all
            components.forEach(unmount => unmount());

            // Verify all cleaned up
            expect(mockSocket.on).toHaveBeenCalledTimes(50);
            expect(mockSocket.off).toHaveBeenCalledTimes(50);
        });
    });
});
