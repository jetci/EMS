const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db', 'wecare.db');

console.log('🔄 Connecting to database at:', DB_PATH);
const db = new Database(DB_PATH, { verbose: console.log });

try {
    console.log('🔍 Checking if users table exists...');
    const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();

    if (!tableInfo) {
        console.error('❌ Table "users" does not exist!');
        process.exit(1);
    }

    console.log('🔍 Checking columns in users table...');
    const columns = db.prepare("PRAGMA table_info(users)").all();
    const hasProfileImage = columns.some(col => col.name === 'profile_image_url');

    if (hasProfileImage) {
        console.log('✅ Column "profile_image_url" already exists.');
    } else {
        console.log('🛠 Adding column "profile_image_url" to users table...');
        db.exec("ALTER TABLE users ADD COLUMN profile_image_url TEXT");
        console.log('✅ Column added successfully.');
    }

    // Verify
    const updatedColumns = db.prepare("PRAGMA table_info(users)").all();
    const verified = updatedColumns.some(col => col.name === 'profile_image_url');

    if (verified) {
        console.log('🎉 Verification successful: Column exists.');
    } else {
        console.error('❌ Verification failed: Column does not exist.');
    }

} catch (error) {
    console.error('❌ Error updating database:', error);
} finally {
    db.close();
    console.log('👋 Database connection closed.');
}
