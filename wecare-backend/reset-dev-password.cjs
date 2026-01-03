const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'wecare.db');
const db = new Database(dbPath);

const email = 'jetci.jm@gmail.com';
const password = 'DevPass123!'; // Updated password

try {
    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, email);

    if (result.changes > 0) {
        console.log(`✅ Password for ${email} has been reset successfully.`);
    } else {
        console.log(`❌ User ${email} not found.`);
    }
} catch (error) {
    console.error('❌ Error resetting password:', error.message);
}
