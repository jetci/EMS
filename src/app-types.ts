export enum RideStatus {
    PENDING = 'PENDING',
    ASSIGNED = 'ASSIGNED',
    EN_ROUTE_TO_PICKUP = 'EN_ROUTE_TO_PICKUP', // Driver is on the way to the patient
    ARRIVED_AT_PICKUP = 'ARRIVED_AT_PICKUP',   // Driver has arrived at the pickup location
    IN_PROGRESS = 'IN_PROGRESS',             // Patient is in the vehicle
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED'
}

export enum DriverStatus {
    AVAILABLE = 'AVAILABLE',
    ON_DUTY = 'ON_DUTY',
    OFF_DUTY = 'OFF_DUTY',
    UNAVAILABLE = 'UNAVAILABLE'
}

export interface Ride {
    id: string;
    patientId: string;
    patientName: string;
    patientPhone?: string;
    pickupLocation: string;
    village?: string;
    landmark?: string;
    destination: string;
    appointmentTime: string;
    status: RideStatus;
    driverName?: string;
    requestedBy?: string;
    specialNeeds?: string[];
    caregiverCount?: number;
    contactPhone?: string;
    caregiverPhone?: string;
    pickupCoordinates?: { lat: number; lng: number };
    driverInfo?: {
        id: string;
        fullName: string;
        phone: string;
        licensePlate: string;
        vehicleModel: string;
    }
    rating?: number;
    reviewTags?: string[];
    reviewComment?: string;
    tripType?: string;
    signatureDataUrl?: string;
    pickupTime?: string;
    dropoffTime?: string;
    cancellationReason?: string;
    distanceKm?: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export enum UserRole {
    DRIVER = 'DRIVER',
    COMMUNITY = 'COMMUNITY',
    RADIO_CENTER = 'RADIO_CENTER',
    RADIO = 'RADIO',
    ADMIN = 'ADMIN',
    OFFICER = 'OFFICER',
    EXECUTIVE = 'EXECUTIVE',
    DEVELOPER = 'DEVELOPER',
}

export interface User {
    id?: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    profileImageUrl?: string;
}

export type UserStatus = 'Active' | 'Inactive';

export interface ManagedUser {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    dateCreated: string;
    status: UserStatus;
    profileImageUrl?: string;
}

export interface Address {
    houseNumber: string;
    village: string;
    tambon: string;
    amphoe: string;
    changwat: string;
}

export interface Attachment {
    name: string;
    url: string;
    size: string;
}


export interface Patient {
    id: string;
    fullName: string;
    profileImageUrl?: string;

    // Personal Info
    title: string;
    gender: string;
    nationalId: string;
    dob: string; // YYYY-MM-DD
    age: number;
    patientTypes: string[];

    // Medical Info
    bloodType: string;
    rhFactor: string;
    healthCoverage: string;
    chronicDiseases: string[];
    allergies: string[];

    // Contact & Address
    contactPhone: string;
    idCardAddress: Address;
    currentAddress: Address;
    landmark: string;
    latitude: string;
    longitude: string;

    // Emergency Contact
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;

    // Attachments
    attachments: Attachment[];

    // Metadata
    registeredDate: string; // ISO String
    registeredBy: string; // Community User Name or ID
    keyInfo: string; // Summary of key conditions
    caregiverName?: string;
    caregiverPhone?: string;
    createdAt?: string;
    updatedAt?: string;
}


export interface Driver {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    licensePlate: string;
    licenseNumber: string;
    licenseExpiry: string;
    status: DriverStatus;
    profileImageUrl?: string;
    email: string;
    address: string;
    vehicleBrand: string;
    vehicleModel: string;
    vehicleColor: string;
    tripsThisMonth: number;
    vehicleType: string;
    vehicleYear: string;
    totalTrips: number;
    avgReviewScore: number;
    dateCreated?: string;
    totalDistance?: number;
    topCompliments?: string[];
    password?: string; // For creating/updating driver credentials
}

export enum ActionType {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    CREATE_USER = 'CREATE_USER',
    UPDATE_USER = 'UPDATE_USER',
    DELETE_USER = 'DELETE_USER',
    CREATE_PATIENT = 'CREATE_PATIENT',
    UPDATE_PATIENT = 'UPDATE_PATIENT',
    DELETE_PATIENT = 'DELETE_PATIENT',
    CREATE_RIDE = 'CREATE_RIDE',
    UPDATE_RIDE = 'UPDATE_RIDE',
    ASSIGN_DRIVER = 'ASSIGN_DRIVER',
    CANCEL_RIDE = 'CANCEL_RIDE',
    COMPLETE_RIDE = 'COMPLETE_RIDE',
    UPDATE_SETTINGS = 'UPDATE_SETTINGS',
}

export interface AuditLog {
    id: string;
    timestamp: string;
    userEmail: string;
    userRole: UserRole;
    action: ActionType;
    targetId?: string;
    ipAddress: string;
    dataPayload?: {
        before?: object;
        after?: object;
    };
}

// FIX: Add missing SystemLog interface
export interface SystemLog {
    time: string;
    user: string;
    role: UserRole;
    action: string;
}

export interface SystemSettings {
    appName: string;
    organizationName: string;
    organizationAddress?: string;
    organizationPhone?: string;
    contactEmail: string;
    logoUrl?: string;
    googleMapsApiKey: string;
    mapCenterLat: number;
    mapCenterLng: number;
    googleRecaptchaSiteKey: string;
    googleRecaptchaSecretKey: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    schedulingModel: 'individual' | 'team';
    developerName?: string;
    developerTitle?: string;
}

export interface Notification {
    id: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    type?: 'info' | 'success' | 'warning' | 'error';
    link?: string;
}

export enum VehicleStatus {
    AVAILABLE = 'AVAILABLE', // พร้อมใช้งาน
    MAINTENANCE = 'MAINTENANCE', // ซ่อมบำรุง
    IN_USE = 'IN_USE', // ใช้งานอยู่ (Schema: IN_USE)
}

export interface Vehicle {
    id: string;
    licensePlate: string;
    model: string;
    brand: string;
    vehicleTypeId: string;
    vehicleTypeName?: string;
    status: VehicleStatus;
    assignedTeamId?: string;
    nextMaintenanceDate?: string;
}

export interface VehicleType {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    capacity?: number;
    features?: string[];
}

export interface Team {
    id: string;
    name: string;
    driverId: string;
    staffIds: string[];
}

export enum ShiftStatus {
    MORNING = 'กะเช้า',
    AFTERNOON = 'กะบ่าย',
    NIGHT = 'กะดึก',
    DAY_OFF = 'วันหยุด',
    ON_LEAVE = 'ลา',
}

export enum TeamShiftStatus {
    ON_DUTY = 'เข้าเวร',
    REST_DAY = 'วันพัก',
}

export interface TeamScheduleEntry {
    id?: string;
    teamId?: string;
    date?: string;
    status: TeamShiftStatus;
    vehicleId?: string;
    shiftType?: string;
}

export interface NewsArticle {
    id: string;
    title: string;
    content: string; // Can be simple text or HTML string from a rich text editor
    author: string;
    status: 'published' | 'draft';
    publishedDate?: string; // ISO string for when it was published
    scheduledDate?: string; // Optional ISO string for future publishing
    featuredImageUrl?: string;
    category?: string;
    tags?: string[];
}


export type CommunityView = 'dashboard' | 'patients' | 'rides' | 'profile' | 'register_patient' | 'request_ride' | 'patient_detail' | 'ride_details' | 'edit_ride';
export type DriverView = 'today_jobs' | 'history' | 'profile';
export type RadioView = 'dashboard' | 'rides' | 'patients' | 'drivers' | 'profile' | 'map_command' | 'request_ride';
export type RadioCenterView = 'dashboard' | 'rides' | 'patients' | 'drivers' | 'profile' | 'map_command' | 'manage_teams' | 'manage_schedules' | 'news' | 'reports' | 'request_ride';
export type OfficerView = 'dashboard' | 'map_command' | 'rides' | 'patients' | 'drivers' | 'profile' | 'manage_teams' | 'manage_schedules' | 'news' | 'edit_news' | 'reports' | 'manage_vehicles' | 'register_patient' | 'request_ride';
export type AdminView = 'dashboard' | 'users' | 'logs' | 'settings' | 'profile' | 'news' | 'edit_news' | 'reports' | 'manage_teams' | 'manage_schedules' | 'manage_vehicles' | 'manage_vehicle_types' | 'test_map' | 'design_system';
export type ExecutiveView = 'executive_dashboard' | 'operational_report' | 'financial_report' | 'patient_demographics_report' | 'profile';
export type AuthenticatedView = CommunityView | DriverView | OfficerView | RadioView | RadioCenterView | AdminView | ExecutiveView;

// ==========================================
// Database Schema Interfaces (snake_case)
// ==========================================

export interface DBUser {
    id: string;
    email: string;
    password?: string;
    role: string;
    full_name: string;
    date_created: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export interface DBPatient {
    id: string;
    full_name: string;
    national_id?: string;
    dob?: string;
    age?: number;
    gender?: string;
    blood_type?: string;
    rh_factor?: string;
    health_coverage?: string;
    contact_phone?: string;

    // Address (ID Card)
    id_card_house_number?: string;
    id_card_village?: string;
    id_card_tambon?: string;
    id_card_amphoe?: string;
    id_card_changwat?: string;

    // Address (Current)
    current_house_number?: string;
    current_village?: string;
    current_tambon?: string;
    current_amphoe?: string;
    current_changwat?: string;

    landmark?: string;
    latitude?: string;
    longitude?: string;

    patient_types?: string; // JSON string
    chronic_diseases?: string; // JSON string
    allergies?: string; // JSON string

    profile_image_url?: string;
    registered_date?: string;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
}

export interface DBRide {
    id: string;
    patient_id: string;
    patient_name: string;
    patient_phone?: string;
    driver_id?: string;
    driver_name?: string;
    vehicle_id?: string;

    pickup_location: string;
    pickup_lat?: string;
    pickup_lng?: string;
    destination: string;
    destination_lat?: string;
    destination_lng?: string;

    appointment_time: string;
    pickup_time?: string;
    dropoff_time?: string;

    trip_type?: string;
    special_needs?: string; // JSON string
    notes?: string;
    distance_km?: number;

    status: string;
    cancellation_reason?: string;

    created_by?: string;
    created_at?: string;
    updated_at?: string;
}