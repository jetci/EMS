const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'wecare.db');
const db = new Database(dbPath);

const info = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='rides'").get();
console.log(info.sql);
