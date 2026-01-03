// src/components/PatientRegistrationWizard/Step3Contact.tsx
import React, { useState, useEffect } from 'react';
import OpenStreetMapTest from '../OpenStreetMapTest';

interface Step3ContactProps {
    onNext?: (data: any) => void;
    onBack?: () => void;
    currentData?: any;
    isLastStep?: boolean;
}

const villages = [
    "หมู่ 1 บ้านหนองตุ้ม", "หมู่ 2 ป่าบง", "หมู่ 3 เต๋าดิน, เวียงสุทโธ",
    "หมู่ 4 สวนดอก", "หมู่ 5 ต้นหนุน", "หมู่ 6 สันทรายคองน้อย",
    "หมู่ 7 แม่ใจใต้", "หมู่ 8 แม่ใจเหนือ", "หมู่ 9 ริมฝาง,สันป่าไหน่",
    "หมู่ 10 ห้วยเฮี่ยน,สันป่ายางยาง", "หมู่ 11 ท่าสะแล", "หมู่ 12 โป่งถืบ",
    "หมู่ 13 ห้วยบอน", "หมู่ 14 เสาหิน", "หมู่ 15 โป่งถืบใน",
    "หมู่ 16 ปางผึ้ง", "หมู่ 17 ใหม่คองน้อย", "หมู่ 18 ศรีดอนชัย",
    "หมู่ 19 ใหม่ชยาราม", "หมู่ 20 สระนิคม"
];

const Step3Contact: React.FC<Step3ContactProps> = ({
    onNext,
    onBack,
    currentData = {}
}) => {
    const [formData, setFormData] = useState({
        idCardAddress: currentData.idCardAddress || {
            houseNumber: '',
            village: '',
            tambon: 'เวียง',
            amphoe: 'ฝาง',
            changwat: 'เชียงใหม่',
        },
        currentAddress: currentData.currentAddress || {
            houseNumber: '',
            village: '',
            tambon: 'เวียง',
            amphoe: 'ฝาง',
            changwat: 'เชียงใหม่',
        },
        addressOption: currentData.addressOption || 'same',
        contactPhone: currentData.contactPhone || '',
        emergencyContactName: currentData.emergencyContactName || '',
        emergencyContactPhone: currentData.emergencyContactPhone || '',
        emergencyContactRelation: currentData.emergencyContactRelation || '',
        landmark: currentData.landmark || '',
        latitude: currentData.latitude || '19.9213',
        longitude: currentData.longitude || '99.2131',
    });

    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (formData.addressOption === 'same') {
            setFormData(prev => ({
                ...prev,
                currentAddress: prev.idCardAddress
            }));
        }
    }, [formData.idCardAddress, formData.addressOption]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev: any) => ({ ...prev, [field]: '' }));
        }
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, addressType: 'idCardAddress' | 'currentAddress') => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [addressType]: { ...prev[addressType], [name]: value }
        }));
    };

    const handleLocationChange = (coords: { lat: number; lng: number }) => {
        setFormData(prev => ({ ...prev, latitude: coords.lat.toString(), longitude: coords.lng.toString() }));
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.idCardAddress.houseNumber.trim()) newErrors.idCardHouseNumber = 'กรุณากรอกบ้านเลขที่';
        if (!formData.idCardAddress.village) newErrors.idCardVillage = 'กรุณาเลือกหมู่บ้าน';
        if (formData.addressOption === 'new') {
            if (!formData.currentAddress.houseNumber.trim()) newErrors.currentHouseNumber = 'กรุณากรอกบ้านเลขที่';
            if (!formData.currentAddress.village) newErrors.currentVillage = 'กรุณาเลือกหมู่บ้าน';
        }
        if (!formData.contactPhone.trim()) {
            newErrors.contactPhone = 'กรุณากรอกเบอร์โทรศัพท์';
        } else if (formData.contactPhone.length !== 10) {
            newErrors.contactPhone = 'เบอร์โทรศัพท์ต้องมี 10 หลัก';
        }
        if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'กรุณากรอกชื่อผู้ติดต่อฉุกเฉิน';
        if (!formData.emergencyContactPhone.trim()) {
            newErrors.emergencyContactPhone = 'กรุณากรอกเบอร์โทรผู้ติดต่อฉุกเฉิน';
        } else if (formData.emergencyContactPhone.length !== 10) {
            newErrors.emergencyContactPhone = 'เบอร์โทรศัพท์ต้องมี 10 หลัก';
        }
        if (!formData.emergencyContactRelation.trim()) newErrors.emergencyContactRelation = 'กรุณากรอกความสัมพันธ์';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm() && onNext) {
            onNext(formData);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    ขั้นตอนที่ 3: ที่อยู่และข้อมูลติดต่อ
                </h3>
                <p className="text-gray-600">
                    กรุณากรอกข้อมูลที่อยู่และช่องทางการติดต่อของผู้ป่วย
                </p>
            </div>

            <form id="step-2-form" onSubmit={handleSubmit} className="space-y-8">
                {/* ID Card Address */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">ส่วนที่ 1: ที่อยู่ตามบัตรประชาชน</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">บ้านเลขที่ <span className="text-red-500">*</span></label>
                            <input type="text" name="houseNumber" value={formData.idCardAddress.houseNumber} onChange={e => handleAddressChange(e, 'idCardAddress')} className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.idCardHouseNumber ? 'border-red-500' : 'border-gray-300'}`} />
                            {errors.idCardHouseNumber && <p className="text-red-500 text-sm mt-1">{errors.idCardHouseNumber}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">หมู่บ้าน <span className="text-red-500">*</span></label>
                            <select name="village" value={formData.idCardAddress.village} onChange={e => handleAddressChange(e, 'idCardAddress')} className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.idCardVillage ? 'border-red-500' : 'border-gray-300'}`}>
                                <option value="">-- เลือก --</option>
                                {villages.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            {errors.idCardVillage && <p className="text-red-500 text-sm mt-1">{errors.idCardVillage}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ตำบล</label>
                            <div className="mt-1 p-2.5 bg-gray-100 rounded-lg text-gray-800 text-sm">{formData.idCardAddress.tambon}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">อำเภอ</label>
                            <div className="mt-1 p-2.5 bg-gray-100 rounded-lg text-gray-800 text-sm">{formData.idCardAddress.amphoe}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">จังหวัด</label>
                            <div className="mt-1 p-2.5 bg-gray-100 rounded-lg text-gray-800 text-sm">{formData.idCardAddress.changwat}</div>
                        </div>
                    </div>
                </div>

                {/* Current Address */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">ส่วนที่ 2: ที่อยู่ปัจจุบัน</h3>
                    <div className="flex items-center space-x-6">
                        <label className="flex items-center">
                            <input type="radio" name="addressOption" value="same" checked={formData.addressOption === 'same'} onChange={(e) => handleInputChange('addressOption', e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-700">ใช้ที่อยู่เดียวกับบัตรประชาชน</span>
                        </label>
                        <label className="flex items-center">
                            <input type="radio" name="addressOption" value="new" checked={formData.addressOption === 'new'} onChange={(e) => handleInputChange('addressOption', e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                            <span className="ml-2 text-sm text-gray-700">ระบุที่อยู่ใหม่</span>
                        </label>
                    </div>
                    {formData.addressOption === 'new' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">บ้านเลขที่ <span className="text-red-500">*</span></label>
                                <input type="text" name="houseNumber" value={formData.currentAddress.houseNumber} onChange={e => handleAddressChange(e, 'currentAddress')} className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.currentHouseNumber ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors.currentHouseNumber && <p className="text-red-500 text-sm mt-1">{errors.currentHouseNumber}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">หมู่บ้าน <span className="text-red-500">*</span></label>
                                <select name="village" value={formData.currentAddress.village} onChange={e => handleAddressChange(e, 'currentAddress')} className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.currentVillage ? 'border-red-500' : 'border-gray-300'}`}>
                                    <option value="">-- เลือก --</option>
                                    {villages.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                {errors.currentVillage && <p className="text-red-500 text-sm mt-1">{errors.currentVillage}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ตำบล</label>
                                <div className="mt-1 p-2.5 bg-gray-100 rounded-lg text-gray-800 text-sm">{formData.currentAddress.tambon}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">อำเภอ</label>
                                <div className="mt-1 p-2.5 bg-gray-100 rounded-lg text-gray-800 text-sm">{formData.currentAddress.amphoe}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">จังหวัด</label>
                                <div className="mt-1 p-2.5 bg-gray-100 rounded-lg text-gray-800 text-sm">{formData.currentAddress.changwat}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contact Info */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">ส่วนที่ 3: ข้อมูลติดต่อ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.contactPhone} onChange={(e) => handleInputChange('contactPhone', e.target.value.replace(/\D/g, '').slice(0, 10))} className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'}`} maxLength={10} />
                            {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ชื่อผู้ติดต่อฉุกเฉิน <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.emergencyContactName} onChange={(e) => handleInputChange('emergencyContactName', e.target.value)} className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'}`} />
                            {errors.emergencyContactName && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">เบอร์โทรผู้ติดต่อฉุกเฉิน <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.emergencyContactPhone} onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value.replace(/\D/g, '').slice(0, 10))} className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'}`} maxLength={10} />
                            {errors.emergencyContactPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactPhone}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ความสัมพันธ์ <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.emergencyContactRelation} onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)} className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.emergencyContactRelation ? 'border-red-500' : 'border-gray-300'}`} />
                            {errors.emergencyContactRelation && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactRelation}</p>}
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">ส่วนที่ 4: ปักหมุดตำแหน่งที่อยู่ปัจจุบัน</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">จุดสังเกต</label>
                        <input type="text" value={formData.landmark} onChange={(e) => handleInputChange('landmark', e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="เช่น ใกล้ตลาด, ตรงข้ามวัด" />
                    </div>
                    <div style={{ height: '400px', width: '100%' }}>
                        <OpenStreetMapTest
                            position={{ lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }}
                            onLocationChange={handleLocationChange}
                        />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>Latitude: {formData.latitude}</span>
                        <span>Longitude: {formData.longitude}</span>
                    </div>
                </div>
                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                        ← ย้อนกลับ
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        ถัดไป →
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Step3Contact;

