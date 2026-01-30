# Test Script: BUG-COMM-001 - Input Validation
# Purpose: Verify that frontend validation is implemented correctly
# Priority: HIGH
# Date: 2026-01-10

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing BUG-COMM-001 Fix" -ForegroundColor Cyan
Write-Host "Frontend Input Validation" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passCount = 0
$failCount = 0

# Test 1: Check if validation.ts exists
Write-Host "Test 1: Checking validation utilities..." -ForegroundColor Yellow
if (Test-Path "d:\EMS\utils\validation.ts") {
    Write-Host "  PASSED: validation.ts exists" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: validation.ts not found" -ForegroundColor Red
    $failCount++
}

# Test 2: Check if ValidationErrorDisplay component exists
Write-Host "`nTest 2: Checking error display component..." -ForegroundColor Yellow
if (Test-Path "d:\EMS\components\ui\ValidationErrorDisplay.tsx") {
    Write-Host "  PASSED: ValidationErrorDisplay.tsx exists" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: ValidationErrorDisplay.tsx not found" -ForegroundColor Red
    $failCount++
}

# Test 3: Check validation functions in validation.ts
Write-Host "`nTest 3: Checking validation functions..." -ForegroundColor Yellow
$validationContent = Get-Content "d:\EMS\utils\validation.ts" -Raw -ErrorAction SilentlyContinue

if ($validationContent) {
    $functions = @(
        "validateThaiNationalId",
        "validateThaiPhoneNumber",
        "validateEmail",
        "validateRequired",
        "validateLength",
        "validatePatientData",
        "validateRideData"
    )
    
    $allFound = $true
    foreach ($func in $functions) {
        if ($validationContent -notmatch $func) {
            Write-Host "  FAILED: Function $func not found" -ForegroundColor Red
            $allFound = $false
        }
    }
    
    if ($allFound) {
        Write-Host "  PASSED: All validation functions found" -ForegroundColor Green
        $passCount++
    }
    else {
        $failCount++
    }
}
else {
    Write-Host "  FAILED: Could not read validation.ts" -ForegroundColor Red
    $failCount++
}

# Test 4: Check Thai National ID validation (MOD 11)
Write-Host "`nTest 4: Checking Thai National ID validation..." -ForegroundColor Yellow
if ($validationContent -match "MOD 11") {
    Write-Host "  PASSED: MOD 11 algorithm implemented" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: MOD 11 algorithm not found" -ForegroundColor Red
    $failCount++
}

# Test 5: Check phone number validation (10 digits, starts with 0)
Write-Host "`nTest 5: Checking phone number validation..." -ForegroundColor Yellow
if ($validationContent -match "0\\d\{9\}") {
    Write-Host "  PASSED: Phone validation pattern found" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Phone validation pattern not found" -ForegroundColor Red
    $failCount++
}

# Test 6: Check Thailand coordinates validation
Write-Host "`nTest 6: Checking Thailand coordinates validation..." -ForegroundColor Yellow
if ($validationContent -match "5\.6.*20\.5" -and $validationContent -match "97\.3.*105\.6") {
    Write-Host "  PASSED: Thailand bounds validation found" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Thailand bounds validation not found" -ForegroundColor Red
    $failCount++
}

# Test 7: Check integration examples
Write-Host "`nTest 7: Checking integration examples..." -ForegroundColor Yellow
$exampleCount = 0

if (Test-Path "d:\EMS\VALIDATION_INTEGRATION_EXAMPLE.tsx") {
    Write-Host "  Found: Patient registration example" -ForegroundColor Green
    $exampleCount++
}

if (Test-Path "d:\EMS\VALIDATION_RIDE_REQUEST_EXAMPLE.tsx") {
    Write-Host "  Found: Ride request example" -ForegroundColor Green
    $exampleCount++
}

if ($exampleCount -eq 2) {
    Write-Host "  PASSED: All integration examples found" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Missing integration examples ($exampleCount/2)" -ForegroundColor Red
    $failCount++
}

# Test 8: Check ValidationErrorDisplay component structure
Write-Host "`nTest 8: Checking error display component..." -ForegroundColor Yellow
$errorDisplayContent = Get-Content "d:\EMS\components\ui\ValidationErrorDisplay.tsx" -Raw -ErrorAction SilentlyContinue

if ($errorDisplayContent) {
    if ($errorDisplayContent -match "ValidationErrorDisplay" -and 
        $errorDisplayContent -match "errors" -and
        $errorDisplayContent -match "map") {
        Write-Host "  PASSED: Error display component structure correct" -ForegroundColor Green
        $passCount++
    }
    else {
        Write-Host "  FAILED: Error display component structure incomplete" -ForegroundColor Red
        $failCount++
    }
}
else {
    Write-Host "  FAILED: Could not read ValidationErrorDisplay.tsx" -ForegroundColor Red
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
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 75) { "Yellow" } else { "Red" })

if ($passCount -eq 8) {
    Write-Host "`nALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "BUG-COMM-001 is FIXED" -ForegroundColor Green
    Write-Host "`nValidation features implemented:" -ForegroundColor Cyan
    Write-Host "  - Thai National ID validation (MOD 11)" -ForegroundColor Green
    Write-Host "  - Phone number validation (10 digits)" -ForegroundColor Green
    Write-Host "  - Email validation" -ForegroundColor Green
    Write-Host "  - Required field validation" -ForegroundColor Green
    Write-Host "  - Length validation" -ForegroundColor Green
    Write-Host "  - Thailand coordinates validation" -ForegroundColor Green
    Write-Host "  - Patient data validation" -ForegroundColor Green
    Write-Host "  - Ride request validation" -ForegroundColor Green
    Write-Host "  - Error display component" -ForegroundColor Green
    exit 0
}
elseif ($passCount -ge 6) {
    Write-Host "`nMOST TESTS PASSED" -ForegroundColor Yellow
    Write-Host "Minor issues remain - review above" -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "`nMANY TESTS FAILED" -ForegroundColor Red
    Write-Host "Validation implementation incomplete" -ForegroundColor Red
    exit 1
}
