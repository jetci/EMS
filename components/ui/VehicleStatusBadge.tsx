import React from 'react';
import { VehicleStatus } from '../../types';

interface VehicleStatusBadgeProps {
  status: VehicleStatus;
}

const statusStyles: { [key in VehicleStatus]: { text: string; classes: string } } = {
  [VehicleStatus.AVAILABLE]: { text: 'พร้อมใช้งาน', classes: 'bg-green-100 text-green-800' },
  [VehicleStatus.MAINTENANCE]: { text: 'ซ่อมบำรุง', classes: 'bg-yellow-100 text-yellow-800' },
  [VehicleStatus.ASSIGNED]: { text: 'ผูกกับทีมแล้ว', classes: 'bg-blue-100 text-blue-800' },
};

const VehicleStatusBadge: React.FC<VehicleStatusBadgeProps> = ({ status }) => {
  const style = statusStyles[status] || { text: 'ไม่ทราบสถานะ', classes: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full inline-flex items-center gap-1.5 ${style.classes}`}>
       <span className={`h-1.5 w-1.5 rounded-full ${style.classes.replace(/text-\w+-\d+/,'').replace('bg','bg-opacity-50 bg')}`} style={{backgroundColor: 'currentColor'}}></span>
      {style.text}
    </span>
  );
};

export default VehicleStatusBadge;
