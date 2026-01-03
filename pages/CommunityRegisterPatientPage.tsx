import React, { useState } from 'react';
import { CommunityView } from '../types';
import { defaultProfileImage } from '../assets/defaultProfile';

// Import StepWizard and Step components from the static folder
import StepWizard, { Step } from '../src/static/components/ui/StepWizard';
import Step1Identity from '../src/static/components/PatientRegistrationWizard/Step1Identity';
import Step2Medical from '../src/static/components/PatientRegistrationWizard/Step2Medical';
import Step3Contact from '../src/static/components/PatientRegistrationWizard/Step3Contact';
import Step4Attachments from '../src/static/components/PatientRegistrationWizard/Step4Attachments';
import Step5Review from '../src/static/components/PatientRegistrationWizard/Step5Review';

interface CommunityRegisterPatientPageProps {
    setActiveView: (view: CommunityView, context?: any) => void;
}

const CommunityRegisterPatientPage: React.FC<CommunityRegisterPatientPageProps> = ({ setActiveView }) => {
    const [formData, setFormData] = useState<any>({
        // Step 1 Data
        title: '',
        firstName: '',
        lastName: '',
        idCard: '',
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

        // Step 5 Data (Review & Submit)
    });

    const handleWizardComplete = async (finalData: any) => {
        console.log("Final data for submission:", finalData);

        try {
            const token = localStorage.getItem('wecare_token'); // Changed from 'token' to 'wecare_token' to match App.tsx
            if (!token) {
                alert('กรุณาเข้าสู่ระบบใหม่');
                return;
            }

            // Transform data to match backend expectation if necessary
            // The backend expects specific fields like 'fullName', 'nationalId', etc.
            // We might need to map 'firstName' + 'lastName' to 'fullName'

            const requestData = new FormData();

            // Basic Fields
            requestData.append('title', finalData.title);
            requestData.append('fullName', `${finalData.firstName} ${finalData.lastName}`);
            requestData.append('gender', finalData.gender);
            requestData.append('nationalId', finalData.idCard || '');

            // Construct DOB from day/month/year
            const dob = `${finalData.birthYear}-${finalData.birthMonth}-${finalData.birthDay}`;
            requestData.append('dob', dob);
            requestData.append('age', String(finalData.age));

            requestData.append('bloodType', finalData.bloodGroup || '');
            requestData.append('rhFactor', finalData.rhFactor || '');
            requestData.append('healthCoverage', finalData.insuranceType || '');
            requestData.append('contactPhone', finalData.contactPhone);
            requestData.append('landmark', finalData.landmark || '');
            requestData.append('latitude', finalData.latitude);
            requestData.append('longitude', finalData.longitude);

            // Address Objects (Send as JSON string)
            requestData.append('idCardAddress', JSON.stringify(finalData.idCardAddress));
            requestData.append('currentAddress', JSON.stringify(finalData.currentAddress));

            // Arrays (Send as JSON string)
            requestData.append('patientTypes', JSON.stringify(finalData.patientTypes));
            requestData.append('chronicDiseases', JSON.stringify(finalData.chronicDiseases));
            requestData.append('allergies', JSON.stringify(finalData.allergies));

            // Profile Image
            if (finalData.profileImage?.file) {
                requestData.append('profileImage', finalData.profileImage.file);
            }

            // Attachments
            if (finalData.attachments && finalData.attachments.length > 0) {
                finalData.attachments.forEach((file: File) => {
                    requestData.append('attachments', file);
                });
            }

            // Using fetch directly or apiRequest from services
            // Let's use the existing apiRequest if possible, but here we use fetch for FormData

            const API_BASE = 'http://localhost:3001'; // Hardcoded for now or use env
            const response = await fetch(`${API_BASE}/api/patients`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Content-Type header should NOT be set when sending FormData, browser sets it with boundary
                },
                body: requestData
            });

            const result = await response.json();

            if (response.ok) {
                alert(`บันทึกข้อมูลผู้ป่วยใหม่สำเร็จ!`);
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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">ลงทะเบียนผู้ป่วยใหม่</h1>
            <StepWizard onComplete={handleWizardComplete}>
                <Step title="ข้อมูลระบุตัวตน">
                    <Step1Identity
                        currentData={formData}

                    />
                </Step>
                <Step title="ข้อมูลทางการแพทย์">
                    <Step2Medical
                        currentData={formData}

                    />
                </Step>
                <Step title="ข้อมูลติดต่อ & ที่อยู่">
                    <Step3Contact
                        currentData={formData}

                    />
                </Step>
                <Step title="เอกสารแนบ">
                    <Step4Attachments
                        currentData={formData}

                    />
                </Step>
                <Step title="ตรวจสอบ & ยืนยัน">
                    <Step5Review
                        currentData={formData}

                    />
                </Step>
            </StepWizard>
        </div>
    );
};

export default CommunityRegisterPatientPage;