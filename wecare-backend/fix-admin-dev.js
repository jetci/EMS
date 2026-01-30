/**
 * Check SQLite Tables and Create Admin/Developer if missing
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db', 'wecare.db');
const SALT_ROUNDS = 10;

async function fixAdminAndDeveloper() {
    console.log('🔧 Fixing Admin and Developer users...\n');

    const db = new Database(DB_PATH);

    // Check tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables:', tables.map(t => t.name).join(', '));
    console.log('');

    // Get all users
    try {
        const users = db.prepare('SELECT id, email, role FROM users').all();
        console.log(`Found ${users.length} users\n`);

        // Check for admin
        const admin = users.find(u => u.email === 'admin@wecare.dev');
        if (!admin) {
            console.log('❌ Admin not found - creating...');
            const adminHash = await bcrypt.hash('password', SALT_ROUNDS);
            db.prepare(`INSERT INTO users (id, email, password, fullName, role, status) 
                        VALUES (?, ?, ?, ?, ?, ?)`).run(
                'USR-001', 'admin@wecare.dev', adminHash, 'Admin User', 'admin', 'Active'
            );
            console.log('✅ Admin created\n');
        } else {
            console.log('✅ Admin exists - updating password...');
            const adminHash = await bcrypt.hash('password', SALT_ROUNDS);
            db.prepare('UPDATE users SET password = ? WHERE email = ?').run(adminHash, 'admin@wecare.dev');
            console.log('✅ Admin password updated\n');
        }

        // Check for developer
        const dev = users.find(u => u.email === 'jetci.jm@gmail.com');
        if (!dev) {
            console.log('❌ Developer not found - creating...');
            const devHash = await bcrypt.hash('g0KEk,^],k;yo', SALT_ROUNDS);
            db.prepare(`INSERT INTO users (id, email, password, fullName, role, status) 
                        VALUES (?, ?, ?, ?, ?, ?)`).run(
                'USR-000', 'jetci.jm@gmail.com', devHash, 'System Developer', 'DEVELOPER', 'Active'
            );
            console.log('✅ Developer created\n');
        } else {
            console.log('✅ Developer exists - updating password...');
            const devHash = await bcrypt.hash('g0KEk,^],k;yo', SALT_ROUNDS);
            db.prepare('UPDATE users SET password = ? WHERE email = ?').run(devHash, 'jetci.jm@gmail.com');
            console.log('✅ Developer password updated\n');
        }

    } catch (err) {
        console.error('Error:', err.message);
    }

    db.close();

    console.log('🎉 Done! Try logging in now.');
    console.log('\nCredentials:');
    console.log('  Admin: admin@wecare.dev / password');
    console.log('  Developer: jetci.jm@gmail.com / g0KEk,^],k;yo');
}

fixAdminAndDeveloper().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
