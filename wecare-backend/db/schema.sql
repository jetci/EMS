-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'USR-' || substr(uuid_generate_v4()::text, 1, 8),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'radio_center', 'officer', 'driver', 'community', 'executive', 'developer')),
    phone VARCHAR(50),
    profile_image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'PAT-' || substr(uuid_generate_v4()::text, 1, 8),
    full_name VARCHAR(255) NOT NULL,
    patient_types JSONB NOT NULL,
    key_info JSONB NOT NULL,
    chronic_diseases JSONB,
    allergies JSONB,
    id_card_address JSONB,
    current_address JSONB,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    attachments JSONB,
    registered_by_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    registered_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'DRV-' || substr(uuid_generate_v4()::text, 1, 8),
    full_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('AVAILABLE', 'ON_TRIP', 'OFFLINE', 'INACTIVE')),
    license_plate VARCHAR(50),
    avg_review_score DECIMAL(3, 2),
    top_compliments JSONB
);

-- Rides table
CREATE TABLE IF NOT EXISTS rides (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'RIDE-' || substr(uuid_generate_v4()::text, 1, 8),
    patient_id VARCHAR(255) NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    driver_id VARCHAR(255) REFERENCES drivers(id) ON DELETE SET NULL,
    requested_by_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'ASSIGNED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    appointment_time TIMESTAMPTZ NOT NULL,
    pickup_location TEXT NOT NULL,
    destination TEXT NOT NULL,
    pickup_coordinates JSONB,
    special_needs JSONB,
    caregiver_count INTEGER DEFAULT 0,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_tags JSONB,
    review_comment TEXT,
    signature_data_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'TEAM-' || substr(uuid_generate_v4()::text, 1, 8),
    name VARCHAR(255) NOT NULL,
    driver_id VARCHAR(255) NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    staff_ids JSONB NOT NULL
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'VEH-' || substr(uuid_generate_v4()::text, 1, 8),
    license_plate VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    status VARCHAR(50) NOT NULL CHECK (status IN ('AVAILABLE', 'MAINTENANCE', 'ASSIGNED')),
    assigned_team_id VARCHAR(255) REFERENCES teams(id) ON DELETE SET NULL,
    next_maintenance_date DATE
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(255),
    record_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rides_patient_id ON rides(patient_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_appointment_time ON rides(appointment_time);
CREATE INDEX IF NOT EXISTS idx_patients_registered_by_id ON patients(registered_by_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON users;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp ON rides;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON rides
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
