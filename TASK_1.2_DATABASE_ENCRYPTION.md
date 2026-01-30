# 🔐 Task 1.2: Database File Encryption

## Overview

เข้ารหัสไฟล์ database ทั้งหมดด้วย AES-256-GCM เพื่อป้องกันการเข้าถึงข้อมูลโดยตรง

**Note:** นี่เป็น file-level encryption สำหรับ better-sqlite3  
สำหรับ production ควรพิจารณาใช้ `@journeyapps/sqlcipher` สำหรับ native SQLCipher support

---

## 📦 Files Created

1. `scripts/migrate-to-encrypted-db.ts` - Migration script
2. `scripts/decrypt-db.ts` - Decryption utility
3. `src/db/encryptedConnection.ts` - Encrypted DB connection

---

## 🚀 Setup Instructions

### Step 1: Generate Database Encryption Key

```bash
# Generate a secure 32-byte key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Example output:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Step 2: Update .env

Add to `wecare-backend/.env`:

```bash
# Database Encryption (REQUIRED for encrypted DB)
DB_ENCRYPTION_KEY=YOUR_64_CHAR_HEX_KEY_HERE

# Example (DO NOT USE IN PRODUCTION):
# DB_ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Step 3: Add NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "migrate-db": "ts-node scripts/migrate-to-encrypted-db.ts",
    "decrypt-db": "ts-node scripts/decrypt-db.ts"
  }
}
```

### Step 4: Run Migration

```bash
cd wecare-backend

# Migrate existing database to encrypted format
npm run migrate-db
```

**Expected Output:**
```
🔐 Database Encryption Migration
================================

📁 Database path: ./db/wecare.db
💾 Backup path: ./db/wecare.db.backup-1706515200000
🔒 Encrypted path: ./db/wecare.db.encrypted

Step 1/5: Creating backup...
✅ Backup created: 2.45 MB

Step 2/5: Opening original database...
✅ Found 14 tables: users, patients, drivers, rides, ...

Step 3/5: Creating encrypted database...
⚠️  Note: Using file-level encryption approach

Step 4/5: Copying schema and data...
  ✓ users: 10 rows
  ✓ patients: 45 rows
  ✓ drivers: 8 rows
  ✓ rides: 123 rows
  ...
✅ Copied 250 total rows

Step 5/5: Encrypting database file...
✅ Database encrypted: 2.46 MB

🎉 Migration Complete!
```

### Step 5: Test Encrypted Database

```bash
# Try to open with sqlite3 (should fail)
sqlite3 db/wecare.db.encrypted "SELECT * FROM users;"
# Error: file is not a database

# Decrypt for testing
npm run decrypt-db
# Creates db/wecare.db.decrypted

# Open decrypted file
sqlite3 db/wecare.db.decrypted "SELECT COUNT(*) FROM users;"
# Should work

# Delete decrypted file
rm db/wecare.db.decrypted
```

### Step 6: Replace Original Database

```bash
# If everything works, replace original
mv db/wecare.db.encrypted db/wecare.db

# Keep backup safe
# db/wecare.db.backup-TIMESTAMP
```

---

## 🔧 Usage in Application

### Option A: Use Encrypted Connection (Recommended)

```typescript
// Instead of:
import { sqliteDB } from './db/sqliteDB';

// Use:
import { encryptedDB } from './db/encryptedConnection';

const db = encryptedDB.get();

// Your queries...
const users = db.prepare('SELECT * FROM users').all();

// Sync periodically (every 5 minutes)
setInterval(() => {
  encryptedDB.sync();
}, 5 * 60 * 1000);

// Close on shutdown
process.on('SIGTERM', () => {
  encryptedDB.close();
});
```

### Option B: Use SQLCipher (Production)

```bash
# Install SQLCipher
npm install @journeyapps/sqlcipher

# Remove better-sqlite3
npm uninstall better-sqlite3
```

```typescript
// src/db/connection.ts
import Database from '@journeyapps/sqlcipher';

const DB_PATH = process.env.DB_PATH || './db/wecare.db';
const DB_KEY = process.env.DB_ENCRYPTION_KEY!;

export const db = new Database(DB_PATH);

// Enable encryption
db.pragma(`key = '${DB_KEY}'`);
db.pragma('cipher_page_size = 4096');
db.pragma('kdf_iter = 256000');

// Test connection
try {
  db.prepare('SELECT count(*) FROM sqlite_master').get();
  console.log('✅ Database encrypted successfully');
} catch (err) {
  console.error('❌ Failed to decrypt database');
  process.exit(1);
}
```

---

## 🧪 Testing

### Test 1: Verify Encryption

```bash
# Database should not be readable with sqlite3
sqlite3 db/wecare.db "SELECT * FROM users;"
# Expected: Error: file is not a database
```

### Test 2: Verify Decryption

```bash
# Decrypt and check
npm run decrypt-db
sqlite3 db/wecare.db.decrypted "SELECT COUNT(*) FROM users;"
# Expected: Returns count

# Cleanup
rm db/wecare.db.decrypted
```

### Test 3: Application Test

```bash
# Start server
npm start

# Test API
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN"

# Should work normally
```

---

## 🔒 Security Considerations

### ✅ Pros
- Database file cannot be opened without encryption key
- Protects data at rest
- Meets PDPA requirements

### ⚠️ Cons
- Performance overhead (decrypt on open, encrypt on close)
- Temp file created during operation
- Not suitable for high-concurrency scenarios

### 🎯 Recommendations

**For Development:**
- Use file-level encryption (current approach)
- Good for testing and small deployments

**For Production:**
- Use SQLCipher (`@journeyapps/sqlcipher`)
- Native encryption, better performance
- No temp files needed

---

## 🚨 Troubleshooting

### Error: "DB_ENCRYPTION_KEY not set"
**Solution:** Add DB_ENCRYPTION_KEY to .env file

### Error: "file is not a database"
**Cause:** Database is encrypted  
**Solution:** Use encrypted connection or decrypt first

### Error: "Decryption failed"
**Possible causes:**
- Wrong encryption key
- Corrupted database file
- File is not encrypted

**Solution:** Check DB_ENCRYPTION_KEY matches the one used for encryption

### Performance Issues
**Solution:** 
- Use SQLCipher for production
- Reduce sync frequency
- Use connection pooling

---

## 📊 Performance Impact

### File-Level Encryption
- **Startup:** +2-5 seconds (decrypt)
- **Shutdown:** +2-5 seconds (encrypt)
- **Runtime:** Minimal (works on decrypted file)
- **Sync:** +1-2 seconds per sync

### SQLCipher (Native)
- **Startup:** +100-200ms
- **Shutdown:** Instant
- **Runtime:** +5-10% overhead
- **Sync:** Instant

---

## 🎯 Next Steps

After completing this task:

1. ✅ Test encrypted database thoroughly
2. ✅ Verify backup strategy
3. ✅ Document encryption key storage
4. ✅ Plan key rotation strategy
5. ✅ Move to Task 1.3: HTTPS & Security Headers

---

## 📝 Rollback Plan

If something goes wrong:

```bash
# Restore from backup
cp db/wecare.db.backup-TIMESTAMP db/wecare.db

# Remove encrypted file
rm db/wecare.db.encrypted

# Remove temp files
rm db/.temp-decrypted.db
```

---

**Status:** ✅ Ready to test  
**Time:** ~1 hour (including testing)  
**Risk:** Low (backup created automatically)
