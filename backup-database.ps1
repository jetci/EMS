# ========================================
# Automated Database Backup Script
# ========================================
# Backup SQLite database with compression and retention
# Author: QA Engineer
# Date: 2026-01-31
# ========================================

param(
    [string]$BackupDir = ".\backups",
    [int]$RetentionDays = 30
)

# Configuration
$DB_FILE = ".\wecare-backend\db\wecare.db"
$DATE = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_NAME = "wecare_$DATE.db"

Write-Host "========================================"
Write-Host "Database Backup Script"
Write-Host "========================================"
Write-Host ""

# Check if database exists
if (-not (Test-Path $DB_FILE)) {
    Write-Host "[ERROR] Database file not found: $DB_FILE" -ForegroundColor Red
    exit 1
}

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    Write-Host "[INFO] Creating backup directory: $BackupDir"
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# Get database size
$dbSize = (Get-Item $DB_FILE).Length / 1KB
Write-Host "[INFO] Database size: $([math]::Round($dbSize, 2)) KB"

# Copy database file
Write-Host "[INFO] Backing up database..."
$backupPath = Join-Path $BackupDir $BACKUP_NAME

try {
    Copy-Item $DB_FILE -Destination $backupPath -Force
    Write-Host "[SUCCESS] Database backed up to: $backupPath" -ForegroundColor Green
    
    # Compress backup
    Write-Host "[INFO] Compressing backup..."
    $zipPath = "$backupPath.zip"
    Compress-Archive -Path $backupPath -DestinationPath $zipPath -Force
    
    # Remove uncompressed backup
    Remove-Item $backupPath -Force
    
    $zipSize = (Get-Item $zipPath).Length / 1KB
    Write-Host "[SUCCESS] Compressed to: $zipPath ($([math]::Round($zipSize, 2)) KB)" -ForegroundColor Green
    
    # Calculate compression ratio
    $ratio = [math]::Round((1 - ($zipSize / $dbSize)) * 100, 2)
    Write-Host "[INFO] Compression ratio: $ratio%"
    
} catch {
    Write-Host "[ERROR] Backup failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Clean old backups
Write-Host ""
Write-Host "[INFO] Cleaning old backups (retention: $RetentionDays days)..."
$cutoffDate = (Get-Date).AddDays(-$RetentionDays)
$oldBackups = Get-ChildItem -Path $BackupDir -Filter "wecare_*.db.zip" | Where-Object { $_.LastWriteTime -lt $cutoffDate }

if ($oldBackups.Count -gt 0) {
    Write-Host "[INFO] Found $($oldBackups.Count) old backups to delete"
    foreach ($backup in $oldBackups) {
        Write-Host "  - Deleting: $($backup.Name)"
        Remove-Item $backup.FullName -Force
    }
    Write-Host "[SUCCESS] Old backups cleaned" -ForegroundColor Green
} else {
    Write-Host "[INFO] No old backups to clean"
}

# List current backups
Write-Host ""
Write-Host "[INFO] Current backups:"
$backups = Get-ChildItem -Path $BackupDir -Filter "wecare_*.db.zip" | Sort-Object LastWriteTime -Descending
foreach ($backup in $backups) {
    $size = [math]::Round($backup.Length / 1KB, 2)
    Write-Host "  - $($backup.Name) ($size KB) - $($backup.LastWriteTime)"
}

Write-Host ""
Write-Host "[SUCCESS] Backup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Backup location: $zipPath"
Write-Host "Total backups: $($backups.Count)"
