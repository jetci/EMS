import React, { useState, useEffect } from 'react';
import { VehicleType } from '../../types';
import XIcon from '../icons/XIcon';

interface EditVehicleTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (vehicleType: Omit<VehicleType, 'id'>) => void;
    vehicleType: VehicleType | null;
}

const EditVehicleTypeModal: React.FC<EditVehicleTypeModalProps> = ({ isOpen, onClose, onSave, vehicleType }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [capacity, setCapacity] = useState<number | ''>('');
    const [error, setError] = useState<string | null>(null);
    const isEditing = !!vehicleType;

    useEffect(() => {
        if (isOpen) {
            setName(vehicleType?.name || '');
            setDescription(vehicleType?.description || '');
            setCapacity(vehicleType?.capacity || '');
            setError(null);
        }
    }, [vehicleType, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Strict validation
        if (!name.trim()) {
            setError('กรุณาระบุชื่อประเภทรถ (ห้ามเว้นว่าง)');
            return;
        }

        if (description && !description.trim()) {
            setError('คำอธิบายต้องไม่เป็นช่องว่าง');
            return;
        }

        onSave({
            name: name.trim(),
            description: description.trim(),
            capacity: capacity === '' ? undefined : Number(capacity)
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'แก้ไขประเภทรถ' : 'เพิ่มประเภทรถใหม่'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">ชื่อประเภทรถ</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                placeholder="ชื่อประเภทรถ (เช่น รถตู้, รถกระบะ)"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">ความจุ (คน/เตียง)</label>
                            <input
                                type="number"
                                name="capacity"
                                id="capacity"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                placeholder="ระบุจำนวน (ตัวเลข)"
                                min="0"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">คำอธิบายเพิ่มเติม</label>
                            <textarea
                                name="description"
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                rows={3}
                                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับประเภทรถ"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 bg-gray-50 border-t space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100">ยกเลิก</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#005A9C] rounded-md hover:bg-blue-800">บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVehicleTypeModal;
