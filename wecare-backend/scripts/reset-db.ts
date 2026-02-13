
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { hashPassword } from '../src/utils/password';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function resetDatabase() {
    console.log('🔄 Resetting Database...');
    try {
        // Drop public schema to wipe everything
        await pool.query('DROP SCHEMA public CASCADE');
        await pool.query('CREATE SCHEMA public');
        console.log('✅ Public schema wiped');

        // Read and apply schema
        const schemaPath = path.join(__dirname, '..', 'db', 'schema.postgres.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        await pool.query(schema);
        console.log('✅ Schema applied');

        // Seed initial data
        console.log('🌱 Seeding data...');
        const hashedPassword = await hashPassword('password123');

        const users = [
            { id: 'USR-ADMIN', email: 'admin@wecare.ems', role: 'admin', full_name: 'System Administrator' },
            { id: 'USR-OFFICER', email: 'officer1@wecare.dev', role: 'OFFICER', full_name: 'EMS Officer' }
        ];

        for (const user of users) {
            await pool.query(
                `INSERT INTO users (id, email, password, role, full_name, date_created, status)
                 VALUES ($1, $2, $3, $4, $5, NOW(), 'Active')`,
                [user.id, user.email, hashedPassword, user.role, user.full_name]
            );
        }
        console.log('✅ Seed data inserted');

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error resetting database:', err);
        process.exit(1);
    }
}

resetDatabase();
