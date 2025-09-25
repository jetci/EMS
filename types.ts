export enum RideStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  EN_ROUTE_TO_PICKUP = 'EN_ROUTE_TO_PICKUP', // Driver is on the way to the patient
  ARRIVED_AT_PICKUP = 'ARRIVED_AT_PICKUP',   // Driver has arrived at the pickup location
  IN_PROGRESS = 'IN_PROGRESS',             // Patient is in the vehicle
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum DriverStatus {
    AVAILABLE = 'AVAILABLE',
    ON_TRIP = 'ON_TRIP',
    OFFLINE = 'OFFLINE',
    INACTIVE = 'INACTIVE',
}

export interface Ride {
  id: string;
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
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: 'driver' | 'community' | 'office' | 'admin' | 'OFFICER' | 'EXECUTIVE' | 'DEVELOPER';
  phone?: string;
  profileImageUrl?: string;
}

export type UserStatus = 'Active' | 'Inactive';

export interface ManagedUser {
    id: string;
    fullName: string;
    email: string;
    role: User['role'];
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
    
    // Attachments
    attachments: Attachment[];

    // Metadata
    registeredDate: string; // ISO String
    registeredBy: string; // Community User Name or ID
    keyInfo: string; // Summary of key conditions
    caregiverName?: string;
    caregiverPhone?: string;
}


export interface Driver {
    id: string;
    fullName: string;
    phone: string;
    licensePlate: string;
    status: DriverStatus;
    profileImageUrl?: string;
    email: string;
    address: string;
    vehicleBrand: string;
    vehicleModel: string;
    vehicleColor: string;
    tripsThisMonth: number;
    vehicleType: string;
    totalTrips: number;
    avgReviewScore: number;
    dateCreated?: string;
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
  userRole: User['role'];
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
    role: User['role'];
    action: string;
}

export interface SystemSettings {
    appName: string;
    organizationName: string;
    // FIX: Changed property `contactInfo` to `contactEmail` to align with its usage in the settings page.
    contactEmail: string;
    logoUrl?: string;
    googleRecaptchaSiteKey: string;
    googleRecaptchaSecretKey: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    schedulingModel: 'individual' | 'team';
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export enum VehicleStatus {
    AVAILABLE = 'พร้อมใช้งาน',
    MAINTENANCE = 'ซ่อมบำรุง',
    ASSIGNED = 'ผูกกับทีมแล้ว',
}

export interface Vehicle {
    id: string;
    licensePlate: string;
    model: string;
    brand: string;
    type: string;
    status: VehicleStatus;
    assignedTeamId?: string;
    nextMaintenanceDate?: string;
}

export interface VehicleType {
  id: string;
  name: string;
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
    status: TeamShiftStatus;
    vehicleId?: string;
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
}


export type CommunityView = 'dashboard' | 'patients' | 'rides' | 'profile' | 'register_patient' | 'request_ride' | 'patient_detail' | 'ride_details';
export type DriverView = 'today_jobs' | 'history' | 'profile';
export type OfficeView = 'dashboard' | 'rides' | 'patients' | 'drivers' | 'profile' | 'manage_teams' | 'manage_schedules' | 'news' | 'edit_news' | 'reports';
export type AdminView = 'dashboard' | 'users' | 'rides' | 'patients' | 'drivers' | 'news' | 'logs' | 'settings' | 'profile' | 'test_map' | 'manage_teams' | 'manage_schedules' | 'manage_vehicles' | 'manage_vehicle_types' | 'edit_news' | 'reports';
export type ExecutiveView = 'executive_dashboard';
export type AuthenticatedView = CommunityView | DriverView | OfficeView | AdminView | ExecutiveView;