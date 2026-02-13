import React, { useState, useMemo, useEffect } from 'react';
import { Driver, DriverStatus } from '../types';
import UserPlusIcon from '../components/icons/UserPlusIcon';
import SearchIcon from '../components/icons/SearchIcon';
import FilterIcon from '../components/icons/FilterIcon';
import EditIcon from '../components/icons/EditIcon';
import HistoryIcon from '../components/icons/HistoryIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import EditDriverModal from '../components/modals/EditDriverModal';
import DriverStatusBadge from '../components/ui/DriverStatusBadge';
import PowerIcon from '../components/icons/PowerIcon';
import { defaultProfileImage } from '../assets/defaultProfile';
import { driversAPI, apiRequest } from '../services/api';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';

const ITEMS_PER_PAGE = 10;

const OfficeManageDriversPage: React.FC = () => {
    const { user } = useAuth();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<DriverStatus | 'All'>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const normalizedRole = String(user?.role || '').trim().toUpperCase();
    const canCreateDriver = normalizedRole === 'ADMIN' || normalizedRole === 'DEVELOPER' || normalizedRole === 'OFFICER';

    useEffect(() => {
        loadAllData();
    }, [normalizedRole]);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const normalizeDriver = (d: any): Driver => {
        return {
            id: String(d?.id || ''),
            fullName: String(d?.fullName || d?.full_name || d?.name || '').trim(),
            phone: String(d?.phone || ''),
            licensePlate: String(d?.licensePlate || d?.license_plate || ''),
            status: (d?.status as any) || DriverStatus.OFFLINE,
            profileImageUrl: String(d?.profileImageUrl || d?.profile_image_url || ''),
            email: String(d?.email || ''),
            address: String(d?.address || ''),
            vehicleBrand: String(d?.vehicleBrand || d?.brand || ''),
            vehicleModel: String(d?.vehicleModel || d?.model || ''),
            vehicleColor: String(d?.vehicleColor || d?.color || ''),
            tripsThisMonth: Number(d?.tripsThisMonth ?? d?.trips_this_month ?? 0),
            vehicleType: String(d?.vehicleType || ''),
            totalTrips: Number(d?.totalTrips ?? d?.total_trips ?? 0),
            avgReviewScore: Number(d?.avgReviewScore ?? 0),
        };
    };

    const loadAllData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [driversData, usersData] = await Promise.all([
                driversAPI.getDrivers(),
                canCreateDriver ? apiRequest('/users/driver-candidates') : Promise.resolve([]),
            ]);
            const rawDrivers = Array.isArray(driversData) ? driversData : (driversData?.drivers || []);
            setDrivers((Array.isArray(rawDrivers) ? rawDrivers : []).map(normalizeDriver));

            const rawUsers = Array.isArray(usersData) ? usersData : (usersData?.users || []);
            const mappedUsers = (Array.isArray(rawUsers) ? rawUsers : []).map((u: any) => ({
                ...u,
                name: (u?.name || u?.full_name || u?.fullName || '').trim(),
                phone: u?.phone || '',
                profileImageUrl: u?.profile_image_url || u?.profileImageUrl,
            }));
            setStaff(mappedUsers);
        } catch (err: any) {
            console.error('Failed to load data:', err);
            setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    const filteredDrivers = useMemo(() => {
        return drivers.filter(d => {
            const matchesSearch = (d.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [drivers, searchTerm, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / ITEMS_PER_PAGE));
    const paginatedDrivers = filteredDrivers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(p => Math.min(Math.max(1, p), totalPages));
    }, [totalPages]);

    const handleOpenModal = (driver: Driver | null) => {
        setSelectedDriver(driver);
        setIsModalOpen(true);
    };

    const handleSaveDriver = async (updatedDriver: Driver) => {
        try {
            if (selectedDriver) {
                const payload: any = {
                    full_name: updatedDriver.fullName,
                    phone: updatedDriver.phone,
                    status: updatedDriver.status,
                    license_plate: updatedDriver.licensePlate,
                    brand: updatedDriver.vehicleBrand,
                    model: updatedDriver.vehicleModel,
                    color: updatedDriver.vehicleColor,
                };
                await driversAPI.updateDriver(updatedDriver.id, payload);
                showToast('✅ อัปเดตข้อมูลคนขับสำเร็จ');
            } else {
                const payload: any = {
                    user_id: (updatedDriver as any).userId || null,
                    full_name: updatedDriver.fullName,
                    phone: updatedDriver.phone,
                    status: updatedDriver.status,
                    profile_image_url: updatedDriver.profileImageUrl,
                    license_plate: updatedDriver.licensePlate,
                    brand: updatedDriver.vehicleBrand,
                    model: updatedDriver.vehicleModel,
                    color: updatedDriver.vehicleColor,
                };
                await driversAPI.createDriver(payload);
                showToast('✅ เพิ่มคนขับใหม่สำเร็จ');
            }
            await loadAllData();
            setIsModalOpen(false);
        } catch (err: any) {
            console.error('Failed to save driver:', err);
            showToast(`❌ ไม่สามารถบันทึกข้อมูลได้: ${err.message}`);
        }
    };

    const handleToggleActive = async (driverId: string) => {
        const driver = drivers.find(d => d.id === driverId);
        if (!driver) return;

        const newStatus = driver.status === DriverStatus.INACTIVE ? DriverStatus.OFFLINE : DriverStatus.INACTIVE;
        const confirmMsg = newStatus === DriverStatus.INACTIVE
            ? 'คุณต้องการปิดการใช้งานคนขับรายนี้ใช่หรือไม่?'
            : 'คุณต้องการเปิดใช้งานคนขับรายนี้ใช่หรือไม่?';

        if (!window.confirm(confirmMsg)) return;

        try {
            await driversAPI.updateDriver(driverId, { status: newStatus });
            showToast(`✅ ${newStatus === DriverStatus.INACTIVE ? 'ปิด' : 'เปิด'}การใช้งานคนขับสำเร็จ`);
            await loadAllData();
        } catch (err: any) {
            console.error('Failed to update status:', err);
            showToast(`❌ เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    return (
        <div className="space-y-6">
            {loading && (
                <div className="p-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded">กำลังโหลดข้อมูลคนขับ...</div>
            )}
            {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded">เกิดข้อผิดพลาด: {error}</div>
            )}
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">จัดการข้อมูลคนขับ</h1>
                {canCreateDriver && (
                    <button onClick={() => handleOpenModal(null)} className="flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-[var(--wecare-blue)] rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                        <UserPlusIcon className="w-5 h-5 mr-2" />
                        <span>เพิ่มคนขับใหม่</span>
                    </button>
                )}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 p-4 bg-white rounded-lg shadow-sm border">
                <div className="relative w-full md:w-auto">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="w-5 h-5 text-gray-400" /></span>
                    <input type="text" placeholder="ค้นหาคนขับ..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-64 pl-10" />
                </div>
                <div className="relative w-full md:w-auto">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><FilterIcon className="w-5 h-5 text-gray-400" /></span>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as DriverStatus | 'All')} className="w-full md:w-56 pl-10">
                        <option value="All">สถานะทั้งหมด</option>
                        <option value={DriverStatus.AVAILABLE}>พร้อมใช้งาน</option>
                        <option value={DriverStatus.ON_TRIP}>กำลังเดินทาง</option>
                        <option value={DriverStatus.OFFLINE}>ออฟไลน์</option>
                        <option value={DriverStatus.INACTIVE}>ไม่ใช้งาน</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50/75">
                            <tr>
                                <th className="px-6 py-3 font-semibold">คนขับ</th>
                                <th className="px-6 py-3 font-semibold">เบอร์โทรศัพท์</th>
                                <th className="px-6 py-3 font-semibold">ข้อมูลรถ</th>
                                <th className="px-6 py-3 font-semibold">เที่ยววิ่ง (เดือนนี้)</th>
                                <th className="px-6 py-3 font-semibold">สถานะ</th>
                                <th className="px-6 py-3 font-semibold text-center">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {!loading && paginatedDrivers.length === 0 && (
                                <tr>
                                    <td className="px-6 py-6 text-center text-gray-500" colSpan={6}>
                                        ไม่พบคนขับตามเงื่อนไขที่เลือก
                                    </td>
                                </tr>
                            )}
                            {paginatedDrivers.map(driver => (
                                <tr key={driver.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <img src={driver.profileImageUrl || defaultProfileImage} alt={driver.fullName} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                {driver.fullName}
                                                <div className="text-xs text-gray-500 font-mono">{driver.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{driver.phone}</td>
                                    <td className="px-6 py-4">{driver.vehicleBrand} {driver.vehicleModel}<div className="text-xs text-gray-500">{driver.licensePlate}</div></td>
                                    <td className="px-6 py-4 text-center">{driver.tripsThisMonth}</td>
                                    <td className="px-6 py-4"><DriverStatusBadge status={driver.status} /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button onClick={() => handleOpenModal(driver)} className="p-2 rounded-full text-gray-400 hover:text-blue-600" title="ดู/แก้ไข"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => showToast('Feature: Driver History View is coming soon.')} className="p-2 rounded-full text-gray-400 hover:text-gray-800" title="ดูประวัติการเดินทาง"><HistoryIcon className="w-5 h-5" /></button>
                                            <button
                                                onClick={() => handleToggleActive(driver.id)}
                                                className={`p-2 rounded-full text-gray-400 ${driver.status === DriverStatus.INACTIVE ? 'hover:text-green-600' : 'hover:text-red-600'}`}
                                                title={driver.status === DriverStatus.INACTIVE ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                            >
                                                <PowerIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-700">ผลลัพธ์ {paginatedDrivers.length} จาก {filteredDrivers.length} รายการ</span>
                <div className="inline-flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(p => p > 1 ? p - 1 : p)} disabled={currentPage === 1} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="text-sm font-semibold">หน้า {currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p < totalPages ? p + 1 : p)} disabled={currentPage >= totalPages} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
            </div>

            <EditDriverModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} driver={selectedDriver} onSave={handleSaveDriver} availableStaff={staff} availableDrivers={drivers} />
            <Toast message={toastMessage} />
        </div>
    );
};

export default OfficeManageDriversPage;
