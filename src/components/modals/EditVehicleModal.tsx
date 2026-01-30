import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleStatus } from '../../types';
import XIcon from '../icons/XIcon';
import ModernDatePicker from '../ui/ModernDatePicker';

interface EditVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (vehicle: Vehicle) => void;
    vehicle: Vehicle | null;
    availableVehicleTypes: any[];
}

// ... imports ...

const emptyVehicle: Omit<Vehicle, 'id'> = {
    licensePlate: '',
    vehicleTypeId: '', // Changed to empty string to force selection
    brand: '',
    model: '',
    status: VehicleStatus.AVAILABLE,
    nextMaintenanceDate: '',
};

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({ isOpen, onClose, onSave, vehicle, availableVehicleTypes }) => {
    const [formData, setFormData] = useState<Omit<Vehicle, 'id'>>(vehicle || emptyVehicle);
    const [error, setError] = useState<string | null>(null);
    const isEditing = !!vehicle;

    useEffect(() => {
        if (isOpen) {
            setFormData(vehicle || emptyVehicle);
            setError(null);
        }
    }, [vehicle, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Strict Validation
        if (!formData.licensePlate?.trim()) {
            setError('กรุณาระบุทะเบียนรถ (ห้ามเว้นว่าง)');
            return;
        }
        if (!formData.vehicleTypeId) {
            setError('กรุณาเลือกประเภทรถ');
            return;
        }

        // Optional fields check - if entered, must not be just whitespace
        if (formData.brand && !formData.brand.trim()) {
            setError('ยี่ห้อต้องไม่เป็นช่องว่าง');
            return;
        }
        if (formData.model && !formData.model.trim()) {
            setError('รุ่นต้องไม่เป็นช่องว่าง');
            return;
        }

        const finalData: Vehicle = {
            id: isEditing ? vehicle!.id : `VEH-${Date.now()}`,
            ...formData,
            licensePlate: formData.licensePlate.trim(),
            brand: formData.brand.trim(),
            model: formData.model.trim(),
            // Ensure vehicleTypeName is not overwritten or handled if needed, but Modal mainly sets ID.
            // ManageVehiclesPage will re-fetch or we can let it restart.
            // Ideally we shouldn't send vehicleTypeName to onSave if not needed, but Vehicle interface has it as optional.
        };
        onSave(finalData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'แก้ไขข้อมูลยานพาหนะ' : 'เพิ่มยานพาหนะใหม่'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">ทะเบียนรถ</label>
                                <input type="text" name="licensePlate" id="licensePlate" value={formData.licensePlate} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" placeholder="ทะเบียนรถ (เช่น กข 1234 เชียงใหม่)" required />
                            </div>
                            <div>
                                <label htmlFor="vehicleTypeId" className="block text-sm font-medium text-gray-700">ประเภทรถ</label>
                                <select name="vehicleTypeId" id="vehicleTypeId" value={formData.vehicleTypeId} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm bg-white" required>
                                    <option value="" disabled>-- เลือกประเภทรถ --</option>
                                    {availableVehicleTypes.map(vt => (
                                        <option key={vt.id} value={vt.id}>{vt.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="brand" className="block text-sm font-medium text-gray-700">ยี่ห้อ</label>
                                <input type="text" name="brand" id="brand" value={formData.brand} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" placeholder="ยี่ห้อ (เช่น Toyota, Isuzu)" />
                            </div>
                            <div>
                                <label htmlFor="model" className="block text-sm font-medium text-gray-700">รุ่น</label>
                                <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" placeholder="รุ่น (เช่น Commuter, D-Max)" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">สถานะ</label>
                            <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm bg-white" required>
                                <option value={VehicleStatus.AVAILABLE}>พร้อมใช้งาน</option>
                                <option value={VehicleStatus.MAINTENANCE}>ซ่อมบำรุง</option>
                                <option value={VehicleStatus.IN_USE}>ใช้งานอยู่</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="nextMaintenanceDate" className="block text-sm font-medium text-gray-700">วันตรวจสภาพครั้งต่อไป</label>
                            <ModernDatePicker
                                name="nextMaintenanceDate"
                                value={formData.nextMaintenanceDate || ''}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                placeholder="เลือกวันตรวจสภาพ"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100">ยกเลิก</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#005A9C] rounded-md hover:bg-blue-800">บันทึกข้อมูล</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVehicleModal;
