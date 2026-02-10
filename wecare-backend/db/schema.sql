-- EMS WeCare SQLite Database Schema
-- Created: 2026-01-01
-- Purpose: Migrate from JSON to SQLite for better data integrity and performance

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('DEVELOPER', 'admin', 'OFFICER', 'radio', 'radio_center', 'driver', 'community', 'EXECUTIVE')),
    full_name TEXT NOT NULL,
    date_created TEXT NOT NULL,
    status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    national_id TEXT UNIQUE,
    dob TEXT,
    age INTEGER,
    gender TEXT,
    blood_type TEXT,
    rh_factor TEXT,
    health_coverage TEXT,
    contact_phone TEXT,
    
    -- Address (ID Card)
    id_card_house_number TEXT,
    id_card_village TEXT,
    id_card_tambon TEXT,
    id_card_amphoe TEXT,
    id_card_changwat TEXT,
    
    -- Address (Current)
    current_house_number TEXT,
    current_village TEXT,
    current_tambon TEXT,
    current_amphoe TEXT,
    current_changwat TEXT,
    
    -- Location
    landmark TEXT,
    latitude TEXT,
    longitude TEXT,
    
    -- Medical Info (stored as JSON)
    patient_types TEXT, -- JSON array
    chronic_diseases TEXT, -- JSON array
    allergies TEXT, -- JSON array
    
    -- Metadata
    profile_image_url TEXT,
    registered_date TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================
-- 2.1 PATIENT ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_attachments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ============================================
-- 3. DRIVERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    license_number TEXT,
    license_expiry TEXT,
    status TEXT DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'UNAVAILABLE')),
    current_vehicle_id TEXT,
    profile_image_url TEXT,
    total_trips INTEGER DEFAULT 0,
    trips_this_month INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (current_vehicle_id) REFERENCES vehicles(id)
);

-- ============================================
-- 4. VEHICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    license_plate TEXT UNIQUE NOT NULL,
    vehicle_type_id TEXT,
    brand TEXT,
    model TEXT,
    year INTEGER,
    color TEXT,
    capacity INTEGER,
    status TEXT DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED')),
    mileage INTEGER DEFAULT 0,
    last_maintenance_date TEXT,
    next_maintenance_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
);

-- ============================================
-- 5. VEHICLE TYPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_types (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    capacity INTEGER,
    features TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. RIDES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rides (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT,
    driver_id TEXT,
    driver_name TEXT,
    vehicle_id TEXT,
    
    -- Trip Details
    pickup_location TEXT NOT NULL,
    pickup_lat TEXT,
    pickup_lng TEXT,
    village TEXT,
    landmark TEXT,
    destination TEXT NOT NULL,
    destination_lat TEXT,
    destination_lng TEXT,
    
    -- Timing
    appointment_time TEXT NOT NULL,
    pickup_time TEXT,
    dropoff_time TEXT,
    
    -- Trip Info
    trip_type TEXT,
    special_needs TEXT, -- JSON array
    notes TEXT,
    distance_km REAL,
    
    -- Status
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    cancellation_reason TEXT,
    
    -- Metadata
    created_by TEXT,
    caregiver_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================
-- 7. RIDE EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ride_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    latitude TEXT,
    longitude TEXT,
    notes TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ride_id) REFERENCES rides(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================
-- 8. DRIVER LOCATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS driver_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL,
    heading REAL,
    speed REAL,
    timestamp TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- ============================================
-- 9. TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    leader_id TEXT,
    member_ids TEXT, -- JSON array
    status TEXT DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (leader_id) REFERENCES users(id)
);

-- ============================================
-- 10. NEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT,
    author_name TEXT,
    category TEXT,
    tags TEXT, -- JSON array
    image_url TEXT,
    published_date TEXT,
    is_published INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- ============================================
-- 11. AUDIT LOGS TABLE (with Hash Chain Integrity)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    user_email TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details TEXT, -- JSON
    ip_address TEXT,
    user_agent TEXT,
    timestamp TEXT NOT NULL,
    hash TEXT, -- SHA-256 hash of this log entry
    previous_hash TEXT, -- Hash of previous log (blockchain-like chain)
    sequence_number INTEGER, -- Sequential number for ordering
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- 12. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- ============================================
-- 13. MAP DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS map_data (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    coordinates TEXT NOT NULL, -- JSON
    properties TEXT, -- JSON
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Patients
CREATE INDEX IF NOT EXISTS idx_patients_created_by ON patients(created_by);
CREATE INDEX IF NOT EXISTS idx_patients_registered_date ON patients(registered_date);
CREATE INDEX IF NOT EXISTS idx_patients_village ON patients(current_village);
CREATE INDEX IF NOT EXISTS idx_patient_attachments_patient_id ON patient_attachments(patient_id);

-- Drivers
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);

-- Rides
CREATE INDEX IF NOT EXISTS idx_rides_patient_id ON rides(patient_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_appointment_time ON rides(appointment_time);
CREATE INDEX IF NOT EXISTS idx_rides_created_by ON rides(created_by);

-- Ride Events
CREATE INDEX IF NOT EXISTS idx_ride_events_ride_id ON ride_events(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_events_timestamp ON ride_events(timestamp);

-- Driver Locations
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_id ON driver_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_timestamp ON driver_locations(timestamp);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- News
CREATE INDEX IF NOT EXISTS idx_news_published_date ON news(published_date);
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news(is_published);
