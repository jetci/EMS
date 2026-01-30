# Quick Fix - Stop port 3000 and restart backend on correct port

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Quick Fix: Backend Port Issue" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill process on port 3000
Write-Host "[1/3] Stopping process on port 3000..." -ForegroundColor Yellow
try {
    $process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
    if ($process) {
        Stop-Process -Id $process -Force
        Write-Host "  Process stopped" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
    else {
        Write-Host "  No process on port 3000" -ForegroundColor Gray
    }
}
catch {
    Write-Host "  Could not stop process" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Kill process on port 3001 (if any)
Write-Host "[2/3] Stopping process on port 3001..." -ForegroundColor Yellow
try {
    $process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
    if ($process) {
        Stop-Process -Id $process -Force
        Write-Host "  Process stopped" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
    else {
        Write-Host "  No process on port 3001" -ForegroundColor Gray
    }
}
catch {
    Write-Host "  Could not stop process" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Instructions
Write-Host "[3/3] Next steps:" -ForegroundColor Cyan
Write-Host "  1. cd d:\EMS\wecare-backend" -ForegroundColor White
Write-Host "  2. npm start" -ForegroundColor White
Write-Host "  3. Verify: http://localhost:3001/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Backend should start on port 3001" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
