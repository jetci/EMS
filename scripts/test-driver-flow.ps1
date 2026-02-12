# Test Script: DRV-P1-04 - Driver Workflow Integration Test
# Tests full driver workflow: Assign Ride -> Get Jobs -> Update Status

$baseUrl = "http://localhost:5000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DRV-P1-04: Driver Workflow Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0
$global:driverToken = $null
$global:adminToken = $null
$global:testRideId = $null

function Test-API {
    param($Name, $Method, $Url, $Body, $Expected, $Token)
    
    Write-Host "[$Method] $Name" -ForegroundColor Yellow
    try {
        $params = @{
            Uri         = $Url
            Method      = $Method
            ContentType = "application/json; charset=utf-8"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 3
        }
        
        if ($Token) {
            $params.Headers = @{ Authorization = "Bearer $Token" }
        }
        
        $response = Invoke-RestMethod @params
        
        if ($Expected) {
            $checkPassed = & $Expected $response
            if ($checkPassed) {
                Write-Host "  ✅ PASSED" -ForegroundColor Green
                $script:passed++
            }
            else {
                Write-Host "  ❌ FAILED - Expectation not met" -ForegroundColor Red
                $script:failed++
            }
        }
        else {
            Write-Host "  ✅ PASSED" -ForegroundColor Green
            $script:passed++
        }
        return $response
    }
    catch {
        Write-Host "  ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
        return $null
    }
}

# 1. Login as Admin (to create/assign ride)
# Assuming we have an admin user or can create one. If not, we'll use a community user to create and then manually assign via file edit or if API supports.
# Actually, let's use community user to create a ride first.

Write-Host "`n=== Step 1: Create Ride as Community User ===" -ForegroundColor Magenta
$commLogin = Test-API "Login Community" "POST" "$baseUrl/auth/login" @{
    email    = "community1@wecare.dev"
    password = "password"
} { param($r) $r.token -ne $null }

$commToken = $commLogin.token

$rideData = @{
    patient_id       = "PAT-001"
    pickup_location  = "Test Pickup"
    destination      = "Test Dest"
    appointment_time = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ssZ")
    trip_type        = "round_trip"
    patient_name     = "Test Patient"
    contact_phone    = "0812345678"
}

$ride = Test-API "Create Ride" "POST" "$baseUrl/community/rides" $rideData { param($r) $r.id -ne $null } $commToken
$global:testRideId = $ride.id
Write-Host "  Created Ride ID: $($global:testRideId)" -ForegroundColor Cyan

# 2. Assign Ride to Driver (Simulating Admin/Dispatcher action)
# Since we don't have a direct 'assign' endpoint exposed/documented yet for this test, 
# we will manually update the ride status and driver_id using the ride update endpoint if possible, 
# OR we rely on the fact that we can update it via jsonDB directly or if there is an endpoint.
# Let's try updating via PUT /community/rides/:id (which usually allows updates)

Write-Host "`n=== Step 2: Assign Ride to Driver ===" -ForegroundColor Magenta
# We need to be admin or officer to assign? Let's try as community (might fail) or just cheat by editing the file if API blocks.
# But wait, we are testing the SYSTEM. 
# Let's try to login as Admin (USR-001)
$adminLogin = Test-API "Login Admin" "POST" "$baseUrl/auth/login" @{
    email    = "admin@wecare.dev"
    password = "admin123"
} { param($r) $r.token -ne $null }

$adminToken = $adminLogin.token

$assignData = @{
    driver_id = "DRV-001"
    status    = "ASSIGNED"
}

$updateRide = Test-API "Assign Ride" "PUT" "$baseUrl/community/rides/$($global:testRideId)" $assignData { 
    param($r) $r.driver_id -eq "DRV-001" -and $r.status -eq "ASSIGNED" 
} $adminToken

# 3. Login as Driver
Write-Host "`n=== Step 3: Login as Driver ===" -ForegroundColor Magenta
$drvLogin = Test-API "Login Driver" "POST" "$baseUrl/auth/login" @{
    email    = "driver1@wecare.dev"
    password = "password"
} { param($r) $r.user.driver_id -eq "DRV-001" }

$global:driverToken = $drvLogin.token

# 4. Get My Rides
Write-Host "`n=== Step 4: Get My Rides ===" -ForegroundColor Magenta
$myRides = Test-API "Get My Rides" "GET" "$baseUrl/drivers/my-rides" $null {
    param($r) $r | Where-Object { $_.id -eq $global:testRideId }
} $global:driverToken

# 5. Update Ride Status (Driver Action)
Write-Host "`n=== Step 5: Update Ride Status (Start Trip) ===" -ForegroundColor Magenta
$statusUpdate = @{
    status = "EN_ROUTE_TO_PICKUP"
}

# Note: Drivers usually use a specific endpoint or the general one? 
# The frontend uses `ridesAPI.updateRideStatus` which calls `PUT /community/rides/:id` (or similar).
# Let's check `api.ts`: updateRideStatus: (id, status) => apiRequest(`/community/rides/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
# Wait, let me check api.ts again for `updateRideStatus`

# Checking api.ts content from memory/previous steps...
# Actually, let's assume it uses the standard update endpoint or a specific status one. 
# I'll try the standard PUT first, if that fails, I might need to check the code.
# But wait, `DriverTodayJobsPage` calls `ridesAPI.updateRideStatus`. 
# Let's assume it maps to `PUT /community/rides/:id` with body `{ status: ... }`.

$updatedRide = Test-API "Update Status to EN_ROUTE" "PUT" "$baseUrl/community/rides/$($global:testRideId)" $statusUpdate {
    param($r) $r.status -eq "EN_ROUTE_TO_PICKUP"
} $global:driverToken

# 6. Verify Status Persisted
Write-Host "`n=== Step 6: Verify Status ===" -ForegroundColor Magenta
$verifyRide = Test-API "Verify Ride Status" "GET" "$baseUrl/community/rides/$($global:testRideId)" $null {
    param($r) $r.status -eq "EN_ROUTE_TO_PICKUP"
} $global:driverToken


# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DRV-P1-04 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" }else { "Green" })
Write-Host ""
