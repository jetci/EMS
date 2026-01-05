/**
 * Hash Passwords Script
 * This script reads users.json, hashes all plain text passwords using bcrypt,
 * and saves the updated users back to the database.
 */

const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const SALT_ROUNDS = 10;
const USERS_FILE = path.join(__dirname, 'db', 'data', 'users.json');

async function hashPassword(plainPassword) {
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function hashAllPasswords() {
    console.log('🔐 Starting password hashing process...\n');

    // Read users.json
    console.log('📖 Reading users from:', USERS_FILE);
    let usersData = fs.readFileSync(USERS_FILE, 'utf8');

    // Remove BOM if present
    if (usersData.charCodeAt(0) === 0xFEFF) {
        console.log('⚠️  Removing BOM character...');
        usersData = usersData.slice(1);
    }

    const users = JSON.parse(usersData);

    console.log(`✅ Found ${users.length} users\n`);

    // Hash each user's password
    const updatedUsers = [];

    for (const user of users) {
        console.log(`Processing: ${user.email} (${user.role})`);

        // Check if password is already hashed (bcrypt hashes start with $2b$)
        if (user.password && user.password.startsWith('$2b$')) {
            console.log('  ⏭️  Password already hashed, skipping...');
            updatedUsers.push(user);
        } else {
            const plainPassword = user.password || 'password';
            console.log(`  🔄 Hashing password: "${plainPassword}"`);

            const hashedPassword = await hashPassword(plainPassword);

            updatedUsers.push({
                ...user,
                password: hashedPassword
            });

            console.log('  ✅ Password hashed successfully');
        }
        console.log('');
    }

    // Save updated users back to file
    console.log('💾 Saving updated users to database...');
    fs.writeFileSync(USERS_FILE, JSON.stringify(updatedUsers, null, 4), 'utf8');

    console.log('✅ All passwords hashed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   Total users: ${users.length}`);
    console.log(`   Passwords hashed: ${updatedUsers.length}`);
    console.log('\n🎉 Done! You can now login with the original passwords.');
    console.log('\n📝 Default passwords:');
    console.log('   - Developer: g0KEk,^],k;yo');
    console.log('   - All others: password');
}

// Run the script
hashAllPasswords().catch(err => {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
});
