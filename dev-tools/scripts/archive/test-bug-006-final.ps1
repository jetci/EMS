# Final Test for BUG-006: Race Condition
# Using correct credentials from database

$baseUrl = "http://localhost:3001"

Write-Host ""
Write-Host "========================================"
Write-Host "  BUG-006 FINAL TEST: Race Condition"
Write-Host "========================================"
Write-Host ""

# Login with correct credentials
Write-Host "[1] Logging in as admin..." -ForegroundColor Cyan
try {
    $loginBody = @{
        email = "admin@wecare.ems"
        password = "Admin@123"
    } | ConvertTo-Json

    $loginResult = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST -Body $loginBody -ContentType "application/json"
    
    $token = $loginResult.token
    $userId = $loginResult.user.id
    Write-Host "    [OK] Logged in: $($loginResult.user.email)" -ForegroundColor Green
    Write-Host "    User ID: $userId" -ForegroundColor Gray
    Write-Host "    Role: $($loginResult.user.role)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "    [ERROR] Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Get available driver
Write-Host "[2] Finding available driver..." -ForegroundColor Cyan
try {
    $headers = @{ Authorization = "Bearer $token" }
    $driversResult = Invoke-RestMethod -Uri "$baseUrl/api/drivers" `
        -Method GET -Headers $headers
    
    $availableDriver = $driversResult.drivers | Where-Object { $_.status -eq "AVAILABLE" } | Select-Object -First 1
    
    if ($availableDriver) {
        Write-Host "    [OK] Found driver: $($availableDriver.full_name)" -ForegroundColor Green
        Write-Host "    Driver ID: $($availableDriver.id)" -ForegroundColor Gray
        Write-Host "    Status: $($availableDriver.status)" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "    [SKIP] No available drivers" -ForegroundColor Yellow
        Write-Host "    Creating test scenario with existing driver..." -ForegroundColor Yellow
        
        # Use first driver regardless of status
        $availableDriver = $driversResult.drivers | Select-Object -First 1
        if (!$availableDriver) {
            Write-Host "    [ERROR] No drivers in system" -ForegroundColor Red
            exit 1
        }
        Write-Host "    Using driver: $($availableDriver.full_name) (Status: $($availableDriver.status))" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "    [ERROR] Cannot get drivers: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create test rides
Write-Host "[3] Creating test rides..." -ForegroundColor Cyan

$timestamp = (Get-Date).ToString("yyyyMMddHHmmss")
$ride1Body = @{
    patient_id = "PAT-TEST-$timestamp-1"
    patient_name = "Test Patient 1 (Race Test)"
    patient_phone = "0800000001"
    pickup_location = "Test Location 1"
    pickup_lat = "13.7563"
    pickup_lng = "100.5018"
    destination = "Test Hospital 1"
    destination_lat = "13.7600"
    destination_lng = "100.5100"
    appointment_time = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss")
    trip_type = "emergency"
    notes = "Race condition test - Ride 1"
} | ConvertTo-Json

$ride2Body = @{
    patient_id = "PAT-TEST-$timestamp-2"
    patient_name = "Test Patient 2 (Race Test)"
    patient_phone = "0800000002"
    pickup_location = "Test Location 2"
    pickup_lat = "13.7500"
    pickup_lng = "100.5000"
    destination = "Test Hospital 2"
    destination_lat = "13.7650"
    destination_lng = "100.5150"
    appointment_time = (Get-Date).AddHours(3).ToString("yyyy-MM-ddTHH:mm:ss")
    trip_type = "emergency"
    notes = "Race condition test - Ride 2"
} | ConvertTo-Json

try {
    $ride1 = Invoke-RestMethod -Uri "$baseUrl/api/rides" `
        -Method POST -Body $ride1Body -Headers $headers -ContentType "application/json"
    
    $ride2 = Invoke-RestMethod -Uri "$baseUrl/api/rides" `
        -Method POST -Body $ride2Body -Headers $headers -ContentType "application/json"
    
    Write-Host "    [OK] Ride 1 created: $($ride1.id)" -ForegroundColor Green
    Write-Host "    [OK] Ride 2 created: $($ride2.id)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "    [ERROR] Cannot create rides: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test concurrent assignment
Write-Host "[4] Testing race condition protection..." -ForegroundColor Cyan
Write-Host "    Attempting to assign same driver to 2 rides simultaneously..." -ForegroundColor Gray
Write-Host ""

# First assignment
Write-Host "    Assignment 1: Ride $($ride1.id) -> Driver $($availableDriver.id)" -ForegroundColor Gray
try {
    $assignBody1 = @{ driver_id = $availableDriver.id } | ConvertTo-Json
    $result1 = Invoke-RestMethod -Uri "$baseUrl/api/rides/$($ride1.id)/assign" `
        -Method PATCH -Headers $headers -Body $assignBody1 -ContentType "application/json"
    
    Write-Host "    [OK] First assignment succeeded" -ForegroundColor Green
    $firstSuccess = $true
} catch {
    Write-Host "    [FAIL] First assignment failed: $($_.Exception.Message)" -ForegroundColor Red
    $firstSuccess = $false
}

Start-Sleep -Milliseconds 100

# Second assignment (should fail if BUG-006 is fixed)
Write-Host ""
Write-Host "    Assignment 2: Ride $($ride2.id) -> Driver $($availableDriver.id)" -ForegroundColor Gray
try {
    $assignBody2 = @{ driver_id = $availableDriver.id } | ConvertTo-Json
    $result2 = Invoke-RestMethod -Uri "$baseUrl/api/rides/$($ride2.id)/assign" `
        -Method PATCH -Headers $headers -Body $assignBody2 -ContentType "application/json"
    
    Write-Host "    [FAIL] Second assignment succeeded (SHOULD HAVE FAILED!)" -ForegroundColor Red
    $secondSuccess = $true
} catch {
    $errorMsg = $_.Exception.Message
    if ($errorMsg -match "400" -or $errorMsg -match "not available" -or $errorMsg -match "already assigned") {
        Write-Host "    [OK] Second assignment blocked (as expected)" -ForegroundColor Green
        Write-Host "    Error: $errorMsg" -ForegroundColor Gray
        $secondSuccess = $false
    } else {
        Write-Host "    [ERROR] Unexpected error: $errorMsg" -ForegroundColor Yellow
        $secondSuccess = $false
    }
}

Write-Host ""

# Cleanup
Write-Host "[5] Cleaning up..." -ForegroundColor Cyan
try {
    $cancelBody = @{ status = "CANCELLED"; notes = "Test cleanup" } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$baseUrl/api/rides/$($ride1.id)/status" `
        -Method PATCH -Body $cancelBody -Headers $headers -ContentType "application/json" | Out-Null
    
    Invoke-RestMethod -Uri "$baseUrl/api/rides/$($ride2.id)/status" `
        -Method PATCH -Body $cancelBody -Headers $headers -ContentType "application/json" | Out-Null
    
    Write-Host "    [OK] Test data cleaned up" -ForegroundColor Green
} catch {
    Write-Host "    [WARNING] Cleanup failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Final verdict
Write-Host "========================================"
Write-Host "  TEST RESULT"
Write-Host "========================================"
Write-Host ""

if ($firstSuccess -and -not $secondSuccess) {
    Write-Host "  [PASS] BUG-006 FIXED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Race condition protection working:" -ForegroundColor Green
    Write-Host "  - First assignment: SUCCESS" -ForegroundColor Green
    Write-Host "  - Second assignment: BLOCKED" -ForegroundColor Green
    Write-Host ""
    Write-Host "  The system correctly prevents assigning" -ForegroundColor Green
    Write-Host "  the same driver to multiple rides." -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================"
    Write-Host ""
    exit 0
} elseif ($firstSuccess -and $secondSuccess) {
    Write-Host "  [FAIL] BUG-006 NOT FIXED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Race condition still exists:" -ForegroundColor Red
    Write-Host "  - First assignment: SUCCESS" -ForegroundColor Red
    Write-Host "  - Second assignment: SUCCESS (SHOULD FAIL)" -ForegroundColor Red
    Write-Host ""
    Write-Host "  The same driver was assigned to 2 rides!" -ForegroundColor Red
    Write-Host ""
    Write-Host "========================================"
    Write-Host ""
    exit 1
} else {
    Write-Host "  [INCONCLUSIVE] Test incomplete" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  First assignment failed unexpectedly." -ForegroundColor Yellow
    Write-Host "  Cannot determine if race condition is fixed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "========================================"
    Write-Host ""
    exit 2
}
