const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/wecare.db');
const db = new Database(dbPath);

try {
    const tableInfo = db.prepare("PRAGMA table_info(patients)").all();
    console.log("Columns in 'patients' table:");
    tableInfo.forEach(col => {
        console.log(`- ${col.name} (${col.type})`);
    });
} catch (error) {
    console.error('Error:', error);
} finally {
    db.close();
}
