import React from 'react';
import { Ride } from '../../types';
import XIcon from '../icons/XIcon';
import UserIcon from '../icons/UserIcon';
import MapPinIcon from '../icons/MapPinIcon';
import ClockIcon from '../icons/ClockIcon';
import PhoneIcon from '../icons/PhoneIcon';
import PlusCircleIcon from '../icons/PlusCircleIcon';
import { formatDateTimeToThai } from '../../utils/dateUtils';
import StatusBadge from '../ui/StatusBadge';
import SteeringWheelIcon from '../icons/SteeringWheelIcon';
import RideTimeline from '../rides/RideTimeline';

interface RideDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride | null;
}

const RideDetailsModal: React.FC<RideDetailsModalProps> = ({ isOpen, onClose, ride }) => {
  if (!isOpen || !ride) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="ride-details-modal-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="ride-details-modal-title" className="text-xl font-bold text-gray-800">
            รายละเอียดการเดินทาง: <span className="font-mono">{ride.id || 'N/A'}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status */}
          <div className="text-center">
            <StatusBadge status={ride.status} />
          </div>

          {/* Ride Info */}
          <div className="space-y-3">
            <div className="flex items-start">
              <UserIcon className="w-5 h-5 mr-3 mt-1 text-[#005A9C] flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">ผู้ป่วย</p>
                <p className="font-semibold text-gray-800">{ride.patientName}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPinIcon className="w-5 h-5 mr-3 mt-1 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">ปลายทาง</p>
                <p className="font-semibold text-gray-800">{ride.destination}</p>
              </div>
            </div>
            <div className="flex items-start">
              <ClockIcon className="w-5 h-5 mr-3 mt-1 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">เวลานัดหมาย</p>
                <p className="font-semibold text-gray-800">{formatDateTimeToThai(ride.appointmentTime)}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-start">
              <PhoneIcon className="w-5 h-5 mr-3 mt-1 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">เบอร์ติดต่อระหว่างเดินทาง</p>
                <p className="font-semibold text-gray-800">{ride.contactPhone || 'ไม่มี'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <PlusCircleIcon className="w-5 h-5 mr-3 mt-1 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">ความต้องการพิเศษ</p>
                <p className="font-semibold text-gray-800">
                  {Array.isArray(ride.specialNeeds)
                    ? (ride.specialNeeds.length > 0 ? ride.specialNeeds.join(', ') : 'ไม่มี')
                    : (ride.specialNeeds || 'ไม่มี')}
                </p>
              </div>
            </div>
          </div>

          {/* Driver Info */}
          {(ride.status === 'ASSIGNED' || ride.status === 'IN_PROGRESS' || ride.status === 'COMPLETED') && ride.driverInfo && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center"><SteeringWheelIcon className="w-5 h-5 mr-2 text-[#005A9C]" />ข้อมูลคนขับ</h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2 text-sm">
                <p><span className="font-semibold text-gray-600">ชื่อ:</span> {ride.driverInfo.fullName}</p>
                <p><span className="font-semibold text-gray-600">เบอร์โทร:</span> {ride.driverInfo.phone}</p>
                <p><span className="font-semibold text-gray-600">รถ:</span> {ride.driverInfo.vehicleModel} ({ride.driverInfo.licensePlate})</p>
              </div>
            </div>
          )}

          {/* Event Timeline */}
          <div className="border-t pt-4">
            <RideTimeline rideId={ride.id} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-4 bg-gray-50 border-t">
          <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideDetailsModal;
