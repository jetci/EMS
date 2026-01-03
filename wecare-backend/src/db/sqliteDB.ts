import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// SQLite Database helper for EMS WeCare
// Replaces JSON-based storage with proper relational database

const DB_PATH = path.join(__dirname, '..', '..', 'db', 'wecare.db');
const SCHEMA_PATH = path.join(__dirname, '..', '..', 'db', 'schema.sql');

// Ensure db directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

import { hashPassword } from '../utils/password';

// Initialize schema
export const initializeSchema = () => {
    try {
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
        db.exec(schema);
        console.log('✅ SQLite database schema initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing database schema:', error);
        throw error;
    }
};

// Seed initial data
export const seedData = async () => {
    try {
        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

        if (userCount.count === 0) {
            console.log('🌱 Seeding initial data...');

            const hashedPassword = await hashPassword('password123');

            // Create Admin User
            const adminUser = {
                id: 'USR-ADMIN',
                email: 'admin@wecare.ems',
                password: hashedPassword,
                role: 'admin',
                full_name: 'System Administrator',
                date_created: new Date().toISOString(),
                status: 'Active'
            };

            // Create Developer User
            const devUser = {
                id: 'USR-DEV',
                email: 'dev@wecare.ems',
                password: hashedPassword,
                role: 'DEVELOPER',
                full_name: 'System Developer',
                date_created: new Date().toISOString(),
                status: 'Active'
            };

            // Create Radio Center User
            const radioUser = {
                id: 'USR-RADIO',
                email: 'office1@wecare.dev',
                password: hashedPassword,
                role: 'radio',
                full_name: 'Radio Center Operator',
                date_created: new Date().toISOString(),
                status: 'Active'
            };

            // Create Officer User
            const officerUser = {
                id: 'USR-OFFICER',
                email: 'officer1@wecare.dev',
                password: hashedPassword,
                role: 'OFFICER',
                full_name: 'EMS Officer',
                date_created: new Date().toISOString(),
                status: 'Active'
            };

            // Create Driver User
            const driverUser = {
                id: 'USR-DRIVER',
                email: 'driver1@wecare.dev',
                password: hashedPassword,
                role: 'driver',
                full_name: 'Ambulance Driver',
                date_created: new Date().toISOString(),
                status: 'Active'
            };

            // Create Community User
            const communityUser = {
                id: 'USR-COMMUNITY',
                email: 'community1@wecare.dev',
                password: hashedPassword,
                role: 'community',
                full_name: 'Community Volunteer',
                date_created: new Date().toISOString(),
                status: 'Active'
            };

            // Create Executive User
            const executiveUser = {
                id: 'USR-EXEC',
                email: 'executive1@wecare.dev',
                password: hashedPassword,
                role: 'EXECUTIVE',
                full_name: 'Hospital Executive',
                date_created: new Date().toISOString(),
                status: 'Active'
            };

            const insertUser = db.prepare(`
                INSERT INTO users (id, email, password, role, full_name, date_created, status)
                VALUES (@id, @email, @password, @role, @full_name, @date_created, @status)
            `);

            insertUser.run(adminUser);
            insertUser.run(devUser);
            insertUser.run(radioUser);
            insertUser.run(officerUser);
            insertUser.run(driverUser);
            insertUser.run(communityUser);
            insertUser.run(executiveUser);

            console.log('✅ Initial users seeded for all roles (password123)');
        }

        // Seed Driver Profile if not exists
        const driverCount = db.prepare('SELECT COUNT(*) as count FROM drivers').get() as { count: number };

        if (driverCount.count === 0) {
            // Ensure USR-DRIVER exists before seeding profile
            const driverUser = db.prepare('SELECT id FROM users WHERE id = ?').get('USR-DRIVER');

            if (driverUser) {
                const driverProfile = {
                    id: 'DRV-001',
                    user_id: 'USR-DRIVER',
                    full_name: 'Ambulance Driver',
                    phone: '081-234-5678',
                    license_number: 'DL-12345',
                    license_expiry: '2030-12-31',
                    status: 'AVAILABLE',
                    total_trips: 0,
                    trips_this_month: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                const insertDriver = db.prepare(`
                    INSERT INTO drivers (id, user_id, full_name, phone, license_number, license_expiry, status, total_trips, trips_this_month, created_at, updated_at)
                    VALUES (@id, @user_id, @full_name, @phone, @license_number, @license_expiry, @status, @total_trips, @trips_this_month, @created_at, @updated_at)
                `);

                insertDriver.run(driverProfile);
                console.log('✅ Initial driver profile seeded');
            }
        }
    } catch (error) {
        console.error('❌ Error seeding data:', error);
    }
};

// Run initialization
initializeSchema();
seedData();

// Whitelist of allowed table names to prevent SQL injection
const ALLOWED_TABLES = [
    'users',
    'patients',
    'rides',
    'drivers',
    'vehicles',
    'vehicle_types',
    'teams',
    'news',
    'audit_logs',
    'system_settings',
    'map_data',
    'ride_events',
    'driver_locations',
    'patient_attachments'
];

// Validate table name to prevent SQL injection
const validateTableName = (table: string): void => {
    if (!ALLOWED_TABLES.includes(table)) {
        throw new Error(`Invalid table name: "${table}". Possible SQL injection attempt.`);
    }
};

// Generic database helper functions
export const sqliteDB = {
    // Direct access to database instance
    db: db,

    // Get database instance
    getInstance: () => db,

    // Execute raw SQL
    exec: (sql: string) => {
        return db.exec(sql);
    },

    // Prepare statement
    prepare: (sql: string) => {
        return db.prepare(sql);
    },

    // Get all records
    all: <T>(sql: string, params: any[] = []): T[] => {
        const stmt = db.prepare(sql);
        return stmt.all(...params) as T[];
    },

    // Get single record
    get: <T>(sql: string, params: any[] = []): T | undefined => {
        const stmt = db.prepare(sql);
        return stmt.get(...params) as T | undefined;
    },

    // Insert record
    insert: (table: string, data: Record<string, any>): any => {
        validateTableName(table);
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        const stmt = db.prepare(sql);
        return stmt.run(...values);
    },

    // Update record
    update: (table: string, id: string, data: Record<string, any>): any => {
        validateTableName(table);
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const sql = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const stmt = db.prepare(sql);
        return stmt.run(...values, id);
    },

    // Delete record
    delete: (table: string, id: string): any => {
        validateTableName(table);
        const sql = `DELETE FROM ${table} WHERE id = ?`;
        const stmt = db.prepare(sql);
        return stmt.run(id);
    },

    // Find by ID
    findById: <T>(table: string, id: string): T | undefined => {
        validateTableName(table);
        const sql = `SELECT * FROM ${table} WHERE id = ?`;
        return sqliteDB.get<T>(sql, [id]);
    },

    // Find all
    findAll: <T>(table: string, where?: string, params: any[] = []): T[] => {
        validateTableName(table);
        const sql = where
            ? `SELECT * FROM ${table} WHERE ${where}`
            : `SELECT * FROM ${table}`;
        return sqliteDB.all<T>(sql, params);
    },

    // Transaction
    transaction: (fn: () => void) => {
        const transaction = db.transaction(fn);
        return transaction();
    },

    // Close database
    close: () => {
        db.close();
    }
};

// Export database instance for advanced usage
export default sqliteDB;
