import React from 'react';
import { Ride, RideStatus } from '../types';
import MapPinIcon from './icons/MapPinIcon';
import ClockIcon from './icons/ClockIcon';
import UserIcon from './icons/UserIcon';
import PhoneIcon from './icons/PhoneIcon';
import WheelchairIcon from './icons/WheelchairIcon';
import InfoIcon from './icons/InfoIcon';
import { formatDateTimeToThai } from '../utils/dateUtils';
import NavigationIcon from './icons/NavigationIcon';

interface RideCardProps {
  ride: Ride;
  onUpdateStatus: (rideId: string, newStatus: RideStatus) => void;
  isActionable?: boolean;
}

const statusStyles: { [key in RideStatus]: { text: string; bg: string; text_color: string } } = {
  [RideStatus.PENDING]: { text: 'รอดำเนินการ', bg: 'bg-yellow-100', text_color: 'text-yellow-800' },
  [RideStatus.ASSIGNED]: { text: 'ได้รับมอบหมาย', bg: 'bg-blue-100', text_color: 'text-blue-800' },
  [RideStatus.EN_ROUTE_TO_PICKUP]: { text: 'กำลังไปรับ', bg: 'bg-orange-100', text_color: 'text-orange-800' },
  [RideStatus.ARRIVED_AT_PICKUP]: { text: 'ถึงจุดรับแล้ว', bg: 'bg-purple-100', text_color: 'text-purple-800' },
  [RideStatus.IN_PROGRESS]: { text: 'กำลังเดินทาง', bg: 'bg-green-100', text_color: 'text-green-800' },
  [RideStatus.COMPLETED]: { text: 'เสร็จสิ้น', bg: 'bg-gray-200', text_color: 'text-gray-800' },
  [RideStatus.CANCELLED]: { text: 'ยกเลิก', bg: 'bg-red-100', text_color: 'text-red-800' },
  [RideStatus.REJECTED]: { text: 'ปฏิเสธงาน', bg: 'bg-red-200', text_color: 'text-red-900' },
};

const getButtonAction = (status: RideStatus) => {
  switch (status) {
    case RideStatus.ASSIGNED:
      return { text: 'เริ่มเดินทาง (ไปรับผู้ป่วย)', nextStatus: RideStatus.EN_ROUTE_TO_PICKUP, className: 'bg-[#28A745] hover:bg-green-700' };
    case RideStatus.EN_ROUTE_TO_PICKUP:
      return { text: 'ถึงจุดรับแล้ว', nextStatus: RideStatus.ARRIVED_AT_PICKUP, className: 'bg-[#FD7E14] hover:bg-orange-600' };
    case RideStatus.ARRIVED_AT_PICKUP:
      return { text: 'รับผู้ป่วยแล้ว (มุ่งหน้าสู่ที่หมาย)', nextStatus: RideStatus.IN_PROGRESS, className: 'bg-[#6F42C1] hover:bg-purple-800' };
    case RideStatus.IN_PROGRESS:
      return { text: 'จบการเดินทาง', nextStatus: RideStatus.COMPLETED, className: 'bg-[#007BFF] hover:bg-blue-700' };
    default:
      return null;
  }
};


const RideCard: React.FC<RideCardProps> = ({ ride, onUpdateStatus, isActionable = true }) => {
  const { id, status, patientName, patientPhone, pickupLocation, destination, appointmentTime, village, specialNeeds, landmark, caregiverPhone } = ride;
  const style = statusStyles[status] || statusStyles[RideStatus.PENDING];
  const buttonAction = getButtonAction(status);

  const hasMoreInfo = landmark || caregiverPhone;

  // Guided Navigation Logic
  const isPickupNavActive = isActionable && (status === RideStatus.ASSIGNED || status === RideStatus.EN_ROUTE_TO_PICKUP);
  const isDestinationNavActive = isActionable && (status === RideStatus.ARRIVED_AT_PICKUP || status === RideStatus.IN_PROGRESS);

  const pickupNavClasses = isPickupNavActive
    ? 'bg-[var(--wecare-blue)] hover:bg-blue-800'
    : 'bg-gray-300 cursor-not-allowed';

  const destinationNavClasses = isDestinationNavActive
    ? 'bg-[var(--wecare-green)] hover:bg-green-700'
    : 'bg-gray-300 cursor-not-allowed';

  const handleNavigate = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const handleActionClick = () => {
    if (buttonAction && isActionable) {
      onUpdateStatus(id, buttonAction.nextStatus);
    }
  };

  const renderSpecialNeedsIcons = (needs?: string[]) => {
    if (!needs || needs.length === 0) return null;
    const needsWheelchair = needs.some(n => n.toLowerCase().includes('วีลแชร์') || n.toLowerCase().includes('wheelchair'));
    return (
      <div className="flex items-center space-x-2">
        {needsWheelchair && <span title="ต้องการวีลแชร์"><WheelchairIcon className="w-5 h-5 text-blue-600" /></span>}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all hover:shadow-xl border border-gray-200">
      <div className={`px-4 py-2 ${style.bg} flex justify-between items-center`}>
        <span className={`text-sm font-semibold ${style.text_color}`}>{style.text}</span>
        <div className="flex items-center gap-3">
          {hasMoreInfo && <span title={`ข้อมูลเพิ่มเติม: ${landmark}, โทร: ${caregiverPhone}`}><InfoIcon className="w-5 h-5 text-gray-500" /></span>}
          <span className="text-sm font-medium text-gray-600">{id}</span>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <UserIcon className="w-6 h-6 text-[#005A9C]" />
            <div>
              <p className="text-gray-500 text-sm">ผู้ป่วย</p>
              <p className="font-bold text-lg text-gray-800">{patientName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {renderSpecialNeedsIcons(specialNeeds)}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <MapPinIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">สถานที่รับ</p>
                <p className="text-gray-700">{pickupLocation}</p>
                {village && <p className="text-xs text-gray-500 mt-1">{village}</p>}
              </div>
            </div>
            <button
              onClick={() => handleNavigate(pickupLocation)}
              disabled={!isPickupNavActive}
              className={`flex items-center gap-2 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${pickupNavClasses}`}
            >
              <NavigationIcon className="w-4 h-4" />
              <span>นำทาง</span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-3">
              <MapPinIcon className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">สถานที่ส่ง</p>
                <p className="text-gray-700">{destination}</p>
              </div>
            </div>
            <button
              onClick={() => handleNavigate(destination)}
              disabled={!isDestinationNavActive}
              className={`flex items-center gap-2 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${destinationNavClasses}`}
            >
              <NavigationIcon className="w-4 h-4" />
              <span>นำทาง</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-gray-500 text-xs">เวลานัดหมาย</p>
              <p className="font-semibold text-[#005A9C]">{formatDateTimeToThai(appointmentTime)}</p>
            </div>
          </div>
        </div>
      </div>

      {buttonAction &&
        <div className="bg-gray-50 p-3 flex gap-2">
          {status === RideStatus.ASSIGNED && (
            <button
              onClick={() => onUpdateStatus(id, RideStatus.REJECTED)}
              disabled={!isActionable}
              className="flex-1 bg-red-100 text-red-700 font-bold py-3 px-4 rounded-lg hover:bg-red-200 transition duration-300 border border-red-200 disabled:opacity-50"
            >
              ปฏิเสธงาน
            </button>
          )}
          <button
            onClick={handleActionClick}
            disabled={!isActionable}
            className={`${status === RideStatus.ASSIGNED ? 'flex-[2]' : 'w-full'} text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-sm ${!isActionable ? 'bg-gray-400 cursor-not-allowed' : buttonAction.className}`}
          >
            {buttonAction.text}
          </button>
        </div>
      }
    </div>
  );
};

export default RideCard;
