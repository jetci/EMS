import { DBPatient, DBRide, Patient, Ride, RideStatus } from '../app-types';

export const mapPatientFromDB = (dbPatient: DBPatient): Patient => {
    return {
        id: dbPatient.id,
        fullName: dbPatient.full_name,
        profileImageUrl: dbPatient.profile_image_url,

        // Personal Info
        title: '', // Not in DBPatient yet, need to infer or add to schema
        gender: dbPatient.gender || '',
        nationalId: dbPatient.national_id || '',
        dob: dbPatient.dob || '',
        age: dbPatient.age || 0,
        patientTypes: dbPatient.patient_types ? JSON.parse(dbPatient.patient_types) : [],

        // Medical Info
        bloodType: dbPatient.blood_type || '',
        rhFactor: dbPatient.rh_factor || '',
        healthCoverage: dbPatient.health_coverage || '',
        chronicDiseases: dbPatient.chronic_diseases ? JSON.parse(dbPatient.chronic_diseases) : [],
        allergies: dbPatient.allergies ? JSON.parse(dbPatient.allergies) : [],

        // Contact & Address
        contactPhone: dbPatient.contact_phone || '',
        idCardAddress: {
            houseNumber: dbPatient.id_card_house_number || '',
            village: dbPatient.id_card_village || '',
            tambon: dbPatient.id_card_tambon || '',
            amphoe: dbPatient.id_card_amphoe || '',
            changwat: dbPatient.id_card_changwat || ''
        },
        currentAddress: {
            houseNumber: dbPatient.current_house_number || '',
            village: dbPatient.current_village || '',
            tambon: dbPatient.current_tambon || '',
            amphoe: dbPatient.current_amphoe || '',
            changwat: dbPatient.current_changwat || ''
        },
        landmark: dbPatient.landmark || '',
        latitude: dbPatient.latitude || '',
        longitude: dbPatient.longitude || '',

        // Metadata
        registeredDate: dbPatient.registered_date || new Date().toISOString(),
        registeredBy: dbPatient.created_by || '',
        keyInfo: '', // Derived field
        createdAt: dbPatient.created_at,
        updatedAt: dbPatient.updated_at,

        // Attachments (Need separate fetch or join)
        attachments: [] as any
    };
};

export const mapRideFromDB = (dbRide: DBRide): Ride => {
    return {
        id: dbRide.id,
        patientId: dbRide.patient_id,
        patientName: dbRide.patient_name,
        patientPhone: dbRide.patient_phone,
        pickupLocation: dbRide.pickup_location,
        destination: dbRide.destination,
        appointmentTime: dbRide.appointment_time,
        status: dbRide.status as RideStatus,
        driverName: dbRide.driver_name,
        pickupCoordinates: (dbRide.pickup_lat && dbRide.pickup_lng) ? {
            lat: parseFloat(dbRide.pickup_lat),
            lng: parseFloat(dbRide.pickup_lng)
        } : undefined,

        // New fields
        pickupTime: dbRide.pickup_time,
        dropoffTime: dbRide.dropoff_time,
        cancellationReason: dbRide.cancellation_reason,
        distanceKm: dbRide.distance_km,
        notes: dbRide.notes,
        tripType: dbRide.trip_type,
        createdAt: dbRide.created_at,
        updatedAt: dbRide.updated_at
    };
};
