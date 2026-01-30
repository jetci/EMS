# Test BUG-006: Race Condition in Driver Assignment
# Testing concurrent driver assignment

$baseUrl = "http://localhost:3001"

Write-Host ""
Write-Host "========================================"
Write-Host "  Testing BUG-006: Race Condition"
Write-Host "========================================"
Write-Host ""

# Login as admin
Write-Host "[1] Logging in as admin..." -ForegroundColor Cyan
try {
    $loginBody = @{
        email = "admin@wecare.com"
        password = "Admin@123"
    } | ConvertTo-Json

    $loginResult = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST -Body $loginBody -ContentType "application/json"
    
    $token = $loginResult.token
    Write-Host "    [OK] Logged in successfully" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "    [ERROR] Cannot login: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Note: Rate limiter may be blocking. Wait 15 minutes or restart backend." -ForegroundColor Yellow
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
        Write-Host "    [OK] Found driver: $($availableDriver.full_name) (ID: $($availableDriver.id))" -ForegroundColor Green
        Write-Host "    Status: $($availableDriver.status)" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "    [SKIP] No available drivers found" -ForegroundColor Yellow
        Write-Host "    Please ensure at least one driver has status 'AVAILABLE'" -ForegroundColor Yellow
        exit 0
    }
} catch {
    Write-Host "    [ERROR] Cannot get drivers: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create 2 test rides
Write-Host "[3] Creating test rides..." -ForegroundColor Cyan

$ride1Body = @{
    patient_id = "PAT-001"
    patient_name = "Test Patient 1 - Race Condition Test"
    patient_phone = "0812345678"
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
    patient_id = "PAT-002"
    patient_name = "Test Patient 2 - Race Condition Test"
    patient_phone = "0823456789"
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
    
    Write-Host "    [OK] Created ride 1: $($ride1.id)" -ForegroundColor Green
    Write-Host "    [OK] Created ride 2: $($ride2.id)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "    [ERROR] Cannot create rides: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test concurrent assignment
Write-Host "[4] Testing concurrent driver assignment..." -ForegroundColor Cyan
Write-Host "    Assigning same driver to both rides simultaneously..." -ForegroundColor Gray
Write-Host ""

$job1 = Start-Job -ScriptBlock {
    param($url, $token, $rideId, $driverId)
    try {
        $headers = @{ Authorization = "Bearer $token" }
        $body = @{ driver_id = $driverId } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri "$url/api/rides/$rideId/assign" `
            -Method PATCH -Headers $headers -Body $body -ContentType "application/json"
        
        return @{
            Success = $true
            RideId = $rideId
            Message = "Assignment succeeded"
            Response = $result
        }
    } catch {
        return @{
            Success = $false
            RideId = $rideId
            Message = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.value__
        }
    }
} -ArgumentList $baseUrl, $token, $ride1.id, $availableDriver.id

$job2 = Start-Job -ScriptBlock {
    param($url, $token, $rideId, $driverId)
    try {
        $headers = @{ Authorization = "Bearer $token" }
        $body = @{ driver_id = $driverId } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri "$url/api/rides/$rideId/assign" `
            -Method PATCH -Headers $headers -Body $body -ContentType "application/json"
        
        return @{
            Success = $true
            RideId = $rideId
            Message = "Assignment succeeded"
            Response = $result
        }
    } catch {
        return @{
            Success = $false
            RideId = $rideId
            Message = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.value__
        }
    }
} -ArgumentList $baseUrl, $token, $ride2.id, $availableDriver.id

# Wait for jobs
Wait-Job $job1, $job2 | Out-Null
$result1 = Receive-Job $job1
$result2 = Receive-Job $job2
Remove-Job $job1, $job2

# Analyze results
Write-Host "[5] Analyzing results..." -ForegroundColor Cyan
Write-Host ""

Write-Host "    Ride 1 ($($ride1.id)):" -ForegroundColor White
if ($result1.Success) {
    Write-Host "      Status: SUCCESS" -ForegroundColor Green
    Write-Host "      Driver assigned: $($availableDriver.full_name)" -ForegroundColor Gray
} else {
    Write-Host "      Status: FAILED" -ForegroundColor Red
    Write-Host "      Error: $($result1.Message)" -ForegroundColor Gray
    Write-Host "      HTTP Status: $($result1.StatusCode)" -ForegroundColor Gray
}

Write-Host ""

Write-Host "    Ride 2 ($($ride2.id)):" -ForegroundColor White
if ($result2.Success) {
    Write-Host "      Status: SUCCESS" -ForegroundColor Green
    Write-Host "      Driver assigned: $($availableDriver.full_name)" -ForegroundColor Gray
} else {
    Write-Host "      Status: FAILED" -ForegroundColor Red
    Write-Host "      Error: $($result2.Message)" -ForegroundColor Gray
    Write-Host "      HTTP Status: $($result2.StatusCode)" -ForegroundColor Gray
}

Write-Host ""

# Determine if race condition exists
$successCount = 0
if ($result1.Success) { $successCount++ }
if ($result2.Success) { $successCount++ }

Write-Host "========================================"
Write-Host "  TEST RESULT"
Write-Host "========================================"
Write-Host ""

if ($successCount -eq 0) {
    Write-Host "  [INCONCLUSIVE] Both assignments failed" -ForegroundColor Yellow
    Write-Host "  This may indicate another issue (not race condition)" -ForegroundColor Yellow
    $testResult = "INCONCLUSIVE"
} elseif ($successCount -eq 1) {
    Write-Host "  [PASS] BUG-006 FIXED!" -ForegroundColor Green
    Write-Host "  Only 1 assignment succeeded (as expected)" -ForegroundColor Green
    Write-Host "  No race condition detected" -ForegroundColor Green
    $testResult = "PASS"
} else {
    Write-Host "  [FAIL] BUG-006 NOT FIXED!" -ForegroundColor Red
    Write-Host "  Both assignments succeeded (race condition exists)" -ForegroundColor Red
    Write-Host "  Same driver was assigned to 2 rides simultaneously" -ForegroundColor Red
    $testResult = "FAIL"
}

Write-Host ""
Write-Host "========================================"
Write-Host ""

# Cleanup
Write-Host "[6] Cleaning up test data..." -ForegroundColor Cyan

try {
    # Cancel both rides
    $cancelBody = @{ status = "CANCELLED"; notes = "Test cleanup" } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$baseUrl/api/rides/$($ride1.id)/status" `
        -Method PATCH -Body $cancelBody -Headers $headers -ContentType "application/json" | Out-Null
    
    Invoke-RestMethod -Uri "$baseUrl/api/rides/$($ride2.id)/status" `
        -Method PATCH -Body $cancelBody -Headers $headers -ContentType "application/json" | Out-Null
    
    Write-Host "    [OK] Test rides cancelled" -ForegroundColor Green
} catch {
    Write-Host "    [WARNING] Could not cleanup: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Summary
$summary = @{
    TestName = "BUG-006: Race Condition in Driver Assignment"
    TestDate = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Result = $testResult
    Details = @{
        DriverId = $availableDriver.id
        DriverName = $availableDriver.full_name
        Ride1Id = $ride1.id
        Ride1Success = $result1.Success
        Ride2Id = $ride2.id
        Ride2Success = $result2.Success
        SuccessCount = $successCount
    }
}

$summary | ConvertTo-Json -Depth 10 | Out-File "test-bug-006-result.json"
Write-Host "Test result saved to: test-bug-006-result.json"
Write-Host ""

# Exit with appropriate code
if ($testResult -eq "PASS") {
    exit 0
} elseif ($testResult -eq "FAIL") {
    exit 1
} else {
    exit 2
}
