import React, { useState, useEffect } from 'react';
import { CommunityView, Patient, Notification } from '../types';
import { formatDateToThai } from '../utils/dateUtils';
import ModernDatePicker from '../components/ui/ModernDatePicker';
import ThaiTimePicker from '../components/ui/ThaiTimePicker';
import SuccessModal from '../components/modals/SuccessModal';
import TagInput from '../components/ui/TagInput';
import { patientsAPI, ridesAPI } from '../services/api';
import { validateThaiPhoneNumber, validateRequired, validateLength } from '../utils/validation';
import ValidationErrorDisplay from '../components/ui/ValidationErrorDisplay';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useErrorHandler } from '../hooks/useErrorHandler';

const tripTypes = [
    'นัดหมอตามปกติ',
    'รับยา',
    'ฉุกเฉิน',
    'กายภาพบำบัด',
    'อื่นๆ'
];

interface CommunityRequestRidePageProps {
    setActiveView: (view: CommunityView) => void;
    preselectedPatientId?: string;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const CommunityRequestRidePage: React.FC<CommunityRequestRidePageProps> = ({ setActiveView, preselectedPatientId, addNotification }) => {
    // Error handling
    const { handleApiError } = useErrorHandler({
        component: 'CommunityRequestRidePage',
        onError: (error) => {
            addNotification({
                message: error.message,
                isRead: false
            });
        }
    });

    const [formData, setFormData] = useState({
        patientId: '',
        appointmentDate: '',
        appointmentTime: '',
        tripType: tripTypes[0],
        caregiverCount: '' as number | string,
        contactPhone: '',
        pickupLocation: '',
        pickupLat: '',
        pickupLng: '',
        destination: 'โรงพยาบาลฝาง',
    });
    const [patients, setPatients] = useState<Array<{
        id: string;
        fullName: string;
        phone?: string;
        address?: string;
        lat?: string;
        lng?: string;
    }>>([]);
    const [loadingPatients, setLoadingPatients] = useState<boolean>(false);

    const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
    const [minTime, setMinTime] = useState<string | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (preselectedPatientId && patients.length > 0) {
            const selectedPatient = patients.find(p => p.id === preselectedPatientId);
            if (selectedPatient) {
                setFormData(prev => ({
                    ...prev,
                    patientId: preselectedPatientId,
                    pickupLocation: selectedPatient.address || '',
                    contactPhone: selectedPatient.phone || '',
                    pickupLat: selectedPatient.lat || '',
                    pickupLng: selectedPatient.lng || '',
                }));
            }
        } else if (preselectedPatientId) {
            setFormData(prev => ({ ...prev, patientId: preselectedPatientId }));
        }
    }, [preselectedPatientId, patients]);

    useEffect(() => {
        const loadPatients = async () => {
            setLoadingPatients(true);
            try {
                const response = await patientsAPI.getPatients();
                // Handle both array and paginated response
                const rawData = response as any;
                const patientsData = Array.isArray(rawData) ? rawData : (rawData.data || rawData.patients || []);

                const mapped = patientsData.map((p: any) => {
                    const houseNumber = p.currentAddress?.houseNumber || p.currentHouseNumber || p.current_house_number;
                    const village = p.currentAddress?.village || p.currentVillage || p.current_village;
                    const tambon = p.currentAddress?.tambon || p.currentTambon || p.current_tambon;
                    const amphoe = p.currentAddress?.amphoe || p.currentAmphoe || p.current_amphoe;
                    const changwat = p.currentAddress?.changwat || p.currentChangwat || p.current_changwat;

                    const addressParts = [
                        houseNumber,
                        village ? (village.startsWith('หมู่') ? village : `หมู่ ${village}`) : '',
                        tambon ? (tambon.startsWith('ต.') ? tambon : `ต.${tambon}`) : '',
                        amphoe ? (amphoe.startsWith('อ.') ? amphoe : `อ.${amphoe}`) : '',
                        changwat ? (changwat.startsWith('จ.') ? changwat : `จ.${changwat}`) : ''
                    ].filter(Boolean);

                    return {
                        id: p.id,
                        fullName: p.fullName || p.full_name,
                        phone: p.contactPhone || p.contact_phone || p.phone || p.key_info?.contact_phone || '',
                        address: addressParts.length > 0 ? addressParts.join(' ') : (p.address || ''),
                        lat: p.latitude || p.lat,
                        lng: p.longitude || p.lng
                    };
                });
                setPatients(mapped);
            } catch (e: any) {
                handleApiError(e, 'loadPatients');
            } finally {
                setLoadingPatients(false);
            }
        };
        loadPatients();
    }, []);

    useEffect(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (formData.appointmentDate === todayStr) {
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const newMinTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
            setMinTime(newMinTime);

            if (formData.appointmentTime) {
                const [selectedHour, selectedMinute] = formData.appointmentTime.split(':').map(Number);
                if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute < currentMinute)) {
                    setFormData(prev => ({ ...prev, appointmentTime: '' }));
                }
            }
        } else {
            setMinTime(null);
        }
    }, [formData.appointmentDate, formData.appointmentTime]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Auto-populate when patient is selected
        if (name === 'patientId' && value) {
            const selectedPatient = patients.find(p => p.id === value);
            if (selectedPatient) {
                setFormData(prev => ({
                    ...prev,
                    patientId: value,
                    pickupLocation: selectedPatient.address || '',
                    contactPhone: selectedPatient.phone || '',
                    pickupLat: selectedPatient.lat || '',
                    pickupLng: selectedPatient.lng || '',
                }));
                return;
            }
        }

        if (name === 'caregiverCount') {
            if (value === '') {
                setFormData(prev => ({ ...prev, caregiverCount: '' }));
            } else {
                const num = parseInt(value, 10);
                if (!isNaN(num) && num >= 0) {
                    setFormData(prev => ({ ...prev, caregiverCount: num }));
                }
            }
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors([]);

        // Comprehensive validation
        const errors: string[] = [];

        // Required fields
        if (!formData.patientId) errors.push('กรุณาเลือกผู้ป่วย');
        if (!formData.appointmentDate) errors.push('กรุณาเลือกวันนัดหมาย');
        if (!formData.appointmentTime) errors.push('กรุณาเลือกเวลานัดหมาย');
        if (!formData.pickupLocation) errors.push('กรุณากรอกจุดรับผู้ป่วย');
        if (!formData.destination) errors.push('กรุณากรอกจุดหมายปลายทาง');
        if (!formData.contactPhone) errors.push('กรุณากรอกเบอร์โทรติดต่อ');

        // Phone validation
        if (formData.contactPhone) {
            const isValid = validateThaiPhoneNumber(formData.contactPhone);
            if (!isValid) errors.push('เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็น 10 หลัก เริ่มต้นด้วย 0)');
        }

        // Location validation
        if (formData.pickupLocation && formData.pickupLocation.length < 10) {
            errors.push('จุดรับผู้ป่วยต้องมีความยาวอย่างน้อย 10 ตัวอักษร');
        }

        if (formData.destination && formData.destination.length < 5) {
            errors.push('จุดหมายปลายทางต้องมีความยาวอย่างน้อย 5 ตัวอักษร');
        }

        // Caregiver count validation
        if (typeof formData.caregiverCount === 'number' && formData.caregiverCount > 10) {
            errors.push('จำนวนผู้ดูแลต้องไม่เกิน 10 คน');
        }

        // If there are validation errors, show them and stop
        if (errors.length > 0) {
            setValidationErrors(errors);
            addNotification({ message: 'กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง', isRead: false });
            return;
        }

        const apptIso = new Date(`${formData.appointmentDate}T${formData.appointmentTime}:00`).toISOString();
        const selectedPatient = patients.find(p => p.id === formData.patientId);
        const payload = {
            patient_id: formData.patientId,
            patient_name: selectedPatient?.fullName || 'Unknown Patient',
            appointment_time: apptIso,
            pickup_location: formData.pickupLocation,
            pickup_lat: formData.pickupLat,
            pickup_lng: formData.pickupLng,
            destination: formData.destination,
            special_needs: specialNeeds,
            caregiver_count: formData.caregiverCount === '' ? 0 : formData.caregiverCount,
            contact_phone: formData.contactPhone,
            trip_type: formData.tripType, // Added trip_type
        } as any;

        setIsSubmitting(true);
        try {
            await ridesAPI.createRide(payload);
            addNotification({ message: `ส่งคำขอเดินทางสำหรับคุณ ${selectedPatient?.fullName || ''} เรียบร้อยแล้ว`, isRead: false });
            setIsSuccessModalOpen(true);
            setFormData({
                patientId: '',
                appointmentDate: '',
                appointmentTime: '',
                tripType: tripTypes[0],
                caregiverCount: '',
                contactPhone: '',
                pickupLocation: '',
                pickupLat: '',
                pickupLng: '',
                destination: 'โรงพยาบาลฝาง',
            });
            setSpecialNeeds([]);
        } catch (e: any) {
            handleApiError(e, 'createRide');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSuccessModal = () => {
        setIsSuccessModalOpen(false);
        setActiveView('rides');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">สร้างคำขอการเดินทางใหม่</h1>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
                <ValidationErrorDisplay errors={validationErrors} />
            )}

            {!loadingPatients && patients.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-yellow-800 mb-2">ยังไม่มีผู้ป่วยในระบบ</h3>
                            <p className="text-yellow-700 mb-4">คุณต้องลงทะเบียนผู้ป่วยก่อนจึงจะสามารถจองรถได้</p>
                            <button
                                onClick={() => setActiveView('register_patient')}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                            >
                                ลงทะเบียนผู้ป่วยเลย
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">ผู้ป่วย</label>
                            <select
                                name="patientId"
                                id="patientId"
                                value={formData.patientId}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>-- กรุณาเลือกผู้ป่วย --</option>
                                {loadingPatients ? (
                                    <option disabled>กำลังโหลดรายชื่อผู้ป่วย...</option>
                                ) : (
                                    patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.fullName}</option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">จุดรับผู้ป่วย</label>
                            <input
                                type="text"
                                name="pickupLocation"
                                id="pickupLocation"
                                value={formData.pickupLocation}
                                onChange={handleChange}
                                placeholder="เช่น บ้านเลขที่ 123 หมู่ 1 ..."
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">จุดหมายปลายทาง</label>
                            <input
                                type="text"
                                name="destination"
                                id="destination"
                                value={formData.destination}
                                onChange={handleChange}
                                placeholder="เช่น โรงพยาบาลฝาง"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="tripType" className="block text-sm font-medium text-gray-700 mb-1">ประเภทการเดินทาง</label>
                            <select
                                name="tripType"
                                id="tripType"
                                value={formData.tripType}
                                onChange={handleChange}
                                required
                            >
                                {tripTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Appointment Date & Time */}
                        <div>
                            <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-1">วันนัดหมาย</label>
                            <ModernDatePicker
                                name="appointmentDate"
                                value={formData.appointmentDate}
                                onChange={handleChange}
                                required
                                min={today}
                                placeholder="เลือกวันนัดหมาย"
                            />
                        </div>
                        <div>
                            <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-1">เวลานัดหมาย</label>
                            <ThaiTimePicker
                                name="appointmentTime"
                                value={formData.appointmentTime}
                                onChange={handleChange}
                                required
                                minTime={minTime}
                            />
                        </div>

                        {/* Special Needs */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">ความต้องการพิเศษของผู้ป่วย</label>
                            <TagInput
                                tags={specialNeeds}
                                setTags={setSpecialNeeds}
                                placeholder="พิมพ์แล้วกด + หรือ Enter (เช่น 'ต้องใช้วีลแชร์')"
                            />
                        </div>

                        {/* Caregiver Count */}
                        <div>
                            <label htmlFor="caregiverCount" className="block text-sm font-medium text-gray-700 mb-1">จำนวนผู้ดูแลที่จะเดินทางไปด้วย</label>
                            <input
                                type="number"
                                name="caregiverCount"
                                id="caregiverCount"
                                value={formData.caregiverCount}
                                onChange={handleChange}
                                min="0"
                                placeholder="0"
                            />
                        </div>

                        {/* Contact Phone */}
                        <div>
                            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรติดต่อระหว่างเดินทาง</label>
                            <input
                                type="tel"
                                name="contactPhone"
                                id="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                placeholder="เบอร์โทรผู้ป่วย หรือผู้ดูแล"
                                required
                            />
                        </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-200 mt-8">
                        <button type="button" onClick={() => setActiveView('dashboard')} className="px-6 py-2.5 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors" disabled={isSubmitting}>
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-2.5 font-semibold text-white rounded-lg shadow-sm transition-colors ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--wecare-green)] hover:bg-green-600'}`}
                        >
                            {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำขอการเดินทาง'}
                        </button>
                    </div>
                </form>
            </div>
            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={handleCloseSuccessModal}
                title="ส่งคำขอสำเร็จ!"
                message="คำขอเดินทางของคุณถูกส่งไปยังเจ้าหน้าที่เพื่อตรวจสอบแล้ว คุณสามารถติดตามสถานะได้ที่หน้า 'จัดการการเดินทาง'"
            />
        </div>
    );
};

export default CommunityRequestRidePage;
