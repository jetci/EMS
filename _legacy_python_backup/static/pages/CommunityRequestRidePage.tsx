import React, { useState, useEffect } from 'react';
import { CommunityView, Patient, Notification } from '../types';
import { formatDateToThai } from '../utils/dateUtils';
import ThaiDatePicker from '../components/ui/ThaiDatePicker';
import ThaiTimePicker from '../components/ui/ThaiTimePicker';
import SuccessModal from '../components/modals/SuccessModal';
import TagInput from '../components/ui/TagInput';
import { getAuthToken } from '../utils/auth';

// Mock data that would typically come from an API
const mockPatients: Pick<Patient, 'id' | 'fullName'>[] = [
  { id: 'PAT-001', fullName: 'สมชาย ใจดี' },
  { id: 'PAT-002', fullName: 'สมหญิง มีสุข' },
  { id: 'PAT-003', fullName: 'อาทิตย์ แจ่มใส' },
  { id: 'PAT-004', fullName: 'จันทรา งามวงศ์วาน' },
  { id: 'PAT-005', fullName: 'มานี รักเรียน' },
  { id: 'PAT-006', fullName: 'ปิติ ชูใจ' },
];

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
    });
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
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        if (formData.appointmentDate === todayStr) {
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const newMinTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
            setMinTime(newMinTime);
            
            // If the currently selected time is in the past, reset it
            if (formData.appointmentTime) {
                const [selectedHour, selectedMinute] = formData.appointmentTime.split(':').map(Number);
                if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute < currentMinute)) {
                    setFormData(prev => ({ ...prev, appointmentTime: '' }));
                }
            }
        } else {
            setMinTime(null); // No time restriction for future dates
        }
    }, [formData.appointmentDate, formData.appointmentTime]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'caregiverCount' ? Math.max(0, parseInt(value, 10) || 0) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const token = getAuthToken();
        if (!token) {
            alert('กรุณาเข้าสู่ระบบ');
            return;
        }

        if (!formData.patientId) {
            alert('กรุณาเลือกผู้ป่วย');
            return;
        }
        if (!formData.appointmentDate || !formData.appointmentTime) {
            alert('กรุณาเลือกวันและเวลานัดหมาย');
            return;
        }

        // Validate appointment is in the future
        const dateTimeStr = `${formData.appointmentDate}T${formData.appointmentTime}:00`;
        const appt = new Date(dateTimeStr);
        const now = new Date();
        if (isNaN(appt.getTime())) {
            alert('รูปแบบวัน/เวลาไม่ถูกต้อง');
            return;
        }
        if (appt < now) {
            alert('ไม่สามารถเลือกเวลาที่ผ่านมาแล้วได้');
            return;
        }

        // Sanitize tags to avoid obvious script injection in input sent to server
        const safeSpecialNeeds = specialNeeds.map(tag => tag.replace(/<[^>]*>/g, ''));

        const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;
        const idempotencyKey = `${token}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

        fetch(`${API_BASE}/api/community/rides`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify({ ...formData, specialNeeds: safeSpecialNeeds })
        }).then(async res => {
            const j = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert('ส่งคำขอล้มเหลว: ' + (j.message || res.statusText));
                return;
            }
            const selectedPatient = mockPatients.find(p => p.id === formData.patientId);
            addNotification({
                message: `ส่งคำขอเดินทางสำหรับคุณ ${selectedPatient?.fullName || formData.patientId} เรียบร้อยแล้ว`,
                isRead: false,
            });
            setIsSuccessModalOpen(true);
        }).catch(err => {
            console.error('Ride request error', err);
            alert('เกิดข้อผิดพลาดเครือข่าย ขอลองใหม่');
        });
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
                        {/* Patient Selection */}
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
                                {mockPatients.map(p => (
                                    <option key={p.id} value={p.id}>{p.fullName}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Destination (Read-only) */}
                        <div>
                            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">จุดหมายปลายทาง</label>
                            <input
                                type="text"
                                name="destination"
                                id="destination"
                                value="โรงพยาบาลฝาง"
                                readOnly
                                className="w-full bg-gray-100 text-gray-600 cursor-not-allowed"
                            />
                        </div>

                        {/* Trip Type */}
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