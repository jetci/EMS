/**
 * Fix Admin and Developer - Correct Schema
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db', 'wecare.db');
const SALT_ROUNDS = 10;

async function finalFix() {
    console.log('🔧 Final Fix for Admin and Developer\n');

    const db = new Database(DB_PATH);

    // Check table schema
    const tableInfo = db.prepare('PRAGMA table_info(users)').all();
    const columns = tableInfo.map(col => col.name);
    console.log('Available columns:', columns.join(', '));
    console.log('');

    // 1. Fix Admin
    console.log('[1/2] Fixing Admin...');
    const adminHash = await bcrypt.hash('password', SALT_ROUNDS);

    db.prepare('DELETE FROM users WHERE email = ?').run('admin@wecare.dev');

    db.prepare(`INSERT INTO users (id, email, password, fullName, role, status) 
                VALUES (?, ?, ?, ?, ?, ?)`).run(
        'USR-001',
        'admin@wecare.dev',
        adminHash,
        'Admin User',
        'admin',
        'Active'
    );
    console.log('  ✅ Admin created\n');

    // 2. Fix Developer - simple password
    console.log('[2/2] Fixing Developer...');
    const devHash = await bcrypt.hash('devpass123', SALT_ROUNDS);

    db.prepare('DELETE FROM users WHERE email = ?').run('jetci.jm@gmail.com');

    db.prepare(`INSERT INTO users (id, email, password, fullName, role, status) 
                VALUES (?, ?, ?, ?, ?, ?)`).run(
        'USR-000',
        'jetci.jm@gmail.com',
        devHash,
        'System Developer',
        'DEVELOPER',
        'Active'
    );
    console.log('  ✅ Developer created\n');

    db.close();

    console.log('========================================');
    console.log('  SUCCESS!');
    console.log('========================================\n');
    console.log('Credentials:');
    console.log('  Admin: admin@wecare.dev / password');
    console.log('  Developer: jetci.jm@gmail.com / devpass123');
    console.log('\n🎉 Login should work now!');
}

finalFix().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
