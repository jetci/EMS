import React from 'react';
import { Ride, RideStatus } from '../types';
import RideCard from './RideCard';
import EmptyStateIcon from './icons/EmptyStateIcon';

interface RideListProps {
  rides: Ride[];
  onUpdateStatus: (rideId: string, newStatus: RideStatus) => void;
  isActionable?: boolean;
}

const RideList: React.FC<RideListProps> = ({ rides, onUpdateStatus, isActionable = true }) => {
  if (rides.length === 0) {
    return (
      <div className="text-center py-10 px-4 flex-grow flex flex-col justify-center items-center">
        <EmptyStateIcon className="w-40 h-40 text-gray-300" />
        <h3 className="text-xl font-bold text-[#005A9C] mt-4">ไม่มีงานในรายการ</h3>
        <p className="text-gray-500 mt-2">ไม่มีงานที่ตรงกับวันที่เลือก</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-3">
      {rides.map(ride => (
        <RideCard
          key={ride.id}
          ride={ride}
          onUpdateStatus={onUpdateStatus}
          isActionable={isActionable}
        />
      ))}
    </div>
  );
};

export default RideList;
