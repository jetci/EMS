// Run migration to add phone and profile_image_url columns
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'wecare.db');
const db = new Database(dbPath);

console.log('Running migration: add_user_profile_fields.sql');

try {
    // Add phone column
    db.exec('ALTER TABLE users ADD COLUMN phone TEXT');
    console.log('✅ Added phone column');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('⚠️  phone column already exists');
    } else {
        console.error('❌ Error adding phone column:', err.message);
    }
}

try {
    // Add profile_image_url column
    db.exec('ALTER TABLE users ADD COLUMN profile_image_url TEXT');
    console.log('✅ Added profile_image_url column');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('⚠️  profile_image_url column already exists');
    } else {
        console.error('❌ Error adding profile_image_url column:', err.message);
    }
}

try {
    // Create index
    db.exec('CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)');
    console.log('✅ Created index on phone column');
} catch (err) {
    console.error('❌ Error creating index:', err.message);
}

// Verify columns
const tableInfo = db.prepare('PRAGMA table_info(users)').all();
console.log('\n📋 Users table columns:');
tableInfo.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
});

db.close();
console.log('\n✅ Migration complete!');
