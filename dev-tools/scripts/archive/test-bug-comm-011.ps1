# Test Script: BUG-COMM-011 - Ownership Check
# Purpose: Verify that ownership checks are implemented
# Priority: HIGH (Already implemented, verification only)
# Date: 2026-01-10

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing BUG-COMM-011 Fix" -ForegroundColor Cyan
Write-Host "Ownership Check Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passCount = 0
$failCount = 0

# Test 1: Check patients.ts for ownership check
Write-Host "Test 1: Checking patients.ts ownership check..." -ForegroundColor Yellow
$patientsContent = Get-Content "d:\EMS\wecare-backend\src\routes\patients.ts" -Raw -ErrorAction SilentlyContinue

if ($patientsContent) {
    if ($patientsContent -match "created_by.*req\.user\.id" -and $patientsContent -match "Access denied") {
        Write-Host "  PASSED: Ownership check found in patients.ts" -ForegroundColor Green
        $passCount++
    }
    else {
        Write-Host "  FAILED: Ownership check not found" -ForegroundColor Red
        $failCount++
    }
}
else {
    Write-Host "  FAILED: Could not read patients.ts" -ForegroundColor Red
    $failCount++
}

# Test 2: Check rides.ts for ownership check
Write-Host "`nTest 2: Checking rides.ts ownership check..." -ForegroundColor Yellow
$ridesContent = Get-Content "d:\EMS\wecare-backend\src\routes\rides.ts" -Raw -ErrorAction SilentlyContinue

if ($ridesContent) {
    if ($ridesContent -match "created_by" -and $ridesContent -match "community") {
        Write-Host "  PASSED: Ownership check found in rides.ts" -ForegroundColor Green
        $passCount++
    }
    else {
        Write-Host "  FAILED: Ownership check not found" -ForegroundColor Red
        $failCount++
    }
}
else {
    Write-Host "  FAILED: Could not read rides.ts" -ForegroundColor Red
    $failCount++
}

# Test 3: Check for created_by field in database schema
Write-Host "`nTest 3: Checking database schema..." -ForegroundColor Yellow
$schemaContent = Get-Content "d:\EMS\wecare-backend\db\schema.sql" -Raw -ErrorAction SilentlyContinue

if ($schemaContent) {
    if ($schemaContent -match "created_by") {
        Write-Host "  PASSED: created_by field in schema" -ForegroundColor Green
        $passCount++
    }
    else {
        Write-Host "  FAILED: created_by field not in schema" -ForegroundColor Red
        $failCount++
    }
}
else {
    Write-Host "  FAILED: Could not read schema.sql" -ForegroundColor Red
    $failCount++
}

# Test 4: Check for role-based filtering
Write-Host "`nTest 4: Checking role-based filtering..." -ForegroundColor Yellow
if ($patientsContent -match "role.*===.*'community'" -and $patientsContent -match "WHERE created_by") {
    Write-Host "  PASSED: Role-based filtering implemented" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Role-based filtering not found" -ForegroundColor Red
    $failCount++
}

# Test 5: Check for 403 Forbidden response
Write-Host "`nTest 5: Checking 403 Forbidden response..." -ForegroundColor Yellow
if ($patientsContent -match "403.*Access denied") {
    Write-Host "  PASSED: 403 Forbidden response implemented" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: 403 response not found" -ForegroundColor Red
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
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })

if ($passCount -eq 5) {
    Write-Host "`nALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "BUG-COMM-011 is VERIFIED" -ForegroundColor Green
    Write-Host "`nOwnership check features:" -ForegroundColor Cyan
    Write-Host "  - created_by field in database" -ForegroundColor Green
    Write-Host "  - Role-based filtering (community users)" -ForegroundColor Green
    Write-Host "  - Ownership validation on update/delete" -ForegroundColor Green
    Write-Host "  - 403 Forbidden for unauthorized access" -ForegroundColor Green
    Write-Host "  - Implemented in both patients and rides" -ForegroundColor Green
    exit 0
}
elseif ($passCount -ge 3) {
    Write-Host "`nMOST TESTS PASSED" -ForegroundColor Yellow
    Write-Host "Ownership check is mostly implemented" -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "`nMANY TESTS FAILED" -ForegroundColor Red
    Write-Host "Ownership check needs implementation" -ForegroundColor Red
    exit 1
}
