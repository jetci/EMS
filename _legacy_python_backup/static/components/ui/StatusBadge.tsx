import React from 'react';
import { RideStatus } from '../../types';

interface StatusBadgeProps {
  status: RideStatus;
}

// FIX: Add missing ride statuses `EN_ROUTE_TO_PICKUP` and `ARRIVED_AT_PICKUP` to fully conform to the `RideStatus` type.
const statusStyles: { [key in RideStatus]: { text: string; classes: string } } = {
  [RideStatus.PENDING]: { text: 'รอดำเนินการ', classes: 'bg-yellow-100 text-yellow-800' },
  [RideStatus.ASSIGNED]: { text: 'ได้รับมอบหมาย', classes: 'bg-blue-100 text-blue-800' },
  [RideStatus.EN_ROUTE_TO_PICKUP]: { text: 'กำลังไปรับ', classes: 'bg-orange-100 text-orange-800' },
  [RideStatus.ARRIVED_AT_PICKUP]: { text: 'ถึงจุดรับแล้ว', classes: 'bg-purple-100 text-purple-800' },
  [RideStatus.IN_PROGRESS]: { text: 'กำลังเดินทาง', classes: 'bg-green-100 text-green-800' },
  [RideStatus.COMPLETED]: { text: 'เสร็จสิ้น', classes: 'bg-gray-200 text-gray-800' },
  [RideStatus.CANCELLED]: { text: 'ยกเลิก', classes: 'bg-red-100 text-red-800' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const style = statusStyles[status] || { text: 'ไม่ทราบสถานะ', classes: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${style.classes}`}>
      {style.text}
    </span>
  );
};

export default StatusBadge;