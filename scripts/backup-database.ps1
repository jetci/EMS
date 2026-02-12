# EMS WeCare - Automated Database Backup Script (Windows)
# Run this script daily via Task Scheduler

# Configuration
$BACKUP_DIR = "D:\Backups\WeCare"
$DB_PATH = "D:\EMS\wecare-backend\db\wecare.db"
$RETENTION_DAYS = 30
$DATE = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "wecare_backup_$DATE.db"

# Create backup directory if not exists
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

Write-Host "🔄 Starting backup: $BACKUP_FILE" -ForegroundColor Cyan

# Copy database file
Copy-Item -Path $DB_PATH -Destination "$BACKUP_DIR\$BACKUP_FILE"

# Compress backup
Write-Host "📦 Compressing backup..." -ForegroundColor Yellow
Compress-Archive -Path "$BACKUP_DIR\$BACKUP_FILE" -DestinationPath "$BACKUP_DIR\$BACKUP_FILE.zip"
Remove-Item "$BACKUP_DIR\$BACKUP_FILE"

# Delete old backups (older than 30 days)
Write-Host "🗑️  Removing old backups..." -ForegroundColor Yellow
$cutoffDate = (Get-Date).AddDays(-$RETENTION_DAYS)
Get-ChildItem -Path $BACKUP_DIR -Filter "wecare_backup_*.zip" | 
Where-Object { $_.LastWriteTime -lt $cutoffDate } | 
Remove-Item -Force

# Upload to cloud (optional - Azure Blob Storage)
# az storage blob upload --account-name youraccountname --container-name backups --name $BACKUP_FILE.zip --file "$BACKUP_DIR\$BACKUP_FILE.zip"

Write-Host "✅ Backup completed: $BACKUP_FILE.zip" -ForegroundColor Green

# Log backup
$logEntry = "$(Get-Date): Backup completed - $BACKUP_FILE.zip"
Add-Content -Path "$BACKUP_DIR\backup.log" -Value $logEntry

# Send notification (optional)
# Send-MailMessage -To "admin@wecare.dev" -Subject "Database Backup Completed" -Body $logEntry
