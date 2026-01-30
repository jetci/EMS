# Database Backup & Restore Guide

**Version:** 1.0  
**Last Updated:** 2026-01-07  
**For:** EMS WeCare System

---

## 📋 Overview

This guide explains how to backup and restore the SQLite database for the EMS WeCare system.

---

## 🔄 Automated Backup

### Backup Script

**Location:** `wecare-backend/scripts/backup-database.js`

**Features:**
- ✅ Automatic daily backups
- ✅ Retention policy (30 days)
- ✅ Backup verification
- ✅ Old backup cleanup
- ✅ Detailed logging

### Manual Backup

Run backup manually:

```bash
cd wecare-backend
node scripts/backup-database.js
```

**Output:**
```
🔄 Database Backup Script
==================================================
⏰ Started at: 2026-01-07T23:35:00.000Z

✅ Created backup directory: D:\EMS\wecare-backend\backups
📊 Database size: 2.45 MB
📂 Backup directory: D:\EMS\wecare-backend\backups
⏳ Creating backup: wecare-backup-20260107-233500.db...
✅ Backup created successfully!
📁 Location: D:\EMS\wecare-backend\backups\wecare-backup-20260107-233500.db
📊 Size: 2.45 MB

🧹 Cleaning up old backups...
📊 Total backups found: 5
✅ No old backups to clean up
📊 Backups remaining: 5

📋 Available backups:
   1. wecare-backup-20260107-233500.db (2.45 MB) - 2026-01-07T16:35:00.000Z
   2. wecare-backup-20260106-020000.db (2.40 MB) - 2026-01-06T19:00:00.000Z
   ...

==================================================
✅ Backup process completed successfully!
⏰ Finished at: 2026-01-07T23:35:05.000Z
```

---

## ⏰ Schedule Automated Backups

### Windows (Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Name: "EMS Database Backup"
4. Trigger: Daily at 2:00 AM
5. Action: Start a program
   - Program: `node`
   - Arguments: `"D:\EMS\wecare-backend\scripts\backup-database.js"`
   - Start in: `D:\EMS\wecare-backend`
6. Finish

### Linux/Mac (Cron)

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2:00 AM)
0 2 * * * cd /path/to/wecare-backend && node scripts/backup-database.js >> logs/backup.log 2>&1
```

---

## 🔙 Restore Database

### List Available Backups

```bash
cd wecare-backend
node scripts/restore-database.js
```

**Output:**
```
📋 Available backups:
   1. wecare-backup-20260107-233500.db (2.45 MB) - 2026-01-07T16:35:00.000Z
   2. wecare-backup-20260106-020000.db (2.40 MB) - 2026-01-06T19:00:00.000Z
   3. wecare-backup-20260105-020000.db (2.38 MB) - 2026-01-05T19:00:00.000Z

⚠️  Usage: node scripts/restore-database.js [backup-filename]
```

### Restore from Backup

```bash
node scripts/restore-database.js wecare-backup-20260107-233500.db
```

**Interactive Process:**
```
🔄 Database Restore Script
==================================================
⏰ Started at: 2026-01-07T23:40:00.000Z

📁 Backup file: wecare-backup-20260107-233500.db
📊 Size: 2.45 MB
📅 Date: 2026-01-07T16:35:00.000Z

⚠️  WARNING: This will replace the current database!
⚠️  All current data will be lost!
⚠️  Make sure to backup current database first if needed.

❓ Are you sure you want to restore? (y/N): y

💾 Backing up current database to: wecare-before-restore-1704668400000.db
✅ Current database backed up

⏳ Restoring database from backup...
✅ Database restored successfully!
📁 Location: D:\EMS\wecare-backend\db\wecare.db
📊 Size: 2.45 MB

⚠️  Please restart the backend server for changes to take effect.

==================================================
✅ Restore process completed!
⏰ Finished at: 2026-01-07T23:40:10.000Z
```

---

## 📂 Backup Storage

### Default Location

```
wecare-backend/
└── backups/
    ├── wecare-backup-20260107-233500.db
    ├── wecare-backup-20260106-020000.db
    ├── wecare-backup-20260105-020000.db
    └── ...
```

### Backup Naming Convention

```
wecare-backup-YYYYMMDD-HHMMSS.db

Example:
wecare-backup-20260107-233500.db
             └─ 2026-01-07 23:35:00
```

---

## 🔒 Retention Policy

**Default Settings:**
- **Retention Period:** 30 days
- **Maximum Backups:** 30 files
- **Cleanup:** Automatic (runs after each backup)

**Modify in `backup-database.js`:**
```javascript
const RETENTION_DAYS = 30;  // Change to desired days
const MAX_BACKUPS = 30;     // Change to desired count
```

---

## 🛡️ Best Practices

### 1. Regular Backups
- ✅ Schedule daily backups (2:00 AM recommended)
- ✅ Verify backup logs regularly
- ✅ Test restore process monthly

### 2. Off-site Backup
```bash
# Copy backups to external storage
robocopy "D:\EMS\wecare-backend\backups" "E:\EMS-Backups" /MIR

# Or cloud storage (example: Google Drive, Dropbox)
```

### 3. Before Major Changes
```bash
# Always backup before:
# - Database migrations
# - Major updates
# - Data imports
node scripts/backup-database.js
```

### 4. Disaster Recovery Plan
1. Keep backups in multiple locations
2. Document restore procedure
3. Test restore regularly
4. Keep backup encryption keys safe

---

## 🧪 Testing Backup/Restore

### Test Backup

```bash
# 1. Run backup
node scripts/backup-database.js

# 2. Verify backup file exists
ls backups/

# 3. Check backup file size
# Should match database size
```

### Test Restore

```bash
# 1. Create test backup
node scripts/backup-database.js

# 2. Make a small change to database
# (e.g., add a test patient)

# 3. Restore from backup
node scripts/restore-database.js [backup-filename]

# 4. Verify data restored correctly
# (test patient should be gone)
```

---

## 🚨 Troubleshooting

### Backup Fails

**Error:** `Database not found`
```bash
# Check database path
ls db/wecare.db

# If missing, initialize database
npm run migrate
```

**Error:** `Permission denied`
```bash
# Check folder permissions
chmod 755 backups/  # Linux/Mac
# Or run as administrator (Windows)
```

### Restore Fails

**Error:** `Backup not found`
```bash
# List available backups
node scripts/restore-database.js

# Use exact filename from list
```

**Error:** `Size mismatch`
```bash
# Backup file may be corrupted
# Try another backup file
```

---

## 📊 Monitoring

### Check Backup Status

```bash
# View backup logs (if logging to file)
tail -f logs/backup.log

# List recent backups
ls -lht backups/ | head -10
```

### Disk Space

```bash
# Check backup folder size
du -sh backups/

# Monitor disk usage
df -h
```

---

## 🔐 Security

### Encrypt Backups (Optional)

```bash
# Encrypt backup
openssl enc -aes-256-cbc -salt -in wecare-backup.db -out wecare-backup.db.enc

# Decrypt backup
openssl enc -aes-256-cbc -d -in wecare-backup.db.enc -out wecare-backup.db
```

### Access Control

```bash
# Restrict backup folder access (Linux/Mac)
chmod 700 backups/

# Windows: Set folder permissions via Properties → Security
```

---

## 📞 Support

**Issues?**
- Check logs in `logs/backup.log`
- Verify disk space available
- Ensure database is not locked
- Contact system administrator

---

**Created by:** System QA Analyst  
**Date:** 2026-01-07  
**Version:** 1.0
