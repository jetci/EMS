#!/bin/bash
# EMS WeCare - Automated Database Backup Script
# Run this script daily via cron job

# Configuration
BACKUP_DIR="/var/backups/wecare"
DB_PATH="/path/to/wecare-backend/db/wecare.db"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="wecare_backup_${DATE}.db"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Backup database
echo "🔄 Starting backup: $BACKUP_FILE"
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/$BACKUP_FILE'"

# Compress backup
echo "📦 Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Delete old backups (older than 30 days)
echo "🗑️  Removing old backups..."
find "$BACKUP_DIR" -name "wecare_backup_*.db.gz" -mtime +$RETENTION_DAYS -delete

# Upload to cloud (optional - AWS S3)
# aws s3 cp "$BACKUP_DIR/$BACKUP_FILE.gz" s3://your-bucket/backups/

echo "✅ Backup completed: $BACKUP_FILE.gz"

# Log backup
echo "$(date): Backup completed - $BACKUP_FILE.gz" >> "$BACKUP_DIR/backup.log"
