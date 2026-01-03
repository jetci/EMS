import React, { useState, useEffect } from 'react';
import { CommunityView } from '../types';
import OpenStreetMapTest from '../components/OpenStreetMapTest';
import { formatDateToThai } from '../utils/dateUtils';
import CameraIcon from '../components/icons/CameraIcon';
import UploadIcon from '../components/icons/UploadIcon';
import PaperclipIcon from '../components/icons/PaperclipIcon';
import TrashIcon from '../components/icons/TrashIcon';
import { defaultProfileImage } from '../assets/defaultProfile';
import TagInput from '../components/ui/TagInput';
import MultiSelectAutocomplete from '../components/ui/MultiSelectAutocomplete';
import ThaiDatePicker from '../components/ui/ThaiDatePicker';

// Import StepWizard and Step components
import StepWizard, { Step } from '../components/ui/StepWizard';
import Step1Identity from '../components/PatientRegistrationWizard/Step1Identity';
import Step2Medical from '../components/PatientRegistrationWizard/Step2Medical';
import Step3Contact from '../components/PatientRegistrationWizard/Step3Contact';
import Step4Attachments from '../components/PatientRegistrationWizard/Step4Attachments';
import Step5Review from '../components/PatientRegistrationWizard/Step5Review';

const villages = [
    "หมู่ 1 บ้านหนองตุ้ม", "หมู่ 2 ป่าบง", "หมู่ 3 เต๋าดิน, เวียงสุทโธ",
    "หมู่ 4 สวนดอก", "หมู่ 5 ต้นหนุน", "หมู่ 6 สันทรายคองน้อย",
    "หมู่ 7 แม่ใจใต้", "หมู่ 8 แม่ใจเหนือ", "หมู่ 9 ริมฝาง,สันป่าไหน่",
    "หมู่ 10 ห้วยเฮี่ยน,สันป่ายางยาง", "หมู่ 11 ท่าสะแล", "หมู่ 12 โป่งถืบ",
    "หมู่ 13 ห้วยบอน", "หมู่ 14 เสาหิน", "หมู่ 15 โป่งถืบใน",
    "หมู่ 16 ปางผึ้ง", "หมู่ 17 ใหม่คองน้อย", "หมู่ 18 ศรีดอนชัย",
    "หมู่ 19 ใหม่ชยาราม", "หมู่ 20 สระนิคม"
];

const titles = ["นาย", "นาง", "นางสาว", "เด็กชาย", "เด็กหญิง"];
const bloodTypes = ["A", "B", "AB", "O"];
const rhFactors = ["Rh+", "Rh-"];
const healthCoverages = ["สิทธิบัตรทอง (UC)", "ประกันสังคม", "ข้าราชการ", "ชำระเงินเอง", "อื่นๆ"];
const patientTypeOptions = ['ผู้ป่วยติดเตียง', 'ผู้ป่วยภาวะพึงพิง', 'ผู้ป่วยยากไร้'];

interface CommunityRegisterPatientPageProps {
    setActiveView: (view: CommunityView) => void;
}

const CommunityRegisterPatientPage: React.FC<CommunityRegisterPatientPageProps> = ({ setActiveView }) => {
    const [formData, setFormData] = useState<any>({
        // Step 1 Data
        title: '',
        firstName: '',
        lastName: '',
        idCard: '', // Changed from nationalId to idCard for consistency with Step1Identity
        birthDay: '',
        birthMonth: '',
        birthYear: '',
        gender: '',
        age: '',

        // Step 2 Data
        patientTypes: [],
        chronicDiseases: [],
        allergies: [],
        bloodGroup: '',
        rhFactor: '',
        insuranceType: '',

        // Step 3 Data (Address & Contact)
        idCardAddress: {
            houseNumber: '',
            village: '',
            tambon: 'เวียง',
            amphoe: 'ฝาง',
            changwat: 'เชียงใหม่',
        },
        currentAddress: {
            houseNumber: '',
            village: '',
            tambon: 'เวียง',
            amphoe: 'ฝาง',
            changwat: 'เชียงใหม่',
        },
        addressOption: 'same', // 'same' or 'new'
        contactPhone: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        landmark: '',
        latitude: '19.9213',
        longitude: '99.2131',

        // Step 4 Data (Attachments)
        profileImage: { file: null, previewUrl: null },
        attachments: [],

        // Step 5 Data (Review & Submit) - No specific fields, just confirmation
    });

    const handleWizardComplete = async (finalData: any) => {
        console.log("Final data for submission:", finalData);
        
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        alert('กรุณาเข้าสู่ระบบใหม่');
                        return;
                    }
            
            const requestData = {
                ...finalData,
                // Ensure patientTypes, chronicDiseases, allergies are correctly formatted if needed
            };
            
            console.log("Sending patient registration data:", requestData);
            
            const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;
            const response = await fetch(`${API_BASE}/api/community/patients/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                alert(`บันทึกข้อมูลผู้ป่วยใหม่สำเร็จ!\nรหัสผู้ป่วย: ${result.patient_id}\nชื่อ: ${result.patient.full_name}`);
                setActiveView('patients');
            } else {
                throw new Error(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
            
        } catch (error: any) {
            console.error('Error registering patient:', error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        }
    };

    return (
        <div className="space-y-6">
            <StepWizard onComplete={handleWizardComplete}>
                <Step title="ข้อมูลระบุตัวตน">
                    <Step1Identity 
                        currentData={formData}
                        onNext={(data) => setFormData(prev => ({ ...prev, ...data }))}
                    />
                </Step>
                <Step title="ข้อมูลทางการแพทย์">
                    <Step2Medical 
                        currentData={formData}
                        onNext={(data) => setFormData(prev => ({ ...prev, ...data }))}
                    />
                </Step>
                <Step title="ข้อมูลติดต่อ & ที่อยู่">
                    <Step3Contact 
                        currentData={formData}
                        onNext={(data) => setFormData(prev => ({ ...prev, ...data }))}
                    />
                </Step>
                <Step title="เอกสารแนบ">
                    <Step4Attachments 
                        currentData={formData}
                        onNext={(data) => setFormData(prev => ({ ...prev, ...data }))}
                    />
                </Step>
                <Step title="ตรวจสอบ & ยืนยัน">
                    <Step5Review 
                        currentData={formData}
                        onNext={(data) => setFormData(prev => ({ ...prev, ...data }))}
                    />
                </Step>
            </StepWizard>
        </div>
    );
};

export default CommunityRegisterPatientPage;

