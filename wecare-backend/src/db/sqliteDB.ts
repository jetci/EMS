import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// SQLite Database helper for EMS WeCare
// Replaces JSON-based storage with proper relational database

const TEST_DB_SUFFIX = process.env.JEST_WORKER_ID ? `_${process.env.JEST_WORKER_ID}` : '';
const DB_FILENAME = process.env.NODE_ENV === 'test' ? `wecare_test${TEST_DB_SUFFIX}.db` : 'wecare.db'
const DEFAULT_DB_PATH = path.join(__dirname, '..', '..', 'db', DB_FILENAME);
const DB_PATH = (() => {
    const envPath = process.env.DB_PATH?.trim();
    if (!envPath) return DEFAULT_DB_PATH;
    return path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
})();
const SCHEMA_PATH = path.join(__dirname, '..', '..', 'db', 'schema.sql');

// Ensure db directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// In test environment, reset database file to ensure clean state for each run
if (process.env.NODE_ENV === 'test') {
    try {
        const disableDbReset = process.env.DISABLE_DB_RESET === 'true';
        if (disableDbReset) {
            console.warn('⚠️ DISABLE_DB_RESET=true: Skipping test DB reset for this run');
        } else if (fs.existsSync(DB_PATH)) {
            fs.unlinkSync(DB_PATH);
            console.log('🧪 Reset test database file');
        }
    } catch (e) {
        console.warn('⚠️ Failed to reset test database file:', e);
    }
} else {
    // Hard guard: never delete DB file outside test environment
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        // No operation: ensure no code path removes DB file in non-test env
        // If any future code attempts to delete, log a critical warning
        if (!fs.existsSync(DB_PATH)) {
            console.warn('⚠️ WARNING: DB file missing in non-test environment. Ensure persistence and backup/restore process.');
        }
    }
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

        // Set initial schema version if not set
        const currentVersion = db.pragma('user_version', { simple: true }) as number;
        if (!currentVersion || currentVersion === 0) {
            db.pragma('user_version = 1');
            console.log('🔖 Set initial schema version to 1');
        }
    } catch (error) {
        console.error('❌ Error initializing database schema:', error);
        throw error;
    }
};

// Seed initial data
export const seedData = async () => {
    try {
        // Always compute the standard test password hash for normalization
        const hashedPassword = await hashPassword('password123');

        const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

        if (userCount.count === 0) {
            console.log('🌱 Seeding initial data...');

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
                role: 'radio_center',
                full_name: 'Radio Center Operator',
                date_created: new Date().toISOString(),
                status: 'Active'
            };

            // Create Radio Center Chief User
            const radioCenterUser = {
                id: 'USR-RADIO-CENTER',
                email: 'radio_center@wecare.dev',
                password: hashedPassword,
                role: 'radio_center',
                full_name: 'Radio Center Chief',
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
            insertUser.run(radioCenterUser);
            insertUser.run(officerUser);
            insertUser.run(driverUser);
            insertUser.run(communityUser);
            insertUser.run(executiveUser);

            console.log('✅ Initial users seeded for all roles (password123)');
        }

        // Normalize existing test accounts to use the standard password (password123)
        const testAccounts = [
            'admin@wecare.ems',
            'admin@wecare.dev',
            'dev@wecare.ems',
            'office1@wecare.dev',
            'radio_center@wecare.dev',
            'officer1@wecare.dev',
            'driver1@wecare.dev',
            'community1@wecare.dev',
            'executive1@wecare.dev'
        ];

        const updateStmt = db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?');
        for (const email of testAccounts) {
            const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string } | undefined;
            if (existing) {
                updateStmt.run(hashedPassword, email);
            }
        }
        console.log('🔧 Normalized test account passwords to password123 (where applicable)');

        // Ensure essential test accounts exist even if DB was seeded earlier
        const ensureUser = db.prepare(`
            INSERT OR IGNORE INTO users (id, email, password, role, full_name, date_created, status)
            VALUES (@id, @email, @password, @role, @full_name, @date_created, @status)
        `);

        ensureUser.run({
            id: 'USR-RADIO-CENTER',
            email: 'radio_center@wecare.dev',
            password: hashedPassword,
            role: 'radio_center',
            full_name: 'Radio Center Chief',
            date_created: new Date().toISOString(),
            status: 'Active'
        });

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
                console.log('✅ Driver profile seeded');
            }
        }

        // ... existing code ...
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    }
};

// Run initialization
// Run initialization function (to be called from index.ts)
export const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing Database...');
        initializeSchema();
        // Run migrations if needed
        applyMigrationsIfNeeded();

        // Ensure soft delete support for patients table in all environments (including tests)
        try {
            const columns = db.prepare("PRAGMA table_info(patients)").all() as any[];
            const hasDeletedAt = columns.some(c => c.name === 'deleted_at');
            if (!hasDeletedAt) {
                db.exec("ALTER TABLE patients ADD COLUMN deleted_at TEXT");
                console.log('🗑️  Added deleted_at to patients (initializeDatabase)');
            }
        } catch (e) {
            console.warn('⚠️  Could not ensure deleted_at column on patients:', e);
        }

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

    // Run statement (for UPDATE/INSERT/DELETE with params)
    run: (sql: string, params: any[] = []): any => {
        const stmt = db.prepare(sql);
        return stmt.run(...params);
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

// Migration runner: apply migration SQL files based on PRAGMA user_version
function backupBeforeMigrate(currentVersion: number, latestVersion: number): void {
    try {
        // Always create a safety backup when initializeDatabase runs migrations flow
        const backupsDir = path.join(__dirname, '..', '..', 'backups');
        if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir, { recursive: true });
        }
        // Checkpoint WAL to ensure backup consistency
        try { sqliteDB.checkpoint('FULL'); } catch {}
        const timestamp = new Date().toISOString()
            .replace(/:/g, '-')
            .replace(/\..+/, '')
            .replace('T', '_');
        const safetyFilename = `wecare_before_migrate_${timestamp}.db`;
        const safetyPath = path.join(backupsDir, safetyFilename);
        fs.copyFileSync(DB_PATH, safetyPath);
        console.log(`📦 Safety backup created before migration: ${safetyFilename}`);
    } catch (backupErr) {
        console.warn('⚠️ Failed to create safety backup before migration:', backupErr);
    }
}

// Helper to check if a column exists in a table (for idempotent migrations)
function hasColumn(table: string, column: string): boolean {
    try {
        const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
        return rows.some(r => r.name === column);
    } catch (e) {
        return false;
    }
}

function getCreateTableSql(table: string): string {
    try {
        const row = db.prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?`).get(table) as { sql?: string } | undefined;
        return row?.sql || '';
    } catch {
        return '';
    }
}

function applyMigrationsIfNeeded(): void {
    try {
        const migrationsDir = path.join(__dirname, '..', '..', 'db', 'migrations');
        const currentVersion = db.pragma('user_version', { simple: true }) as number;

        if (!fs.existsSync(migrationsDir)) {
            console.log('ℹ️ No migrations directory found');
            return;
        }

        // Define ordered migrations with target versions
        const migrationFiles: Array<{ version: number; file: string }> = [
            { version: 2, file: 'add_missing_patient_fields.sql' },
            { version: 3, file: 'add_title_column.sql' },
            { version: 4, file: 'add_emergency_contact.sql' },
            { version: 5, file: 'add_user_profile_fields.sql' },
            { version: 6, file: 'add_caregiver_and_key_info.sql' },
            { version: 7, file: 'add_rides_location_columns.sql' },
            { version: 8, file: 'rebuild_users_remove_radio_role.sql' },
            { version: 9, file: 'rebuild_teams_drop_leader_fk.sql' },
            { version: 10, file: 'rebuild_drivers_expand_statuses.sql' }
        ];

        // Determine latest schema version from migration list
        const latestVersion = Math.max(...migrationFiles.map(m => m.version));

        // Create safety backup only if migrations are actually needed
        if (currentVersion < latestVersion) {
            backupBeforeMigrate(currentVersion, latestVersion);
        }

        let applied = 0;
        for (const m of migrationFiles) {
            if (currentVersion < m.version) {
                const filePath = path.join(migrationsDir, m.file);
                if (fs.existsSync(filePath)) {
                    // Idempotency checks per migration
                    let shouldApply = true;
                    if (m.version === 2) {
                        // No-op migration
                        shouldApply = false;
                    } else if (m.version === 3) {
                        // Add title column to patients
                        if (hasColumn('patients', 'title')) {
                            shouldApply = false;
                        }
                    } else if (m.version === 4) {
                        // Add emergency contact columns to patients
                        if (hasColumn('patients', 'emergency_contact_name')) {
                            shouldApply = false;
                        }
                    } else if (m.version === 5) {
                        // Add phone and profile_image_url to users
                        if (hasColumn('users', 'phone') && hasColumn('users', 'profile_image_url')) {
                            shouldApply = false;
                        }
                    } else if (m.version === 6) {
                        // Add caregiver and key_info to patients
                        if (hasColumn('patients', 'caregiver_name') && hasColumn('patients', 'caregiver_phone') && hasColumn('patients', 'key_info')) {
                            shouldApply = false;
                        }
                    } else if (m.version === 7) {
                        // Add village/landmark/caregiver_phone to rides
                        if (hasColumn('rides', 'village') && hasColumn('rides', 'landmark') && hasColumn('rides', 'caregiver_phone')) {
                            shouldApply = false;
                        }
                    } else if (m.version === 8) {
                        const usersSql = getCreateTableSql('users').toLowerCase();
                        const allowsRadio = usersSql.includes("'radio'");
                        const hasRadioUsers = (() => {
                            try {
                                const row = db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'radio'`).get() as { c?: number } | undefined;
                                return (row?.c || 0) > 0;
                            } catch {
                                return false;
                            }
                        })();
                        if (!allowsRadio && !hasRadioUsers) {
                            shouldApply = false;
                        }
                    } else if (m.version === 9) {
                        const teamsSql = getCreateTableSql('teams').toLowerCase();
                        const hasLeaderFk = teamsSql.includes('foreign key') && teamsSql.includes('leader_id');
                        if (!hasLeaderFk) {
                            shouldApply = false;
                        }
                    } else if (m.version === 10) {
                        const driversSql = getCreateTableSql('drivers').toLowerCase();
                        const hasOldOnly = driversSql.includes("check(status in ('available', 'on_duty', 'off_duty', 'unavailable'))");
                        if (!hasOldOnly) {
                            shouldApply = false;
                        }
                    }

                    if (shouldApply) {
                        console.log(`🚚 Applying migration v${m.version}: ${m.file}`);
                        const sql = fs.readFileSync(filePath, 'utf-8');
                        db.exec(sql);
                    } else {
                        console.log(`ℹ️ Skipping migration v${m.version} (${m.file}) - already applied or no-op`);
                    }

                    // Advance schema version regardless to keep PRAGMA in sync
                    db.pragma(`user_version = ${m.version}`);
                    applied++;
                } else {
                    console.warn(`⚠️ Migration file missing: ${m.file}`);
                }
            }
        }

        if (applied > 0) {
            const newVersion = db.pragma('user_version', { simple: true }) as number;
            console.log(`✅ Migrations processed. Schema version is now ${newVersion}`);
        } else {
            console.log('ℹ️ No migrations needed');
        }
    } catch (error) {
        console.error('❌ Error applying migrations:', error);
        throw error;
    }
}

