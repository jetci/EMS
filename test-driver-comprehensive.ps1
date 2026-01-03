# ========================================
# DRIVER MODULE - COMPREHENSIVE TEST SUITE
# ========================================
# Purpose: Verify DRIVER role functionality (Mobile App Flow)
# Date: 2026-01-02
# ========================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "DRIVER MODULE - COMPREHENSIVE TEST SUITE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$BASE_URL = "http://localhost:3001/api"
$PASS_COUNT = 0
$FAIL_COUNT = 0
$DRIVER_TOKEN = ""
$TEST_RIDE_ID = ""

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

# TC-D001: Login as Driver
Write-Host "`nTC-D001: Login as Driver..." -ForegroundColor Gray
try {
    # Using a known driver account
    $loginBody = @{
        email    = "driver1@wecare.dev" 
        password = "password"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($response.token -and $response.user.role -eq 'driver') {
        Test-Result "TC-D001" $true
        $DRIVER_TOKEN = $response.token
    }
    else {
        Test-Result "TC-D001" $false "Login failed or wrong role"
    }
}
catch {
    Test-Result "TC-D001" $false "Login failed: $_"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $DRIVER_TOKEN"
    "Content-Type"  = "application/json"
}

# ========================================
# TEST SUITE 2: PROFILE & STATUS
# ========================================
Write-Host "`n[TEST SUITE 2] Profile & Status" -ForegroundColor Yellow

# TC-D002: Get My Profile
Write-Host "`nTC-D002: Get My Profile..." -ForegroundColor Gray
try {
    $profile = Invoke-RestMethod -Uri "$BASE_URL/drivers/my-profile" -Method GET -Headers $headers
    if ($profile.full_name) {
        Test-Result "TC-D002" $true "Driver: $($profile.full_name)"
    }
    else {
        Test-Result "TC-D002" $false "Invalid profile data"
    }
}
catch {
    Test-Result "TC-D002" $false "Cannot get profile: $_"
}

# TC-D003: Update Status to AVAILABLE
Write-Host "`nTC-D003: Update Status to AVAILABLE..." -ForegroundColor Gray
try {
    $body = @{ status = "AVAILABLE" } | ConvertTo-Json
    $updated = Invoke-RestMethod -Uri "$BASE_URL/drivers/my-profile" -Method PUT -Headers $headers -Body $body
    if ($updated.status -eq "AVAILABLE") {
        Test-Result "TC-D003" $true
    }
    else {
        Test-Result "TC-D003" $false "Status update failed"
    }
}
catch {
    Test-Result "TC-D003" $false "Cannot update status: $_"
}

# ========================================
# TEST SUITE 3: JOB MANAGEMENT
# ========================================
Write-Host "`n[TEST SUITE 3] Job Management" -ForegroundColor Yellow

# TC-D004: Get My Rides (Today's Jobs)
Write-Host "`nTC-D004: Get My Rides..." -ForegroundColor Gray
try {
    $rides = Invoke-RestMethod -Uri "$BASE_URL/drivers/my-rides" -Method GET -Headers $headers
    if ($rides -is [Array]) {
        Test-Result "TC-D004" $true "Found $($rides.Count) active rides"
        if ($rides.Count -gt 0) {
            $TEST_RIDE_ID = $rides[0].id
        }
    }
    else {
        Test-Result "TC-D004" $false "Invalid rides response"
    }
}
catch {
    Test-Result "TC-D004" $false "Cannot get rides: $_"
}

# TC-D005: Update Ride Status (if ride exists)
if ($TEST_RIDE_ID) {
    Write-Host "`nTC-D005: Update Ride Status (EN_ROUTE)..." -ForegroundColor Gray
    try {
        $body = @{ status = "EN_ROUTE_TO_PICKUP" } | ConvertTo-Json
        # Corrected endpoint: PUT /api/rides/:id (not /status)
        $updatedRide = Invoke-RestMethod -Uri "$BASE_URL/rides/$TEST_RIDE_ID" -Method PUT -Headers $headers -Body $body
        if ($updatedRide.status -eq "EN_ROUTE_TO_PICKUP") {
            Test-Result "TC-D005" $true
        }
        else {
            Test-Result "TC-D005" $false "Status mismatch"
        }
    }
    catch {
        Test-Result "TC-D005" $false "Cannot update ride status: $_"
    }
}
else {
    Write-Host "`nTC-D005: Update Ride Status - SKIPPED (No rides available)" -ForegroundColor Yellow
}

# ========================================
# TEST SUITE 4: HISTORY
# ========================================
Write-Host "`n[TEST SUITE 4] History" -ForegroundColor Yellow

# TC-D006: Get My History
Write-Host "`nTC-D006: Get My History..." -ForegroundColor Gray
try {
    $history = Invoke-RestMethod -Uri "$BASE_URL/drivers/my-history" -Method GET -Headers $headers
    if ($history -is [Array]) {
        Test-Result "TC-D006" $true "Found $($history.Count) history items"
    }
    else {
        Test-Result "TC-D006" $false "Invalid history response"
    }
}
catch {
    Test-Result "TC-D006" $false "Cannot get history: $_"
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
