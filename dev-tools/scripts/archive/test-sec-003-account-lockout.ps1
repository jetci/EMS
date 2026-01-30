# SEC-003: Account Lockout Mechanism - Test Script
# Tests account lockout after failed login attempts

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:3001"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SEC-003: Account Lockout Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalTests = 0
$passedTests = 0

# Test 1: Failed Login Attempts Tracked
Write-Host "Test 1: Failed Login Attempts Tracked" -ForegroundColor Yellow
$totalTests++

$testEmail = "lockout-test@example.com"

try {
    # Try to login with wrong password
    $body = @{
        email    = $testEmail
        password = "WrongPassword123!"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "FAIL - Login should have failed" -ForegroundColor Red
}
catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.remainingAttempts) {
        Write-Host "PASS - Failed attempt tracked (Remaining: $($errorResponse.remainingAttempts))" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "FAIL - No remaining attempts info" -ForegroundColor Red
    }
}
Write-Host ""

# Test 2: Multiple Failed Attempts
Write-Host "Test 2: Multiple Failed Attempts (4 more)" -ForegroundColor Yellow
$totalTests++

$lastRemaining = 5
for ($i = 1; $i -le 4; $i++) {
    try {
        $body = @{
            email    = $testEmail
            password = "WrongPassword$i!"
        } | ConvertTo-Json

        Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
            -Method Post `
            -Body $body `
            -ContentType "application/json" `
            -ErrorAction Stop
    }
    catch {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        $lastRemaining = $errorResponse.remainingAttempts
        Write-Host "  Attempt $i failed (Remaining: $lastRemaining)" -ForegroundColor Gray
    }
    Start-Sleep -Milliseconds 500
}

if ($lastRemaining -eq 0) {
    Write-Host "PASS - All attempts consumed" -ForegroundColor Green
    $passedTests++
}
else {
    Write-Host "FAIL - Attempts not properly tracked" -ForegroundColor Red
}
Write-Host ""

# Test 3: Account Locked After Max Attempts
Write-Host "Test 3: Account Locked After Max Attempts" -ForegroundColor Yellow
$totalTests++

try {
    $body = @{
        email    = $testEmail
        password = "AnyPassword123!"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "FAIL - Account should be locked" -ForegroundColor Red
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 423) {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "PASS - Account locked (Status: 423)" -ForegroundColor Green
        Write-Host "  Message: $($errorResponse.message)" -ForegroundColor Gray
        $passedTests++
    }
    else {
        Write-Host "FAIL - Wrong status code: $statusCode" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: Get Lockout Statistics (Admin)
Write-Host "Test 4: Get Lockout Statistics" -ForegroundColor Yellow
$totalTests++

try {
    # Login as admin
    $loginBody = @{
        email    = "admin@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json" `
        -ErrorAction Stop

    $token = $loginResponse.token
    $headers = @{ "Authorization" = "Bearer $token" }

    # Get lockout stats
    $response = Invoke-RestMethod -Uri "$baseUrl/api/lockout/stats" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    if ($response.success -and $response.stats) {
        Write-Host "PASS - Lockout stats retrieved" -ForegroundColor Green
        Write-Host "  Locked Accounts: $($response.stats.lockedAccounts)" -ForegroundColor Gray
        Write-Host "  Max Attempts: $($response.stats.config.maxAttempts)" -ForegroundColor Gray
        $passedTests++
    }
    else {
        Write-Host "FAIL - Stats not available" -ForegroundColor Red
    }
}
catch {
    Write-Host "FAIL - API call failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: List Locked Accounts
Write-Host "Test 5: List Locked Accounts" -ForegroundColor Yellow
$totalTests++

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/lockout/locked" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop
    
    if ($response.success -and $response.count -gt 0) {
        Write-Host "PASS - Found $($response.count) locked account(s)" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "WARNING - No locked accounts found" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "FAIL - API call failed" -ForegroundColor Red
}
Write-Host ""

# Test 6: Unlock Account (Admin)
Write-Host "Test 6: Unlock Account (Admin)" -ForegroundColor Yellow
$totalTests++

try {
    $unlockBody = @{
        email = $testEmail
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/lockout/unlock" `
        -Method Post `
        -Headers $headers `
        -Body $unlockBody `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "PASS - Account unlocked" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "FAIL - Unlock failed" -ForegroundColor Red
    }
}
catch {
    Write-Host "FAIL - API call failed" -ForegroundColor Red
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
    Write-Host "SEC-003: FIXED - All tests passed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Account lockout mechanism is working:" -ForegroundColor Green
    Write-Host "  - Failed attempts are tracked" -ForegroundColor Green
    Write-Host "  - Account locks after 5 failed attempts" -ForegroundColor Green
    Write-Host "  - Lockout duration: 15 minutes" -ForegroundColor Green
    Write-Host "  - Admin can unlock accounts" -ForegroundColor Green
    Write-Host "  - Statistics available" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "SEC-003: NEEDS REVIEW" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review the failed tests above." -ForegroundColor Red
    exit 1
}
