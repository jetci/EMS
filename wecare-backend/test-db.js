const sqlite3 = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db', 'wecare.db');

try {
    console.log('Testing connection to:', DB_PATH);
    const db = new sqlite3(DB_PATH, { timeout: 5000 });

    console.log('Checking USERS table...');
    const count = db.prepare('SELECT COUNT(*) as count FROM users').get();
    console.log('User count:', count);

    db.close();
    console.log('✅ Connection successful');
} catch (err) {
    console.error('❌ Failed to connect:', err);
}
