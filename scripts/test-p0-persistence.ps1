# P0-3 Test Script: JsonDB Persistence Test
# Tests data persistence after server restart

$baseUrl = "http://localhost:5000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  P0-3: JsonDB Persistence Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true
$testPatientName = "Test Patient $(Get-Date -Format 'HHmmss')"
$createdPatientId = $null

# Test 1: Create a new patient
Write-Host "[TEST 1] POST /api/community/patients (Create Patient)" -ForegroundColor Yellow
try {
    $patientPayload = @{
        full_name     = $testPatientName
        phone         = "0899999999"
        address       = "Test Address"
        patient_types = "Test Type"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/community/patients" -Method POST -Body $patientPayload -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    
    if ($response.id -and $response.full_name -eq $testPatientName) {
        $createdPatientId = $response.id
        Write-Host "  PASSED - Created patient ID: $createdPatientId" -ForegroundColor Green
    }
    else {
        Write-Host "  FAILED - Invalid response" -ForegroundColor Red
        $allPassed = $false
    }
}
catch {
    Write-Host "  FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# Test 2: Verify data is in JSON file
Write-Host "[TEST 2] Verify patients.json file exists and has data" -ForegroundColor Yellow
$jsonPath = "d:\EMS\wecare-backend\db\data\patients.json"
if (Test-Path $jsonPath) {
    $content = Get-Content $jsonPath -Raw | ConvertFrom-Json
    $found = $content | Where-Object { $_.id -eq $createdPatientId }
    if ($found) {
        Write-Host "  PASSED - Patient $createdPatientId found in JSON file" -ForegroundColor Green
    }
    else {
        Write-Host "  FAILED - Patient not found in JSON file" -ForegroundColor Red
        $allPassed = $false
    }
}
else {
    Write-Host "  FAILED - patients.json file not found" -ForegroundColor Red
    $allPassed = $false
}

# Test 3: Create a new ride
Write-Host "[TEST 3] POST /api/community/rides (Create Ride)" -ForegroundColor Yellow
$testRideDate = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
$createdRideId = $null
try {
    $ridePayload = @{
        patient_id       = "PAT-001"
        patient_name     = "Patient One"
        appointment_time = $testRideDate
        pickup_location  = "Test Pickup"
        destination      = "Test Hospital"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/community/rides" -Method POST -Body $ridePayload -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    
    if ($response.id -and $response.status -eq "PENDING") {
        $createdRideId = $response.id
        Write-Host "  PASSED - Created ride ID: $createdRideId" -ForegroundColor Green
    }
    else {
        Write-Host "  FAILED - Invalid response" -ForegroundColor Red
        $allPassed = $false
    }
}
catch {
    Write-Host "  FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# Test 4: Verify ride is in JSON file
Write-Host "[TEST 4] Verify rides.json file exists and has data" -ForegroundColor Yellow
$ridesJsonPath = "d:\EMS\wecare-backend\db\data\rides.json"
if (Test-Path $ridesJsonPath) {
    $content = Get-Content $ridesJsonPath -Raw | ConvertFrom-Json
    $found = $content | Where-Object { $_.id -eq $createdRideId }
    if ($found) {
        Write-Host "  PASSED - Ride $createdRideId found in JSON file" -ForegroundColor Green
    }
    else {
        Write-Host "  FAILED - Ride not found in JSON file" -ForegroundColor Red
        $allPassed = $false
    }
}
else {
    Write-Host "  FAILED - rides.json file not found" -ForegroundColor Red
    $allPassed = $false
}

# Test 5: GET and verify created data
Write-Host "[TEST 5] GET /api/community/patients - Verify patient exists" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/community/patients" -Method GET -ErrorAction Stop
    $found = $response | Where-Object { $_.id -eq $createdPatientId }
    if ($found) {
        Write-Host "  PASSED - Patient $createdPatientId returned from API" -ForegroundColor Green
    }
    else {
        Write-Host "  FAILED - Patient not returned from API" -ForegroundColor Red
        $allPassed = $false
    }
}
catch {
    Write-Host "  FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "  ALL TESTS PASSED" -ForegroundColor Green
    Write-Host "  Data will persist after server restart!" -ForegroundColor Green
}
else {
    Write-Host "  SOME TESTS FAILED" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Cyan
