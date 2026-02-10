const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const db = new Database('./db/wecare.db');

async function fixAdminPassword() {
    const password = 'Admin@123';
    const hash = await bcrypt.hash(password, 10);
    
    console.log('Hashing password:', password);
    console.log('Hash:', hash);
    
    // Update admin user
    const stmt = db.prepare('UPDATE users SET password = ? WHERE email = ?');
    const result = stmt.run(hash, 'admin@wecare.ems');
    
    console.log('Updated rows:', result.changes);
    
    // Verify
    const user = db.prepare('SELECT email, password FROM users WHERE email = ?').get('admin@wecare.ems');
    console.log('\nVerifying...');
    console.log('Email:', user.email);
    console.log('Hash in DB:', user.password.substring(0, 20) + '...');
    
    // Test compare
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password match:', isValid);
    
    if (isValid) {
        console.log('\n✅ SUCCESS! Admin password fixed!');
    } else {
        console.log('\n❌ FAILED! Password still not working');
    }
    
    db.close();
}

fixAdminPassword().catch(console.error);
