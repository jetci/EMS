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
        // Proceed with API call only if validation passes
        const response = await patientAPI.createPatient(finalData);
        
        if (response.ok) {
            alert('สร้างประวัติผู้ป่วยสำเร็จ!');
            // Navigate back or reset form
            navigate('/community-dashboard');
        } else {
            throw new Error(response.message || 'Failed to create patient');
        }
    } catch (error: any) {
        setValidationErrors([error.message]);
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
};

// ============================================
// STEP 4: Display validation errors in JSX
// ============================================

return (
    <div className="space-y-6">
        {/* Show validation errors */}
        {validationErrors.length > 0 && (
            <ValidationErrorDisplay errors={validationErrors} />
        )}

        {/* Your wizard component */}
        <PatientRegistrationWizard
            onComplete={handleWizardComplete}
        />
    </div>
);

// ============================================
// Optional: Field-level validation
// ============================================

const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

const validateField = (fieldName: string, value: any) => {
    const validationResult = validatePatientField(fieldName, value);
    
    if (!validationResult.isValid) {
        setFieldErrors(prev => ({
            ...prev,
            [fieldName]: validationResult.error
        }));
    } else {
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }
};

// In JSX form fields:
<input
    type="text"
    value={firstName}
    onChange={(e) => {
        setFirstName(e.target.value);
        validateField('firstName', e.target.value);
    }}
    className={fieldErrors.firstName ? 'border-red-500' : ''}
/>
{fieldErrors.firstName && (
    <p className="text-red-500 text-sm">{fieldErrors.firstName}</p>
)}
