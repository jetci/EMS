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
import { driversAPI, apiRequest } from '../src/services/api';

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

    useEffect(() => {
        loadAllData();
    }, []);

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
            const matchesSearch = (d.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
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
            } else {
                await driversAPI.createDriver(updatedDriver);
            }
            await loadAllData();
            setIsModalOpen(false);
        } catch (err: any) {
            console.error('Failed to save driver:', err);
            alert('ไม่สามารถบันทึกข้อมูลคนขับได้');
        }
    };
    
    const handleToggleActive = (driverId: string) => {
        setDrivers(prev => prev.map(d => {
            if (d.id === driverId) {
                return {...d, status: d.status === DriverStatus.INACTIVE ? DriverStatus.OFFLINE : DriverStatus.INACTIVE};
            }
            return d;
        }));
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
                                            <button className="p-2 rounded-full text-gray-400 hover:text-gray-800" title="ดูประวัติการเดินทาง"><HistoryIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleToggleActive(driver.id)} className={`p-2 rounded-full text-gray-400 hover:text-${driver.status === DriverStatus.INACTIVE ? 'green' : 'red'}-600`} title={driver.status === DriverStatus.INACTIVE ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}><PowerIcon className="w-5 h-5" /></button>
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
                    <button onClick={() => setCurrentPage(p => p > 1 ? p - 1 : p)} disabled={currentPage === 1} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronLeftIcon className="w-5 h-5"/></button>
                    <span className="text-sm font-semibold">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p < totalPages ? p + 1 : p)} disabled={currentPage === totalPages} className="p-2 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronRightIcon className="w-5 h-5"/></button>
                </div>
            </div>

            <EditDriverModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} driver={selectedDriver} onSave={handleSaveDriver} availableStaff={staff} availableDrivers={drivers} />
        </div>
    );
};

export default OfficeManageDriversPage;