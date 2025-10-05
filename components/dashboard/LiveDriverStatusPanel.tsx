import React, { useState, useEffect } from 'react';
import { driversAPI } from '../../src/services/api';
import { Driver } from '../../types';
import DriverStatusBadge from '../ui/DriverStatusBadge';
import { defaultProfileImage } from '../../assets/defaultProfile';

const LiveDriverStatusPanel: React.FC = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                <h2 className="text-xl font-bold text-gray-800 p-4 border-b">สถานะคนขับ</h2>
                <div className="p-4 flex items-center justify-center">
                    <div className="text-gray-500">กำลังโหลด...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
            <h2 className="text-xl font-bold text-gray-800 p-4 border-b">สถานะคนขับ</h2>
            <div className="p-4 space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto">
                {drivers.map(driver => (
                    <div key={driver.id} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                        <div className="flex items-center gap-3">
                             <img src={driver.profileImageUrl || defaultProfileImage} alt={driver.fullName} className="w-10 h-10 rounded-full object-cover" />
                             <div>
                                 <p className="font-semibold text-gray-800 text-sm">{driver.fullName}</p>
                                 <p className="text-xs text-gray-500 font-mono">{driver.id}</p>
                             </div>
                        </div>
                        <DriverStatusBadge status={driver.status} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveDriverStatusPanel;
