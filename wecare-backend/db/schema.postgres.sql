-- EMS WeCare PostgreSQL Database Schema
-- Created: 2026-02-13
-- Purpose: Production schema for PostgreSQL
-- Enable UUID extension if we decide to use UUIDs later (optional but good practice)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK(
        role IN (
            'DEVELOPER',
            'admin',
            'OFFICER',
            'radio_center',
            'driver',
            'community',
            'EXECUTIVE'
        )
    ),
    full_name VARCHAR(255) NOT NULL,
    date_created TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
    phone VARCHAR(50),
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
-- ============================================
-- 2. PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(50),
    full_name VARCHAR(255) NOT NULL,
    national_id TEXT UNIQUE,
    dob VARCHAR(50),
    -- Keeping as string to match legacy app logic, or DATE if refactoring
    age INTEGER,
    gender VARCHAR(20),
    blood_type VARCHAR(10),
    rh_factor VARCHAR(10),
    health_coverage VARCHAR(255),
    contact_phone TEXT,
    key_info TEXT,
    caregiver_name VARCHAR(255),
    caregiver_phone TEXT,
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone TEXT,
    emergency_contact_relation VARCHAR(100),
    -- Address (ID Card)
    id_card_house_number VARCHAR(100),
    id_card_village VARCHAR(100),
    id_card_tambon VARCHAR(100),
    id_card_amphoe VARCHAR(100),
    id_card_changwat VARCHAR(100),
    -- Address (Current)
    current_house_number VARCHAR(100),
    current_village VARCHAR(100),
    current_tambon VARCHAR(100),
    current_amphoe VARCHAR(100),
    current_changwat VARCHAR(100),
    -- Location
    landmark TEXT,
    latitude VARCHAR(50),
    longitude VARCHAR(50),
    -- Medical Info (Store as JSONB for better query support)
    patient_types JSONB,
    chronic_diseases JSONB,
    allergies JSONB,
    -- Metadata
    profile_image_url TEXT,
    registered_date VARCHAR(50),
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    -- Soft delete
    FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_patients_created_by ON patients(created_by);
CREATE INDEX IF NOT EXISTS idx_patients_registered_date ON patients(registered_date);
CREATE INDEX IF NOT EXISTS idx_patients_village ON patients(current_village);
CREATE INDEX IF NOT EXISTS idx_patients_national_id ON patients(national_id);
-- ============================================
-- 2.1 PATIENT ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_attachments (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_patient_attachments_patient_id ON patient_attachments(patient_id);
-- ============================================
-- 3. VEHICLE TYPES TABLE (Created before vehicles due to FK)
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_types (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    capacity INTEGER,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- ============================================
-- 4. VEHICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(255) PRIMARY KEY,
    license_plate VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type_id VARCHAR(255),
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    color VARCHAR(50),
    capacity INTEGER,
    status VARCHAR(50) DEFAULT 'AVAILABLE' CHECK(
        status IN ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED')
    ),
    mileage INTEGER DEFAULT 0,
    last_maintenance_date VARCHAR(50),
    next_maintenance_date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
-- ============================================
-- 5. DRIVERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS drivers (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    license_number VARCHAR(100),
    license_expiry VARCHAR(50),
    status VARCHAR(50) DEFAULT 'AVAILABLE' CHECK(
        status IN (
            'AVAILABLE',
            'ON_TRIP',
            'OFFLINE',
            'INACTIVE',
            'ON_DUTY',
            'OFF_DUTY',
            'UNAVAILABLE'
        )
    ),
    current_vehicle_id VARCHAR(255),
    profile_image_url TEXT,
    total_trips INTEGER DEFAULT 0,
    trips_this_month INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (current_vehicle_id) REFERENCES vehicles(id)
);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
-- ============================================
-- 6. RIDES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rides (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50),
    driver_id VARCHAR(255),
    driver_name VARCHAR(255),
    vehicle_id VARCHAR(255),
    -- Trip Details
    pickup_location TEXT NOT NULL,
    pickup_lat VARCHAR(50),
    pickup_lng VARCHAR(50),
    village VARCHAR(100),
    landmark TEXT,
    destination TEXT NOT NULL,
    destination_lat VARCHAR(50),
    destination_lng VARCHAR(50),
    -- Timing
    appointment_time VARCHAR(50) NOT NULL,
    pickup_time VARCHAR(50),
    dropoff_time VARCHAR(50),
    -- Trip Info
    trip_type VARCHAR(100),
    special_needs JSONB,
    notes TEXT,
    distance_km REAL,
    -- Status
    status VARCHAR(50) DEFAULT 'PENDING' CHECK(
        status IN (
            'PENDING',
            'ASSIGNED',
            'IN_PROGRESS',
            'COMPLETED',
            'CANCELLED'
        )
    ),
    cancellation_reason TEXT,
    -- Metadata
    created_by VARCHAR(255),
    caregiver_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_rides_patient_id ON rides(patient_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_appointment_time ON rides(appointment_time);
CREATE INDEX IF NOT EXISTS idx_rides_created_by ON rides(created_by);
-- ============================================
-- 7. RIDE EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ride_events (
    id SERIAL PRIMARY KEY,
    ride_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    timestamp VARCHAR(50) NOT NULL,
    latitude VARCHAR(50),
    longitude VARCHAR(50),
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_ride_events_ride_id ON ride_events(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_events_timestamp ON ride_events(timestamp);
-- ============================================
-- 8. DRIVER LOCATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS driver_locations (
    id SERIAL PRIMARY KEY,
    driver_id VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    timestamp VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_id ON driver_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_timestamp ON driver_locations(timestamp);
-- ============================================
-- 9. TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    leader_id VARCHAR(255),
    member_ids JSONB,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- ============================================
-- 10. TEAM SHIFTS TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS team_shifts (
    id VARCHAR(255) PRIMARY KEY,
    team_id VARCHAR(255) NOT NULL,
    shift_date VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, shift_date),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS team_shift_assignments (
    id VARCHAR(255) PRIMARY KEY,
    team_shift_id VARCHAR(255) NOT NULL,
    vehicle_id VARCHAR(255),
    driver_id VARCHAR(255),
    helper_ids JSONB,
    properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_shift_id) REFERENCES team_shifts(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);
-- ============================================
-- 11. DRIVER SHIFTS TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS driver_shifts (
    id VARCHAR(255) PRIMARY KEY,
    driver_id VARCHAR(255) NOT NULL,
    shift_date VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(driver_id, shift_date),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
-- ============================================
-- 12. NEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id VARCHAR(255),
    author_name VARCHAR(255),
    category VARCHAR(100),
    tags JSONB,
    image_url TEXT,
    published_date VARCHAR(50),
    is_published INTEGER DEFAULT 0,
    -- Postgres usually prefers BOOLEAN, but keeping INT for code compat
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_news_published_date ON news(published_date);
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news(is_published);
-- ============================================
-- 12. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    timestamp VARCHAR(50) NOT NULL,
    hash VARCHAR(255),
    previous_hash VARCHAR(255),
    sequence_number BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
-- ============================================
-- 13. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
-- ============================================
-- 14. MAP DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS map_data (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    coordinates TEXT NOT NULL,
    -- Keeping as TEXT because logic probably parses custom format
    properties JSONB,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
