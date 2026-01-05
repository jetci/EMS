/**
 * Direct Password Test - ทดสอบว่า password ที่ hash ตรงกับ plain text หรือไม่
 */

const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function testPasswords() {
    console.log('🔍 Testing Password Hashes\n');

    // Read users
    const usersFile = path.join(__dirname, 'db', 'data', 'users.json');
    const usersData = fs.readFileSync(usersFile, 'utf8');
    const users = JSON.parse(usersData.charCodeAt(0) === 0xFEFF ? usersData.slice(1) : usersData);

    // Test passwords
    const testCases = [
        { email: 'admin@wecare.dev', password: 'password' },
        { email: 'jetci.jm@gmail.com', password: 'g0KEk,^],k;yo' },
        { email: 'office1@wecare.dev', password: 'password' },
        { email: 'driver1@wecare.dev', password: 'password' }
    ];

    for (const testCase of testCases) {
        const user = users.find(u => u.email === testCase.email);

        if (!user) {
            console.log(`❌ User not found: ${testCase.email}\n`);
            continue;
        }

        console.log(`Testing: ${testCase.email}`);
        console.log(`  Plain password: "${testCase.password}"`);
        console.log(`  Stored hash: ${user.password.substring(0, 30)}...`);

        const isValid = await bcrypt.compare(testCase.password, user.password);

        if (isValid) {
            console.log(`  ✅ MATCH - Password is correct!\n`);
        } else {
            console.log(`  ❌ NO MATCH - Password is WRONG!`);
            console.log(`  This is the problem!\n`);
        }
    }

    console.log('Done.');
}

testPasswords().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
