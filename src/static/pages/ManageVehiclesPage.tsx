import React, { useState, useMemo } from 'react';
import { Vehicle, VehicleStatus } from '../types';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import SearchIcon from '../components/icons/SearchIcon';
import FilterIcon from '../components/icons/FilterIcon';
import EditIcon from '../components/icons/EditIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';
import EditVehicleModal from '../components/modals/EditVehicleModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Toast from '../components/Toast';
import { mockVehicles, mockTeamsData, mockVehicleTypes } from '../data/mockData';
import { formatDateToThai } from '../utils/dateUtils';

const ITEMS_PER_PAGE = 10;

const CurrentStatusBadge: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
    switch (vehicle.status) {
        case VehicleStatus.AVAILABLE:
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    ว่าง
                </span>
            );
        case VehicleStatus.ASSIGNED:
            const teamName = vehicle.assignedTeamId ? mockTeamsData[vehicle.assignedTeamId as keyof typeof mockTeamsData] : 'N/A';
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                     <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    กำลังใช้งาน - {teamName}
                </span>
            );
        case VehicleStatus.MAINTENANCE:
             return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                     <span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
                    ซ่อมบำรุง
                </span>
            );
        default:
            return <span className="text-gray-500">N/A</span>;
    }
};


const ManageVehiclesPage: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'All' | Vehicle['type']>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(v => {
            const matchesSearch = v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) || v.model.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'All' || v.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [vehicles, searchTerm, typeFilter]);

    const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
    const paginatedVehicles = filteredVehicles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleOpenCreateModal = () => {
        setSelectedVehicle(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
    };

    const handleSaveVehicle = (vehicleData: Vehicle) => {
        if (selectedVehicle) {
            setVehicles(prev => prev.map(v => v.id === vehicleData.id ? vehicleData : v));
            showToast(`✅ แก้ไขข้อมูลรถทะเบียน "${vehicleData.licensePlate}" สำเร็จ`);
        } else {
            const newVehicle = { ...vehicleData, id: `VEH-${Date.now()}` };
            setVehicles(prev => [newVehicle, ...prev]);
            showToast(`🎉 เพิ่มรถทะเบียน "${newVehicle.licensePlate}" ใหม่สำเร็จ`);
        }
        setIsModalOpen(false);
    };

    const handleOpenDeleteConfirm = (vehicle: Vehicle) => {
        setVehicleToDelete(vehicle);
        setIsConfirmOpen(true);
    };
    
    const handleDeleteVehicle = () => {
        if (vehicleToDelete) {
            setVehicles(prev => prev.filter(v => v.id !== vehicleToDelete.id));
            showToast(`🗑️ ลบรถทะเบียน "${vehicleToDelete.licensePlate}" เรียบร้อยแล้ว`);
        }
        setIsConfirmOpen(false);
        setVehicleToDelete(null);
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">จัดการยานพาหนะ</h1>
                <button 
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-[#005A9C] rounded-lg shadow-sm hover:bg-blue-800 transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    <span>เพิ่มยานพาหนะใหม่</span>
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-3 md:space-y-0">
                <div className="relative w-full md:w-auto">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon className="w-5 h-5 text-gray-400" /></span>
                    <input type="text" placeholder="ค้นหาทะเบียนรถ..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005A9C]" />
                </div>
                <div className="relative w-full md:w-auto">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><FilterIcon className="w-5 h-5 text-gray-400" /></span>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="w-full md:w-56 pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#005A9C] bg-white">
                        <option value="All">รถทุกประเภท</option>
                        {mockVehicleTypes.map(vt => (
                            <option key={vt.id} value={vt.name}>{vt.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">ทะเบียนรถ</th>
                                <th className="px-4 py-3">ประเภทรถ</th>
                                <th className="px-4 py-3">ยี่ห้อ/รุ่น</th>
                                <th className="px-4 py-3">สถานะปัจจุบัน</th>
                                <th className="px-4 py-3">วันตรวจสภาพครั้งต่อไป</th>
                                <th className="px-4 py-3 text-center">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedVehicles.map(vehicle => (
                                <tr key={vehicle.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{vehicle.licensePlate}</td>
                                    <td className="px-4 py-3">{vehicle.type}</td>
                                    <td className="px-4 py-3">{vehicle.brand} {vehicle.model}</td>
                                    <td className="px-4 py-3"><CurrentStatusBadge vehicle={vehicle} /></td>
                                    <td className="px-4 py-3">{vehicle.nextMaintenanceDate ? formatDateToThai(vehicle.nextMaintenanceDate) : 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button onClick={() => handleOpenEditModal(vehicle)} className="text-gray-500 hover:text-blue-600" title="แก้ไข"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleOpenDeleteConfirm(vehicle)} className="text-gray-500 hover:text-red-600" title="ลบ"><TrashIcon className="w-5 h-5" /></button>
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
                <span className="text-sm text-gray-700">Showing {paginatedVehicles.length} of {filteredVehicles.length} results</span>
                <div className="inline-flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(p => p > 1 ? p - 1 : p)} disabled={currentPage === 1} className="px-3 py-1 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronLeftIcon className="w-4 h-4"/></button>
                    <span className="text-sm">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => p < totalPages ? p + 1 : p)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm bg-white border rounded-md disabled:opacity-50"><ChevronRightIcon className="w-4 h-4"/></button>
                </div>
            </div>

            <EditVehicleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveVehicle}
                vehicle={selectedVehicle}
            />

            <ConfirmationModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDeleteVehicle}
                title={`ยืนยันการลบรถทะเบียน "${vehicleToDelete?.licensePlate}"`}
                message="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลยานพาหนะนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
            />
            
            <Toast message={toastMessage} />
        </div>
    );
};

export default ManageVehiclesPage;