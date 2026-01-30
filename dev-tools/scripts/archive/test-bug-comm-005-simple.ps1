# Simple Test Script for BUG-COMM-005
# Test: API Base URL Environment Variable Fix

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing BUG-COMM-005 Fix" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passCount = 0
$failCount = 0

# Test 1: No hardcoded localhost:3001
Write-Host "Test 1: Checking for hardcoded URLs..." -ForegroundColor Yellow
$file = "d:\EMS\pages\CommunityRegisterPatientPage.tsx"
$content = Get-Content $file -Raw

if ($content -match "localhost:3001") {
    Write-Host "  FAILED: Found hardcoded URL" -ForegroundColor Red
    $failCount++
}
else {
    Write-Host "  PASSED: No hardcoded URLs" -ForegroundColor Green
    $passCount++
}

# Test 2: Uses VITE_API_BASE_URL
Write-Host "`nTest 2: Checking for environment variable..." -ForegroundColor Yellow
if ($content -match "VITE_API_BASE_URL") {
    Write-Host "  PASSED: Uses environment variable" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Environment variable not found" -ForegroundColor Red
    $failCount++
}

# Test 3: Check .env.production exists
Write-Host "`nTest 3: Checking .env.production..." -ForegroundColor Yellow
if (Test-Path "d:\EMS\.env.production") {
    $envContent = Get-Content "d:\EMS\.env.production" -Raw
    if ($envContent -match "VITE_API_BASE_URL") {
        Write-Host "  PASSED: .env.production configured" -ForegroundColor Green
        $passCount++
    }
    else {
        Write-Host "  FAILED: VITE_API_BASE_URL not in .env.production" -ForegroundColor Red
        $failCount++
    }
}
else {
    Write-Host "  WARNING: .env.production not found" -ForegroundColor Yellow
    $failCount++
}

# Test 4: No duplicate /api/api/
Write-Host "`nTest 4: Checking for URL duplication..." -ForegroundColor Yellow
if ($content -match "/api/api/") {
    Write-Host "  FAILED: Found duplicate path" -ForegroundColor Red
    $failCount++
}
else {
    Write-Host "  PASSED: No URL duplication" -ForegroundColor Green
    $passCount++
}

# Test 5: Correct implementation
Write-Host "`nTest 5: Verifying implementation..." -ForegroundColor Yellow
if ($content -match "API_BASE.*VITE_API_BASE_URL.*'/api'") {
    Write-Host "  PASSED: Correct implementation" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Implementation not found" -ForegroundColor Red
    $failCount++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($passCount + $failCount)" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

$successRate = [math]::Round(($passCount / ($passCount + $failCount)) * 100, 0)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } else { "Yellow" })

if ($passCount -eq 5) {
    Write-Host "`nALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "BUG-COMM-005 is FIXED" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`nSOME TESTS FAILED" -ForegroundColor Yellow
    exit 1
}
