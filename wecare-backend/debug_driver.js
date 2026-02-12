const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'wecare.db');
const db = new Database(dbPath);

console.log('📊 Checking Driver account and profile...');

try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get('driver1@wecare.dev');
    if (user) {
        console.log('✅ User "driver1@wecare.dev" found:');
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Name: ${user.full_name}`);
        console.log(`   - Phone: ${user.phone}`);
        console.log(`   - Profile Image: ${user.profile_image_url}`);
    } else {
        console.log('❌ User "driver1@wecare.dev" not found');
    }

    const driver = db.prepare('SELECT * FROM drivers WHERE user_id = ?').get(user?.id);
    if (driver) {
        console.log('\n✅ Driver profile found:');
        console.log(`   - ID: ${driver.id}`);
        console.log(`   - Name: ${driver.full_name}`);
        console.log(`   - Status: ${driver.status}`);
        console.log(`   - Profile Image: ${driver.profile_image_url}`);
    } else {
        console.log('\n❌ Driver profile not found for this user');
    }

} catch (err) {
    console.error('❌ Error:', err.message);
} finally {
    db.close();
}
