import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Ride, RideStatus } from '../types';
import RideList from '../components/RideList';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/dashboard/StatCard';
import HistoryIcon from '../components/icons/HistoryIcon';
import CalendarCheckIcon from '../components/icons/CalendarCheckIcon';
import ModernDatePicker from '../components/ui/ModernDatePicker';
import XCircleIcon from '../components/icons/XCircleIcon';
import { driversAPI } from '../services/api';

// Extend dayjs with plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const DriverHistoryPage: React.FC = () => {
    const [rides, setRides] = useState<Ride[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        status: 'All'
    });

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await driversAPI.getMyHistory();
                // Map backend data to frontend Ride format
                const mapped: Ride[] = (data || []).map((r: any) => ({
                    id: r.id,
                    patientId: r.patient_id || '',
                    patientName: r.patient_name || 'Unknown',
                    patientPhone: r.patient_phone || r.contact_phone || '',
                    pickupLocation: r.pickup_location || r.pickupLocation || '',
                    destination: r.destination || r.dropoffLocation || '',
                    appointmentTime: r.appointment_time || r.appointmentTime || new Date().toISOString(),
                    status: (r.status as RideStatus) || RideStatus.COMPLETED,
                }));
                setRides(mapped);
            } catch (e: any) {
                console.error('Failed to load driver history:', e);
                setError(e.message || 'ไม่สามารถโหลดประวัติได้');
                setRides([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
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


    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">ประวัติการเดินทาง</h1>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    ⚠️ {error}
                </div>
            )}

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
                        <ModernDatePicker name="startDate" value={filters.startDate} onChange={handleFilterChange} max={today} placeholder="เลือกวันเริ่มต้น" />
                    </div>
                    <div className="lg:col-span-1">
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">ถึงวันที่</label>
                        <ModernDatePicker name="endDate" value={filters.endDate} onChange={handleFilterChange} max={today} placeholder="เลือกวันสิ้นสุด" />
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
                            <XCircleIcon className="w-5 h-5" />
                            <span>ล้างตัวกรอง</span>
                        </button>
                    </div>
                </div>
            </div>

            {rides.length === 0 && !error ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">ยังไม่มีประวัติการเดินทาง</p>
                </div>
            ) : (
                <RideList rides={filteredRides} onUpdateStatus={() => { }} isActionable={false} />
            )}
        </div>
    );
};

export default DriverHistoryPage;
