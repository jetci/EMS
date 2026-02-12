const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'wecare.db');
const db = new Database(dbPath);

console.log('📊 Checking Rides table schema...');

try {
    const columns = db.prepare("PRAGMA table_info(rides)").all();
    const columnNames = columns.map(c => c.name);
    console.log('All Columns:', columnNames.join(', '));

    ['village', 'landmark', 'caregiver_phone'].forEach(col => {
        console.log(`Column ${col}: ${columnNames.includes(col) ? 'PRESENT' : 'MISSING'}`);
    });
} catch (error) {
    console.error('❌ Error checking schema:', error);
} finally {
    db.close();
}
