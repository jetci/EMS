const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'wecare.db');
const db = new Database(dbPath);

console.log('📊 Checking table "users" schema...');

try {
    const columns = db.pragma('table_info(users)');
    console.log('✅ Columns in "users":');
    columns.forEach(row => {
        console.log(`   - ${row.name} (${row.type})`);
    });

    const hasProfileImage = columns.some(r => r.name === 'profile_image_url');
    const hasPhone = columns.some(r => r.name === 'phone');

    console.log('\n🔍 Missing columns in "users":');
    if (!hasProfileImage) console.log('   ❌ profile_image_url');
    if (!hasPhone) console.log('   ❌ phone');
    if (hasProfileImage && hasPhone) console.log('   ✅ All expected columns present');

    console.log('\n📊 Checking table "drivers" schema...');
    const driverColumns = db.pragma('table_info(drivers)');
    driverColumns.forEach(row => {
        console.log(`   - ${row.name} (${row.type})`);
    });

    const hasDriverProfileImage = driverColumns.some(r => r.name === 'profile_image_url');
    if (!hasDriverProfileImage) console.log('   ❌ profile_image_url missing in "drivers" table');

} catch (err) {
    console.error('❌ Error:', err.message);
} finally {
    db.close();
}
