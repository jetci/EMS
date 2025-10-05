import React, { useState, useEffect } from 'react';
import { CommunityView, Patient, Notification } from '../types';
import { formatDateToThai } from '../utils/dateUtils';
import ThaiDatePicker from '../components/ui/ThaiDatePicker';
import ThaiTimePicker from '../components/ui/ThaiTimePicker';
import SuccessModal from '../components/modals/SuccessModal';
import TagInput from '../components/ui/TagInput';
import { patientsAPI, ridesAPI } from '../src/services/api';

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
    const [formData, setFormData] = useState({
        patientId: '',
        appointmentDate: '',
        appointmentTime: '',
        tripType: tripTypes[0],
        caregiverCount: 0,
        contactPhone: '',
        pickupLocation: '',
        destination: 'โรงพยาบาลฝาง',
    });
    const [patients, setPatients] = useState<Array<{ id: string; fullName: string }>>([]);
    const [loadingPatients, setLoadingPatients] = useState<boolean>(false);

    const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
    const [minTime, setMinTime] = useState<string | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if(preselectedPatientId) {
            setFormData(prev => ({...prev, patientId: preselectedPatientId}));
        }
    }, [preselectedPatientId]);

    useEffect(() => {
        const loadPatients = async () => {
            setLoadingPatients(true);
            try {
                const data = await patientsAPI.getPatients();
                const mapped = (data || []).map((p: any) => ({ id: p.id, fullName: p.full_name || p.fullName }));
                setPatients(mapped);
            } catch (e) {
                addNotification({ message: 'ไม่สามารถโหลดรายชื่อผู้ป่วยได้', isRead: false });
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
        setFormData(prev => ({
            ...prev,
            [name]: name === 'caregiverCount' ? Math.max(0, parseInt(value, 10) || 0) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.patientId || !formData.appointmentDate || !formData.appointmentTime || !formData.pickupLocation || !formData.destination) {
            addNotification({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน', isRead: false });
            return;
        }

        const apptIso = new Date(`${formData.appointmentDate}T${formData.appointmentTime}:00`).toISOString();
        const payload = {
            patient_id: formData.patientId,
            appointment_time: apptIso,
            pickup_location: formData.pickupLocation,
            destination: formData.destination,
            special_needs: specialNeeds.join(', '),
            caregiver_count: formData.caregiverCount,
            contact_phone: formData.contactPhone,
        } as any;

        try {
            await ridesAPI.createRide(payload);
            const selectedPatient = patients.find(p => p.id === formData.patientId);
            addNotification({ message: `ส่งคำขอเดินทางสำหรับคุณ ${selectedPatient?.fullName || ''} เรียบร้อยแล้ว`, isRead: false });
            setIsSuccessModalOpen(true);
            setFormData({
                patientId: '',
                appointmentDate: '',
                appointmentTime: '',
                tripType: tripTypes[0],
                caregiverCount: 0,
                contactPhone: '',
                pickupLocation: '',
                destination: 'โรงพยาบาลฝาง',
            });
            setSpecialNeeds([]);
        } catch (e) {
            addNotification({ message: 'ไม่สามารถสร้างคำขอเดินทางได้ กรุณาลองใหม่', isRead: false });
        }
    };

    const handleCloseSuccessModal = () => {
        setIsSuccessModalOpen(false);
        setActiveView('rides');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">สร้างคำขอการเดินทางใหม่</h1>

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
                                    <option>กำลังโหลด...</option>
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
                            <ThaiDatePicker
                                name="appointmentDate"
                                value={formData.appointmentDate}
                                onChange={handleChange}
                                required
                                min={today}
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
                        <button type="button" onClick={() => setActiveView('dashboard')} className="px-6 py-2.5 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
                            ยกเลิก
                        </button>
                        <button type="submit" className="px-6 py-2.5 font-semibold text-white bg-[var(--wecare-green)] rounded-lg shadow-sm hover:bg-green-600 transition-colors">
                            ส่งคำขอการเดินทาง
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