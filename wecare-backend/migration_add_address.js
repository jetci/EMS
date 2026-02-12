
const sqlite = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'db', 'wecare.db');
const db = new sqlite(dbPath);

try {
    db.prepare('ALTER TABLE drivers ADD COLUMN address TEXT').run();
    console.log('Successfully added address column to drivers table');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('Address column already exists');
    } else {
        console.error('Error adding address column:', err.message);
    }
}
db.close();
