import React from 'react';
import { mockDrivers } from '../../data/mockData';
import DriverStatusBadge from '../ui/DriverStatusBadge';
import { defaultProfileImage } from '../../assets/defaultProfile';

const LiveDriverStatusPanel: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
            <h2 className="text-xl font-bold text-gray-800 p-4 border-b">สถานะคนขับ</h2>
            <div className="p-4 space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto">
                {mockDrivers.map(driver => (
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
