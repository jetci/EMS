-- EMS WeCare Database Schema for MySQL
-- Database: wiangwec_wecare

-- Drop tables if exist (for clean install)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS news_articles;
DROP TABLE IF EXISTS rides;
DROP TABLE IF EXISTS driver_profiles;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    profile_image_url VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vehicles Table
CREATE TABLE vehicles (
    id VARCHAR(36) PRIMARY KEY,
    license_plate VARCHAR(50) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    assigned_team_id VARCHAR(36),
    next_maintenance_date DATE,
    INDEX idx_license_plate (license_plate),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Driver Profiles Table
CREATE TABLE driver_profiles (
    user_id VARCHAR(36) PRIMARY KEY,
    license_plate VARCHAR(50) NOT NULL,
    address TEXT,
    vehicle_id VARCHAR(36),
    avg_review_score DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    INDEX idx_vehicle_id (vehicle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Patients Table
CREATE TABLE patients (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(255),
    title VARCHAR(50),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    gender VARCHAR(50),
    national_id VARCHAR(20) UNIQUE,
    dob DATE,
    age VARCHAR(20),
    patient_types TEXT,
    blood_type VARCHAR(10),
    rh_factor VARCHAR(10),
    health_coverage VARCHAR(100),
    chronic_diseases TEXT,
    allergies TEXT,
    contact_phone VARCHAR(50) NOT NULL,
    id_card_address TEXT,
    current_address TEXT NOT NULL,
    landmark TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    registered_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    registered_by_id VARCHAR(36) NOT NULL,
    key_info TEXT,
    caregiver_name VARCHAR(255),
    caregiver_phone VARCHAR(50),
    FOREIGN KEY (registered_by_id) REFERENCES users(id),
    INDEX idx_national_id (national_id),
    INDEX idx_registered_by (registered_by_id),
    INDEX idx_full_name (full_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rides Table
CREATE TABLE rides (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    requester_id VARCHAR(36) NOT NULL,
    pickup_location TEXT NOT NULL,
    destination VARCHAR(255) NOT NULL,
    appointment_time DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    driver_id VARCHAR(36),
    vehicle_id VARCHAR(36),
    special_needs TEXT,
    caregiver_count INT NOT NULL DEFAULT 0,
    rating INT,
    review_tags TEXT,
    review_comment TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    INDEX idx_patient_id (patient_id),
    INDEX idx_requester_id (requester_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_status (status),
    INDEX idx_appointment_time (appointment_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- News Articles Table
CREATE TABLE news_articles (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    published_date DATETIME,
    scheduled_date DATETIME,
    featured_image_url VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_published_date (published_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs Table
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_email VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_id VARCHAR(36),
    ip_address VARCHAR(45) NOT NULL,
    data_payload TEXT,
    INDEX idx_timestamp (timestamp),
    INDEX idx_user_email (user_email),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
