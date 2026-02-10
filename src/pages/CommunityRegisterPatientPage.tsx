import React, { useState, useEffect } from 'react';
import { CommunityView } from '../types';
import { defaultProfileImage } from '../assets/defaultProfile';

// Import StepWizard component from the static folder
import StepWizard from '../static/components/ui/StepWizard';
import Step1Identity from '../static/components/PatientRegistrationWizard/Step1Identity';
import Step2Medical from '../static/components/PatientRegistrationWizard/Step2Medical';
import Step3Contact from '../static/components/PatientRegistrationWizard/Step3Contact';
import Step4Attachments from '../static/components/PatientRegistrationWizard/Step4Attachments';
import Step5Review from '../static/components/PatientRegistrationWizard/Step5Review';
import { apiRequest } from '../services/api';

interface CommunityRegisterPatientPageProps {
    setActiveView: (view: CommunityView, context?: any) => void;
}

const DRAFT_KEY = 'wecare_patient_registration_draft';

const CommunityRegisterPatientPage: React.FC<CommunityRegisterPatientPageProps> = ({ setActiveView }) => {
    const [showDraftNotification, setShowDraftNotification] = useState(false);
    const [formData, setFormData] = useState<any>({
        // Step 1 Data
        title: '',
        firstName: '',
        lastName: '',
        nationalId: '',
        dob: '',
        gender: '',
        age: '',

        // Step 2 Data
        patientTypes: [],
        chronicDiseases: [],
        allergies: [],
        bloodType: '',
        rhFactor: '',
        healthCoverage: '',
        keyInfo: '',

        // Step 3 Data (Address & Contact)
        idCardAddress: {
            houseNumber: '',
            village: '',
            tambon: '',
            amphoe: '',
            changwat: '',
        },
        currentAddress: {
            houseNumber: '',
            village: '',
            tambon: '',
            amphoe: '',
            changwat: '',
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

    // Load draft on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
            try {
                const parsedDraft = JSON.parse(savedDraft);
                // Check if draft is recent (within 7 days)
                const draftAge = Date.now() - (parsedDraft.timestamp || 0);
                const sevenDays = 7 * 24 * 60 * 60 * 1000;

                if (draftAge < sevenDays) {
                    setShowDraftNotification(true);
                } else {
                    // Clear old draft
                    localStorage.removeItem(DRAFT_KEY);
                }
            } catch (error) {
                console.error('Error loading draft:', error);
                localStorage.removeItem(DRAFT_KEY);
            }
        }
    }, []);

    // Auto-save draft whenever formData changes
    useEffect(() => {
        // Don't save if form is empty (initial state)
        const hasData = formData.firstName || formData.lastName || formData.nationalId ||
            formData.contactPhone || formData.bloodType;

        if (hasData) {
            const draftData = {
                ...formData,
                // Exclude file objects (can't be serialized)
                profileImage: { file: null, previewUrl: null },
                attachments: [],
                timestamp: Date.now()
            };

            try {
                localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
                console.log('📝 Draft auto-saved');
            } catch (error) {
                console.error('Error saving draft:', error);
            }
        }
    }, [formData]);

    const loadDraft = () => {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        console.log('🔍 Loading draft from localStorage:', savedDraft);
        if (savedDraft) {
            try {
                const parsedDraft = JSON.parse(savedDraft);
                console.log('📦 Parsed draft data:', parsedDraft);
                delete parsedDraft.timestamp; // Remove timestamp before setting
                const normalizedDraft = {
                    ...parsedDraft,
                    nationalId: parsedDraft.nationalId || parsedDraft.idCard || '',
                    dob: parsedDraft.dob || parsedDraft.birthDate || '',
                    bloodType: parsedDraft.bloodType || parsedDraft.bloodGroup || '',
                    rhFactor: parsedDraft.rhFactor || '',
                    healthCoverage: parsedDraft.healthCoverage || parsedDraft.insuranceType || '',
                };
                console.log('✅ Setting formData to:', normalizedDraft);
                setFormData(normalizedDraft);
                setShowDraftNotification(false);
                alert('✅ โหลดข้อมูลฉบับร่างสำเร็จ');
            } catch (error) {
                console.error('Error loading draft:', error);
                alert('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล');
            }
        }
    };

    const discardDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setShowDraftNotification(false);
        alert('🗑️ ลบข้อมูลฉบับร่างแล้ว');
    };

    const handleDataChange = (wizardData: any) => {
        // Update parent formData whenever wizard data changes
        setFormData(wizardData);
    };

    const handleWizardComplete = async (finalData: any) => {
        console.log("Final data for submission:", finalData);

        try {
            const token = localStorage.getItem('wecare_token');
            if (!token) {
                alert('ไม่พบ Token กรุณาเข้าสู่ระบบใหม่');
                return;
            }

            const appendIfPresent = (fd: FormData, key: string, value: any) => {
                if (value === undefined || value === null) return;
                if (typeof value === 'string' && value.trim() === '') return;
                if (typeof value === 'number' && !Number.isFinite(value)) return;
                fd.append(key, typeof value === 'string' ? value : String(value));
            };

            // Transform data to match backend expectation if necessary
            // The backend expects specific fields like 'fullName', 'nationalId', etc.
            // We might need to map 'firstName' + 'lastName' to 'fullName'

            const requestData = new FormData();

            // Basic Fields
            requestData.append('fullName', `${finalData.firstName} ${finalData.lastName}`);
            appendIfPresent(requestData, 'title', finalData.title);
            appendIfPresent(requestData, 'gender', finalData.gender);
            appendIfPresent(requestData, 'nationalId', finalData.nationalId || finalData.idCard);

            appendIfPresent(requestData, 'dob', finalData.dob || finalData.birthDate);
            appendIfPresent(requestData, 'age', finalData.age);

            appendIfPresent(requestData, 'bloodType', finalData.bloodType || finalData.bloodGroup);
            appendIfPresent(requestData, 'rhFactor', finalData.rhFactor);
            appendIfPresent(requestData, 'healthCoverage', finalData.healthCoverage || finalData.insuranceType);
            appendIfPresent(requestData, 'keyInfo', finalData.keyInfo);
            appendIfPresent(requestData, 'contactPhone', finalData.contactPhone);
            appendIfPresent(requestData, 'landmark', finalData.landmark);
            appendIfPresent(requestData, 'latitude', finalData.latitude);
            appendIfPresent(requestData, 'longitude', finalData.longitude);

            // Emergency Contact
            appendIfPresent(requestData, 'emergencyContactName', finalData.emergencyContactName);
            appendIfPresent(requestData, 'emergencyContactPhone', finalData.emergencyContactPhone);
            appendIfPresent(requestData, 'emergencyContactRelation', finalData.emergencyContactRelation);

            // Address Objects (Send as JSON string)
            requestData.append('idCardAddress', JSON.stringify(finalData.idCardAddress));
            requestData.append('currentAddress', JSON.stringify(finalData.currentAddress));

            // Arrays (Send as JSON string)
            // Handle patientTypeOther: Merge into patientTypes if present
            let typesToSend = [...(finalData.patientTypes || [])];
            if (finalData.patientTypeOther) {
                if (typesToSend.includes('อื่นๆ')) {
                    typesToSend = typesToSend.map(t => t === 'อื่นๆ' ? `อื่นๆ (${finalData.patientTypeOther})` : t);
                } else {
                    typesToSend.push(`อื่นๆ (${finalData.patientTypeOther})`);
                }
            }
            requestData.append('patientTypes', JSON.stringify(typesToSend));
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
            await apiRequest('/patients', {
                method: 'POST',
                body: requestData
            });

            localStorage.removeItem(DRAFT_KEY);
            alert('ลงทะเบียนผู้ป่วยสำเร็จ!');
            setActiveView('patients');

        } catch (error: any) {
            console.error('Error registering patient:', error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        }
    };

    const steps = [
        {
            title: 'ข้อมูลส่วนตัว',
            component: <Step1Identity formData={formData} />,
        },
        {
            title: 'ข้อมูลทางการแพทย์',
            component: <Step2Medical formData={formData} />,
        },
        {
            title: 'ข้อมูลติดต่อ',
            component: <Step3Contact formData={formData} />,
        },
        {
            title: 'เอกสารแนบ',
            component: <Step4Attachments formData={formData} />,
        },
        {
            title: 'ตรวจสอบข้อมูล',
            component: <Step5Review formData={formData} />,
        },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">ลงทะเบียนผู้ป่วย</h1>

            {/* Draft Notification Banner */}
            {showDraftNotification && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-md animate-fade-in">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-blue-800">
                                พบข้อมูลฉบับร่างที่บันทึกไว้
                            </h3>
                            <p className="mt-1 text-sm text-blue-700">
                                ระบบพบข้อมูลการลงทะเบียนที่ยังไม่เสร็จสมบูรณ์ คุณต้องการโหลดข้อมูลนี้เพื่อดำเนินการต่อหรือไม่?
                            </p>
                            <div className="mt-3 flex gap-3">
                                <button
                                    onClick={loadDraft}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                >
                                    📂 โหลดข้อมูลฉบับร่าง
                                </button>
                                <button
                                    onClick={discardDraft}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                                >
                                    🗑️ ลบและเริ่มใหม่
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <StepWizard
                steps={steps}
                onComplete={handleWizardComplete}
                onCancel={() => setActiveView('patients')}
                onDataChange={handleDataChange}
                initialData={formData}
            />
        </div>
    );
};

export default CommunityRegisterPatientPage;
