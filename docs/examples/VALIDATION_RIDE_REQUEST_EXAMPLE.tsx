/**
 * Example: How to integrate validation into CommunityRequestRidePage.tsx
 * 
 * Instructions:
 * 1. Add imports at the top of the file
 * 2. Add state for validation errors
 * 3. Add validation before submitting
 * 4. Display validation errors
 */

// ============================================
// STEP 1: Add imports (add at the top)
// ============================================

import { validateRideData, formatValidationErrors } from '../utils/validation';
import ValidationErrorDisplay from '../components/ui/ValidationErrorDisplay';

// ============================================
// STEP 2: Add state for validation errors
// ============================================

const [validationErrors, setValidationErrors] = useState<string[]>([]);

// ============================================
// STEP 3: Add validation in handleSubmit
// ============================================

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setValidationErrors([]);

    // Prepare data for validation
    const rideData = {
        patient_id: selectedPatient,
        destination: destination,
        appointment_time: appointmentTime,
        trip_type: tripType,
        contact_phone: contactPhone,
        pickup_location: pickupLocation,
        special_needs: specialNeeds
    };

    // Validate data before submission
    const validationResult = validateRideData(rideData);

    if (!validationResult.isValid) {
        // Show validation errors
        const errorMessages = validationResult.errors.map(err => err.message);
        setValidationErrors(errorMessages);

        // Scroll to top to show errors
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Alert user
        alert(`พบข้อผิดพลาด ${validationResult.errors.length} รายการ:\n\n${formatValidationErrors(validationResult.errors)}`);
        return;
    }

    // If validation passes, proceed with submission
    try {
        const token = localStorage.getItem('wecare_token');
        if (!token) {
            alert('กรุณาเข้าสู่ระบบใหม่');
            return;
        }

        const response = await fetch('/api/rides', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(rideData),
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok) {
            alert('สร้างคำขอเดินทางสำเร็จ!');
            // Reset form or navigate
        } else {
            throw new Error(result.message || 'เกิดข้อผิดพลาด');
        }

    } catch (error: any) {
        console.error('Error creating ride:', error);
        setValidationErrors([error.message]);
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
};

// ============================================
// STEP 4: Display validation errors in JSX
// ============================================

return (
    <div className="space-y-6">
        {/* Show validation errors at the top */}
        {validationErrors.length > 0 && (
            <ValidationErrorDisplay errors={validationErrors} />
        )}

        {/* Your form here */}
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields */}
            <input type="text" placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
            {/* More fields */}
            <button type="submit">Request Ride</button>
        </form>
    </div>
);

// ============================================
// Optional: Real-time field validation
// ============================================

const [formData, setFormData] = useState({
    patient_id: '',
    destination: '',
    appointment_time: '',
    trip_type: '',
    contact_phone: '',
    pickup_location: '',
    special_needs: ''
});

const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

const validateField = (fieldName: string, value: any) => {
    const validationResult = validateRideField(fieldName, value);
    
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

const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
        ...prev,
        [fieldName]: value
    }));
    validateField(fieldName, value);
};

// In JSX form fields:
<input
    type="text"
    value={formData.destination}
    onChange={(e) => handleInputChange('destination', e.target.value)}
    className={fieldErrors.destination ? 'border-red-500' : ''}
/>
{fieldErrors.destination && (
    <p className="text-red-500 text-sm">{fieldErrors.destination}</p>
)}

// ============================================
// Optional: Progressive validation on submit
// ============================================

const canSubmit = () => {
    const result = validateRideData(formData);
    return result.isValid;
};

// In button:
<button 
    type="submit" 
    disabled={!canSubmit()}
    className={canSubmit() ? 'bg-blue-500' : 'bg-gray-300'}
>
    Request Ride
</button>
