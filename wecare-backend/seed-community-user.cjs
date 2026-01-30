const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'wecare.db');
const db = new Database(dbPath);

const email = 'community1@wecare.dev';
const password = 'password';
const fullName = 'Community User 1';

try {
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (existing) {
        console.log(`User ${email} already exists. Updating password...`);
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, email);
    } else {
        console.log(`Creating user ${email}...`);
        const hashedPassword = bcrypt.hashSync(password, 10);
        const id = 'USER-' + Date.now();
        db.prepare(`
            INSERT INTO users (id, email, password, full_name, role, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'community', 'Active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(id, email, hashedPassword, fullName);
    }
    console.log('✅ Community user seeded successfully.');
} catch (error) {
    console.error('❌ Error seeding user:', error.message);
    process.exit(1);
}
