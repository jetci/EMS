import React from 'react';
import MapCommandEditor from '../components/admin/MapCommandEditor';
import { OfficerView } from '../types';

interface MapCommandPageProps {
    setActiveView: (view: OfficerView, context?: any) => void;
}

const MapCommandPage: React.FC<MapCommandPageProps> = ({ setActiveView }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">แผนที่สั่งการ</h1>
            </div>
            <p className="text-gray-600">
                ใช้แผนที่นี้สำหรับปักจุดเกิดเหตุ, วาดเส้นทาง, กำหนดพื้นที่อันตราย และติดตามรถ EMS แบบเรียลไทม์
            </p>
            <MapCommandEditor
                title="แผนที่สั่งการ - ศูนย์วิทยุ EMS"
                showDriverTracking={true}
                refreshInterval={10000}
            />
        </div>
    );
};

export default MapCommandPage;

