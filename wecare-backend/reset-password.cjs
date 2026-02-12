const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database('./db/wecare.db');

const email = 'community1@wecare.dev';
const newPassword = 'password';

// Hash new password
const hashedPassword = bcrypt.hashSync(newPassword, 10);

// Update password
const result = db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, email);

if (result.changes > 0) {
    console.log(`✓ Password reset successful for ${email}`);
    console.log(`  New password: ${newPassword}`);
} else {
    console.log(`✗ User not found: ${email}`);
}

db.close();
