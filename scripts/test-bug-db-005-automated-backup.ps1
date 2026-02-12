# 🧪 Test Script: BUG-DB-005 - Automated Backup System
# Test backup functionality and verify setup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 Testing Automated Backup System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @()

# Test 1: Check if backup script exists
Write-Host "Test 1: Backup script exists" -ForegroundColor Yellow
$backupScript = "D:\EMS\wecare-backend\scripts\backup-database.ps1"
if (Test-Path $backupScript) {
    Write-Host "✅ PASS - Backup script found" -ForegroundColor Green
    $testResults += @{ Test = "Backup script exists"; Status = "PASS" }
}
else {
    Write-Host "❌ FAIL - Backup script not found" -ForegroundColor Red
    $testResults += @{ Test = "Backup script exists"; Status = "FAIL" }
}
Write-Host ""

# Test 2: Check if setup script exists
Write-Host "Test 2: Setup script exists" -ForegroundColor Yellow
$setupScript = "D:\EMS\wecare-backend\scripts\setup-backup-task.ps1"
if (Test-Path $setupScript) {
    Write-Host "✅ PASS - Setup script found" -ForegroundColor Green
    $testResults += @{ Test = "Setup script exists"; Status = "PASS" }
}
else {
    Write-Host "❌ FAIL - Setup script not found" -ForegroundColor Red
    $testResults += @{ Test = "Setup script exists"; Status = "FAIL" }
}
Write-Host ""

# Test 3: Check if database exists
Write-Host "Test 3: Database file exists" -ForegroundColor Yellow
$dbPath = "D:\EMS\wecare-backend\db\wecare.db"
if (Test-Path $dbPath) {
    $dbSize = (Get-Item $dbPath).Length / 1KB
    Write-Host "✅ PASS - Database found ($([math]::Round($dbSize, 2)) KB)" -ForegroundColor Green
    $testResults += @{ Test = "Database exists"; Status = "PASS" }
}
else {
    Write-Host "❌ FAIL - Database not found" -ForegroundColor Red
    $testResults += @{ Test = "Database exists"; Status = "FAIL" }
}
Write-Host ""

# Test 4: Check if backup directory can be created
Write-Host "Test 4: Backup directory creation" -ForegroundColor Yellow
$backupDir = "D:\Backups\WeCare"
try {
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    Write-Host "✅ PASS - Backup directory accessible: $backupDir" -ForegroundColor Green
    $testResults += @{ Test = "Backup directory"; Status = "PASS" }
}
catch {
    Write-Host "❌ FAIL - Cannot create backup directory" -ForegroundColor Red
    $testResults += @{ Test = "Backup directory"; Status = "FAIL" }
}
Write-Host ""

# Test 5: Check scheduled task (if exists)
Write-Host "Test 5: Scheduled task status" -ForegroundColor Yellow
$taskName = "WeCare Database Backup"
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($task) {
    Write-Host "✅ PASS - Scheduled task exists" -ForegroundColor Green
    Write-Host "   State: $($task.State)" -ForegroundColor Cyan
    Write-Host "   Next Run: $((Get-ScheduledTaskInfo -TaskName $taskName).NextRunTime)" -ForegroundColor Cyan
    $testResults += @{ Test = "Scheduled task"; Status = "PASS" }
}
else {
    Write-Host "⚠️  WARNING - Scheduled task not found (not yet setup)" -ForegroundColor Yellow
    Write-Host "   Run setup-backup-task.ps1 to create it" -ForegroundColor Yellow
    $testResults += @{ Test = "Scheduled task"; Status = "WARNING" }
}
Write-Host ""

# Test 6: Run manual backup test
Write-Host "Test 6: Manual backup execution" -ForegroundColor Yellow
Write-Host "   Would you like to run a test backup? (Y/N)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host "   🔄 Running backup..." -ForegroundColor Cyan
    try {
        & $backupScript
        Write-Host "✅ PASS - Backup executed successfully" -ForegroundColor Green
        $testResults += @{ Test = "Manual backup"; Status = "PASS" }
    }
    catch {
        Write-Host "❌ FAIL - Backup execution failed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $testResults += @{ Test = "Manual backup"; Status = "FAIL" }
    }
}
else {
    Write-Host "⏭️  SKIPPED - Manual backup test" -ForegroundColor Yellow
    $testResults += @{ Test = "Manual backup"; Status = "SKIPPED" }
}
Write-Host ""

# Test 7: Check backup files
Write-Host "Test 7: Backup files verification" -ForegroundColor Yellow
$backupFiles = Get-ChildItem -Path $backupDir -Filter "wecare_backup_*.zip" -ErrorAction SilentlyContinue

if ($backupFiles) {
    Write-Host "✅ PASS - Found $($backupFiles.Count) backup file(s)" -ForegroundColor Green
    $latestBackup = $backupFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    Write-Host "   Latest: $($latestBackup.Name) ($([math]::Round($latestBackup.Length / 1KB, 2)) KB)" -ForegroundColor Cyan
    Write-Host "   Created: $($latestBackup.LastWriteTime)" -ForegroundColor Cyan
    $testResults += @{ Test = "Backup files"; Status = "PASS" }
}
else {
    Write-Host "⚠️  WARNING - No backup files found" -ForegroundColor Yellow
    Write-Host "   Run a manual backup first" -ForegroundColor Yellow
    $testResults += @{ Test = "Backup files"; Status = "WARNING" }
}
Write-Host ""

# Test 8: Check backup log
Write-Host "Test 8: Backup log verification" -ForegroundColor Yellow
$logFile = "$backupDir\backup.log"
if (Test-Path $logFile) {
    $logLines = Get-Content $logFile -Tail 5
    Write-Host "✅ PASS - Backup log exists" -ForegroundColor Green
    Write-Host "   Last 5 entries:" -ForegroundColor Cyan
    $logLines | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    $testResults += @{ Test = "Backup log"; Status = "PASS" }
}
else {
    Write-Host "⚠️  WARNING - Backup log not found" -ForegroundColor Yellow
    $testResults += @{ Test = "Backup log"; Status = "WARNING" }
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$warnCount = ($testResults | Where-Object { $_.Status -eq "WARNING" }).Count
$skipCount = ($testResults | Where-Object { $_.Status -eq "SKIPPED" }).Count

Write-Host "Total Tests: $($testResults.Count)"
Write-Host "✅ Passed: $passCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red
Write-Host "⚠️  Warnings: $warnCount" -ForegroundColor Yellow
Write-Host "⏭️  Skipped: $skipCount" -ForegroundColor Gray
Write-Host ""

# Detailed results
Write-Host "📋 Detailed Results:" -ForegroundColor Cyan
foreach ($result in $testResults) {
    $icon = switch ($result.Status) {
        "PASS" { "✅" }
        "FAIL" { "❌" }
        "WARNING" { "⚠️ " }
        "SKIPPED" { "⏭️ " }
    }
    $color = switch ($result.Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARNING" { "Yellow" }
        "SKIPPED" { "Gray" }
    }
    Write-Host "   $icon $($result.Test): $($result.Status)" -ForegroundColor $color
}
Write-Host ""

# Recommendations
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "💡 Recommendations" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($failCount -gt 0) {
    Write-Host "🔴 Action Required:" -ForegroundColor Red
    Write-Host "   Fix failed tests before proceeding"
    Write-Host ""
}

if ($warnCount -gt 0) {
    Write-Host "🟡 Suggested Actions:" -ForegroundColor Yellow
    if (-not $task) {
        Write-Host "   1. Run setup-backup-task.ps1 to create scheduled task"
    }
    if (-not $backupFiles) {
        Write-Host "   2. Run a manual backup to verify functionality"
    }
    Write-Host ""
}

if ($passCount -eq $testResults.Count) {
    Write-Host "🎉 All tests passed! Backup system is fully operational." -ForegroundColor Green
    Write-Host ""
}

Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Verify backups are running daily"
Write-Host "   2. Test restore process periodically"
Write-Host "   3. Monitor backup logs"
Write-Host "   4. Consider cloud backup (AWS S3/Azure Blob)"
Write-Host ""
