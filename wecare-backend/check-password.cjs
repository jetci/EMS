const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database('./db/wecare.db', { readonly: true });

const email = 'community1@wecare.dev';
const testPassword = 'password';

const user = db.prepare('SELECT id, email, password, role FROM users WHERE email = ?').get(email);

if (user) {
    console.log(`User found: ${user.email} (${user.role})`);
    console.log(`Password hash: ${user.password.substring(0, 20)}...`);
    
    // Test password
    const isValid = bcrypt.compareSync(testPassword, user.password);
    console.log(`\nPassword "${testPassword}" is ${isValid ? 'VALID' : 'INVALID'}`);
    
    if (!isValid) {
        console.log('\nTrying other common passwords...');
        const passwords = ['Password@123', 'Community@123', 'community123', 'wecare123'];
        for (const pwd of passwords) {
            if (bcrypt.compareSync(pwd, user.password)) {
                console.log(`✓ Correct password: "${pwd}"`);
                break;
            }
        }
    }
} else {
    console.log(`User not found: ${email}`);
}

db.close();
