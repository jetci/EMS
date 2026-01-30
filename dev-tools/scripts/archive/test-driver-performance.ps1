# Test Script: Driver Performance & Workflow Integrity
# Tests for performance metrics update and ownership enforcement

Write-Host "====================================="
Write-Host "Driver Performance & Workflow Test"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Driver 1
Write-Host ""
Write-Host "Logging in as Driver 1 (driver1@wecare.dev)..."
$loginBody = @{ email = "driver1@wecare.dev"; password = "password" } | ConvertTo-Json
Write-Host "Body: $loginBody"
$loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
Write-Host "Login Success"
$TOKEN = $loginResponse.token
$DRIVER_ID = $loginResponse.user.driver_id
$headers = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json" }

# Step 2: Get initial performance
Write-Host ""
Write-Host "Getting initial performance for $DRIVER_ID..."
$drivers = Invoke-RestMethod -Uri "$BASE_URL/drivers" -Method GET -Headers $headers
$driver = $drivers | Where-Object { $_.id -eq $DRIVER_ID }
$initialTrips = $driver.total_trips
Write-Host "Initial total trips: $initialTrips"

# Step 3: Create a ride and assign to Driver 1 (as Admin)
Write-Host ""
Write-Host "Logging in as Admin to assign a ride..."
$adminLoginBody = @{ email = "admin@wecare.dev"; password = "password" } | ConvertTo-Json
$adminLoginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $adminLoginBody -ContentType "application/json"
$ADMIN_TOKEN = $adminLoginResponse.token
$adminHeaders = @{ "Authorization" = "Bearer $ADMIN_TOKEN"; "Content-Type" = "application/json" }

Write-Host "Creating and assigning ride..."
$rideBody = @{ 
    patient_id      = "PAT-001"; 
    patient_name    = "Test Patient"; 
    pickup_location = "Home"; 
    destination     = "Hospital";
    status          = "ASSIGNED";
    driver_id       = $DRIVER_ID;
    driver_name     = "Driver One"
} | ConvertTo-Json
$rideResponse = Invoke-RestMethod -Uri "$BASE_URL/rides" -Method POST -Body $rideBody -Headers $adminHeaders
$RIDE_ID = $rideResponse.id
Write-Host "Ride created: $RIDE_ID"

# Step 4: Driver 1 completes the ride
Write-Host ""
Write-Host "Driver 1 completing the ride..."
$completeBody = @{ status = "COMPLETED" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Body $completeBody -Headers $headers | Out-Null
Write-Host "Ride completed."

# Step 5: Verify performance update
Write-Host ""
Write-Host "Verifying performance update..."
$drivers = Invoke-RestMethod -Uri "$BASE_URL/drivers" -Method GET -Headers $headers
$driver = $drivers | Where-Object { $_.id -eq $DRIVER_ID }
$finalTrips = $driver.total_trips
Write-Host "Final total trips: $finalTrips"

if ($finalTrips -eq ($initialTrips + 1)) {
    Write-Host "PASS: Performance metrics updated correctly."
}
else {
    Write-Host "FAIL: Performance metrics NOT updated. Expected $($initialTrips + 1), got $finalTrips"
}

# Step 6: Test Ownership Enforcement (Driver 1 trying to update a ride assigned to Driver 2)
Write-Host ""
Write-Host "Test: Driver 1 trying to update Driver 2's ride..."
# Create ride for Driver 2 (DRV-002)
$rideBody2 = @{ 
    patient_id   = "PAT-002"; 
    patient_name = "Other Patient"; 
    status       = "ASSIGNED";
    driver_id    = "DRV-002";
    driver_name  = "Driver Two"
} | ConvertTo-Json
$rideResponse2 = Invoke-RestMethod -Uri "$BASE_URL/rides" -Method POST -Body $rideBody2 -Headers $adminHeaders
$RIDE_ID2 = $rideResponse2.id

try {
    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID2" -Method PUT -Body $completeBody -Headers $headers
    Write-Host "FAIL: Driver 1 was able to update Driver 2's ride!"
}
catch {
    if ($_.Exception.Message -match "403") {
        Write-Host "PASS: Driver 1 denied access to Driver 2's ride."
    }
    else {
        Write-Host "FAIL: Unexpected error: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "====================================="
Write-Host "Driver Performance & Workflow Complete"
Write-Host "====================================="
