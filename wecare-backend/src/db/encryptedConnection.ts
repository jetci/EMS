/**
 * Encrypted Database Connection
 * Handles connection to encrypted SQLite database
 * 
 * Note: This is a simplified implementation using file-level encryption.
 * For production, consider using @journeyapps/sqlcipher for native SQLCipher support.
 */

import Database from 'better-sqlite3';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.DB_PATH || './db/wecare.db';
const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY;
const TEMP_DB_PATH = path.join(path.dirname(DB_PATH), '.temp-decrypted.db');

let db: Database.Database | null = null;
let isEncrypted = false;

/**
 * Check if database file is encrypted
 */
const checkIfEncrypted = (filePath: string): boolean => {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    // Try to open as regular SQLite
    const testDb = new Database(filePath, { readonly: true });
    testDb.close();
    return false; // If successful, it's not encrypted
  } catch (error) {
    // If it fails, it might be encrypted
    return true;
  }
};

/**
 * Decrypt database file to temporary location
 */
const decryptDatabase = (encryptedPath: string, tempPath: string): void => {
  if (!DB_ENCRYPTION_KEY) {
    throw new Error('DB_ENCRYPTION_KEY not set in environment variables');
  }

  console.log('🔓 Decrypting database...');

  const encryptedBuffer = fs.readFileSync(encryptedPath);

  // Extract IV, auth tag, and encrypted data
  const iv = encryptedBuffer.slice(0, 16);
  const authTag = encryptedBuffer.slice(16, 32);
  const encrypted = encryptedBuffer.slice(32);

  // Decrypt
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(DB_ENCRYPTION_KEY, 'hex'),
    iv
  );

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  // Write to temp file
  fs.writeFileSync(tempPath, decrypted);
  console.log('✅ Database decrypted to temporary file');
};

/**
 * Encrypt database file from temporary location
 */
const encryptDatabase = (tempPath: string, encryptedPath: string): void => {
  if (!DB_ENCRYPTION_KEY) {
    throw new Error('DB_ENCRYPTION_KEY not set in environment variables');
  }

  console.log('🔐 Encrypting database...');

  const dbBuffer = fs.readFileSync(tempPath);

  // Encrypt using AES-256-GCM
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(DB_ENCRYPTION_KEY, 'hex'),
    iv
  );

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

  fs.writeFileSync(encryptedPath, finalEncrypted);
  console.log('✅ Database encrypted');
};

/**
 * Get database connection
 */
export const getEncryptedDB = (): Database.Database => {
  if (db) {
    return db;
  }

  // Check if database is encrypted
  isEncrypted = checkIfEncrypted(DB_PATH);

  if (isEncrypted) {
    console.log('📦 Opening encrypted database...');
    
    // Decrypt to temp file
    decryptDatabase(DB_PATH, TEMP_DB_PATH);
    
    // Open temp database
    db = new Database(TEMP_DB_PATH);
    
    console.log('✅ Encrypted database opened');
  } else {
    console.log('📦 Opening regular database...');
    db = new Database(DB_PATH);
  }

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');
  
  return db;
};

/**
 * Close database and re-encrypt if needed
 */
export const closeEncryptedDB = (): void => {
  if (!db) {
    return;
  }

  console.log('💾 Closing database...');
  
  // Close database
  db.close();
  db = null;

  if (isEncrypted && fs.existsSync(TEMP_DB_PATH)) {
    // Re-encrypt from temp file
    encryptDatabase(TEMP_DB_PATH, DB_PATH);
    
    // Delete temp file
    fs.unlinkSync(TEMP_DB_PATH);
    console.log('🗑️  Temporary file deleted');
  }

  console.log('✅ Database closed');
};

/**
 * Sync database (for encrypted databases)
 * Call this periodically to save changes
 */
export const syncEncryptedDB = (): void => {
  if (!db || !isEncrypted) {
    return;
  }

  console.log('💾 Syncing encrypted database...');
  
  // Force WAL checkpoint
  db.pragma('wal_checkpoint(TRUNCATE)');
  
  // Re-encrypt
  encryptDatabase(TEMP_DB_PATH, DB_PATH);
  
  console.log('✅ Database synced');
};

/**
 * Setup graceful shutdown
 */
const setupGracefulShutdown = () => {
  const shutdown = () => {
    console.log('\n🛑 Shutting down...');
    closeEncryptedDB();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('exit', () => {
    closeEncryptedDB();
  });
};

// Setup shutdown handlers
setupGracefulShutdown();

// Export singleton instance
export const encryptedDB = {
  get: () => getEncryptedDB(),
  close: closeEncryptedDB,
  sync: syncEncryptedDB,
  isEncrypted: () => isEncrypted
};
