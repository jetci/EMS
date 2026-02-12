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

const ITEMS_PER_PAGE = 10;

const OfficeManageDriversPage: React.FC = () => {
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

    useEffect(() => {
        loadAllData();
    }, []);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const loadAllData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [driversData, usersData] = await Promise.all([
                driversAPI.getDrivers(),
                apiRequest('/users'),
            ]);
            setDrivers(Array.isArray(driversData) ? driversData : (driversData?.drivers || []));
            setStaff(Array.isArray(usersData) ? usersData : (usersData?.users || []));
        } catch (err: any) {
            console.error('Failed to load data:', err);
            setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    const filteredDrivers = useMemo(() => {
        return drivers.filter(d => {
            const fullName = `${d.firstName || ''} ${d.lastName || ''}`.trim();
            const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [drivers, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredDrivers.length / ITEMS_PER_PAGE);
    const paginatedDrivers = filteredDrivers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleOpenModal = (driver: Driver | null) => {
        setSelectedDriver(driver);
        setIsModalOpen(true);
    };

    const handleSaveDriver = async (updatedDriver: Driver) => {
        try {
            if (selectedDriver) {
                await driversAPI.updateDriver(updatedDriver.id, updatedDriver);
                showToast('✅ อัปเดตข้อมูลคนขับสำเร็จ');
            } else {
                await driversAPI.createDriver(updatedDriver);
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

        const newStatus = driver.status === DriverStatus.UNAVAILABLE ? DriverStatus.OFF_DUTY : DriverStatus.UNAVAILABLE;
        const confirmMsg = newStatus === DriverStatus.UNAVAILABLE
            ? 'คุณต้องการปิดการใช้งานคนขับรายนี้ใช่หรือไม่?'
            : 'คุณต้องการเปิดใช้งานคนขับรายนี้ใช่หรือไม่?';

        if (!window.confirm(confirmMsg)) return;

        try {
            await driversAPI.updateDriver(driverId, { ...driver, status: newStatus });
            showToast(`✅ ${newStatus === DriverStatus.UNAVAILABLE ? 'ปิด' : 'เปิด'}การใช้งานคนขับสำเร็จ`);
            await loadAllData();
        } catch (err: any) {
            console.error('Failed to update status:', err);
            showToast(`❌ เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">จัดการข้อมูลคนขับ</h1>
                <button onClick={() => handleOpenModal(null)} className="flex items-center justify-center px-5 py-2.5 font-semibold text-white bg-[var(--wecare-blue)] rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                    <UserPlusIcon className="w-5 h-5 mr-2" />
                    <span>เพิ่มคนขับใหม่</span>
                </button>
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
                        <option value={DriverStatus.OFF_DUTY}>ออฟไลน์</option>
                        <option value={DriverStatus.UNAVAILABLE}>ไม่ใช้งาน</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center border">
                    <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
                </div>
            ) : error ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-red-200">
                    <div className="text-red-600">เกิดข้อผิดพลาด: {error}</div>
                </div>
            ) : paginatedDrivers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center border">
                    <UserPlusIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">ไม่พบข้อมูลคนขับ</h3>
                    <p className="text-gray-500 mb-4">
                        {searchTerm || statusFilter !== 'All'
                            ? 'ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา'
                            : 'เริ่มต้นโดยการเพิ่มคนขับใหม่'}
                    </p>
                    {!searchTerm && statusFilter === 'All' && (
                        <button
                            onClick={() => handleOpenModal(null)}
                            className="inline-flex items-center px-4 py-2 bg-[var(--wecare-blue)] text-white rounded-lg hover:bg-blue-700"
                        >
                            <UserPlusIcon className="w-5 h-5 mr-2" />
                            เพิ่มคนขับใหม่
                        </button>
                    )}
                </div>
            ) : (
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
                                {paginatedDrivers.map(driver => (
                                    <tr key={driver.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <img src={driver.profileImageUrl || defaultProfileImage} alt={`${driver.firstName} ${driver.lastName}`} className="w-10 h-10 rounded-full object-cover" />
                                                <div>
                                                    {`${driver.firstName} ${driver.lastName}`}
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
                                                <button onClick={() => handleToggleActive(driver.id)} className={`p-2 rounded-full text-gray-400 hover:text-${driver.status === DriverStatus.UNAVAILABLE ? 'green' : 'red'}-600`} title={driver.status === DriverStatus.UNAVAILABLE ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}><PowerIcon className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-700">ผลลัพธ์ {paginatedDrivers.length} จาก {filteredDrivers.length} รายการ</span>
                <div className="inline-flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(p => p > 1 ? p - 1 : p)} disabled={currentPage === 1} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="text-sm font-semibold">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p < totalPages ? p + 1 : p)} disabled={currentPage === totalPages} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
            </div>

            <EditDriverModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} driver={selectedDriver} onSave={handleSaveDriver} availableStaff={staff} availableDrivers={drivers} />
            <Toast message={toastMessage} />
        </div>
    );
};

export default OfficeManageDriversPage;
