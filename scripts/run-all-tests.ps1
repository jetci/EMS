# Automated Test Runner: Community Role
# Purpose: Run all automated tests
# Date: 2026-01-10

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Automated Test Runner" -ForegroundColor Cyan
Write-Host "Community Role - Complete Test Suite" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$totalTests = 0
$passedTests = 0
$failedTests = 0

# Test 1: Run bug fix tests
Write-Host "Running Bug Fix Tests..." -ForegroundColor Yellow
if (Test-Path "d:\EMS\dev-tools\scripts\archive\test-final-bugs.ps1") {
    $result = & powershell -ExecutionPolicy Bypass -File "d:\EMS\dev-tools\scripts\archive\test-final-bugs.ps1"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Bug fix tests PASSED" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "  ❌ Bug fix tests FAILED" -ForegroundColor Red
        $failedTests++
    }
    $totalTests++
}

# Test 2: Run feature tests
Write-Host "`nRunning Feature Tests..." -ForegroundColor Yellow
if (Test-Path "d:\EMS\dev-tools\scripts\archive\test-patient-and-rides.ps1") {
    $result = & powershell -ExecutionPolicy Bypass -File "d:\EMS\dev-tools\scripts\archive\test-patient-and-rides.ps1"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Feature tests PASSED" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "  ❌ Feature tests FAILED" -ForegroundColor Red
        $failedTests++
    }
    $totalTests++
}

# Test 3: Run ride request tests
Write-Host "`nRunning Ride Request Tests..." -ForegroundColor Yellow
if (Test-Path "d:\EMS\dev-tools\scripts\archive\test-create-ride-request.ps1") {
    $result = & powershell -ExecutionPolicy Bypass -File "d:\EMS\dev-tools\scripts\archive\test-create-ride-request.ps1"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Ride request tests PASSED" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "  ❌ Ride request tests FAILED" -ForegroundColor Red
        $failedTests++
    }
    $totalTests++
}

# Test 4: Run improvement tests
Write-Host "`nRunning Improvement Tests..." -ForegroundColor Yellow
if (Test-Path "d:\EMS\dev-tools\scripts\archive\test-ride-request-improvements.ps1") {
    $result = & powershell -ExecutionPolicy Bypass -File "d:\EMS\dev-tools\scripts\archive\test-ride-request-improvements.ps1"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Improvement tests PASSED" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "  ❌ Improvement tests FAILED" -ForegroundColor Red
        $failedTests++
    }
    $totalTests++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Test Suites: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red

$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 0) } else { 0 }
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 75) { "Yellow" } else { "Red" })

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Next: Manual Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Open browser: http://localhost:3000" -ForegroundColor Yellow
Write-Host "2. Login as Community user" -ForegroundColor Yellow
Write-Host "3. Test ride creation (check for RIDE-NaN)" -ForegroundColor Yellow
Write-Host "4. Test patient registration" -ForegroundColor Yellow
Write-Host "5. Test validation errors" -ForegroundColor Yellow

if ($passedTests -eq $totalTests) {
    Write-Host "`n✅ ALL AUTOMATED TESTS PASSED!" -ForegroundColor Green
    Write-Host "Ready for manual testing" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`n⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
    Write-Host "Check failed tests above" -ForegroundColor Yellow
    exit 1
}
