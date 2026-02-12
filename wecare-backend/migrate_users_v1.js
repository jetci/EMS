const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'wecare.db');
const db = new Database(dbPath);

console.log('🔄 Applying migration to add "phone" and "profile_image_url" to "users" table...');

try {
    const columns = db.pragma('table_info(users)');
    const hasPhone = columns.some(r => r.name === 'phone');
    const hasProfileImage = columns.some(r => r.name === 'profile_image_url');

    if (!hasPhone) {
        console.log('   ➕ Adding "phone" column...');
        db.exec('ALTER TABLE users ADD COLUMN phone TEXT');
    } else {
        console.log('   ✅ "phone" column already exists');
    }

    if (!hasProfileImage) {
        console.log('   ➕ Adding "profile_image_url" column...');
        db.exec('ALTER TABLE users ADD COLUMN profile_image_url TEXT');
    } else {
        console.log('   ✅ "profile_image_url" column already exists');
    }

    console.log('✅ Migration completed successfully');

} catch (err) {
    console.error('❌ Migration failed:', err.message);
} finally {
    db.close();
}
