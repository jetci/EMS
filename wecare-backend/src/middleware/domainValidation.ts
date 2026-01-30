import { Request, Response, NextFunction } from 'express';
import { validatePhoneNumber, validateCoordinates, validateDateFormat } from './sqlInjectionPrevention';

/**
 * Patient-specific validation middleware
 */

export const validatePatientInput = (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];
    const {
        fullName,
        nationalId,
        dob,
        contactPhone,
        latitude,
        longitude,
        patientTypes,
        bloodType,
        chronicDiseases,
        allergies
    } = req.body;

    // Full name validation
    if (fullName !== undefined) {
        if (!fullName || fullName.trim().length < 2) {
            errors.push('Full name must be at least 2 characters');
        }
        if (fullName && fullName.length > 100) {
            errors.push('Full name must not exceed 100 characters');
        }
    }

    // National ID validation (Thai format: X-XXXX-XXXXX-XX-X)
    if (nationalId !== undefined && nationalId) {
        const nationalIdPattern = /^\d{1}-\d{4}-\d{5}-\d{2}-\d{1}$/;
        const nationalIdSimple = /^\d{13}$/;
        if (!nationalIdPattern.test(nationalId) && !nationalIdSimple.test(nationalId)) {
            errors.push('Invalid national ID format (expected: X-XXXX-XXXXX-XX-X or 13 digits)');
        }
    }

    // Date of birth validation
    if (dob !== undefined && dob) {
        if (!validateDateFormat(dob)) {
            errors.push('Invalid date of birth format');
        } else {
            const birthDate = new Date(dob);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();

            if (age < 0 || age > 150) {
                errors.push('Invalid date of birth (age must be between 0 and 150)');
            }
        }
    }

    // Phone number validation
    if (contactPhone !== undefined && contactPhone) {
        if (!validatePhoneNumber(contactPhone)) {
            errors.push('Invalid phone number format (expected: 0X-XXXX-XXXX or 0XXXXXXXXX)');
        }
    }

    // Coordinates validation
    if ((latitude !== undefined || longitude !== undefined)) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (!validateCoordinates(lat, lng)) {
            errors.push('Invalid coordinates (latitude: -90 to 90, longitude: -180 to 180)');
        }
    }

    // Patient types validation
    if (patientTypes !== undefined) {
        if (!Array.isArray(patientTypes)) {
            errors.push('Patient types must be an array');
        } else if (patientTypes.length === 0) {
            errors.push('At least one patient type is required');
        }
    }

    // Blood type validation
    if (bloodType !== undefined && bloodType) {
        const validBloodTypes = ['A', 'B', 'AB', 'O', 'Unknown'];
        if (!validBloodTypes.includes(bloodType)) {
            errors.push(`Invalid blood type (must be one of: ${validBloodTypes.join(', ')})`);
        }
    }

    // Chronic diseases validation
    if (chronicDiseases !== undefined) {
        if (!Array.isArray(chronicDiseases)) {
            errors.push('Chronic diseases must be an array');
        } else {
            chronicDiseases.forEach((disease: any, index: number) => {
                if (typeof disease !== 'string' || disease.trim().length === 0) {
                    errors.push(`Invalid chronic disease at index ${index}`);
                }
            });
        }
    }

    // Allergies validation
    if (allergies !== undefined) {
        if (!Array.isArray(allergies)) {
            errors.push('Allergies must be an array');
        } else {
            allergies.forEach((allergy: any, index: number) => {
                if (typeof allergy !== 'string' || allergy.trim().length === 0) {
                    errors.push(`Invalid allergy at index ${index}`);
                }
            });
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Patient validation failed',
            details: errors
        });
    }

    next();
};

/**
 * Ride-specific validation middleware
 */
export const validateRideInput = (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];
    const {
        patientId,
        pickupLocation,
        destination,
        appointmentTime,
        contactPhone,
        caregiverCount,
        pickupCoordinates
    } = req.body;

    // Patient ID validation
    if (patientId !== undefined && patientId) {
        if (!/^PAT-\d{3,}$/.test(patientId)) {
            errors.push('Invalid patient ID format (expected: PAT-XXX)');
        }
    }

    // Pickup location validation
    if (pickupLocation !== undefined) {
        if (!pickupLocation || pickupLocation.trim().length < 5) {
            errors.push('Pickup location must be at least 5 characters');
        }
        if (pickupLocation && pickupLocation.length > 500) {
            errors.push('Pickup location must not exceed 500 characters');
        }
    }

    // Destination validation
    if (destination !== undefined) {
        if (!destination || destination.trim().length < 5) {
            errors.push('Destination must be at least 5 characters');
        }
        if (destination && destination.length > 500) {
            errors.push('Destination must not exceed 500 characters');
        }
    }

    // Appointment time validation
    if (appointmentTime !== undefined && appointmentTime) {
        if (!validateDateFormat(appointmentTime)) {
            errors.push('Invalid appointment time format');
        } else {
            const appointmentDate = new Date(appointmentTime);
            const now = new Date();

            // Appointment should not be in the past (with 5 minute tolerance)
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            if (appointmentDate < fiveMinutesAgo) {
                errors.push('Appointment time cannot be in the past');
            }

            // Appointment should not be more than 1 year in the future
            const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
            if (appointmentDate > oneYearFromNow) {
                errors.push('Appointment time cannot be more than 1 year in the future');
            }
        }
    }

    // Contact phone validation
    if (contactPhone !== undefined && contactPhone) {
        if (!validatePhoneNumber(contactPhone)) {
            errors.push('Invalid contact phone number format');
        }
    }

    // Caregiver count validation
    if (caregiverCount !== undefined) {
        const count = Number(caregiverCount);
        if (isNaN(count) || count < 0 || count > 10) {
            errors.push('Caregiver count must be between 0 and 10');
        }
    }

    // Pickup coordinates validation
    if (pickupCoordinates !== undefined && pickupCoordinates) {
        const { lat, lng } = pickupCoordinates;
        if (!validateCoordinates(lat, lng)) {
            errors.push('Invalid pickup coordinates');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Ride validation failed',
            details: errors
        });
    }

    next();
};

/**
 * Driver-specific validation middleware
 */
export const validateDriverInput = (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];
    const {
        fullName,
        phone,
        licensePlate,
        vehicleBrand,
        vehicleModel,
        vehicleColor
    } = req.body;

    // Full name validation
    if (fullName !== undefined) {
        if (!fullName || fullName.trim().length < 2) {
            errors.push('Full name must be at least 2 characters');
        }
        if (fullName && fullName.length > 100) {
            errors.push('Full name must not exceed 100 characters');
        }
    }

    // Phone validation
    if (phone !== undefined && phone) {
        if (!validatePhoneNumber(phone)) {
            errors.push('Invalid phone number format');
        }
    }

    // License plate validation (Thai format)
    if (licensePlate !== undefined && licensePlate) {
        // Thai license plate: XX-XXXX or XXX-XXXX
        const licensePlatePattern = /^[ก-ฮA-Z0-9]{2,3}-\d{4}$/;
        if (!licensePlatePattern.test(licensePlate)) {
            errors.push('Invalid license plate format (expected: XX-XXXX or XXX-XXXX)');
        }
    }

    // Vehicle brand validation
    if (vehicleBrand !== undefined) {
        if (!vehicleBrand || vehicleBrand.trim().length < 2) {
            errors.push('Vehicle brand must be at least 2 characters');
        }
        if (vehicleBrand && vehicleBrand.length > 50) {
            errors.push('Vehicle brand must not exceed 50 characters');
        }
    }

    // Vehicle model validation
    if (vehicleModel !== undefined) {
        if (!vehicleModel || vehicleModel.trim().length < 2) {
            errors.push('Vehicle model must be at least 2 characters');
        }
        if (vehicleModel && vehicleModel.length > 50) {
            errors.push('Vehicle model must not exceed 50 characters');
        }
    }

    // Vehicle color validation
    if (vehicleColor !== undefined) {
        if (!vehicleColor || vehicleColor.trim().length < 2) {
            errors.push('Vehicle color must be at least 2 characters');
        }
        if (vehicleColor && vehicleColor.length > 30) {
            errors.push('Vehicle color must not exceed 30 characters');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Driver validation failed',
            details: errors
        });
    }

    next();
};
