import React, { useState, useMemo } from 'react';
import { VehicleType } from '../types';
import PlusCircleIcon from '../components/icons/PlusCircleIcon';
import EditIcon from '../components/icons/EditIcon';
import TrashIcon from '../components/icons/TrashIcon';
import EditVehicleTypeModal from '../components/modals/EditVehicleTypeModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import Toast from '../components/Toast';
import { mockVehicleTypes, mockVehicles } from '../data/mockData';

const ManageVehicleTypesPage: React.FC = () => {
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>(mockVehicleTypes);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<VehicleType | null>(null);
    const [typeToDelete, setTypeToDelete] = useState<VehicleType | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const vehicleCounts = useMemo(() => {
        const counts = new Map<string, number>();
        mockVehicles.forEach(vehicle => {
            counts.set(vehicle.type, (counts.get(vehicle.type) || 0) + 1);
        });
        return counts;
    }, []);

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

    const handleSaveType = (typeData: Omit<VehicleType, 'id'>) => {
        if (selectedType) {
            setVehicleTypes(prev => prev.map(t => t.id === selectedType.id ? { ...t, ...typeData } : t));
            showToast(`✅ แก้ไขประเภทรถ "${typeData.name}" สำเร็จ`);
        } else {
            const newType = { ...typeData, id: `vt-${Date.now()}` };
            setVehicleTypes(prev => [newType, ...prev]);
            showToast(`🎉 เพิ่มประเภทรถ "${newType.name}" ใหม่สำเร็จ`);
        }
        setIsModalOpen(false);
    };

    const handleOpenDeleteConfirm = (type: VehicleType) => {
        setTypeToDelete(type);
        setIsConfirmOpen(true);
    };

    const handleDeleteType = () => {
        if (typeToDelete) {
            if ((vehicleCounts.get(typeToDelete.name) || 0) > 0) {
                 showToast(`❌ ไม่สามารถลบได้: มีรถที่ใช้ประเภทนี้อยู่`);
            } else {
                setVehicleTypes(prev => prev.filter(t => t.id !== typeToDelete.id));
                showToast(`🗑️ ลบประเภทรถ "${typeToDelete.name}" เรียบร้อยแล้ว`);
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
                                <th className="px-6 py-3">จำนวนรถที่ใช้ประเภทนี้</th>
                                <th className="px-6 py-3 text-center">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicleTypes.map(type => (
                                <tr key={type.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{type.name}</td>
                                    <td className="px-6 py-4">{vehicleCounts.get(type.name) || 0}</td>
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
