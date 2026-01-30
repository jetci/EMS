const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db', 'wecare.db'); // Corrected path
const db = new Database(DB_PATH);

console.log('🔧 Starting migration: Adding phone column to users table...');

try {
    // Check if column exists
    const tableInfo = db.pragma('table_info(users)');
    const hasPhone = tableInfo.some(col => col.name === 'phone');

    if (hasPhone) {
        console.log('⚠️ Column "phone" already exists in "users" table. Skipping.');
    } else {
        console.log('📝 Adding "phone" column...');
        db.exec('ALTER TABLE users ADD COLUMN phone TEXT');
        console.log('✅ Column "phone" added successfully.');
    }

    // Verify
    const updatedInfo = db.pragma('table_info(users)');
    const phoneCol = updatedInfo.find(col => col.name === 'phone');
    if (phoneCol) {
        console.log('✅ Verification successful: phone column is present.');
    } else {
        console.error('❌ Verification failed: phone column NOT found!');
    }

} catch (error) {
    console.error('❌ Migration failed:', error);
} finally {
    db.close();
}
