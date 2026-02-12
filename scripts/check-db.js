// Quick database check script
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db', 'wecare.db');

console.log('Database path:', DB_PATH);

try {
    const db = new Database(DB_PATH, { readonly: true });
    
    console.log('\n=== CHECKING DATABASE ===\n');
    
    // Check users table
    const users = db.prepare('SELECT id, email, role, status, substr(password,1,30) as pwd_hash FROM users').all();
    
    console.log('Users in database:');
    console.table(users);
    
    // Check if admin exists
    const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@wecare.ems');
    
    if (admin) {
        console.log('\nAdmin user found:');
        console.log('  ID:', admin.id);
        console.log('  Email:', admin.email);
        console.log('  Role:', admin.role);
        console.log('  Status:', admin.status);
        console.log('  Password hash (first 30 chars):', admin.password.substring(0, 30));
        console.log('  Hash starts with:', admin.password.substring(0, 7));
    } else {
        console.log('\n❌ Admin user NOT FOUND!');
    }
    
    db.close();
} catch (error) {
    console.error('Error:', error.message);
}
