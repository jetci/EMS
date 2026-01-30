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

// Initialize database connection with optimizations
const db = new Database(DB_PATH, {
    verbose: undefined,
    // Timeout for database operations (5 seconds)
    timeout: 5000
});

// ============================================
// SQLite Performance Optimizations
// ============================================

// Enable foreign keys (data integrity)
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrency
// WAL allows multiple readers and one writer simultaneously
db.pragma('journal_mode = WAL');

// Set busy timeout (wait up to 5 seconds if database is locked)
// This prevents "database is locked" errors under concurrent load
db.pragma('busy_timeout = 5000');

// Optimize cache size (10MB = 10000 pages of 1KB each)
// Larger cache = better performance for frequently accessed data
db.pragma('cache_size = -10000');

// Synchronous mode: NORMAL (good balance of safety and performance)
// FULL = safest but slowest, NORMAL = good compromise, OFF = fastest but risky
db.pragma('synchronous = NORMAL');

// Memory-mapped I/O (30MB)
// Improves read performance by mapping database file to memory
db.pragma('mmap_size = 30000000');

// Temp store in memory (faster temporary operations)
db.pragma('temp_store = MEMORY');

// Optimize page size (4KB is optimal for most systems)
db.pragma('page_size = 4096');

// Auto-vacuum: INCREMENTAL (prevents database file from growing indefinitely)
db.pragma('auto_vacuum = INCREMENTAL');

console.log('✅ SQLite database connection initialized with performance optimizations');
console.log('   - WAL mode: Enabled (concurrent reads)');
console.log('   - Busy timeout: 5000ms');
console.log('   - Cache size: 10MB');
console.log('   - Memory-mapped I/O: 30MB');
console.log('');

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
// Run initialization function (to be called from index.ts)
export const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing Database...');
        initializeSchema();
        await seedData();
        console.log('✅ Database initialization completed');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
};

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
    transaction: <T>(fn: () => T): T => {
        const transaction = db.transaction(fn);
        return transaction() as T;
    },

    // Health check
    healthCheck: (): { healthy: boolean; message: string; details?: any } => {
        try {
            // Try a simple query
            const result = db.prepare('SELECT 1 as test').get() as { test: number };

            if (result && result.test === 1) {
                // Get database stats
                const stats = {
                    walMode: db.pragma('journal_mode', { simple: true }),
                    cacheSize: db.pragma('cache_size', { simple: true }),
                    pageSize: db.pragma('page_size', { simple: true }),
                    foreignKeys: db.pragma('foreign_keys', { simple: true })
                };

                return {
                    healthy: true,
                    message: 'Database connection is healthy',
                    details: stats
                };
            } else {
                return {
                    healthy: false,
                    message: 'Database query returned unexpected result'
                };
            }
        } catch (error) {
            return {
                healthy: false,
                message: 'Database health check failed',
                details: error instanceof Error ? error.message : String(error)
            };
        }
    },

    // Get connection stats
    getStats: () => {
        try {
            return {
                isOpen: db.open,
                inTransaction: db.inTransaction,
                readonly: db.readonly,
                name: db.name,
                memory: db.memory
            };
        } catch (error) {
            console.error('Error getting database stats:', error);
            return null;
        }
    },

    // Optimize database (run VACUUM and ANALYZE)
    optimize: () => {
        try {
            console.log('🔧 Optimizing database...');

            // Incremental vacuum (reclaim unused space)
            db.pragma('incremental_vacuum');

            // Analyze database (update query planner statistics)
            db.exec('ANALYZE');

            console.log('✅ Database optimized successfully');
            return true;
        } catch (error) {
            console.error('❌ Error optimizing database:', error);
            return false;
        }
    },

    // Checkpoint WAL file (flush to main database)
    checkpoint: (mode: 'PASSIVE' | 'FULL' | 'RESTART' | 'TRUNCATE' = 'PASSIVE') => {
        try {
            const result = db.pragma(`wal_checkpoint(${mode})`);
            console.log(`✅ WAL checkpoint (${mode}) completed:`, result);
            return result;
        } catch (error) {
            console.error('❌ Error during WAL checkpoint:', error);
            return null;
        }
    },

    // Close database with cleanup
    close: () => {
        try {
            console.log('🔄 Closing database connection...');

            // Checkpoint WAL before closing
            sqliteDB.checkpoint('TRUNCATE');

            // Close connection
            db.close();

            console.log('✅ Database connection closed successfully');
        } catch (error) {
            console.error('❌ Error closing database:', error);
            throw error;
        }
    }
};

// ============================================
// Graceful Shutdown Handler
// ============================================

let isShuttingDown = false;

const gracefulShutdown = (signal: string) => {
    if (isShuttingDown) {
        console.log('⏳ Shutdown already in progress...');
        return;
    }

    isShuttingDown = true;
    console.log('');
    console.log(`📡 Received ${signal} signal`);
    console.log('🔄 Starting graceful shutdown...');

    try {
        // Close database connection
        sqliteDB.close();

        console.log('✅ Graceful shutdown completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
    }
};

// process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

// Handle uncaught errors
// process.on('uncaughtException', (error) => {
//     console.error('❌ Uncaught Exception:', error);
//     gracefulShutdown('uncaughtException');
// });

// process.on('unhandledRejection', (reason, promise) => {
//     console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
//     gracefulShutdown('unhandledRejection');
// });

// Export database instance for advanced usage
export default sqliteDB;
