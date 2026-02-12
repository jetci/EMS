# Diagnostic Script: POST /api/rides Error
# Purpose: Help diagnose the 500 error
# Date: 2026-01-10

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Diagnostic: POST /api/rides Error" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Checking backend files..." -ForegroundColor Yellow

# Check rides.ts
if (Test-Path "d:\EMS\wecare-backend\src\routes\rides.ts") {
    Write-Host "✅ rides.ts exists" -ForegroundColor Green
    
    $content = Get-Content "d:\EMS\wecare-backend\src\routes\rides.ts" -Raw
    
    if ($content -match "console.log\('Creating ride") {
        Write-Host "✅ Debug logging added" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Debug logging missing" -ForegroundColor Red
    }
    
    if ($content -match "console.error\('Error creating ride") {
        Write-Host "✅ Error logging added" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Error logging missing" -ForegroundColor Red
    }
}
else {
    Write-Host "❌ rides.ts not found" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Check backend console for error details" -ForegroundColor Yellow
Write-Host "2. Look for 'Creating ride with data:' message" -ForegroundColor Yellow
Write-Host "3. Look for 'Error creating ride:' message" -ForegroundColor Yellow
Write-Host "4. Copy the error message and send it here" -ForegroundColor Yellow

Write-Host "`nCommon Issues:" -ForegroundColor Cyan
Write-Host "  - Database constraint violation" -ForegroundColor White
Write-Host "  - Missing required fields" -ForegroundColor White
Write-Host "  - Invalid data format" -ForegroundColor White
Write-Host "  - Foreign key constraint" -ForegroundColor White
