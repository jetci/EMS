/**
 * Database Decryption Utility
 * Decrypts encrypted database file for recovery or migration
 * 
 * Usage:
 *   npm run decrypt-db
 */

import crypto from 'crypto';
import fs from 'fs';

const DB_ENCRYPTED_PATH = process.env.DB_PATH || './db/wecare.db';
const DB_DECRYPTED_PATH = DB_ENCRYPTED_PATH + '.decrypted';
const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY;

console.log('🔓 Database Decryption Utility');
console.log('==============================\n');

// Validate encryption key
if (!DB_ENCRYPTION_KEY) {
  console.error('❌ Error: DB_ENCRYPTION_KEY not set');
  process.exit(1);
}

if (!fs.existsSync(DB_ENCRYPTED_PATH)) {
  console.error(`❌ Error: Encrypted database not found at ${DB_ENCRYPTED_PATH}`);
  process.exit(1);
}

try {
  console.log('📁 Reading encrypted database...');
  const encryptedBuffer = fs.readFileSync(DB_ENCRYPTED_PATH);
  
  // Extract IV, auth tag, and encrypted data
  const iv = encryptedBuffer.slice(0, 16);
  const authTag = encryptedBuffer.slice(16, 32);
  const encrypted = encryptedBuffer.slice(32);
  
  console.log(`   IV length: ${iv.length} bytes`);
  console.log(`   Auth tag length: ${authTag.length} bytes`);
  console.log(`   Encrypted data: ${(encrypted.length / 1024 / 1024).toFixed(2)} MB\n`);
  
  console.log('🔓 Decrypting...');
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
  
  console.log(`✅ Decrypted: ${(decrypted.length / 1024 / 1024).toFixed(2)} MB\n`);
  
  console.log('💾 Writing decrypted database...');
  fs.writeFileSync(DB_DECRYPTED_PATH, decrypted);
  
  console.log(`✅ Decrypted database saved to: ${DB_DECRYPTED_PATH}\n`);
  console.log('🎉 Decryption complete!');
  console.log('\nYou can now open the decrypted database with:');
  console.log(`  sqlite3 ${DB_DECRYPTED_PATH}`);
  console.log('\n⚠️  Remember to delete the decrypted file when done!');
  
} catch (error) {
  console.error('\n❌ Decryption failed:', error);
  console.log('\nPossible causes:');
  console.log('  - Wrong encryption key');
  console.log('  - Corrupted database file');
  console.log('  - File is not encrypted');
  process.exit(1);
}
