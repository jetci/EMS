// Check admin and developer passwords
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db', 'wecare.db');

async function checkPasswords() {
    const db = new Database(DB_PATH, { readonly: true });
    
    console.log('=== CHECKING ADMIN & DEVELOPER PASSWORDS ===\n');
    
    // Get admin and developer users
    const users = db.prepare('SELECT * FROM users WHERE role IN (?, ?)').all('admin', 'DEVELOPER');
    
    const testPasswords = ['Admin@123', 'password123', 'password', 'admin123', 'dev123'];
    
    for (const user of users) {
        console.log(`\n📧 ${user.email} (${user.role})`);
        console.log(`   Hash: ${user.password.substring(0, 30)}...`);
        console.log('   Testing passwords:');
        
        let foundPassword = false;
        for (const pwd of testPasswords) {
            try {
                const isValid = await bcrypt.compare(pwd, user.password);
                if (isValid) {
                    console.log(`   ✅ CORRECT: "${pwd}"`);
                    foundPassword = true;
                } else {
                    console.log(`   ❌ Wrong: "${pwd}"`);
                }
            } catch (error) {
                console.log(`   ⚠️  Error testing "${pwd}": ${error.message}`);
            }
        }
        
        if (!foundPassword) {
            console.log('   🔴 NO MATCHING PASSWORD FOUND!');
        }
    }
    
    // Also check what other roles use
    console.log('\n\n=== OTHER ROLES (for comparison) ===\n');
    const otherUsers = db.prepare('SELECT * FROM users WHERE role NOT IN (?, ?) LIMIT 2').all('admin', 'DEVELOPER');
    
    for (const user of otherUsers) {
        console.log(`\n📧 ${user.email} (${user.role})`);
        console.log(`   Hash: ${user.password.substring(0, 30)}...`);
        
        for (const pwd of testPasswords) {
            const isValid = await bcrypt.compare(pwd, user.password);
            if (isValid) {
                console.log(`   ✅ Password: "${pwd}"`);
                break;
            }
        }
    }
    
    db.close();
}

checkPasswords().catch(console.error);
