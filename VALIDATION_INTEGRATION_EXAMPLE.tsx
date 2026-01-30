/**
 * Example: How to integrate validation into CommunityRegisterPatientPage.tsx
 * 
 * Instructions:
 * 1. Add imports at the top of the file
 * 2. Add state for validation errors
 * 3. Add validation before submitting
 * 4. Display validation errors
 */

// ============================================
// STEP 1: Add imports (add after line 3)
// ============================================

import { validatePatientData, formatValidationErrors } from '../utils/validation';
import ValidationErrorDisplay from '../components/ui/ValidationErrorDisplay';

// ============================================
// STEP 2: Add state for validation errors (add after line 67)
// ============================================

const [validationErrors, setValidationErrors] = useState<string[]>([]);

// ============================================
// STEP 3: Add validation in handleWizardComplete (replace lines 69-77)
// ============================================

const handleWizardComplete = async (finalData: any) => {
    console.log("Final data for submission:", finalData);

    // Clear previous errors
    setValidationErrors([]);

    // Validate data before submission
    const validationResult = validatePatientData(finalData);

    if (!validationResult.isValid) {
        // Show validation errors
        const errorMessages = validationResult.errors.map(err => err.message);
        setValidationErrors(errorMessages);

        // Scroll to top to show errors
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Alert user
        alert(`พบข้อผิดพลาด ${validationResult.errors.length} รายการ\n\n${formatValidationErrors(validationResult.errors)}`);
        return;
    }

    try {
        const token = localStorage.getItem('wecare_token');
        if (!token) {
            alert('กรุณาเข้าสู่ระบบใหม่');
            return;
        }

        // ... rest of the code remains the same
    } catch (error: any) {
        console.error('Error registering patient:', error);
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
};

// ============================================
// STEP 4: Display validation errors (add after line 154, before StepWizard)
// ============================================

return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">ลงทะเบียนผู้ป่วยใหม่</h1>

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
            <ValidationErrorDisplay errors={validationErrors} />
        )}

        <StepWizard onComplete={handleWizardComplete}>
            {/* ... rest of the wizard steps ... */}
        </StepWizard>
    </div>
);

// ============================================
// COMPLETE EXAMPLE: Full handleWizardComplete function
// ============================================

const handleWizardComplete = async (finalData: any) => {
    console.log("Final data for submission:", finalData);

    // Clear previous errors
    setValidationErrors([]);

    // Validate data before submission
    const validationResult = validatePatientData(finalData);

    if (!validationResult.isValid) {
        // Show validation errors
        const errorMessages = validationResult.errors.map(err => err.message);
        setValidationErrors(errorMessages);

        // Scroll to top to show errors
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Alert user with all errors
        alert(`พบข้อผิดพลาด ${validationResult.errors.length} รายการ:\n\n${formatValidationErrors(validationResult.errors)}`);
        return;
    }

    try {
        const token = localStorage.getItem('wecare_token');
        if (!token) {
            alert('กรุณาเข้าสู่ระบบใหม่');
            return;
        }

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

        // Get API base URL from environment variable
        const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';
        const response = await fetch(`${API_BASE}/patients`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: requestData,
            credentials: 'include'
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
        setValidationErrors([error.message]);
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
};
