import React from 'react';
import { DriverStatus } from '../../types';

interface DriverStatusBadgeProps {
  status: DriverStatus;
}

const statusStyles: { [key in DriverStatus]: { text: string; classes: string } } = {
  [DriverStatus.AVAILABLE]: { text: '✅ ว่าง', classes: 'bg-green-100 text-green-800' },
  [DriverStatus.ON_DUTY]: { text: '👷 กำลังปฏิบัติหน้าที่', classes: 'bg-blue-100 text-blue-800' },
  [DriverStatus.OFF_DUTY]: { text: '⚫ ปิดรับงาน', classes: 'bg-gray-200 text-gray-700' },
  [DriverStatus.UNAVAILABLE]: { text: '🌙 ไม่พร้อมปฏิบัติงาน', classes: 'bg-red-100 text-red-800' },
};

const DriverStatusBadge: React.FC<DriverStatusBadgeProps> = ({ status }) => {
  const style = statusStyles[status] || { text: 'ไม่ทราบสถานะ', classes: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${style.classes}`}>
      {style.text}
    </span>
  );
};

export default DriverStatusBadge;
