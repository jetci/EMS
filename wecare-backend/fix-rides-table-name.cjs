const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'wecare.db');
const db = new Database(dbPath);

console.log('Fixing table name...');

try {
    // Check if rides_new exists
    const checkNew = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='rides_new'").get();
    const checkOld = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='rides'").get();

    if (checkNew && !checkOld) {
        console.log("Found 'rides_new' and missing 'rides'. Renaming...");
        db.prepare("ALTER TABLE rides_new RENAME TO rides").run();
        console.log("✅ Renamed 'rides_new' to 'rides' successfully.");
    } else if (checkOld) {
        console.log("Table 'rides' already exists. No action needed.");
    } else {
        console.error("❌ Critical Error: Neither 'rides' nor 'rides_new' found!");
    }

} catch (error) {
    console.error('❌ Error fixing table name:', error.message);
}
