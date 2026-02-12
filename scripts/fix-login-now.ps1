# Automated Login System Fix Script
# This script will restart the backend and frontend on correct ports

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  LOGIN SYSTEM FIX SCRIPT" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop all Node processes
Write-Host "[1/4] Stopping all Node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "      Stopped $($nodeProcesses.Count) Node process(es)" -ForegroundColor Green
    Start-Sleep -Seconds 3
} else {
    Write-Host "      No Node processes running" -ForegroundColor Gray
}

# Step 2: Verify ports are free
Write-Host "[2/4] Verifying ports 3000 and 3001 are free..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
$port3001 = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "      WARNING: Port 3000 still in use" -ForegroundColor Red
    $processId = $port3000.OwningProcess
    Write-Host "      Killing process $processId..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

if ($port3001) {
    Write-Host "      WARNING: Port 3001 still in use" -ForegroundColor Red
    $processId = $port3001.OwningProcess
    Write-Host "      Killing process $processId..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "      Ports are free" -ForegroundColor Green

# Step 3: Start Backend on port 3001
Write-Host "[3/4] Starting backend on port 3001..." -ForegroundColor Yellow
$backendPath = "d:\EMS\wecare-backend"

if (Test-Path $backendPath) {
    # Start backend in new window
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$backendPath'; Write-Host 'Starting Backend Server...' -ForegroundColor Cyan; npm run dev"
    )
    
    Write-Host "      Backend starting..." -ForegroundColor Yellow
    Write-Host "      Waiting for backend to initialize..." -ForegroundColor Gray
    Start-Sleep -Seconds 8
    
    # Check if backend is running on port 3001
    $backendRunning = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
    if ($backendRunning) {
        Write-Host "      Backend is running on port 3001" -ForegroundColor Green
    } else {
        Write-Host "      WARNING: Backend may not be running on port 3001" -ForegroundColor Red
        Write-Host "      Check the backend terminal window for errors" -ForegroundColor Yellow
    }
} else {
    Write-Host "      ERROR: Backend directory not found at $backendPath" -ForegroundColor Red
    exit 1
}

# Step 4: Start Frontend on port 3000
Write-Host "[4/4] Starting frontend on port 3000..." -ForegroundColor Yellow
$frontendPath = "d:\EMS"

if (Test-Path $frontendPath) {
    # Start frontend in new window
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$frontendPath'; Write-Host 'Starting Frontend Server...' -ForegroundColor Cyan; npm run dev"
    )
    
    Write-Host "      Frontend starting..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Check if frontend is running on port 3000
    $frontendRunning = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    if ($frontendRunning) {
        Write-Host "      Frontend is running on port 3000" -ForegroundColor Green
    } else {
        Write-Host "      WARNING: Frontend may not be running on port 3000" -ForegroundColor Yellow
    }
} else {
    Write-Host "      ERROR: Frontend directory not found at $frontendPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  FIX COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "2. Click 'เข้าสู่ระบบ' (Login)" -ForegroundColor White
Write-Host "3. Enter credentials:" -ForegroundColor White
Write-Host "   Email: admin@wecare.ems" -ForegroundColor Cyan
Write-Host "   Password: Admin@123" -ForegroundColor Cyan
Write-Host ""
Write-Host "If login still fails, check the backend terminal for errors" -ForegroundColor Gray
Write-Host ""

# Optional: Test login endpoint
Write-Host "Testing login endpoint..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    $testBody = '{"email":"admin@wecare.ems","password":"Admin@123"}'
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
        -Method POST `
        -Body $testBody `
        -ContentType "application/json" `
        -TimeoutSec 5
    
    Write-Host "✅ LOGIN TEST SUCCESSFUL!" -ForegroundColor Green
    Write-Host "   User: $($response.user.email)" -ForegroundColor Green
    Write-Host "   Role: $($response.user.role)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Login test failed - backend may still be starting" -ForegroundColor Yellow
    Write-Host "   Wait a few more seconds and try logging in via browser" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
