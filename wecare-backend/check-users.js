/**
 * Check SQLite Users
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db', 'wecare.db');

function checkUsers() {
    console.log('🔍 Checking SQLite users...\n');

    const db = new Database(DB_PATH);

    const users = db.prepare('SELECT id, email, role, fullName FROM users').all();

    console.log(`Found ${users.length} users:\n`);

    users.forEach(user => {
        console.log(`  ${user.email}`);
        console.log(`    Role: ${user.role}`);
        console.log(`    Name: ${user.fullName}`);
        console.log(`    ID: ${user.id}\n`);
    });

    // Check specific users
    const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@wecare.dev');
    const dev = db.prepare('SELECT * FROM users WHERE email = ?').get('jetci.jm@gmail.com');

    console.log('Admin user:', admin ? '✅ EXISTS' : '❌ NOT FOUND');
    console.log('Developer user:', dev ? '✅ EXISTS' : '❌ NOT FOUND');

    db.close();
}

checkUsers();
