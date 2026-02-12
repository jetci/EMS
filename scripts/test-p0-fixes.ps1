# P0 Bug Fix Test Script
# Tests: API Route Mismatch + POST ride endpoint

$baseUrl = "http://localhost:5000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  P0 Bug Fix Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Test 1: GET /api/community/patients
Write-Host "[TEST 1] GET /api/community/patients" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/community/patients" -Method GET -ContentType "application/json" -ErrorAction Stop
    if ($response -is [Array]) {
        Write-Host "  ✅ PASSED - Got $($response.Count) patients" -ForegroundColor Green
    } else {
        Write-Host "  ❌ FAILED - Response is not an array" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# Test 2: GET /api/community/rides
Write-Host "[TEST 2] GET /api/community/rides" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/community/rides" -Method GET -ContentType "application/json" -ErrorAction Stop
    if ($response -is [Array]) {
        Write-Host "  ✅ PASSED - Got $($response.Count) rides" -ForegroundColor Green
    } else {
        Write-Host "  ❌ FAILED - Response is not an array" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# Test 3: POST /api/community/rides - Create new ride
Write-Host "[TEST 3] POST /api/community/rides (Create Ride)" -ForegroundColor Yellow
try {
    $ridePayload = @{
        patient_id = "PAT-001"
        patient_name = "Test Patient"
        appointment_time = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
        pickup_location = "บ้านทดสอบ หมู่ 1"
        destination = "โรงพยาบาลฝาง"
        special_needs = "ต้องใช้รถเข็น"
        caregiver_count = 1
        contact_phone = "0891234567"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/community/rides" -Method POST -Body $ridePayload -ContentType "application/json" -ErrorAction Stop
    
    if ($response.id -and $response.status -eq "PENDING") {
        Write-Host "  ✅ PASSED - Created ride with ID: $($response.id)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ FAILED - Invalid response structure" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# Test 4: POST /api/community/patients - Create new patient
Write-Host "[TEST 4] POST /api/community/patients (Create Patient)" -ForegroundColor Yellow
try {
    $patientPayload = @{
        full_name = "นาย ทดสอบ ระบบ"
        patient_types = @("ผู้ป่วยติดเตียง")
        key_info = @{
            summary = "ผู้ป่วยทดสอบ"
            chronic_diseases = @("เบาหวาน")
            allergies = @("เพนนิซิลิน")
            contact_phone = "0899999999"
        }
    } | ConvertTo-Json -Depth 3

    $response = Invoke-RestMethod -Uri "$baseUrl/community/patients" -Method POST -Body $patientPayload -ContentType "application/json" -ErrorAction Stop
    
    if ($response.id -and $response.full_name) {
        Write-Host "  ✅ PASSED - Created patient with ID: $($response.id)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ FAILED - Invalid response structure" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "  ALL TESTS PASSED ✅" -ForegroundColor Green
} else {
    Write-Host "  SOME TESTS FAILED ❌" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Cyan
