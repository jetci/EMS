import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Configuration
const DB_PATH = path.join(__dirname, '..', 'db', 'benchmark.db');
const RECORDS_TO_INSERT = 5000;

// Remove existing benchmark db
if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
}

// Initialize Database without optimizations first (to simulate baseline)
const db = new Database(DB_PATH);

console.log('🚀 Starting Database Benchmark...');
console.log(`📊 Target Records: ${RECORDS_TO_INSERT}`);

// Setup Schema
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            role TEXT,
            status TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            action TEXT,
            timestamp TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);
} catch (e) {
    console.log('Schema exists or error:', e);
}

// 1. Benchmark Insert WITHOUT Transaction
console.log('\n⏱️ Benchmarking Insert (No Transaction)...');
db.exec('DELETE FROM users');
let startTime = Date.now();
const insertUser = db.prepare('INSERT INTO users (id, email, role, status) VALUES (?, ?, ?, ?)');
for (let i = 0; i < 500; i++) { // Reduced to 500 for quick test
    try {
        insertUser.run(`user_${i}`, `user${i}@example.com`, 'user', 'active');
    } catch (e) { }
}
let endTime = Date.now();
console.log(`❌ Insert 500 records (No Tx): ${(endTime - startTime)}ms`);

// Clear data
db.exec('DELETE FROM users');

// 2. Benchmark Insert WITH Transaction (Optimized)
console.log('\n⏱️ Benchmarking Insert (With Transaction)...');
startTime = Date.now();
const insertMany = db.transaction((count) => {
    for (let i = 0; i < count; i++) {
        try {
            insertUser.run(`user_${i}`, `user${i}@example.com`, 'user', 'active');
        } catch (e) { }
    }
});
insertMany(RECORDS_TO_INSERT);
endTime = Date.now();
console.log(`✅ Insert ${RECORDS_TO_INSERT} records (With Tx): ${(endTime - startTime)}ms`);

// 3. Benchmark Query WITHOUT Index
console.log('\n⏱️ Benchmarking Query (No Index)...');
startTime = Date.now();
const queryEmail = db.prepare('SELECT * FROM users WHERE email = ?');
for (let i = 0; i < 1000; i++) {
    queryEmail.get(`user${i * 2}@example.com`);
}
endTime = Date.now();
console.log(`❌ Query 1000 times (No Index): ${(endTime - startTime)}ms`);

// Add Index
console.log('\nResource: Adding Index...');
try {
    db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
} catch (e) { }

// 4. Benchmark Query WITH Index
console.log('\n⏱️ Benchmarking Query (With Index)...');
startTime = Date.now();
for (let i = 0; i < 1000; i++) {
    queryEmail.get(`user${i * 2}@example.com`);
}
endTime = Date.now();
console.log(`✅ Query 1000 times (With Index): ${(endTime - startTime)}ms`);

// Apply PRAGMA Optimizations
console.log('\nResource: Applying WAL Mode & Optimizations...');
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -20000');

// 5. Benchmark Insert WITH Optimizations
console.log('\n⏱️ Benchmarking Insert (Optimized Config)...');
db.exec('DELETE FROM users');
startTime = Date.now();
insertMany(RECORDS_TO_INSERT);
endTime = Date.now();
console.log(`🚀 Insert ${RECORDS_TO_INSERT} records (Optimized): ${(endTime - startTime)}ms`);

// Cleanup
db.close();
if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
}
console.log('\n✅ Benchmark Completed');
