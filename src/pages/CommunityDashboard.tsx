import React, { useState, useEffect } from 'react';
import StatCard from '../components/dashboard/StatCard';
import UsersIcon from '../components/icons/UsersIcon';
import ClockWaitingIcon from '../components/icons/ClockWaitingIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import StatusBadge from '../components/ui/StatusBadge';
import { RideStatus, Ride, CommunityView } from '../types';
import UserPlusIcon from '../components/icons/UserPlusIcon';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import { formatDateToThai } from '../utils/dateUtils';
import RidesIcon from '../components/icons/RidesIcon';
import { patientsAPI, ridesAPI } from '../services/api';

interface CommunityDashboardProps {
    setActiveView: (view: CommunityView, context?: any) => void;
}

const CommunityDashboard: React.FC<CommunityDashboardProps> = ({ setActiveView }) => {
    const [patientsCount, setPatientsCount] = useState(0);
    const [pendingRidesCount, setPendingRidesCount] = useState(0);
    const [completedRidesCount, setCompletedRidesCount] = useState(0);
    const [recentRides, setRecentRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('ผู้ใช้');

    useEffect(() => {
        // Get user name from localStorage
        try {
            const userData = localStorage.getItem('wecare_user');
            if (userData) {
                const user = JSON.parse(userData);
                setUserName(user.name || user.fullName || 'ผู้ใช้');
            }
        } catch { }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ✅ Fetch patients count (backward compatible with pagination)
                const patientsResponse = await patientsAPI.getPatients();
                const patientsData = patientsResponse?.data || patientsResponse || [];
                setPatientsCount(Array.isArray(patientsData) ? patientsData.length : 0);

                // ✅ Fetch rides (backward compatible with pagination)
                const ridesResponse = await ridesAPI.getRides();
                const ridesData = ridesResponse?.data || ridesResponse || [];
                const rides = Array.isArray(ridesData) ? ridesData : [];

                // Count pending rides
                const pending = rides.filter((r: any) => r.status === RideStatus.PENDING).length;
                setPendingRidesCount(pending);

                // Count completed rides this month
                const now = new Date();
                const thisMonth = rides.filter((r: any) => {
                    const rideDate = new Date(r.appointment_time || r.appointmentTime);
                    return r.status === RideStatus.COMPLETED &&
                        rideDate.getMonth() === now.getMonth() &&
                        rideDate.getFullYear() === now.getFullYear();
                }).length;
                setCompletedRidesCount(thisMonth);

                // Get recent 5 rides
                const mapped: Ride[] = rides.slice(0, 5).map((r: any) => ({
                    id: r.id,
                    patientId: r.patient_id || r.patientId || '',
                    patientName: r.patient_name || r.patientName || '',
                    destination: r.destination || '',
                    appointmentTime: r.appointment_time || r.appointmentTime || new Date().toISOString(),
                    status: (r.status as RideStatus) || RideStatus.PENDING,
                    pickupLocation: r.pickup_location || r.pickupLocation || '',
                }));
                setRecentRides(mapped);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-[var(--text-primary)]">สวัสดี, {userName}!</h1>
                <p className="mt-2 text-lg text-[var(--text-secondary)]">ภาพรวมและทางลัดสำหรับจัดการผู้ป่วยและการเดินทางของคุณ</p>
            </div>

            {/* Quick Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="ผู้ป่วยในดูแล" value={loading ? '...' : String(patientsCount)} icon={UsersIcon} variant="info" />
                <StatCard
                    title="คำขอที่รอดำเนินการ"
                    value={loading ? '...' : String(pendingRidesCount)}
                    icon={ClockWaitingIcon}
                    variant="warning"
                    onClick={() => setActiveView('rides', { filter: RideStatus.PENDING })}
                />
                <StatCard title="เดินทางสำเร็จ (เดือนนี้)" value={loading ? '...' : String(completedRidesCount)} icon={CheckCircleIcon} variant="success" />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">ทางลัด</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => setActiveView('register_patient')}
                        className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-[var(--border-color)] flex items-center gap-5 text-left hover:border-blue-300"
                    >
                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[var(--wecare-blue-light)] flex items-center justify-center">
                            <UserPlusIcon className="w-7 h-7 text-[var(--wecare-blue)]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--wecare-blue)] transition-colors">ลงทะเบียนผู้ป่วยใหม่</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">เพิ่มข้อมูลผู้ป่วยในความดูแลของคุณเข้าระบบ</p>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveView('request_ride')}
                        className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-[var(--border-color)] flex items-center gap-5 text-left hover:border-green-300"
                    >
                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                            <RidesIcon className="w-7 h-7 text-green-700" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-green-700 transition-colors">ร้องขอการเดินทางใหม่</h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">สร้างคำขอเดินทางสำหรับผู้ป่วยที่มีนัดหมาย</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">กิจกรรมล่าสุด</h2>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-[var(--border-color)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-[var(--text-secondary)]">
                            <thead className="text-xs text-[var(--text-primary)] uppercase bg-gray-50/75">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-semibold">ชื่อผู้ป่วย</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">ปลายทาง</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">วันที่นัดหมาย</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {loading ? (
                                    <tr><td colSpan={4} className="px-6 py-4 text-center">กำลังโหลด...</td></tr>
                                ) : recentRides.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-4 text-center">ไม่มีข้อมูล</td></tr>
                                ) : recentRides.map((ride) => (
                                    <tr key={ride.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-[var(--text-primary)] whitespace-nowrap">{ride.patientName}</td>
                                        <td className="px-6 py-4">{ride.destination}</td>
                                        <td className="px-6 py-4">{formatDateToThai(ride.appointmentTime)}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={ride.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityDashboard;
