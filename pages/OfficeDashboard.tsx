import React, { useState, useEffect } from 'react';
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
import LiveDriverStatusPanel from '../components/dashboard/LiveDriverStatusPanel';
import WheelchairIcon from '../components/icons/WheelchairIcon';
import { dashboardService } from '../src/services/dashboardService';

interface OfficeDashboardProps {
    setActiveView: (view: OfficeView, context?: any) => void;
}

const OfficeDashboard: React.FC<OfficeDashboardProps> = ({ setActiveView }) => {
    const currentDate = formatFullDateToThai(new Date());
    const [urgentRides, setUrgentRides] = useState<Ride[]>([]);
    const [todaysSchedule, setTodaysSchedule] = useState<Ride[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [urgentData, scheduleData, driversData, statsData] = await Promise.all([
                dashboardService.getUrgentRides(),
                dashboardService.getTodaysSchedule(),
                dashboardService.getAvailableDrivers(),
                dashboardService.getOfficeDashboard(),
            ]);
            setUrgentRides(urgentData.rides || []);
            setTodaysSchedule(scheduleData.rides || []);
            setDrivers(driversData.drivers || []);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            showToast('⚠️ ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

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

    const handleAssignDriver = async (rideId: string, driverId: string) => {
        try {
            await dashboardService.assignDriver(rideId, driverId);
            await loadDashboardData();
            const driver = drivers.find(d => d.id === driverId);
            showToast(`✅ มอบหมายงาน ${rideId} ให้กับ ${driver?.fullName || 'คนขับ'} สำเร็จแล้ว`);
            setIsAssignModalOpen(false);
        } catch (error) {
            console.error('Failed to assign driver:', error);
            showToast('⚠️ ไม่สามารถมอบหมายงานได้ กรุณาลองใหม่อีกครั้ง');
        }
    };
    
    const allRidesForModal = [...urgentRides, ...todaysSchedule];
    
    const totalTodayRides = stats?.total_today_rides || todaysSchedule.length;
    const availableDrivers = stats?.available_drivers || drivers.filter(d => d.status === 'AVAILABLE').length;
    const totalDrivers = stats?.total_drivers || drivers.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
            </div>
        );
    }

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

            {selectedRide && <AssignDriverModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} ride={selectedRide} onAssign={handleAssignDriver} allDrivers={drivers} allRides={allRidesForModal} />}
            <RideDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} ride={selectedRide} />
            <Toast message={toastMessage} />
        </div>
    );
};

export default OfficeDashboard;