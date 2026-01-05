// Test password verification
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db', 'wecare.db');

async function testPasswords() {
    const db = new Database(DB_PATH, { readonly: true });
    
    const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@wecare.ems');
    
    if (!admin) {
        console.log('❌ Admin user not found');
        return;
    }
    
    console.log('Testing passwords for:', admin.email);
    console.log('Stored hash:', admin.password);
    console.log('');
    
    const passwords = ['Admin@123', 'password123', 'admin123', 'Admin123'];
    
    for (const pwd of passwords) {
        try {
            const isValid = await bcrypt.compare(pwd, admin.password);
            if (isValid) {
                console.log(`✅ CORRECT PASSWORD: "${pwd}"`);
            } else {
                console.log(`❌ Wrong: "${pwd}"`);
            }
        } catch (error) {
            console.log(`❌ Error testing "${pwd}":`, error.message);
        }
    }
    
    db.close();
}

testPasswords().catch(console.error);
