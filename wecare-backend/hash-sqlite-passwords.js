/**
 * Hash Passwords in SQLite Database (ถูกต้อง!)
 */

const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const path = require('path');

const SALT_ROUNDS = 10;
const DB_PATH = path.join(__dirname, 'db', 'wecare.db');

async function hashSQLitePasswords() {
    console.log('🔐 Hashing passwords in SQLite database...\n');

    const db = new Database(DB_PATH);

    // Get all users
    const users = db.prepare('SELECT * FROM users').all();
    console.log(`Found ${users.length} users in SQLite\n`);

    // Define correct passwords
    const passwords = {
        'jetci.jm@gmail.com': 'devpass123',
        'admin@wecare.dev': 'password',
        'office1@wecare.dev': 'password',
        'driver1@wecare.dev': 'password',
        'community1@wecare.dev': 'password',
        'officer1@wecare.dev': 'password',
        'executive1@wecare.dev': 'password'
    };

    // Update each user
    const updateStmt = db.prepare('UPDATE users SET password = ? WHERE email = ?');

    for (const user of users) {
        const plainPassword = passwords[user.email] || 'password';

        console.log(`Processing: ${user.email}`);
        console.log(`  Plain: "${plainPassword}"`);

        const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

        updateStmt.run(hashedPassword, user.email);

        console.log(`  Hash: ${hashedPassword.substring(0, 30)}...`);
        console.log(`  ✅ Updated in SQLite\n`);
    }

    db.close();

    console.log('✅ All SQLite passwords hashed!\n');
    console.log('📝 Credentials:');
    console.log('   - Developer: jetci.jm@gmail.com / devpass123');
    console.log('   - All others: [email] / password');
    console.log('\n🎉 Done! Login should work now!');
}

hashSQLitePasswords().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
