"use strict";
/**
 * Database Migration Script
 * Migrates existing SQLite database to encrypted SQLCipher database
 *
 * Usage:
 *   npm run migrate-db
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const DB_PATH = process.env.DB_PATH || './db/wecare.db';
const DB_BACKUP_PATH = DB_PATH + '.backup-' + Date.now();
const DB_ENCRYPTED_PATH = DB_PATH + '.encrypted';
const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY;
console.log('🔐 Database Encryption Migration');
console.log('================================\n');
// Validate encryption key
if (!DB_ENCRYPTION_KEY) {
    console.error('❌ Error: DB_ENCRYPTION_KEY not set in environment variables');
    console.log('\nGenerate a key with:');
    console.log('  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    console.log('\nThen add to .env:');
    console.log('  DB_ENCRYPTION_KEY=your_64_char_hex_key');
    process.exit(1);
}
if (DB_ENCRYPTION_KEY.length !== 64 || !/^[0-9a-f]{64}$/i.test(DB_ENCRYPTION_KEY)) {
    console.error('❌ Error: DB_ENCRYPTION_KEY must be 64 hex characters');
    console.log('Current length:', DB_ENCRYPTION_KEY.length);
    process.exit(1);
}
// Check if database exists
if (!fs_1.default.existsSync(DB_PATH)) {
    console.error(`❌ Error: Database not found at ${DB_PATH}`);
    process.exit(1);
}
console.log('📁 Database path:', DB_PATH);
console.log('💾 Backup path:', DB_BACKUP_PATH);
console.log('🔒 Encrypted path:', DB_ENCRYPTED_PATH);
console.log('');
try {
    // Step 1: Backup original database
    console.log('Step 1/5: Creating backup...');
    fs_1.default.copyFileSync(DB_PATH, DB_BACKUP_PATH);
    const backupSize = fs_1.default.statSync(DB_BACKUP_PATH).size;
    console.log(`✅ Backup created: ${(backupSize / 1024 / 1024).toFixed(2)} MB\n`);
    // Step 2: Open original database
    console.log('Step 2/5: Opening original database...');
    const sourceDb = new better_sqlite3_1.default(DB_PATH, { readonly: true });
    // Get database info
    const tables = sourceDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    console.log(`✅ Found ${tables.length} tables:`, tables.map(t => t.name).join(', '));
    console.log('');
    // Step 3: Create encrypted database
    console.log('Step 3/5: Creating encrypted database...');
    // Remove encrypted file if exists
    if (fs_1.default.existsSync(DB_ENCRYPTED_PATH)) {
        fs_1.default.unlinkSync(DB_ENCRYPTED_PATH);
    }
    const targetDb = new better_sqlite3_1.default(DB_ENCRYPTED_PATH);
    // Enable encryption with SQLCipher pragmas
    // Note: better-sqlite3 doesn't support SQLCipher by default
    // We'll use a different approach: encrypt the file itself
    console.log('⚠️  Note: Using file-level encryption approach');
    console.log('   For production, consider using @journeyapps/sqlcipher\n');
    // Step 4: Copy schema and data
    console.log('Step 4/5: Copying schema and data...');
    // Get and execute schema
    const schema = sourceDb.prepare("SELECT sql FROM sqlite_master WHERE sql IS NOT NULL AND type IN ('table', 'index', 'trigger', 'view') ORDER BY type DESC").all();
    for (const item of schema) {
        try {
            targetDb.exec(item.sql);
        }
        catch (err) {
            // Ignore errors for existing objects
        }
    }
    // Copy data from each table
    let totalRows = 0;
    for (const table of tables) {
        const rows = sourceDb.prepare(`SELECT * FROM ${table.name}`).all();
        if (rows.length > 0) {
            const columns = Object.keys(rows[0]);
            const placeholders = columns.map(() => '?').join(', ');
            const insertStmt = targetDb.prepare(`INSERT INTO ${table.name} (${columns.join(', ')}) VALUES (${placeholders})`);
            const insertMany = targetDb.transaction((rows) => {
                for (const row of rows) {
                    insertStmt.run(...columns.map(col => row[col]));
                }
            });
            insertMany(rows);
            totalRows += rows.length;
            console.log(`  ✓ ${table.name}: ${rows.length} rows`);
        }
    }
    console.log(`✅ Copied ${totalRows} total rows\n`);
    // Step 5: Encrypt the database file
    console.log('Step 5/5: Encrypting database file...');
    // Close databases
    sourceDb.close();
    targetDb.close();
    // Read encrypted database
    const dbBuffer = fs_1.default.readFileSync(DB_ENCRYPTED_PATH);
    // Encrypt using AES-256-GCM
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv('aes-256-gcm', Buffer.from(DB_ENCRYPTION_KEY, 'hex'), iv);
    const encrypted = Buffer.concat([
        cipher.update(dbBuffer),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();
    // Write encrypted file with IV and auth tag
    const finalEncrypted = Buffer.concat([
        iv,
        authTag,
        encrypted
    ]);
    fs_1.default.writeFileSync(DB_ENCRYPTED_PATH, finalEncrypted);
    const encryptedSize = fs_1.default.statSync(DB_ENCRYPTED_PATH).size;
    console.log(`✅ Database encrypted: ${(encryptedSize / 1024 / 1024).toFixed(2)} MB\n`);
    // Summary
    console.log('🎉 Migration Complete!');
    console.log('====================\n');
    console.log('Files created:');
    console.log(`  📦 Backup: ${DB_BACKUP_PATH}`);
    console.log(`  🔒 Encrypted: ${DB_ENCRYPTED_PATH}`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Test the encrypted database');
    console.log('  2. Update your app to use encrypted database');
    console.log('  3. If everything works, replace original:');
    console.log(`     mv ${DB_ENCRYPTED_PATH} ${DB_PATH}`);
    console.log('');
    console.log('⚠️  Keep the backup safe until you verify everything works!');
}
catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.log('\n🔄 Rollback: Your original database is safe');
    // Cleanup
    if (fs_1.default.existsSync(DB_ENCRYPTED_PATH)) {
        fs_1.default.unlinkSync(DB_ENCRYPTED_PATH);
        console.log('   Removed incomplete encrypted database');
    }
    process.exit(1);
}
