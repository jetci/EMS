import React, { useEffect, useRef } from 'react';
import { sendLocationUpdate } from '../../services/socketService';

interface DriverLocationTrackerProps {
    driverId: string | null;
    status?: string;
}

/**
 * Background component to simulate real-time location tracking for drivers.
 * In a real mobile app, this would use Capacitor/Cordova Geolocation background plugin.
 */
const DriverLocationTracker: React.FC<DriverLocationTrackerProps> = ({ driverId, status }) => {
    const lastUpdateRef = useRef<number>(0);

    useEffect(() => {
        if (!driverId) return;

        const updateLocation = async () => {
            // Only update every 30 seconds to save battery/bandwidth
            const now = Date.now();
            if (now - lastUpdateRef.current < 30000) return;

            try {
                // Simulate movement around Chiang Rai/Fang area if no real GPS
                // In production, navigator.geolocation.getCurrentPosition would be used
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const { latitude, longitude } = position.coords;
                        await sendLocationUpdate({
                            driverId,
                            lat: latitude,
                            lng: longitude,
                            status
                        });
                        lastUpdateRef.current = Date.now();
                    }, async (error) => {
                        // Fallback to simulated movement if GPS denied
                        const baseLat = 19.9213;
                        const baseLng = 99.2131;
                        const offset = (Math.random() - 0.5) * 0.01;
                        await sendLocationUpdate({
                            driverId,
                            lat: baseLat + offset,
                            lng: baseLng + offset,
                            status
                        });
                        lastUpdateRef.current = Date.now();
                    });
                }
            } catch (err) {
                console.error('Failed to update driver location:', err);
            }
        };

        // Initial update
        updateLocation();

        // Interval update (5 seconds for real-time tracking)
        const interval = setInterval(updateLocation, 5000);
        return () => clearInterval(interval);
    }, [driverId, status]);

    return null; // Invisible component
};

export default DriverLocationTracker;
