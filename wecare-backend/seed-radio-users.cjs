const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = 'd:\\EMS\\wecare-backend\\db\\wecare.db';
const db = new Database(dbPath);

// Ensure users table exists
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        full_name TEXT NOT NULL,
        date_created TEXT NOT NULL,
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        phone_number TEXT
    );
`);

const users = [
    {
        email: 'radio@wecare.dev',
        password: 'password',
        fullName: 'Radio Operator',
        role: 'radio',
        phoneNumber: '0811111111'
    },
    {
        email: 'radio_center@wecare.dev',
        password: 'password',
        fullName: 'Radio Center Chief',
        role: 'radio_center',
        phoneNumber: '0822222222'
    }
];

console.log('Creating radio users...');

const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, password, full_name, role, date_created, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`);

users.forEach(user => {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    const id = 'USER-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    try {
        // Check if user exists
        const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(user.email);

        if (existing) {
            console.log(`User ${user.email} already exists. Updating password...`);
            db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, user.email);
        } else {
            console.log(`Creating user ${user.email}...`);
            insertStmt.run(id, user.email, hashedPassword, user.fullName, user.role, user.date_created || new Date().toISOString());
        }
    } catch (error) {
        console.error(`Error processing ${user.email}:`, error.message);
    }
});

console.log('Done!');
