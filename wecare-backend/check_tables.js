
const Database = require('better-sqlite3');
const db = new Database('wecare.db');

try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables in DB:', tables.map(t => t.name));

    // Check rides table too
    const ridesCols = db.prepare('PRAGMA table_info(rides)').all();
    console.log('Rides Columns:', ridesCols.length);
} catch (err) {
    console.error(err);
}
