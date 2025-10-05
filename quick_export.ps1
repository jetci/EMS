# Quick Export Script for wiangwec_wecare Database
# PowerShell Script สำหรับ Export ข้อมูลแบบง่าย

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "wiangwec_backup_$timestamp.sql"

Write-Host "=== EMS WeCare Database Export ===" -ForegroundColor Cyan
Write-Host ""

# Database credentials
$dbUser = "wiangwec_wecare"
$dbName = "wiangwec_wecare"
$dbHost = "localhost"

Write-Host "Database: $dbName" -ForegroundColor Yellow
Write-Host "Output: $backupFile" -ForegroundColor Yellow
Write-Host ""

# Export using mysqldump
Write-Host "Exporting database..." -ForegroundColor Green

$mysqldumpPath = "mysqldump"  # ถ้า mysqldump ไม่อยู่ใน PATH ให้ใส่ full path

try {
    # Export ทั้ง Database (Schema + Data)
    & $mysqldumpPath -u $dbUser -p --host=$dbHost $dbName > $backupFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Export สำเร็จ!" -ForegroundColor Green
        Write-Host "ไฟล์: $backupFile" -ForegroundColor Cyan
        
        $fileSize = (Get-Item $backupFile).Length / 1KB
        Write-Host "ขนาด: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Cyan
    } else {
        Write-Host "✗ Export ล้มเหลว" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "วิธีแก้:" -ForegroundColor Yellow
    Write-Host "1. ตรวจสอบว่าติดตั้ง MySQL/MariaDB แล้ว" -ForegroundColor White
    Write-Host "2. ตรวจสอบว่า mysqldump อยู่ใน PATH" -ForegroundColor White
    Write-Host "3. หรือใช้ phpMyAdmin Export แทน" -ForegroundColor White
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
