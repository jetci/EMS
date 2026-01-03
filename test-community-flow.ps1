# ========================================
# COMMUNITY MODULE - USER FLOW TEST SUITE
# ========================================
# Purpose: Verify Community User functionality (Register, Login, Request Ride)
# Date: 2026-01-02
# ========================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "COMMUNITY MODULE - USER FLOW TEST SUITE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$BASE_URL = "http://localhost:3001/api"
$PASS_COUNT = 0
$FAIL_COUNT = 0
$TOKEN = ""
$PATIENT_ID = ""
$RIDE_ID = ""

# Helper Functions
function Test-Result {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = ""
    )
    
    if ($Passed) {
        Write-Host "PASS: $TestName" -ForegroundColor Green
        $script:PASS_COUNT++
    }
    else {
        Write-Host "FAIL: $TestName - $Message" -ForegroundColor Red
        $script:FAIL_COUNT++
    }
}

# ========================================
# TEST SUITE 1: AUTHENTICATION
# ========================================
Write-Host "`n[TEST SUITE 1] Authentication" -ForegroundColor Yellow

# TC-C001: Login as Community User
Write-Host "`nTC-C001: Login as Community User..." -ForegroundColor Gray
try {
    $loginBody = @{
        email    = "community1@wecare.dev" 
        password = "password"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($response.token -and $response.user.role -eq 'community') {
        Test-Result "TC-C001" $true
        $TOKEN = $response.token
    }
    else {
        Test-Result "TC-C001" $false "Login failed or wrong role"
    }
}
catch {
    Test-Result "TC-C001" $false "Login failed: $_"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# ========================================
# TEST SUITE 2: PATIENT MANAGEMENT
# ========================================
Write-Host "`n[TEST SUITE 2] Patient Management" -ForegroundColor Yellow

# TC-C002: Create New Patient
Write-Host "`nTC-C002: Create New Patient..." -ForegroundColor Gray
try {
    $patientBody = @{
        full_name      = "Grandma Test"
        date_of_birth  = "1950-01-01"
        gender         = "Female"
        phone_number   = "0812345678"
        address        = "123 Test Village"
        id_card_number = "1234567890123"
        medical_info   = @{
            allergies        = @("Peanuts")
            chronic_diseases = @("Hypertension")
        }
    } | ConvertTo-Json -Depth 10

    $newPatient = Invoke-RestMethod -Uri "$BASE_URL/community/patients" -Method POST -Headers $headers -Body $patientBody
    
    if ($newPatient.id) {
        Test-Result "TC-C002" $true "Created Patient ID: $($newPatient.id)"
        $PATIENT_ID = $newPatient.id
    }
    else {
        Test-Result "TC-C002" $false "Failed to create patient"
    }
}
catch {
    Test-Result "TC-C002" $false "Error creating patient: $_"
}

# TC-C003: Get My Patients
Write-Host "`nTC-C003: Get My Patients..." -ForegroundColor Gray
try {
    $patients = Invoke-RestMethod -Uri "$BASE_URL/community/patients" -Method GET -Headers $headers
    
    $found = $false
    if ($patients -is [Array]) {
        foreach ($p in $patients) {
            if ($p.id -eq $PATIENT_ID) {
                $found = $true
                break
            }
        }
    }
    
    if ($found) {
        Test-Result "TC-C003" $true "Found created patient in list"
    }
    else {
        Test-Result "TC-C003" $false "Created patient not found in list"
    }
}
catch {
    Test-Result "TC-C003" $false "Error getting patients: $_"
}

# ========================================
# TEST SUITE 3: RIDE REQUEST
# ========================================
Write-Host "`n[TEST SUITE 3] Ride Request" -ForegroundColor Yellow

# TC-C004: Request a Ride
if ($PATIENT_ID) {
    Write-Host "`nTC-C004: Request a Ride..." -ForegroundColor Gray
    try {
        $tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss")
        
        $rideBody = @{
            patient_id       = $PATIENT_ID
            patient_name     = "Grandma Test"
            appointment_time = $tomorrow
            pickup_location  = "123 Test Village"
            destination      = "Fang Hospital"
            trip_type        = "General Appointment" 
            contact_phone    = "0812345678"
            special_needs    = @("Wheelchair")
        } | ConvertTo-Json

        $newRide = Invoke-RestMethod -Uri "$BASE_URL/community/rides" -Method POST -Headers $headers -Body $rideBody
        
        if ($newRide.id -and $newRide.status -eq 'PENDING') {
            Test-Result "TC-C004" $true "Created Ride ID: $($newRide.id)"
            $RIDE_ID = $newRide.id
        }
        else {
            Test-Result "TC-C004" $false "Failed to create ride"
        }
    }
    catch {
        Test-Result "TC-C004" $false "Error requesting ride: $_"
    }
}
else {
    Write-Host "`nTC-C004: Request a Ride - SKIPPED (No Patient ID)" -ForegroundColor Yellow
}

# TC-C005: Get My Rides
Write-Host "`nTC-C005: Get My Rides..." -ForegroundColor Gray
try {
    $rides = Invoke-RestMethod -Uri "$BASE_URL/community/rides" -Method GET -Headers $headers
    
    $found = $false
    if ($rides -is [Array]) {
        foreach ($r in $rides) {
            if ($r.id -eq $RIDE_ID) {
                $found = $true
                break
            }
        }
    }
    
    if ($found) {
        Test-Result "TC-C005" $true "Found created ride in list"
    }
    else {
        Test-Result "TC-C005" $false "Created ride not found in list"
    }
}
catch {
    Test-Result "TC-C005" $false "Error getting rides: $_"
}

# ========================================
# FINAL REPORT
# ========================================
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "TEST EXECUTION COMPLETE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "`nRESULTS:" -ForegroundColor White
Write-Host "  PASS: $PASS_COUNT" -ForegroundColor Green
Write-Host "  FAIL: $FAIL_COUNT" -ForegroundColor Red

if ($FAIL_COUNT -eq 0) {
    Write-Host "`nSTATUS: ALL TESTS PASSED" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`nSTATUS: TESTS FAILED" -ForegroundColor Red
    exit 1
}
