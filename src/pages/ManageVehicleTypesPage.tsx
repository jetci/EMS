import React, { useState, useMemo, useEffect } from 'react';
import { VehicleType } from '../types';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import EditIcon from '../components/icons/EditIcon';
import TrashIcon from '../components/icons/TrashIcon';
import EditVehicleTypeModal from '../components/modals/EditVehicleTypeModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Toast from '../components/Toast';
import { apiRequest } from '../services/api';

const ManageVehicleTypesPage: React.FC = () => {
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<VehicleType | null>(null);
    const [typeToDelete, setTypeToDelete] = useState<VehicleType | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const [vehicleTypesData, vehiclesData] = await Promise.all([
                apiRequest('/vehicle-types'),
                apiRequest('/vehicles'),
            ]);
            setVehicleTypes(Array.isArray(vehicleTypesData) ? vehicleTypesData : (vehicleTypesData?.vehicleTypes || []));
            setVehicles(Array.isArray(vehiclesData) ? vehiclesData : (vehiclesData?.vehicles || []));
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const vehicleCounts = useMemo(() => {
        const counts = new Map<string, number>();
        vehicles.forEach(vehicle => {
            // Raw vehicle data uses snake_case: vehicle_type_id
            const typeId = vehicle.vehicle_type_id || vehicle.vehicleTypeId;
            if (typeId) {
                counts.set(typeId, (counts.get(typeId) || 0) + 1);
            }
        });
        return counts;
    }, [vehicles]);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleOpenCreateModal = () => {
        setSelectedType(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (type: VehicleType) => {
        setSelectedType(type);
        setIsModalOpen(true);
    };

    const handleSaveType = async (typeData: Omit<VehicleType, 'id'>) => {
        try {
            if (selectedType) {
                await apiRequest(`/vehicle-types/${selectedType.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(typeData),
                });
                showToast(`✅ แก้ไขประเภทรถ "${typeData.name}" สำเร็จ`);
            } else {
                await apiRequest('/vehicle-types', {
                    method: 'POST',
                    body: JSON.stringify(typeData),
                });
                showToast(`🎉 เพิ่มประเภทรถ "${typeData.name}" ใหม่สำเร็จ`);
            }
            await loadAllData();
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to save vehicle type:', err);
            showToast('❌ ไม่สามารถบันทึกข้อมูลได้');
        }
        setIsModalOpen(false);
    };

    const handleOpenDeleteConfirm = (type: VehicleType) => {
        setTypeToDelete(type);
        setIsConfirmOpen(true);
    };

    const handleDeleteType = async () => {
        if (typeToDelete) {
            try {
                await apiRequest(`/vehicle-types/${typeToDelete.id}`, { method: 'DELETE' });
                showToast(`🗑️ ลบประเภทรถ "${typeToDelete.name}" เรียบร้อยแล้ว`);
                await loadAllData();
            } catch (err) {
                console.error('Failed to delete vehicle type:', err);
                showToast('❌ ไม่สามารถลบข้อมูลได้');
            }
        }
        setIsConfirmOpen(false);
        setTypeToDelete(null);
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">จัดการประเภทรถ</h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-[#005A9C] rounded-lg shadow-sm hover:bg-blue-800 transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    <span>เพิ่มประเภทรถใหม่</span>
                </button>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">ชื่อประเภทรถ</th>
                                <th className="px-6 py-3">รายละเอียด</th>
                                <th className="px-6 py-3">ความจุ</th>
                                <th className="px-6 py-3">จำนวนรถ</th>
                                <th className="px-6 py-3 text-center">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicleTypes.map(type => (
                                <tr key={type.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{type.name}</td>
                                    <td className="px-6 py-4 text-gray-500 truncate max-w-xs" title={type.description}>{type.description || '-'}</td>
                                    <td className="px-6 py-4">{type.capacity ? `${type.capacity} คน/เตียง` : '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {vehicleCounts.get(type.id) || 0} คัน
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button onClick={() => handleOpenEditModal(type)} className="text-gray-500 hover:text-blue-600" title="แก้ไข"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleOpenDeleteConfirm(type)} className="text-gray-500 hover:text-red-600" title="ลบ"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <EditVehicleTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveType}
                vehicleType={selectedType}
            />

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDeleteType}
                title={`ยืนยันการลบประเภทรถ "${typeToDelete?.name}"`}
                message="คุณแน่ใจหรือไม่ว่าต้องการลบประเภทรถนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
            />

            <Toast message={toastMessage} />
        </div>
    );
};

export default ManageVehicleTypesPage;

