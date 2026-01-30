const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db/wecare.db');
const migrationPath = path.join(__dirname, '../db/migrations/add_title_column.sql');

console.log(`Opening database at ${dbPath}...`);
const db = new Database(dbPath);

try {
    console.log(`Reading migration file from ${migrationPath}...`);
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...');
    db.exec(migrationSql);

    console.log('✅ Migration executed successfully!');
} catch (error) {
    if (error.message.includes('duplicate column name: title')) {
        console.log('⚠️ Column "title" already exists. Skipping migration.');
    } else {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
} finally {
    db.close();
}
