const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'wecare.db');
const db = new Database(dbPath);

console.log('🚀 Migrating Rides table to include location/caregiver details...');

try {
    const columns = db.prepare("PRAGMA table_info(rides)").all().map(c => c.name);

    db.transaction(() => {
        if (!columns.includes('village')) {
            console.log('   ➕ Adding column: village');
            db.exec("ALTER TABLE rides ADD COLUMN village TEXT");
        }
        if (!columns.includes('landmark')) {
            console.log('   ➕ Adding column: landmark');
            db.exec("ALTER TABLE rides ADD COLUMN landmark TEXT");
        }
        if (!columns.includes('caregiver_phone')) {
            console.log('   ➕ Adding column: caregiver_phone');
            db.exec("ALTER TABLE rides ADD COLUMN caregiver_phone TEXT");
        }
    })();

    console.log('✅ Migration successful!');
} catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
} finally {
    db.close();
}
