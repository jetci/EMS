import React, { useState } from 'react';
import dayjs from 'dayjs';
import StatCard from '../components/dashboard/StatCard';
import UsersIcon from '../components/icons/UsersIcon';
import ClockWaitingIcon from '../components/icons/ClockWaitingIcon';
import RidesIcon from '../components/icons/RidesIcon';
import { RideStatus, Ride, OfficeView } from '../types';
import UserIcon from '../components/icons/UserIcon';
import { formatDateTimeToThai, formatFullDateToThai } from '../utils/dateUtils';
import AssignDriverModal from '../components/modals/AssignDriverModal';
import RideDetailsModal from '../components/modals/RideDetailsModal';
import Toast from '../components/Toast';
import ScheduleTimeline from '../components/dashboard/ScheduleTimeline';
import { mockDrivers } from '../data/mockData';
import LiveDriverStatusPanel from '../components/dashboard/LiveDriverStatusPanel';
import WheelchairIcon from '../components/icons/WheelchairIcon';

const mockUrgentRidesData: Ride[] = [
    { id: 'RIDE-204', patientName: 'จันทรา งามวงศ์วาน', destination: 'โรงพยาบาลรามาธิบดี', appointmentTime: dayjs().add(1, 'day').hour(16).minute(30).toISOString(), status: RideStatus.PENDING, requestedBy: 'นางสาวสมศรี ใจดี', pickupLocation: '101 ถนนรัชดาภิเษก', village: 'หมู่ 4 สวนดอก', tripType: 'รับยา', specialNeeds: ['ต้องการวีลแชร์'] },
    { id: 'RIDE-205', patientName: 'มานี รักเรียน', destination: 'โรงพยาบาลพญาไท', appointmentTime: dayjs().add(1, 'day').hour(17).minute(0).toISOString(), status: RideStatus.PENDING, requestedBy: 'นายปิติ ชูใจ', pickupLocation: '222 ถนนเพชรบุรี', village: 'หมู่ 5 ต้นหนุน', tripType: 'ฉุกเฉิน' },
    { id: 'RIDE-206', patientName: 'ปิติ ชูใจ', destination: 'โรงพยาบาลศิริราช', appointmentTime: dayjs().add(2, 'day').hour(8).minute(0).toISOString(), status: RideStatus.PENDING, requestedBy: 'น.ส.มานี มีนา', pickupLocation: '333 ถนนจรัญสนิทวงศ์', village: 'หมู่ 6 สันทรายคองน้อย', tripType: 'นัดหมอตามปกติ' },
];

const mockTodaysScheduleData: Ride[] = [
    { id: 'RIDE-301', patientName: 'กานดา สุขใจ', destination: 'รพ.ศิริราช', appointmentTime: dayjs().hour(9).minute(0).toISOString(), status: RideStatus.ASSIGNED, driverName: 'สมศักดิ์ ขยันยิ่ง', driverInfo: { id: 'DRV-001', fullName: 'สมศักดิ์ ขยันยิ่ง', phone: '081-234-5678', licensePlate: 'กท 1234', vehicleModel: 'Toyota Vios' }, pickupLocation: '...'},
    { id: 'RIDE-302', patientName: 'วิชัย มีชัย', destination: 'รพ.รามาธิบดี', appointmentTime: dayjs().hour(10).minute(30).toISOString(), status: RideStatus.ASSIGNED, driverName: 'มานะ อดทน', driverInfo: { id: 'DRV-002', fullName: 'มานะ อดทน', phone: '082-345-6789', licensePlate: 'ชล 5678', vehicleModel: 'Honda City' }, pickupLocation: '...'},
    { id: 'RIDE-303', patientName: 'มานี ใจดี', destination: 'รพ.จุฬา', appointmentTime: dayjs().hour(10).minute(45).toISOString(), status: RideStatus.IN_PROGRESS, driverName: 'สมศรี มีวินัย', driverInfo: { id: 'DRV-003', fullName: 'สมศรี มีวินัย', phone: '083-456-7890', licensePlate: 'กท 9012', vehicleModel: 'Isuzu D-Max' }, pickupLocation: '...'},
    { id: 'RIDE-305', patientName: 'อรุณ รุ่งเรือง', destination: 'รพ.กรุงเทพ', appointmentTime: dayjs().hour(16).minute(15).toISOString(), status: RideStatus.ASSIGNED, driverName: 'วิชัย รักบริการ', driverInfo: { id: 'DRV-004', fullName: 'วิชัย รักบริการ', phone: '084-567-8901', licensePlate: 'ชม 3456', vehicleModel: 'Toyota Altis' }, pickupLocation: '...'},
];

interface OfficeDashboardProps {
    setActiveView: (view: OfficeView, context?: any) => void;
}

const OfficeDashboard: React.FC<OfficeDashboardProps> = ({ setActiveView }) => {
    const currentDate = formatFullDateToThai(new Date());
    const [urgentRides, setUrgentRides] = useState<Ride[]>(mockUrgentRidesData);
    const [todaysSchedule, setTodaysSchedule] = useState<Ride[]>(mockTodaysScheduleData);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleOpenAssignModal = (ride: Ride) => {
        setSelectedRide(ride);
        setIsAssignModalOpen(true);
    };

    const handleOpenDetailsModal = (ride: Ride) => {
        setSelectedRide(ride);
        setIsDetailsModalOpen(true);
    };

    const handleAssignDriver = (rideId: string, driverId: string) => {
        const driver = mockDrivers.find(d => d.id === driverId);
        if (!driver) return;

        const assignedRide = urgentRides.find(r => r.id === rideId);
        if (assignedRide) {
            const updatedRideInfo = {
                ...assignedRide,
                driverName: driver.fullName,
                status: RideStatus.ASSIGNED as RideStatus,
                driverInfo: {
                    id: driver.id,
                    fullName: driver.fullName,
                    phone: driver.phone,
                    licensePlate: driver.licensePlate,
                    vehicleModel: `${driver.vehicleBrand} ${driver.vehicleModel}`
                }
            };

            if (dayjs(updatedRideInfo.appointmentTime).isSame(dayjs(), 'day')) {
                setTodaysSchedule(prev => [...prev, updatedRideInfo].sort((a, b) => dayjs(a.appointmentTime).diff(dayjs(b.appointmentTime))));
            }
        }
        
        setUrgentRides(prevRides => prevRides.filter(r => r.id !== rideId));
        showToast(`✅ มอบหมายงาน ${rideId} ให้กับ ${driver.fullName} สำเร็จแล้ว`);
        setIsAssignModalOpen(false);
    };
    
    const allRidesForModal = [...urgentRides, ...todaysSchedule];
    
    const totalTodayRides = todaysSchedule.length;
    const availableDrivers = mockDrivers.filter(d => d.status === 'AVAILABLE').length;
    const totalDrivers = mockDrivers.length;


    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <h1 className="text-4xl font-bold text-gray-800">ศูนย์บัญชาการ (Command Center)</h1>
                <p className="text-md text-gray-500 font-medium">{currentDate}</p>
            </div>
            
            {/* Quick Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="คำขอใหม่ (ยังไม่จ่ายงาน)" value={urgentRides.length.toString()} icon={ClockWaitingIcon} variant="warning" onClick={() => setActiveView('rides')} />
                <StatCard title="การเดินทางวันนี้ทั้งหมด" value={totalTodayRides.toString()} icon={RidesIcon} onClick={() => setActiveView('rides')} />
                <StatCard title="คนขับที่พร้อมใช้งาน" value={`${availableDrivers} / ${totalDrivers}`} icon={UserIcon} variant="info" onClick={() => setActiveView('drivers')} />
                <StatCard title="จำนวนผู้ป่วยทั้งหมด" value="42" icon={UsersIcon} onClick={() => setActiveView('patients')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Operations Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* A. Urgent Action Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 p-4 border-b">รายการที่ต้องจัดการด่วน: คำขอเดินทางใหม่</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50/75">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 font-semibold">ชื่อผู้ป่วย</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">หมู่บ้าน</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">เวลานัดหมาย</th>
                                        <th scope="col" className="px-6 py-3 font-semibold">ประเภท/ความต้องการ</th>
                                        <th scope="col" className="px-6 py-3 font-semibold text-center">การดำเนินการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {urgentRides.map((ride) => (
                                        <tr key={ride.id} className="bg-white border-b hover:bg-gray-50/50 last:border-b-0">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{ride.patientName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{ride.village}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{formatDateTimeToThai(ride.appointmentTime)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span>{ride.tripType}</span>
                                                    {ride.specialNeeds?.includes('ต้องการวีลแชร์') && (
                                                        <span className="flex items-center text-xs text-blue-600" title="ต้องการวีลแชร์">
                                                            <WheelchairIcon className="w-4 h-4" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button onClick={() => handleOpenAssignModal(ride)} className="px-3 py-1.5 text-xs font-semibold text-white bg-[var(--wecare-blue)] rounded-md hover:bg-blue-700 transition-colors">
                                                        จ่ายงาน
                                                    </button>
                                                    <button onClick={() => handleOpenDetailsModal(ride)} className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                                                        ดูรายละเอียด
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {urgentRides.length === 0 && (
                                        <tr><td colSpan={5} className="text-center py-8 text-gray-500">ไม่มีคำขอเดินทางใหม่ในขณะนี้</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* B. Today's Schedule Timeline */}
                    <ScheduleTimeline rides={todaysSchedule} />
                </div>

                {/* C. Live Driver Status Panel */}
                <div className="lg:col-span-1">
                    <LiveDriverStatusPanel />
                </div>
            </div>

            {selectedRide && <AssignDriverModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} ride={selectedRide} onAssign={handleAssignDriver} allDrivers={mockDrivers} allRides={allRidesForModal} />}
            <RideDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} ride={selectedRide} />
            <Toast message={toastMessage} />
        </div>
    );
};

export default OfficeDashboard;