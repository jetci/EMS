import React, { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import { Ride, Driver, DriverStatus, RideStatus } from '../../types';
import MapPinIcon from '../icons/MapPinIcon';
import { formatDateTimeToThai } from '../../utils/dateUtils';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (rideId: string, driverId: string) => void;
  ride: Ride;
  allDrivers: Driver[];
  allRides: Ride[];
}

// Haversine formula to calculate distance in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const checkOverlap = (rideA: Ride, rideB: Ride): boolean => {
  const startA = dayjs(rideA.appointmentTime || rideA.appointment_time);
  const endA = startA.add(1, 'hour');
  const startB = dayjs(rideB.appointmentTime || rideB.appointment_time);
  const endB = startB.add(1, 'hour');
  return startA.isBefore(endB) && endA.isAfter(startB);
};

const isDriverOnDuty = (driver: any): boolean => {
  return driver.status !== 'INACTIVE' && driver.status !== 'OFFLINE';
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

    // Patient coordinates (from enriched ride data)
    const pLat = (ride as any).latitude;
    const pLng = (ride as any).longitude;

    return allDrivers.map(driver => {
      const onDuty = isDriverOnDuty(driver);

      // Calculate distance if coordinates are available
      let distance: number | null = null;
      if (pLat && pLng && (driver as any).latitude && (driver as any).longitude) {
        distance = calculateDistance(pLat, pLng, (driver as any).latitude, (driver as any).longitude);
      }

      if (!onDuty) {
        return { driver, isAvailable: false, reason: 'ไม่อยู่ในเวร', distance };
      }

      // Check for conflicting rides
      const conflictingRide = allRides.find(existingRide =>
        (existingRide.driver_id === driver.id || existingRide.driverInfo?.id === driver.id) &&
        existingRide.id !== ride.id &&
        !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(existingRide.status) &&
        checkOverlap(ride, existingRide)
      );

      if (conflictingRide) {
        return { driver, isAvailable: false, reason: `มีงานซ้อน (${dayjs(conflictingRide.appointmentTime || conflictingRide.appointment_time).format('HH:mm')})`, distance };
      }

      return { driver, isAvailable: true, reason: '', distance };
    }).sort((a, b) => {
      // 1. Available drivers first
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;

      // 2. Nearest drivers first (if distance available)
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;

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
    <Modal isOpen={isOpen} onClose={onClose} title={`จ่ายงานสำหรับการเดินทาง ID: ${ride.id}`}>
      <div className="space-y-6">
        {/* Ride Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">ข้อมูลสรุป</h3>
          <div className="bg-gray-50 p-4 rounded-lg border space-y-2 text-sm">
            <p><span className="font-semibold text-gray-600">ผู้ป่วย:</span> {ride.patientName || (ride as any).patient_name}</p>
            <p><span className="font-semibold text-gray-600">เวลานัดหมาย:</span> {formatDateTimeToThai(ride.appointmentTime || (ride as any).appointment_time)}</p>
            <div className="flex items-start"><MapPinIcon className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" /><span className="font-semibold text-gray-600">รับ:</span>&nbsp;{ride.pickupLocation || (ride as any).pickup_location}</div>
            <div className="flex items-start"><MapPinIcon className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" /><span className="font-semibold text-gray-600">ส่ง:</span>&nbsp;{ride.destination}</div>
          </div>
        </div>

        {/* Driver List */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-700">เลือกคนขับที่พร้อมให้บริการ</h3>
            <span className="text-xs text-gray-500 italic">* เรียงตามระยะทางที่ใกล้ที่สุด</span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 border-t border-b py-2">
            {driverAvailability.map(({ driver, isAvailable, reason, distance }) => (
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
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600 font-bold text-xs">
                    {driver.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className={`font-semibold ${isAvailable ? 'text-gray-800' : 'text-gray-500'}`}>{driver.fullName}</div>
                    {distance !== null && (
                      <div className="text-[10px] text-gray-500">ห่างจากจุดรับ: {distance.toFixed(2)} กม.</div>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-medium ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {isAvailable ? 'ว่าง' : reason}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end items-center gap-3">
          <Button onClick={onClose} variant="outline" size="sm">ยกเลิก</Button>
          <Button onClick={handleConfirm} disabled={!selectedDriverId} size="sm">ยืนยันการจ่ายงาน</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignDriverModal;
