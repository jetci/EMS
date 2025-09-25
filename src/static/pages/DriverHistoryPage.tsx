import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { Ride, RideStatus } from '../types';
import RideList from '../components/RideList';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/dashboard/StatCard';
import HistoryIcon from '../components/icons/HistoryIcon';
import CalendarCheckIcon from '../components/icons/CalendarCheckIcon';
import ThaiDatePicker from '../components/ui/ThaiDatePicker';
import XCircleIcon from '../components/icons/XCircleIcon';


const mockRides: Ride[] = [
    // This month
    { id: 'RIDE-301', patientName: 'สมชาย ใจดี', pickupLocation: '123 สุขุมวิท', destination: 'รพ. กรุงเทพ', appointmentTime: dayjs().subtract(2, 'day').toISOString(), status: RideStatus.COMPLETED },
    { id: 'RIDE-302', patientName: 'สมหญิง มีสุข', pickupLocation: '456 พหลโยธิน', destination: 'รพ. บำรุงราษฎร์', appointmentTime: dayjs().subtract(5, 'day').toISOString(), status: RideStatus.COMPLETED },
    { id: 'RIDE-303', patientName: 'อาทิตย์ แจ่มใส', pickupLocation: '789 พระราม 4', destination: 'รพ. สมิติเวช', appointmentTime: dayjs().subtract(3, 'day').toISOString(), status: RideStatus.CANCELLED },
    // Last month
    { id: 'RIDE-201', patientName: 'จันทรา งามวงศ์วาน', pickupLocation: '101 รัชดา', destination: 'รพ. รามาธิบดี', appointmentTime: dayjs().subtract(1, 'month').toISOString(), status: RideStatus.COMPLETED },
    { id: 'RIDE-202', patientName: 'มานี รักเรียน', pickupLocation: '222 เพชรบุรี', destination: 'รพ. พญาไท', appointmentTime: dayjs().subtract(1, 'month').subtract(2, 'day').toISOString(), status: RideStatus.COMPLETED },
    { id: 'RIDE-203', patientName: 'ปิติ ชูใจ', pickupLocation: '333 จรัญสนิทวงศ์', destination: 'รพ. ศิริราช', appointmentTime: dayjs().subtract(1, 'month').subtract(5, 'day').toISOString(), status: RideStatus.CANCELLED },
    // 2 months ago
    { id: 'RIDE-101', patientName: 'วีระ กล้าหาญ', pickupLocation: '555 ลาดพร้าว', destination: 'รพ. ลาดพร้าว', appointmentTime: dayjs().subtract(2, 'month').toISOString(), status: RideStatus.COMPLETED },
];


const DriverHistoryPage: React.FC = () => {
    const [rides, setRides] = useState<Ride[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        status: 'All'
    });

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const historyRides = mockRides.filter(r => r.status === RideStatus.COMPLETED || r.status === RideStatus.CANCELLED);
            setRides(historyRides);
            setIsLoading(false);
        }, 500);
    }, []);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFilters(f => ({ ...f, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({ startDate: '', endDate: '', status: 'All' });
    };

    const filteredRides = useMemo(() => {
        return rides.filter(r => {
            const matchesStatus = filters.status === 'All' || r.status === filters.status;
            
            let matchesDate = true;
            if (filters.startDate && filters.endDate) {
                const rideDate = dayjs(r.appointmentTime);
                matchesDate = rideDate.isSameOrAfter(dayjs(filters.startDate), 'day') && rideDate.isSameOrBefore(dayjs(filters.endDate), 'day');
            } else if (filters.startDate) {
                matchesDate = dayjs(r.appointmentTime).isSameOrAfter(dayjs(filters.startDate), 'day');
            } else if (filters.endDate) {
                 matchesDate = dayjs(r.appointmentTime).isSameOrBefore(dayjs(filters.endDate), 'day');
            }

            return matchesStatus && matchesDate;
        });
    }, [rides, filters]);

    const stats = useMemo(() => {
        const thisWeek = rides.filter(r => dayjs(r.appointmentTime).isSame(dayjs(), 'week')).length;
        const thisMonth = rides.filter(r => dayjs(r.appointmentTime).isSame(dayjs(), 'month')).length;
        return { thisWeek, thisMonth };
    }, [rides]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">ประวัติการเดินทาง</h1>
            
            {/* Summary Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="เที่ยววิ่งทั้งหมด (สัปดาห์นี้)" value={stats.thisWeek.toString()} icon={HistoryIcon} variant="info" />
                <StatCard title="เที่ยววิ่งทั้งหมด (เดือนนี้)" value={stats.thisMonth.toString()} icon={CalendarCheckIcon} variant="success" />
            </div>

            {/* Toolbar */}
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-1">
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">จากวันที่</label>
                        <ThaiDatePicker name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    </div>
                    <div className="lg:col-span-1">
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">ถึงวันที่</label>
                        <ThaiDatePicker name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                    </div>
                    <div className="lg:col-span-1">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full">
                            <option value="All">ทั้งหมด</option>
                            <option value={RideStatus.COMPLETED}>เสร็จสิ้น</option>
                            <option value={RideStatus.CANCELLED}>ยกเลิก</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 text-sm text-gray-700 hover:text-red-700 font-medium py-2 px-4 rounded-lg bg-gray-100 hover:bg-red-50 transition-colors">
                            <XCircleIcon className="w-5 h-5"/>
                            <span>ล้างตัวกรอง</span>
                        </button>
                    </div>
                 </div>
            </div>

            <RideList rides={filteredRides} onUpdateStatus={() => {}} isActionable={false} />
        </div>
    );
};

export default DriverHistoryPage;