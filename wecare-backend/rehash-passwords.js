/**
 * Re-Hash Passwords with Correct Plain Text
 * This ensures all users have password = "password" (except Developer)
 */

const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const SALT_ROUNDS = 10;
const USERS_FILE = path.join(__dirname, 'db', 'data', 'users.json');

async function rehashPasswords() {
    console.log('🔐 Re-hashing passwords with correct plain text...\n');

    // Read current users
    const usersData = fs.readFileSync(USERS_FILE, 'utf8');
    let users = JSON.parse(usersData.charCodeAt(0) === 0xFEFF ? usersData.slice(1) : usersData);

    console.log(`Found ${users.length} users\n`);

    // Define correct passwords
    const correctPasswords = {
        'jetci.jm@gmail.com': 'devpass123',  // Developer
        'admin@wecare.dev': 'password',
        'office1@wecare.dev': 'password',
        'driver1@wecare.dev': 'password',
        'community1@wecare.dev': 'password',
        'officer1@wecare.dev': 'password',
        'executive1@wecare.dev': 'password'
    };

    // Hash each user's password
    for (const user of users) {
        const correctPassword = correctPasswords[user.email] || 'password';

        console.log(`Processing: ${user.email}`);
        console.log(`  Plain password: "${correctPassword}"`);

        const hashedPassword = await bcrypt.hash(correctPassword, SALT_ROUNDS);
        user.password = hashedPassword;

        console.log(`  Hashed: ${hashedPassword.substring(0, 20)}...`);
        console.log('  ✅ Done\n');
    }

    // Save
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4), 'utf8');

    console.log('✅ All passwords re-hashed successfully!\n');
    console.log('📝 Credentials:');
    console.log('   - Developer: jetci.jm@gmail.com / devpass123');
    console.log('   - All others: [email] / password');
    console.log('\n🎉 Done! You can now login.');
}

rehashPasswords().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
