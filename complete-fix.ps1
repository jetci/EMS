# Complete Automated Fix - Kill, Restart, and Test

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Automated Complete Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all Node processes
Write-Host "[1/5] Stopping all Node processes..." -ForegroundColor Yellow
try {
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "  All Node processes stopped" -ForegroundColor Green
    Start-Sleep -Seconds 3
}
catch {
    Write-Host "  No Node processes found" -ForegroundColor Gray
}
Write-Host ""

# Step 2: Start Backend
Write-Host "[2/5] Starting backend on port 3001..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "d:\EMS\wecare-backend"
    npm start
}
Write-Host "  Backend starting (Job ID: $($backendJob.Id))" -ForegroundColor Green
Start-Sleep -Seconds 8
Write-Host ""

# Step 3: Check Backend Health
Write-Host "[3/5] Checking backend health..." -ForegroundColor Yellow
$maxRetries = 10
$retryCount = 0
$backendReady = $false

while ($retryCount -lt $maxRetries -and -not $backendReady) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "  Backend is ready!" -ForegroundColor Green
        Write-Host "  Status: $($health.status)" -ForegroundColor Gray
        $backendReady = $true
    }
    catch {
        $retryCount++
        Write-Host "  Waiting for backend... ($retryCount/$maxRetries)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $backendReady) {
    Write-Host "  Backend failed to start!" -ForegroundColor Red
    Write-Host "  Check: d:\EMS\wecare-backend" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 4: Test Login
Write-Host "[4/5] Testing login..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
        -Method POST `
        -Body (@{email = "admin@wecare.dev"; password = "password" } | ConvertTo-Json) `
        -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "  LOGIN SUCCESS!" -ForegroundColor Green
    Write-Host "  User: $($response.user.email)" -ForegroundColor White
    Write-Host "  Role: $($response.user.role)" -ForegroundColor White
    Write-Host "  ID: $($response.user.id)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ALL SYSTEMS OPERATIONAL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "  Login failed: $statusCode" -ForegroundColor Red
    
    if ($statusCode -eq 401) {
        Write-Host "  Issue: Password verification failed" -ForegroundColor Yellow
    }
    elseif ($statusCode -eq 400) {
        Write-Host "  Issue: SQL Injection Prevention blocking" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "  Backend is running but login has issues" -ForegroundColor Yellow
    Write-Host "  Check backend logs for details" -ForegroundColor Cyan
}
Write-Host ""

# Step 5: Instructions
Write-Host "[5/5] Next steps:" -ForegroundColor Cyan
Write-Host "  Backend is running in background (Job ID: $($backendJob.Id))" -ForegroundColor White
Write-Host ""
Write-Host "  To view backend logs:" -ForegroundColor White
Write-Host "    Receive-Job -Id $($backendJob.Id) -Keep" -ForegroundColor Gray
Write-Host ""
Write-Host "  To stop backend:" -ForegroundColor White
Write-Host "    Stop-Job -Id $($backendJob.Id)" -ForegroundColor Gray
Write-Host "    Remove-Job -Id $($backendJob.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Frontend: Open http://localhost:3000" -ForegroundColor White
Write-Host "  (Make sure frontend is running: npm run dev)" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
