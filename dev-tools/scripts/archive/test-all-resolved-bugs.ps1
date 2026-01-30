# EMS WeCare - Master Test Script
# Tests all resolved bugs (BUG-BE-001, BUG-BE-004, PERF-001)

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:3001"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EMS WeCare - Master Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing 3 Resolved Critical Bugs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalTests = 0
$passedTests = 0
$failedTests = 0

# Check if server is running
Write-Host "🔍 Checking if backend server is running..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host " ✅" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host ""
    Write-Host "❌ ERROR: Backend server is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the backend server first:" -ForegroundColor Yellow
    Write-Host "   cd wecare-backend" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# ============================================
# BUG-BE-001: Role Validation Tests
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BUG-BE-001: Role Validation Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test user credentials
$testUsers = @{
    admin     = @{ email = "admin@wecare.dev"; password = "password"; role = "admin" }
    officer   = @{ email = "officer1@wecare.dev"; password = "password"; role = "OFFICER" }
    driver    = @{ email = "driver1@wecare.dev"; password = "password"; role = "driver" }
    community = @{ email = "community1@wecare.dev"; password = "password"; role = "community" }
}

# Login all users
Write-Host "🔐 Logging in test users..." -ForegroundColor Yellow
$tokens = @{}
foreach ($userKey in $testUsers.Keys) {
    $user = $testUsers[$userKey]
    Write-Host "   $($user.role)..." -NoNewline
    
    try {
        $loginBody = @{
            email    = $user.email
            password = $user.password
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
            -Method Post `
            -Body $loginBody `
            -ContentType "application/json" `
            -ErrorAction Stop

        $tokens[$userKey] = $response.token
        Write-Host " ✅" -ForegroundColor Green
    }
    catch {
        Write-Host " ❌" -ForegroundColor Red
    }
}
Write-Host ""

# Test 1: Admin can access user management
Write-Host "Test 1: Admin can access user management" -NoNewline
$totalTests++
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/users" `
        -Method Get `
        -Headers @{ "Authorization" = "Bearer $($tokens.admin)" } `
        -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host " ❌" -ForegroundColor Red
        $failedTests++
    }
}
catch {
    Write-Host " ❌" -ForegroundColor Red
    $failedTests++
}

# Test 2: Community CANNOT access user management
Write-Host "Test 2: Community CANNOT access user management" -NoNewline
$totalTests++
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/users" `
        -Method Get `
        -Headers @{ "Authorization" = "Bearer $($tokens.community)" } `
        -ErrorAction Stop
    
    Write-Host " ❌ (Should be denied)" -ForegroundColor Red
    $failedTests++
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host " ✅ (Correctly denied)" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host " ❌ (Wrong status: $statusCode)" -ForegroundColor Red
        $failedTests++
    }
}

# Test 3: Officer can access patients
Write-Host "Test 3: Officer can access patients" -NoNewline
$totalTests++
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/patients" `
        -Method Get `
        -Headers @{ "Authorization" = "Bearer $($tokens.officer)" } `
        -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host " ✅" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host " ❌" -ForegroundColor Red
        $failedTests++
    }
}
catch {
    Write-Host " ❌" -ForegroundColor Red
    $failedTests++
}

# Test 4: Driver CANNOT access patients
Write-Host "Test 4: Driver CANNOT access patients" -NoNewline
$totalTests++
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/patients" `
        -Method Get `
        -Headers @{ "Authorization" = "Bearer $($tokens.driver)" } `
        -ErrorAction Stop
    
    Write-Host " ❌ (Should be denied)" -ForegroundColor Red
    $failedTests++
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host " ✅ (Correctly denied)" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host " ❌ (Wrong status: $statusCode)" -ForegroundColor Red
        $failedTests++
    }
}

Write-Host ""
Write-Host "BUG-BE-001 Results: $passedTests/4 passed" -ForegroundColor $(if ($passedTests -eq 4) { "Green" } else { "Yellow" })
Write-Host ""

# ============================================
# BUG-BE-004: CORS Configuration Tests
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BUG-BE-004: CORS Configuration Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$corsTests = 0
$corsPassed = 0

# Test 5: CORS headers present
Write-Host "Test 5: CORS headers present for allowed origin" -NoNewline
$totalTests++
$corsTests++
try {
    $headers = @{
        "Origin" = "http://localhost:5173"
    }
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/health" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop

    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    
    if ($corsHeader -eq "http://localhost:5173") {
        Write-Host " ✅" -ForegroundColor Green
        $passedTests++
        $corsPassed++
    }
    else {
        Write-Host " ❌ (Wrong header: $corsHeader)" -ForegroundColor Red
        $failedTests++
    }
}
catch {
    Write-Host " ❌" -ForegroundColor Red
    $failedTests++
}

# Test 6: Unauthorized origin blocked
Write-Host "Test 6: Unauthorized origin blocked" -NoNewline
$totalTests++
$corsTests++
try {
    $headers = @{
        "Origin" = "http://evil-site.com"
    }
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/health" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop

    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    
    if (-not $corsHeader) {
        Write-Host " ✅ (No CORS header)" -ForegroundColor Green
        $passedTests++
        $corsPassed++
    }
    else {
        Write-Host " ❌ (Should not have CORS header)" -ForegroundColor Red
        $failedTests++
    }
}
catch {
    Write-Host " ❌" -ForegroundColor Red
    $failedTests++
}

Write-Host ""
Write-Host "BUG-BE-004 Results: $corsPassed/2 passed" -ForegroundColor $(if ($corsPassed -eq 2) { "Green" } else { "Yellow" })
Write-Host ""

# ============================================
# PERF-001: Database Performance Tests
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PERF-001: Database Performance Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$perfTests = 0
$perfPassed = 0

# Test 7: Health check endpoint
Write-Host "Test 7: Health check endpoint" -NoNewline
$totalTests++
$perfTests++
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get -ErrorAction Stop
    
    if ($response.status -eq "healthy" -and $response.database.healthy) {
        Write-Host " ✅" -ForegroundColor Green
        $passedTests++
        $perfPassed++
    }
    else {
        Write-Host " ❌" -ForegroundColor Red
        $failedTests++
    }
}
catch {
    Write-Host " ❌" -ForegroundColor Red
    $failedTests++
}

# Test 8: WAL mode enabled
Write-Host "Test 8: WAL mode enabled" -NoNewline
$totalTests++
$perfTests++
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health/database" -Method Get -ErrorAction Stop
    
    if ($response.details.walMode -eq "wal") {
        Write-Host " ✅" -ForegroundColor Green
        $passedTests++
        $perfPassed++
    }
    else {
        Write-Host " ❌ (WAL mode: $($response.details.walMode))" -ForegroundColor Red
        $failedTests++
    }
}
catch {
    Write-Host " ❌" -ForegroundColor Red
    $failedTests++
}

# Test 9: Concurrent query performance
Write-Host "Test 9: Concurrent query performance (10 requests)" -NoNewline
$totalTests++
$perfTests++

if ($tokens.admin) {
    $headers = @{ "Authorization" = "Bearer $($tokens.admin)" }
    $jobs = @()
    $startTime = Get-Date
    
    for ($i = 1; $i -le 10; $i++) {
        $jobs += Start-Job -ScriptBlock {
            param($url, $headers)
            try {
                $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers -ErrorAction Stop
                return @{ success = $true }
            }
            catch {
                return @{ success = $false }
            }
        } -ArgumentList "$baseUrl/api/rides", $headers
    }
    
    $jobs | Wait-Job | Out-Null
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    
    $results = $jobs | Receive-Job
    $successCount = ($results | Where-Object { $_.success }).Count
    $jobs | Remove-Job
    
    if ($successCount -eq 10) {
        Write-Host " ✅ ($([math]::Round($duration, 0))ms total)" -ForegroundColor Green
        $passedTests++
        $perfPassed++
    }
    else {
        Write-Host " ❌ (Only $successCount/10 succeeded)" -ForegroundColor Red
        $failedTests++
    }
}
else {
    Write-Host " ⚠️ (Skipped - no auth)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "PERF-001 Results: $perfPassed/3 passed" -ForegroundColor $(if ($perfPassed -eq 3) { "Green" } else { "Yellow" })
Write-Host ""

# ============================================
# Final Summary
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Final Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total Tests Run: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host ""

$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })
Write-Host ""

# Bug-specific results
Write-Host "Bug-Specific Results:" -ForegroundColor Cyan
Write-Host "  BUG-BE-001 (Role Validation): $(if ($passedTests -ge 4) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($passedTests -ge 4) { "Green" } else { "Red" })
Write-Host "  BUG-BE-004 (CORS Config): $(if ($corsPassed -eq 2) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($corsPassed -eq 2) { "Green" } else { "Red" })
Write-Host "  PERF-001 (DB Performance): $(if ($perfPassed -eq 3) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($perfPassed -eq 3) { "Green" } else { "Red" })
Write-Host ""

if ($passedTests -eq $totalTests) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "All 3 critical bugs are verified as fixed:" -ForegroundColor Green
    Write-Host "  ✅ BUG-BE-001: Role validation working" -ForegroundColor Green
    Write-Host "  ✅ BUG-BE-004: CORS configuration correct" -ForegroundColor Green
    Write-Host "  ✅ PERF-001: Database optimized" -ForegroundColor Green
    Write-Host ""
    Write-Host "System is ready for further testing!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review the failed tests above." -ForegroundColor Red
    Write-Host ""
    exit 1
}
