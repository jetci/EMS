import { Pool } from 'pg';
import { hashPassword } from '../utils/password';

// PostgreSQL Database Helper
// Implements the same interface as sqliteDB but with async methods and PG syntax

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: 20, // Max clients in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased for serverless cold starts
});

// Test connection on startup
pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
});

// Embedded Schema for Serverless Resilience
const SCHEMA_SQL = `
-- EMS WeCare PostgreSQL Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_created TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    phone VARCHAR(50),
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(50),
    full_name VARCHAR(255) NOT NULL,
    national_id VARCHAR(50) UNIQUE,
    dob VARCHAR(50),
    age INTEGER,
    gender VARCHAR(20),
    blood_type VARCHAR(10),
    rh_factor VARCHAR(10),
    health_coverage VARCHAR(255),
    contact_phone VARCHAR(50),
    key_info TEXT,
    caregiver_name VARCHAR(255),
    caregiver_phone VARCHAR(50),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relation VARCHAR(100),
    id_card_house_number VARCHAR(100),
    id_card_village VARCHAR(100),
    id_card_tambon VARCHAR(100),
    id_card_amphoe VARCHAR(100),
    id_card_changwat VARCHAR(100),
    current_house_number VARCHAR(100),
    current_village VARCHAR(100),
    current_tambon VARCHAR(100),
    current_amphoe VARCHAR(100),
    current_changwat VARCHAR(100),
    landmark TEXT,
    latitude VARCHAR(50),
    longitude VARCHAR(50),
    patient_types JSONB,
    chronic_diseases JSONB,
    allergies JSONB,
    profile_image_url TEXT,
    registered_date VARCHAR(50),
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

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

CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(255) PRIMARY KEY,
    license_plate VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type_id VARCHAR(255),
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    color VARCHAR(50),
    capacity INTEGER,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    mileage INTEGER DEFAULT 0,
    last_maintenance_date VARCHAR(50),
    next_maintenance_date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
);

CREATE TABLE IF NOT EXISTS drivers (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    license_number VARCHAR(100),
    license_expiry VARCHAR(50),
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    current_vehicle_id VARCHAR(255),
    profile_image_url TEXT,
    total_trips INTEGER DEFAULT 0,
    trips_this_month INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (current_vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE IF NOT EXISTS rides (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50),
    driver_id VARCHAR(255),
    driver_name VARCHAR(255),
    vehicle_id VARCHAR(255),
    pickup_location TEXT NOT NULL,
    pickup_lat VARCHAR(50),
    pickup_lng VARCHAR(50),
    village VARCHAR(100),
    landmark TEXT,
    destination TEXT NOT NULL,
    destination_lat VARCHAR(50),
    destination_lng VARCHAR(50),
    appointment_time VARCHAR(50) NOT NULL,
    pickup_time VARCHAR(50),
    dropoff_time VARCHAR(50),
    trip_type VARCHAR(100),
    special_needs JSONB,
    notes TEXT,
    distance_km REAL,
    status VARCHAR(50) DEFAULT 'PENDING',
    cancellation_reason TEXT,
    created_by VARCHAR(255),
    caregiver_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

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
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

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

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS map_data (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    coordinates TEXT NOT NULL,
    properties JSONB,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
`;

// Initialize Schema
export const initializeSchema = async () => {
    try {
        console.log('📜 Initializing database schema...');
        await pool.query(SCHEMA_SQL);
        console.log('✅ PostgreSQL schema initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing PostgreSQL schema:', error);
        throw error;
    }
};

// Seed Data
export const seedData = async () => {
    try {
        const hashedPassword = await hashPassword('password123');
        const userCountResult = await pool.query('SELECT COUNT(*) as count FROM users');
        const userCount = parseInt(userCountResult.rows[0].count);

        if (userCount === 0) {
            console.log('🌱 Seeding initial data...');
            const users = [
                { id: 'USR-ADMIN', email: 'admin@wecare.ems', role: 'admin', full_name: 'System Administrator' },
                { id: 'USR-DEV', email: 'dev@wecare.ems', role: 'DEVELOPER', full_name: 'System Developer' },
                { id: 'USR-RADIO', email: 'office1@wecare.dev', role: 'radio_center', full_name: 'Radio Center Operator' },
                { id: 'USR-RADIO-CENTER', email: 'radio_center@wecare.dev', role: 'radio_center', full_name: 'Radio Center Chief' },
                { id: 'USR-OFFICER', email: 'officer1@wecare.dev', role: 'OFFICER', full_name: 'EMS Officer' },
                { id: 'USR-DRIVER', email: 'driver1@wecare.dev', role: 'driver', full_name: 'Ambulance Driver' },
                { id: 'USR-COMMUNITY', email: 'community1@wecare.dev', role: 'community', full_name: 'Community Volunteer' },
                { id: 'USR-EXEC', email: 'executive1@wecare.dev', role: 'EXECUTIVE', full_name: 'Hospital Executive' }
            ];

            for (const user of users) {
                await pool.query(
                    "INSERT INTO users (id, email, password, role, full_name, date_created, status) VALUES ($1, $2, $3, $4, $5, NOW(), 'Active')",
                    [user.id, user.email, hashedPassword, user.role, user.full_name]
                );
            }
            console.log('✅ Initial users seeded');
        }

        const driverCount = await pool.query('SELECT COUNT(*) as count FROM drivers');
        if (parseInt(driverCount.rows[0].count) === 0) {
            await pool.query(
                'INSERT INTO drivers (id, user_id, full_name, phone, license_number, license_expiry, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())',
                ['DRV-001', 'USR-DRIVER', 'Ambulance Driver', '081-234-5678', 'DL-12345', '2030-12-31', 'AVAILABLE']
            );
            console.log('✅ Driver profile seeded');
        }
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    }
};

export const initializeDatabase = async () => {
    if (!process.env.DATABASE_URL) {
        console.warn('⚠️ DATABASE_URL not set. Skipping Postgres initialization.');
        return;
    }
    try {
        // Minimal connection test
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL');
        client.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        // Don't throw here to allow app to start and show specific errors on routes
    }
};

/**
 * Manual initialization for schema and seeding
 * Use this only in development or via migration scripts
 */
export const ensureSchema = async () => {
    try {
        const checkTable = await pool.query("SELECT to_regclass('public.users')");
        if (!checkTable.rows[0].to_regclass) {
            await initializeSchema();
            await seedData();
        }
    } catch (error) {
        console.error('❌ Schema initialization failed:', error);
        throw error;
    }
};

export const db = {
    pool, // Expose pool for legacy middleware (like idempotency.ts)
    query: (sql: string, params: any[] = []) => pool.query(sql, params),
    all: async <T>(sql: string, params: any[] = []): Promise<T[]> => {
        const res = await pool.query(sql, params);
        return res.rows;
    },
    get: async <T>(sql: string, params: any[] = []): Promise<T | undefined> => {
        const res = await pool.query(sql, params);
        return res.rows[0];
    },
    run: async (sql: string, params: any[] = []): Promise<{ changes: number; rowCount: number }> => {
        const res = await pool.query(sql, params);
        const count = res.rowCount ?? 0;
        return { changes: count, rowCount: count };
    },
    transaction: async <T>(callback: (client: any) => Promise<T>): Promise<T> => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },
    insert: async (table: string, data: Record<string, any>) => {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const res = await pool.query(sql, values);
        return res.rows[0];
    },
    update: async (table: string, id: string, data: Record<string, any>) => {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        const sql = `UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`;
        const res = await pool.query(sql, [...values, id]);
        return res.rows[0];
    },
    delete: async (table: string, id: string): Promise<{ changes: number; rowCount: number }> => {
        const res = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
        const count = res.rowCount ?? 0;
        return { changes: count, rowCount: count };
    },
    findById: async <T>(table: string, id: string): Promise<T | undefined> => {
        const res = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
        return res.rows[0];
    },
    healthCheck: async () => {
        try {
            await pool.query('SELECT 1');
            return { healthy: true, message: 'Connected to PostgreSQL' };
        } catch (e: any) {
            return { healthy: false, message: e.message };
        }
    }
};

export default db;
