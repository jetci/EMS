# BUG-BE-004: CORS Configuration - Test Script
# Tests CORS configuration validation and error handling

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BUG-BE-004: CORS Configuration Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalTests = 0
$passedTests = 0

# Test 1: Development Environment (No ALLOWED_ORIGINS required)
Write-Host "📋 Test 1: Development Environment" -ForegroundColor Yellow
$totalTests++

$env:NODE_ENV = "development"
$env:ALLOWED_ORIGINS = ""

Write-Host "Starting server in development mode..." -NoNewline

# Start server in background
$serverProcess = Start-Process -FilePath "powershell" `
    -ArgumentList "-Command", "cd wecare-backend; npm run dev" `
    -PassThru `
    -WindowStyle Hidden

Start-Sleep -Seconds 5

# Check if server started
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host " ❌" -ForegroundColor Red
    }
}
catch {
    Write-Host " ❌ Server failed to start" -ForegroundColor Red
}

# Stop server
Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host ""

# Test 2: Production Environment (ALLOWED_ORIGINS required)
Write-Host "📋 Test 2: Production Without ALLOWED_ORIGINS (Should Fail)" -ForegroundColor Yellow
$totalTests++

$env:NODE_ENV = "production"
$env:ALLOWED_ORIGINS = ""

Write-Host "Starting server in production mode without ALLOWED_ORIGINS..." -NoNewline

# Capture server output
$outputFile = ".\test-cors-output.txt"
$serverProcess = Start-Process -FilePath "powershell" `
    -ArgumentList "-Command", "cd wecare-backend; npm run dev 2>&1 | Tee-Object -FilePath '$outputFile'" `
    -PassThru `
    -WindowStyle Hidden

Start-Sleep -Seconds 5

# Check if server failed to start (expected)
$serverRunning = Get-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue

if (-not $serverRunning) {
    # Server should have exited
    $output = Get-Content $outputFile -Raw -ErrorAction SilentlyContinue
    if ($output -match "FATAL ERROR.*ALLOWED_ORIGINS") {
        Write-Host " ✅ (Expected failure)" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host " ❌ (Wrong error message)" -ForegroundColor Red
    }
}
else {
    Write-Host " ❌ (Server should not start)" -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
}

Remove-Item $outputFile -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host ""

# Test 3: Production with Valid ALLOWED_ORIGINS
Write-Host "📋 Test 3: Production With Valid ALLOWED_ORIGINS" -ForegroundColor Yellow
$totalTests++

$env:NODE_ENV = "production"
$env:ALLOWED_ORIGINS = "https://wecare.example.com,https://app.wecare.com"

Write-Host "Starting server with valid ALLOWED_ORIGINS..." -NoNewline

$serverProcess = Start-Process -FilePath "powershell" `
    -ArgumentList "-Command", "cd wecare-backend; npm run dev" `
    -PassThru `
    -WindowStyle Hidden

Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host " ❌" -ForegroundColor Red
    }
}
catch {
    Write-Host " ❌ Server failed to start" -ForegroundColor Red
}

Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host ""

# Test 4: Invalid Origin Format
Write-Host "📋 Test 4: Invalid Origin Format (Should Fail)" -ForegroundColor Yellow
$totalTests++

$env:NODE_ENV = "production"
$env:ALLOWED_ORIGINS = "wecare.example.com,invalid-url"

Write-Host "Starting server with invalid origins..." -NoNewline

$outputFile = ".\test-cors-output.txt"
$serverProcess = Start-Process -FilePath "powershell" `
    -ArgumentList "-Command", "cd wecare-backend; npm run dev 2>&1 | Tee-Object -FilePath '$outputFile'" `
    -PassThru `
    -WindowStyle Hidden

Start-Sleep -Seconds 5

$serverRunning = Get-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue

if (-not $serverRunning) {
    $output = Get-Content $outputFile -Raw -ErrorAction SilentlyContinue
    if ($output -match "Invalid origins detected") {
        Write-Host " ✅ (Expected failure)" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host " ❌ (Wrong error message)" -ForegroundColor Red
    }
}
else {
    Write-Host " ❌ (Server should not start)" -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
}

Remove-Item $outputFile -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host ""

# Test 5: Staging Environment with Defaults
Write-Host "📋 Test 5: Staging Environment (Should Use Defaults)" -ForegroundColor Yellow
$totalTests++

$env:NODE_ENV = "staging"
$env:ALLOWED_ORIGINS = ""

Write-Host "Starting server in staging mode..." -NoNewline

$serverProcess = Start-Process -FilePath "powershell" `
    -ArgumentList "-Command", "cd wecare-backend; npm run dev" `
    -PassThru `
    -WindowStyle Hidden

Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host " ❌" -ForegroundColor Red
    }
}
catch {
    Write-Host " ❌ Server failed to start" -ForegroundColor Red
}

Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host ""

# Test 6: CORS Headers Test
Write-Host "📋 Test 6: CORS Headers Validation" -ForegroundColor Yellow
$totalTests++

$env:NODE_ENV = "development"
$env:ALLOWED_ORIGINS = ""

Write-Host "Testing CORS headers..." -NoNewline

$serverProcess = Start-Process -FilePath "powershell" `
    -ArgumentList "-Command", "cd wecare-backend; npm run dev" `
    -PassThru `
    -WindowStyle Hidden

Start-Sleep -Seconds 5

try {
    $headers = @{
        "Origin" = "http://localhost:5173"
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" `
        -Method Get `
        -Headers $headers `
        -TimeoutSec 5 `
        -ErrorAction Stop

    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    
    if ($corsHeader -eq "http://localhost:5173") {
        Write-Host " ✅" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host " ❌ (Wrong CORS header: $corsHeader)" -ForegroundColor Red
    }
}
catch {
    Write-Host " ❌ Request failed" -ForegroundColor Red
}

Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host ""

# Cleanup
$env:NODE_ENV = "development"
$env:ALLOWED_ORIGINS = ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red
Write-Host ""

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })
Write-Host ""

if ($passedTests -eq $totalTests) {
    Write-Host "✅ BUG-BE-004: FIXED - All tests passed!" -ForegroundColor Green
    Write-Host "CORS configuration is working correctly with proper validation." -ForegroundColor Green
    exit 0
}
else {
    Write-Host "❌ BUG-BE-004: NOT FIXED - Some tests failed" -ForegroundColor Red
    Write-Host "Please review the failed tests and fix the CORS configuration." -ForegroundColor Red
    exit 1
}
