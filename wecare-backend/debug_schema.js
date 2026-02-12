const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'wecare.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Checking table "users" schema...');

db.all("PRAGMA table_info(users)", (err, rows) => {
    if (err) {
        console.error('❌ Error:', err.message);
    } else {
        console.log('✅ Columns in "users":');
        rows.forEach(row => {
            console.log(`   - ${row.name} (${row.type})`);
        });

        const hasProfileImage = rows.some(r => r.name === 'profile_image_url');
        const hasPhone = rows.some(r => r.name === 'phone');

        console.log('\n🔍 Missing columns:');
        if (!hasProfileImage) console.log('   ❌ profile_image_url');
        if (!hasPhone) console.log('   ❌ phone');
        if (hasProfileImage && hasPhone) console.log('   ✅ All expected columns present');
    }

    // Also check drivers table
    console.log('\n📊 Checking table "drivers" schema...');
    db.all("PRAGMA table_info(drivers)", (err, rows) => {
        if (!err) {
            rows.forEach(row => {
                console.log(`   - ${row.name} (${row.type})`);
            });
        }
        db.close();
    });
});
