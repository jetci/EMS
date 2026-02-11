import React, { useState, useMemo, useEffect } from 'react';
import { Ride, RideStatus, Driver } from '../types';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import SearchIcon from '../components/icons/SearchIcon';
import StatusBadge from '../components/ui/StatusBadge';
import EyeIcon from '../components/icons/EyeIcon';
import TrashIcon from '../components/icons/TrashIcon';
import EditIcon from '../components/icons/EditIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import UserCheckIcon from '../components/icons/UserCheckIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import AssignDriverModal from '../components/modals/AssignDriverModal';
import Toast from '../components/Toast';
import { formatDateTimeToThai } from '../utils/dateUtils';
import ModernDatePicker from '../components/ui/ModernDatePicker';
import { driversAPI, ridesAPI } from '../services/api';
import { dashboardService } from '../services/dashboardService';
import UserSwitchIcon from '../components/icons/UserSwitchIcon';
import WheelchairIcon from '../components/icons/WheelchairIcon';

const ITEMS_PER_PAGE = 10;
const tripTypes = ['All', 'นัดหมอตามปกติ', 'รับยา', 'กายภาพบำบัด', 'ฉุกเฉิน', 'อื่นๆ'];

interface OfficeManageRidesPageProps {
    setActiveView?: (view: any) => void;
}

const OfficeManageRidesPage: React.FC<OfficeManageRidesPageProps> = ({ setActiveView }) => {
    const [rides, setRides] = useState<Ride[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [filters, setFilters] = useState({
        status: 'All',
        driver: 'All',
        village: 'All',
        tripType: 'All',
        startDate: '',
        endDate: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        loadRides();
    }, []);

    const loadRides = async () => {
        try {
            setLoading(true);
            setError(null);
            const [ridesData, driversData] = await Promise.all([
                ridesAPI.getRides(),
                driversAPI.getDrivers()
            ]);
            // ✅ Backward compatible: support both old (array) and new (object) formats
            const rawRides = ridesData?.data || ridesData || [];
            const normalizedRides = (Array.isArray(rawRides) ? rawRides : []).map((r: any) => ({
                ...r,
                village: r?.village || r?.currentVillage || r?.current_village || undefined,
                landmark: r?.landmark || undefined,
            }));
            setRides(normalizedRides as any);

            const rawDrivers = Array.isArray(driversData) ? driversData : (driversData?.drivers || []);
            const normalizedDrivers = (Array.isArray(rawDrivers) ? rawDrivers : []).map((d: any) => ({
                ...d,
                fullName: (d?.fullName || d?.full_name || d?.name || '').trim(),
            }));
            setDrivers(normalizedDrivers as any);
        } catch (err: any) {
            console.error('Failed to load data:', err);
            setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    const uniqueVillages = useMemo(() => {
        const villages = new Set(rides.map(r => r.village).filter((v): v is string => !!v));
        return ['All', ...Array.from(villages)];
    }, [rides]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFilters(f => ({ ...f, [name]: value }));
    };

    const filteredRides = useMemo(() => {
        return rides.filter(r => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = (r.patientName || '').toLowerCase().includes(searchLower) || (r.id || '').toLowerCase().includes(searchLower);
            const matchesStatus = filters.status === 'All' || r.status === filters.status;
            const matchesDriver = filters.driver === 'All' || (r.driverName || '') === filters.driver;
            const matchesVillage = filters.village === 'All' || (r.village || '') === filters.village;
            const matchesTripType = filters.tripType === 'All' || (r.tripType || '') === filters.tripType;

            let matchesDate = true;
            if (filters.startDate && filters.endDate) {
                const rideDate = new Date(r.appointmentTime);
                const start = new Date(filters.startDate);
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);
                matchesDate = rideDate >= start && rideDate <= end;
            }

            return matchesSearch && matchesStatus && matchesDriver && matchesVillage && matchesTripType && matchesDate;
        });
    }, [rides, searchTerm, filters]);

    const totalPages = Math.ceil(filteredRides.length / ITEMS_PER_PAGE);
    const paginatedRides = filteredRides.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleOpenAssignModal = (ride: Ride) => {
        setSelectedRide(ride);
        setIsModalOpen(true);
    };

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    };

    const handleAssignDriver = async (rideId: string, driverId: string) => {
        try {
            await dashboardService.assignDriver(rideId, driverId);
            const driver = drivers.find(d => d.id === driverId);
            showToast(`✅ มอบหมายงาน ${rideId} ให้กับ ${driver?.fullName || 'คนขับ'} สำเร็จแล้ว`);
            await loadRides();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Failed to assign driver:', error);
            showToast(`❌ ไม่สามารถมอบหมายงานได้: ${error.message}`);
        }
    };

    const handleCancelRide = async (rideId: string) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกการเดินทางนี้?')) return;
        try {
            await ridesAPI.cancelRide(rideId);
            showToast('✅ ยกเลิกการเดินทางสำเร็จ');
            await loadRides();
        } catch (error: any) {
            console.error('Failed to cancel ride:', error);
            showToast(`❌ ไม่สามารถยกเลิกได้: ${error.message}`);
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilters({ status: 'All', driver: 'All', village: 'All', tripType: 'All', startDate: '', endDate: '' });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">จัดการการเดินทางทั้งหมด</h1>
                <button
                    onClick={() => setActiveView && setActiveView('request_ride')}
                    className="flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-[var(--wecare-green)] rounded-lg shadow-sm hover:bg-green-600 transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    <span>ร้องขอการเดินทางใหม่</span>
                </button>
            </div>

            {/* Advanced Filtering Toolbar */}
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <div className="xl:col-span-2">
                        <label className="text-xs font-medium text-gray-600">ค้นหา</label>
                        <input type="text" placeholder="ชื่อผู้ป่วย หรือ Ride ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600">สถานะ</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange}>
                            <option value="All">สถานะทั้งหมด</option>
                            <option value={RideStatus.PENDING}>รอดำเนินการ</option>
                            <option value={RideStatus.ASSIGNED}>อนุมัติแล้ว</option>
                            <option value={RideStatus.IN_PROGRESS}>กำลังเดินทาง</option>
                            <option value={RideStatus.COMPLETED}>เสร็จสิ้น</option>
                            <option value={RideStatus.CANCELLED}>ยกเลิก</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600">คนขับ</label>
                        <select name="driver" value={filters.driver} onChange={handleFilterChange}>
                            <option value="All">คนขับทั้งหมด</option>
                            {drivers.filter(d => d.fullName).map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600">หมู่บ้าน</label>
                        <select name="village" value={filters.village} onChange={handleFilterChange}>
                            {uniqueVillages.map(v => (<option key={v} value={v}>{v === 'All' ? 'ทุกหมู่บ้าน' : v}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-600">ประเภท</label>
                        <select name="tripType" value={filters.tripType} onChange={handleFilterChange}>
                            {tripTypes.map(t => (<option key={t} value={t}>{t === 'All' ? 'ทุกประเภท' : t}</option>))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <div className="xl:col-span-2 grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="text-xs font-medium text-gray-600">จากวันที่</label>
                            <ModernDatePicker name="startDate" value={filters.startDate} onChange={handleFilterChange} placeholder="วันเริ่มต้น" />
                        </div>
                        <div className="col-span-1">
                            <label className="text-xs font-medium text-gray-600">ถึงวันที่</label>
                            <ModernDatePicker name="endDate" value={filters.endDate} onChange={handleFilterChange} placeholder="วันสิ้นสุด" />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 text-sm text-gray-700 font-medium py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                            <XCircleIcon className="w-5 h-5" />
                            <span>ล้างตัวกรอง</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50/75">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Ride ID</th>
                                <th className="px-4 py-3 font-semibold">ชื่อผู้ป่วย</th>
                                <th className="px-4 py-3 font-semibold">ประเภท/ความต้องการ</th>
                                <th className="px-4 py-3 font-semibold">คนขับ</th>
                                <th className="px-4 py-3 font-semibold">เวลานัดหมาย</th>
                                <th className="px-4 py-3 font-semibold">สถานะ</th>
                                <th className="px-4 py-3 font-semibold text-center">ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedRides.map(ride => {
                                const canEdit = ride.status === RideStatus.PENDING || ride.status === RideStatus.ASSIGNED;
                                const canCancel = ride.status === RideStatus.PENDING || ride.status === RideStatus.ASSIGNED;
                                return (
                                    <tr key={ride.id} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{ride.id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{ride.patientName}
                                            <div className="text-xs text-gray-500 font-normal">{ride.village}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span>{ride.tripType}</span>
                                                {Array.isArray(ride.specialNeeds) && ride.specialNeeds.some(n => String(n).toLowerCase().includes('วีลแชร์') || String(n).toLowerCase().includes('wheelchair') || String(n).toLowerCase().includes('ล้อเข็น')) && (
                                                    <span title="ต้องการวีลแชร์">
                                                        <WheelchairIcon className="w-5 h-5 text-blue-600" />
                                                    </span>
                                                )}
                                            </div>
                                            {ride.tripType === 'อื่นๆ' && ride.notes && (
                                                <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                                                    {ride.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">{ride.driverName || 'N/A'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{formatDateTimeToThai(ride.appointmentTime)}</td>
                                        <td className="px-4 py-3"><StatusBadge status={ride.status} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button onClick={() => handleOpenAssignModal(ride)} className="p-2 rounded-full text-gray-400 hover:text-blue-600" title="ดูรายละเอียด"><EyeIcon className="w-5 h-5" /></button>
                                                {ride.status === RideStatus.PENDING && (
                                                    <button onClick={() => handleOpenAssignModal(ride)} className="p-2 rounded-full text-gray-400 hover:text-blue-600" title="จ่ายงาน"><UserCheckIcon className="w-5 h-5" /></button>
                                                )}
                                                {(ride.status === RideStatus.ASSIGNED || ride.status === RideStatus.IN_PROGRESS) && (
                                                    <button onClick={() => handleOpenAssignModal(ride)} className="p-2 rounded-full text-gray-400 hover:text-yellow-600" title="เปลี่ยนคนขับ"><UserSwitchIcon className="w-5 h-5" /></button>
                                                )}
                                                {canEdit && (
                                                    <button onClick={() => showToast('Feature: Edit Ride is coming soon. Please use Assign Driver for updates.')} className="p-2 rounded-full text-gray-400 hover:text-gray-800" title="แก้ไข"><EditIcon className="w-5 h-5" /></button>
                                                )}
                                                {canCancel && (
                                                    <button onClick={() => handleCancelRide(ride.id)} className="p-2 rounded-full text-gray-400 hover:text-red-600" title="ยกเลิก"><TrashIcon className="w-5 h-5" /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-700">ผลลัพธ์ {paginatedRides.length} จาก {filteredRides.length} รายการ</span>
                <div className="inline-flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(p => p > 1 ? p - 1 : p)} disabled={currentPage === 1} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="text-sm font-semibold">หน้า {currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p < totalPages ? p + 1 : p)} disabled={currentPage === totalPages} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
            </div>

            {selectedRide && <AssignDriverModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} ride={selectedRide} onAssign={handleAssignDriver} allDrivers={drivers} allRides={rides} />}
            <Toast message={toastMessage} />
        </div>
    );
};

export default OfficeManageRidesPage;
