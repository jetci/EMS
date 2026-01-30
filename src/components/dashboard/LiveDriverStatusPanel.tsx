import React, { useState, useEffect } from 'react';
import { driversAPI } from '../../services/api';
import { onDriverStatusUpdated, onLocationUpdated } from '../../services/socketService';
import { Driver } from '../../types';
import DriverStatusBadge from '../ui/DriverStatusBadge';
import { defaultProfileImage } from '../../assets/defaultProfile';

const LiveDriverStatusPanel: React.FC = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial fetch
    useEffect(() => {
        const loadDrivers = async () => {
            try {
                const data = await driversAPI.getDrivers();
                setDrivers(Array.isArray(data) ? data : (data?.drivers || []));
            } catch (err) {
                console.error('Failed to load drivers:', err);
            } finally {
                setLoading(false);
            }
        };
        loadDrivers();
    }, []);

    // Real-time updates subscription
    useEffect(() => {
        // Listen for status updates
        const cleanupStatus = onDriverStatusUpdated((data: any) => {
            console.log('⚡ Driver status updated:', data);
            setDrivers(prevDrivers =>
                prevDrivers.map(d =>
                    d.id === data.driverId ? { ...d, status: data.status } : d
                )
            );
        });

        // Listen for location updates (optional: update timestamp or status if included)
        const cleanupLocation = onLocationUpdated((data: any) => {
            if (data.status) {
                setDrivers(prevDrivers =>
                    prevDrivers.map(d =>
                        d.id === data.driverId ? { ...d, status: data.status } : d
                    )
                );
            }
        });

        return () => {
            cleanupStatus();
            cleanupLocation();
        };
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                <h2 className="text-xl font-bold text-gray-800 p-4 border-b">สถานะคนขับ (Live)</h2>
                <div className="p-4 flex items-center justify-center">
                    <div className="text-gray-500">กำลังโหลด...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                <h2 className="text-xl font-bold text-[var(--wecare-blue)] flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    สถานะคนขับ
                </h2>
                <span className="text-xs text-gray-500">Real-time</span>
            </div>

            <div className="p-4 space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto flex-1">
                {drivers.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">ไม่พบข้อมูลคนขับ</div>
                ) : (
                    drivers.map(driver => (
                        <div key={driver.id} className="flex justify-between items-center pb-3 border-b last:border-b-0 hover:bg-gray-50 p-2 rounded-md transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img src={driver.profileImageUrl || defaultProfileImage} alt={driver.fullName} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${driver.status === 'AVAILABLE' ? 'bg-green-500' : driver.status === 'BUSY' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{driver.fullName}</p>
                                    <p className="text-xs text-gray-500 font-mono flex items-center gap-1">
                                        ID: {driver.id}
                                    </p>
                                </div>
                            </div>
                            <DriverStatusBadge status={driver.status} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LiveDriverStatusPanel;
