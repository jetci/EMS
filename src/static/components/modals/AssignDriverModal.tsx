import React, { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import { Ride, Driver, DriverStatus, RideStatus } from '../../types';
import MapPinIcon from '../icons/MapPinIcon';
import XIcon from '../icons/XIcon';
import { formatDateTimeToThai } from '../../utils/dateUtils';
import UserIcon from '../icons/UserIcon';

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (rideId: string, driverId: string) => void;
  ride: Ride;
  allDrivers: Driver[];
  allRides: Ride[];
}

// Helper function to check for time overlap (assuming 1 hour per ride)
const checkOverlap = (rideA: Ride, rideB: Ride): boolean => {
    const startA = dayjs(rideA.appointmentTime);
    const endA = startA.add(1, 'hour');
    const startB = dayjs(rideB.appointmentTime);
    const endB = startB.add(1, 'hour');
    return startA.isBefore(endB) && endA.isAfter(startB);
};

// Mock Driver Schedule (for "On Duty" check)
const isDriverOnDuty = (driver: Driver): boolean => {
    // In a real app, this would check a full schedule table.
    // Here, we use their current status as a proxy for being on duty.
    return driver.status !== DriverStatus.INACTIVE && driver.status !== DriverStatus.OFFLINE;
}

const AssignDriverModal: React.FC<AssignDriverModalProps> = ({ isOpen, onClose, onAssign, ride, allDrivers, allRides }) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        setSelectedDriverId(null);
    }
  }, [isOpen]);

  const driverAvailability = useMemo(() => {
    if (!ride) return [];
    
    return allDrivers.map(driver => {
        const onDuty = isDriverOnDuty(driver);
        if (!onDuty) {
            return { driver, isAvailable: false, reason: 'ไม่อยู่ในเวร' };
        }
        
        // Check for conflicting rides
        const conflictingRide = allRides.find(existingRide => 
            existingRide.driverInfo?.id === driver.id &&
            existingRide.id !== ride.id &&
            existingRide.status !== RideStatus.COMPLETED &&
            existingRide.status !== RideStatus.CANCELLED &&
            checkOverlap(ride, existingRide)
        );

        if (conflictingRide) {
            return { driver, isAvailable: false, reason: `มีงานซ้อน (${dayjs(conflictingRide.appointmentTime).format('HH:mm')})` };
        }
        
        return { driver, isAvailable: true, reason: '' };
    }).sort((a, b) => {
        // Sort available drivers to the top
        if (a.isAvailable && !b.isAvailable) return -1;
        if (!a.isAvailable && b.isAvailable) return 1;
        return a.driver.fullName.localeCompare(b.driver.fullName);
    });
  }, [allDrivers, allRides, ride]);

  if (!isOpen || !ride) return null;

  const handleConfirm = () => {
    if (selectedDriverId) {
        onAssign(ride.id, selectedDriverId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="assign-driver-modal-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="assign-driver-modal-title" className="text-xl font-bold text-gray-800">จ่ายงานสำหรับการเดินทาง ID: <span className="font-mono">{ride.id}</span></h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            {/* Ride Info */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">ข้อมูลสรุป</h3>
                <div className="bg-gray-50 p-4 rounded-lg border space-y-2 text-sm">
                    <p><span className="font-semibold text-gray-600">ผู้ป่วย:</span> {ride.patientName}</p>
                    <p><span className="font-semibold text-gray-600">เวลานัดหมาย:</span> {formatDateTimeToThai(ride.appointmentTime)}</p>
                    <div className="flex items-start"><MapPinIcon className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0"/><span className="font-semibold text-gray-600">รับ:</span>&nbsp;{ride.pickupLocation}</div>
                    <div className="flex items-start"><MapPinIcon className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0"/><span className="font-semibold text-gray-600">ส่ง:</span>&nbsp;{ride.destination}</div>
                </div>
            </div>
          
            {/* Driver List */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">เลือกคนขับที่พร้อมให้บริการ</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 border-t border-b py-2">
                    {driverAvailability.map(({ driver, isAvailable, reason }) => (
                        <label 
                            key={driver.id} 
                            htmlFor={driver.id} 
                            className={`flex items-center p-3 border rounded-lg transition-all ${!isAvailable ? 'bg-gray-100 text-gray-400' : 'cursor-pointer'} ${selectedDriverId === driver.id ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' : isAvailable ? 'border-gray-300 hover:bg-gray-50' : 'border-gray-200'}`}
                        >
                            <input
                                type="radio"
                                id={driver.id}
                                name="driverSelection"
                                value={driver.id}
                                checked={selectedDriverId === driver.id}
                                onChange={(e) => setSelectedDriverId(e.target.value)}
                                disabled={!isAvailable}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:bg-gray-200"
                            />
                            <div className="ml-3 flex-grow flex items-center">
                                <img src={driver.profileImageUrl} alt={driver.fullName} className="w-8 h-8 rounded-full mr-3" />
                                <span className={`font-semibold ${isAvailable ? 'text-gray-800' : 'text-gray-500'}`}>{driver.fullName}</span>
                            </div>
                            <span className={`text-xs font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                {isAvailable ? 'ว่าง' : reason}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100">
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDriverId}
            className="px-4 py-2 text-sm font-medium text-white bg-[#005A9C] rounded-md hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ยืนยันการจ่ายงาน
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignDriverModal;