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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">ขอรถพยาบาล</h1>

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
            <ValidationErrorDisplay errors={validationErrors} />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields */}

            {/* Patient Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลือกผู้ป่วย <span className="text-red-500">*</span>
                </label>
                <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                >
                    <option value="">-- เลือกผู้ป่วย --</option>
                    {/* Patient options */}
                </select>
            </div>

            {/* Destination */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    จุดหมาย <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น โรงพยาบาลฝาง"
                    required
                />
            </div>

            {/* Appointment Time */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันและเวลานัดหมาย <span className="text-red-500">*</span>
                </label>
                <input
                    type="datetime-local"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            {/* Trip Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภทการเดินทาง <span className="text-red-500">*</span>
                </label>
                <select
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                >
                    <option value="">-- เลือกประเภท --</option>
                    <option value="ONE_WAY">เที่ยวเดียว</option>
                    <option value="ROUND_TRIP">ไป-กลับ</option>
                </select>
            </div>

            {/* Contact Phone */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span>
                </label>
                <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0812345678"
                    maxLength={10}
                    required
                />
                <p className="text-sm text-gray-500 mt-1">
                    กรุณากรอกเบอร์โทรศัพท์ 10 หลัก เริ่มต้นด้วย 0
                </p>
            </div>

            {/* Pickup Location */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    สถานที่รับผู้ป่วย
                </label>
                <textarea
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="ระบุสถานที่รับผู้ป่วย (ถ้าไม่ระบุจะใช้ที่อยู่ของผู้ป่วย)"
                />
            </div>

            {/* Special Needs */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    ความต้องการพิเศษ
                </label>
                <textarea
                    value={specialNeeds}
                    onChange={(e) => setSpecialNeeds(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="เช่น ต้องการเปลนอน, ต้องการออกซิเจน, ฯลฯ"
                />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    ส่งคำขอ
                </button>
                <button
                    type="button"
                    onClick={() => setActiveView('dashboard')}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                    ยกเลิก
                </button>
            </div>
        </form>
    </div>
);

// ============================================
// COMPLETE EXAMPLE: Full component with validation
// ============================================

import React, { useState, useEffect } from 'react';
import { CommunityView } from '../types';
import { validateRideData, formatValidationErrors } from '../utils/validation';
import ValidationErrorDisplay from '../components/ui/ValidationErrorDisplay';

interface CommunityRequestRidePageProps {
    setActiveView: (view: CommunityView, context?: any) => void;
}

const CommunityRequestRidePage: React.FC<CommunityRequestRidePageProps> = ({ setActiveView }) => {
    // State
    const [selectedPatient, setSelectedPatient] = useState('');
    const [destination, setDestination] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [tripType, setTripType] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');
    const [specialNeeds, setSpecialNeeds] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Load patients on mount
    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            const token = localStorage.getItem('wecare_token');
            const response = await fetch('/api/patients', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setPatients(data.data || []);
        } catch (error) {
            console.error('Error loading patients:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setValidationErrors([]);
        setLoading(true);

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

        // Validate data
        const validationResult = validateRideData(rideData);

        if (!validationResult.isValid) {
            const errorMessages = validationResult.errors.map(err => err.message);
            setValidationErrors(errorMessages);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            alert(`พบข้อผิดพลาด ${validationResult.errors.length} รายการ:\n\n${formatValidationErrors(validationResult.errors)}`);
            setLoading(false);
            return;
        }

        // Submit to backend
        try {
            const token = localStorage.getItem('wecare_token');
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
                setActiveView('rides');
            } else {
                throw new Error(result.message || 'เกิดข้อผิดพลาด');
            }
        } catch (error: any) {
            console.error('Error creating ride:', error);
            setValidationErrors([error.message]);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">ขอรถพยาบาล</h1>

            {validationErrors.length > 0 && (
                <ValidationErrorDisplay errors={validationErrors} />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form fields as shown above */}
            </form>
        </div>
    );
};

export default CommunityRequestRidePage;
