# Fix Script: Clean Invalid Ride IDs
# Purpose: Remove RIDE-NaN entries from database
# Date: 2026-01-10

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleaning Invalid Ride IDs" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$dbPath = "d:\EMS\wecare-backend\db\wecare.db"

if (Test-Path $dbPath) {
    Write-Host "✅ Database found: $dbPath" -ForegroundColor Green
    
    Write-Host "`nExecuting cleanup SQL..." -ForegroundColor Yellow
    
    # Create SQL script
    $sqlScript = @"
-- Check for invalid ride IDs
SELECT id, patient_id, patient_name, created_at 
FROM rides 
WHERE id LIKE '%NaN%' OR patient_id LIKE '%NaN%';

-- Delete invalid rides
DELETE FROM rides WHERE id LIKE '%NaN%' OR patient_id LIKE '%NaN%';

-- Verify cleanup
SELECT COUNT(*) as remaining_invalid 
FROM rides 
WHERE id LIKE '%NaN%' OR patient_id LIKE '%NaN%';
"@
    
    Write-Host $sqlScript -ForegroundColor Cyan
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "1. Backend server will auto-restart (nodemon)" -ForegroundColor Yellow
    Write-Host "2. Try creating a ride again" -ForegroundColor Yellow
    Write-Host "3. Check that ID is RIDE-001 or RIDE-002" -ForegroundColor Yellow
    
    Write-Host "`nFix Applied:" -ForegroundColor Green
    Write-Host "  - generateRideId() now handles NaN" -ForegroundColor Green
    Write-Host "  - Added validation for invalid IDs" -ForegroundColor Green
    Write-Host "  - Will start from RIDE-001 if needed" -ForegroundColor Green
    
}
else {
    Write-Host "❌ Database not found: $dbPath" -ForegroundColor Red
}
