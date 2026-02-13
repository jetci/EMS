import { Pool, QueryResult } from 'pg';
import path from 'path';
import fs from 'fs';
import { hashPassword } from '../utils/password';

// PostgreSQL Database Helper
// Implements the same interface as sqliteDB but with async methods and PG syntax

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: 20, // Max clients in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('error', (err, client) => {
    console.error('❌ Unexpected error on idle client', err);
    // In serverless, we don't want to exit the process
});

// Initialize Schema (Run SQL file)
export const initializeSchema = async () => {
    try {
        // Try multiple potential paths for serverless vs local
        const paths = [
            path.join(process.cwd(), 'wecare-backend', 'db', 'schema.postgres.sql'),
            path.join(__dirname, '..', '..', 'db', 'schema.postgres.sql'),
            path.join(__dirname, '..', 'db', 'schema.postgres.sql'), // Bundled case
            path.join(process.cwd(), 'db', 'schema.postgres.sql')
        ];

        let schemaPath = '';
        for (const p of paths) {
            if (fs.existsSync(p)) {
                schemaPath = p;
                break;
            }
        }

        if (!schemaPath) {
            console.error('❌ could not find schema.postgres.sql in any of:', paths);
            throw new Error('Schema file not found');
        }

        console.log(`📜 Loading schema from: ${schemaPath}`);
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        await pool.query(schema);
        console.log('✅ PostgreSQL schema initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing PostgreSQL schema:', error);
        throw error;
    }
};

// Seed Data (Adapted for Async/PG)
export const seedData = async () => {
    try {
        const hashedPassword = await hashPassword('password123');

        // Check if users exist
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
                    `INSERT INTO users (id, email, password, role, full_name, date_created, status)
                     VALUES ($1, $2, $3, $4, $5, NOW(), 'Active')`,
                    [user.id, user.email, hashedPassword, user.role, user.full_name]
                );
            }
            console.log('✅ Initial users seeded');
        }

        // Ensure Driver Profile
        const driverProfileResult = await pool.query('SELECT COUNT(*) as count FROM drivers');
        if (parseInt(driverProfileResult.rows[0].count) === 0) {
            await pool.query(
                `INSERT INTO drivers (id, user_id, full_name, phone, license_number, license_expiry, status, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
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
    console.log('🔄 Initializing PostgreSQL connection...');
    try {
        await pool.query('SELECT NOW()'); // Simple connection check
        console.log('✅ Connected to PostgreSQL');

        // Note: In production, schema management is usually done via migrations tools (Knex/Prisma)
        // For this streamlined setup, we check if users table exists before init schema
        const checkTable = await pool.query(`SELECT to_regclass('public.users')`);
        if (!checkTable.rows[0].to_regclass) {
            await initializeSchema();
            await seedData();
        } else {
            console.log('ℹ️ Schema already exists, skipping init');
        }

        console.log('✅ PostgreSQL initialization completed');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
};


// DB Interface (Async)
export const postgresDB = {
    pool,

    // Execute raw SQL
    query: async (sql: string, params: any[] = []) => {
        return pool.query(sql, params);
    },

    // Get all rows
    all: async <T>(sql: string, params: any[] = []): Promise<T[]> => {
        const res = await pool.query(sql, params);
        return res.rows;
    },

    // Get single row
    get: async <T>(sql: string, params: any[] = []): Promise<T | undefined> => {
        const res = await pool.query(sql, params);
        return res.rows[0];
    },

    // Run (Insert/Update/Delete) -> Return row count or inserted row
    run: async (sql: string, params: any[] = []): Promise<any> => {
        const res = await pool.query(sql, params);
        return { changes: res.rowCount, lastInsertId: null }; // PG doesn't return ID unless RETURNING is used
    },

    // Insert helper
    insert: async (table: string, data: Record<string, any>): Promise<any> => {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const res = await pool.query(sql, values);
        return res.rows[0];
    },

    // Update helper
    update: async (table: string, id: string, data: Record<string, any>): Promise<any> => {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        const sql = `UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`;
        const res = await pool.query(sql, [...values, id]);
        return res.rows[0];
    },

    // Delete helper
    delete: async (table: string, id: string): Promise<any> => {
        const sql = `DELETE FROM ${table} WHERE id = $1`;
        return pool.query(sql, [id]);
    },

    // Find by ID
    findById: async <T>(table: string, id: string): Promise<T | undefined> => {
        const sql = `SELECT * FROM ${table} WHERE id = $1`;
        const res = await pool.query(sql, [id]);
        return res.rows[0];
    },

    // Transaction wrapper
    transaction: async <T>(fn: (client: any) => Promise<T>): Promise<T> => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await fn(client); // fn should use the client
            await client.query('COMMIT');
            return result;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    healthCheck: async () => {
        try {
            const start = Date.now();
            await pool.query('SELECT 1');
            const duration = Date.now() - start;
            return { healthy: true, message: 'Connected to PostgreSQL', latency: duration };
        } catch (e: any) {
            return { healthy: false, message: e.message };
        }
    },

    close: async () => {
        await pool.end();
    }
};

export default postgresDB;
