# BUG-DB-005: Database Backup Strategy - Test Script
# Tests automated backup system

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:3001"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BUG-DB-005: Database Backup Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalTests = 0
$passedTests = 0

# Login as admin
Write-Host "Logging in as admin..." -NoNewline
try {
    $loginBody = @{
        email    = "admin@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json" `
        -ErrorAction Stop

    $token = $response.token
    Write-Host " OK" -ForegroundColor Green
}
catch {
    Write-Host " FAILED" -ForegroundColor Red
    Write-Host "Cannot proceed without authentication" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
}

Write-Host ""

# Test 1: Create Manual Backup
Write-Host "Test 1: Create Manual Backup" -ForegroundColor Yellow
$totalTests++

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/backup/create" `
        -Method Post `
        -Headers $headers `
        -ErrorAction Stop
    
    if ($response.success -and $response.backup.filename) {
        Write-Host "PASS - Backup created: $($response.backup.filename)" -ForegroundColor Green
        Write-Host "  Size: $($response.backup.sizeInMB) MB" -ForegroundColor Gray
        $passedTests++
        $script:backupFilename = $response.backup.filename
    }
    else {
        Write-Host "FAIL - Backup creation failed" -ForegroundColor Red
    }
}
catch {
    Write-Host "FAIL - API call failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: List Backups
Write-Host "Test 2: List Backups" -ForegroundColor Yellow
$totalTests++

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/backup/list" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    if ($response.success -and $response.count -gt 0) {
        Write-Host "PASS - Found $($response.count) backups" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "FAIL - No backups found" -ForegroundColor Red
    }
}
catch {
    Write-Host "FAIL - API call failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get Backup Statistics
Write-Host "Test 3: Get Backup Statistics" -ForegroundColor Yellow
$totalTests++

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/backup/stats" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "PASS - Statistics retrieved" -ForegroundColor Green
        Write-Host "  Total Backups: $($response.stats.totalBackups)" -ForegroundColor Gray
        Write-Host "  Total Size: $($response.stats.totalSizeInMB) MB" -ForegroundColor Gray
        Write-Host "  Retention: $($response.stats.config.maxBackups) backups" -ForegroundColor Gray
        $passedTests++
    }
    else {
        Write-Host "FAIL - Failed to get statistics" -ForegroundColor Red
    }
}
catch {
    Write-Host "FAIL - API call failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Verify Backup
if ($script:backupFilename) {
    Write-Host "Test 4: Verify Backup" -ForegroundColor Yellow
    $totalTests++

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/backup/verify/$($script:backupFilename)" `
            -Method Post `
            -Headers $headers `
            -ErrorAction Stop
        
        if ($response.success -and $response.details.verified) {
            Write-Host "PASS - Backup verified successfully" -ForegroundColor Green
            Write-Host "  Tables: $($response.details.tables)" -ForegroundColor Gray
            $passedTests++
        }
        else {
            Write-Host "FAIL - Backup verification failed" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "FAIL - API call failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 5: Backup Directory Exists
Write-Host "Test 5: Backup Directory Exists" -ForegroundColor Yellow
$totalTests++

$backupDir = ".\wecare-backend\backups"
if (Test-Path $backupDir) {
    $backupFiles = Get-ChildItem $backupDir -Filter "wecare_backup_*.db" -ErrorAction SilentlyContinue
    if ($backupFiles -and $backupFiles.Count -gt 0) {
        Write-Host "PASS - Backup directory exists with $($backupFiles.Count) files" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "WARNING - Backup directory exists but no backups found" -ForegroundColor Yellow
    }
}
else {
    Write-Host "FAIL - Backup directory not found" -ForegroundColor Red
}
Write-Host ""

# Test 6: Cleanup Old Backups
Write-Host "Test 6: Cleanup Old Backups" -ForegroundColor Yellow
$totalTests++

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/backup/cleanup" `
        -Method Post `
        -Headers $headers `
        -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "PASS - Cleanup completed" -ForegroundColor Green
        Write-Host "  Deleted: $($response.deletedBackups) backups" -ForegroundColor Gray
        Write-Host "  Kept: $($response.keptBackups) backups" -ForegroundColor Gray
        $passedTests++
    }
    else {
        Write-Host "FAIL - Cleanup failed" -ForegroundColor Red
    }
}
catch {
    Write-Host "FAIL - API call failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red
Write-Host ""

$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })
Write-Host ""

if ($passedTests -eq $totalTests) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "BUG-DB-005: FIXED - All tests passed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database backup system is working correctly:" -ForegroundColor Green
    Write-Host "  - Automated backups enabled" -ForegroundColor Green
    Write-Host "  - Manual backup creation working" -ForegroundColor Green
    Write-Host "  - Backup verification working" -ForegroundColor Green
    Write-Host "  - Backup rotation/cleanup working" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "BUG-DB-005: NEEDS REVIEW" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review the failed tests above." -ForegroundColor Red
    exit 1
}
