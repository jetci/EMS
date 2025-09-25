import React from 'react';
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


const mockRecentRides: Ride[] = [
    { id: 'RIDE-105', patientName: 'กานดา สุขใจ', destination: 'โรงพยาบาลศิริราช', appointmentTime: '2024-09-20T10:00:00Z', status: RideStatus.PENDING, pickupLocation: '' },
    { id: 'RIDE-104', patientName: 'วิชัย มีชัย', destination: 'โรงพยาบาลรามาธิบดี', appointmentTime: '2024-09-20T13:30:00Z', status: RideStatus.ASSIGNED, pickupLocation: '' },
    { id: 'RIDE-103', patientName: 'มานี ใจดี', destination: 'โรงพยาบาลจุฬาลงกรณ์', appointmentTime: '2024-09-19T09:00:00Z', status: RideStatus.COMPLETED, pickupLocation: '' },
    { id: 'RIDE-102', patientName: 'สมศรี รักสงบ', destination: 'โรงพยาบาลบำรุงราษฎร์', appointmentTime: '2024-09-19T11:00:00Z', status: RideStatus.COMPLETED, pickupLocation: '' },
    { id: 'RIDE-101', patientName: 'อรุณ รุ่งเรือง', destination: 'โรงพยาบาลกรุงเทพ', appointmentTime: '2024-09-18T14:00:00Z', status: RideStatus.CANCELLED, pickupLocation: '' },
];

interface CommunityDashboardProps {
    setActiveView: (view: CommunityView, context?: any) => void;
}

const CommunityDashboard: React.FC<CommunityDashboardProps> = ({ setActiveView }) => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-[var(--text-primary)]">สวัสดี, Community User!</h1>
                <p className="mt-2 text-lg text-[var(--text-secondary)]">ภาพรวมและทางลัดสำหรับจัดการผู้ป่วยและการเดินทางของคุณ</p>
            </div>
            
            {/* Quick Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="ผู้ป่วยในดูแล" value="12" icon={UsersIcon} variant="info" />
                <StatCard 
                    title="คำขอที่รอดำเนินการ" 
                    value="3" 
                    icon={ClockWaitingIcon} 
                    variant="warning"
                    onClick={() => setActiveView('rides', { filter: RideStatus.PENDING })}
                />
                <StatCard title="เดินทางสำเร็จ (เดือนนี้)" value="28" icon={CheckCircleIcon} variant="success" />
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
                            <UserPlusIcon className="w-7 h-7 text-[var(--wecare-blue)]"/>
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
                            <RidesIcon className="w-7 h-7 text-green-700"/>
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
                                {mockRecentRides.map((ride) => (
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