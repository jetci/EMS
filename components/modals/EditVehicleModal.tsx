import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleStatus } from '../../types';
import XIcon from '../icons/XIcon';
import ThaiDatePicker from '../ui/ThaiDatePicker';
import { mockVehicleTypes } from '../../data/mockData';

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
  vehicle: Vehicle | null;
}

const emptyVehicle: Omit<Vehicle, 'id'> = {
    licensePlate: '',
    type: '', // Changed to empty string to force selection
    brand: '',
    model: '',
    status: VehicleStatus.AVAILABLE,
    nextMaintenanceDate: '',
};

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({ isOpen, onClose, onSave, vehicle }) => {
    const [formData, setFormData] = useState<Omit<Vehicle, 'id'>>(vehicle || emptyVehicle);
    const isEditing = !!vehicle;

    useEffect(() => {
        if (isOpen) {
            setFormData(vehicle || emptyVehicle);
        }
    }, [vehicle, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData: Vehicle = {
            id: isEditing ? vehicle.id : `VEH-${Date.now()}`,
            ...formData,
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">ทะเบียนรถ</label>
                                <input type="text" name="licensePlate" id="licensePlate" value={formData.licensePlate} onChange={handleChange} className="mt-1" required />
                            </div>
                             <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700">ประเภทรถ</label>
                                <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1" required>
                                    <option value="" disabled>-- เลือกประเภทรถ --</option>
                                    {mockVehicleTypes.map(vt => (
                                        <option key={vt.id} value={vt.name}>{vt.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="brand" className="block text-sm font-medium text-gray-700">ยี่ห้อ</label>
                                <input type="text" name="brand" id="brand" value={formData.brand} onChange={handleChange} className="mt-1" />
                            </div>
                             <div>
                                <label htmlFor="model" className="block text-sm font-medium text-gray-700">รุ่น</label>
                                <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} className="mt-1" />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">สถานะ</label>
                            <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1" required>
                                <option value={VehicleStatus.AVAILABLE}>พร้อมใช้งาน</option>
                                <option value={VehicleStatus.MAINTENANCE}>ซ่อมบำรุง</option>
                                <option value={VehicleStatus.ASSIGNED}>ผูกกับทีมแล้ว</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="nextMaintenanceDate" className="block text-sm font-medium text-gray-700">วันตรวจสภาพครั้งต่อไป</label>
                             <ThaiDatePicker
                                name="nextMaintenanceDate"
                                value={formData.nextMaintenanceDate || ''}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
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