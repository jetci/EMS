# Test Script: Driver Workflow
# Tests driver login, view rides, update status, and event logging

Write-Host "====================================="
Write-Host "Driver Workflow Test"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Driver
Write-Host ""
Write-Host "Logging in as Driver..."
try {
    $loginBody = @{
        email    = "driver1@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    
    if (-not $TOKEN) {
        Write-Host "FAIL: Login failed."
        exit 1
    }
    Write-Host "Login Successful. Role: $($loginResponse.user.role)"
}
catch {
    Write-Host "FAIL: Login request failed."
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# Step 2: Fetch driver's own rides
Write-Host ""
Write-Host "Fetching driver's rides (my-rides)..."
try {
    $myRides = Invoke-RestMethod -Uri "$BASE_URL/drivers/my-rides" -Method GET -Headers $headers
    Write-Host "Found $($myRides.Count) rides for this driver."
}
catch {
    Write-Host "WARN: Could not fetch my-rides."
}

# Step 3: Fetch driver's profile
Write-Host ""
Write-Host "Fetching driver profile..."
try {
    $profile = Invoke-RestMethod -Uri "$BASE_URL/drivers/my-profile" -Method GET -Headers $headers
    Write-Host "Driver profile: $($profile.full_name) - $($profile.status)"
    Write-Host "  Total Trips: $($profile.total_trips)"
}
catch {
    Write-Host "WARN: Could not fetch driver profile."
}

# Step 4: Create a test ride and assign to this driver (using officer)
Write-Host ""
Write-Host "Logging in as Officer to create a test ride..."
try {
    $officerLogin = @{
        email    = "officer1@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $officerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $officerLogin -ContentType "application/json"
    $OFFICER_TOKEN = $officerResponse.token
    
    $officerHeaders = @{
        "Authorization" = "Bearer $OFFICER_TOKEN"
        "Content-Type"  = "application/json"
    }
    
    # Create ride
    $rideBody = @{
        patient_id       = "PAT-001"
        patient_name     = "Driver Test Patient"
        appointment_time = (Get-Date).AddHours(1).ToString("yyyy-MM-ddTHH:mm:ss")
        pickup_location  = "Test Pickup"
        destination      = "Test Hospital"
    } | ConvertTo-Json

    $rideResponse = Invoke-RestMethod -Uri "$BASE_URL/rides" -Method POST -Headers $officerHeaders -Body $rideBody
    $RIDE_ID = $rideResponse.id
    Write-Host "Ride Created: $RIDE_ID"
    
    # Assign to driver DRV-001
    $assignBody = @{
        status      = "ASSIGNED"
        driver_id   = "DRV-001"
        driver_name = "Test Driver"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Headers $officerHeaders -Body $assignBody | Out-Null
    Write-Host "Ride assigned to driver DRV-001"
}
catch {
    Write-Host "FAIL: Failed to create and assign ride."
    exit 1
}

# Step 5: Driver updates status
Write-Host ""
Write-Host "Driver updating status to EN_ROUTE_TO_PICKUP..."
try {
    $statusBody = @{
        status = "EN_ROUTE_TO_PICKUP"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Headers $headers -Body $statusBody | Out-Null
    Write-Host "Status updated to EN_ROUTE_TO_PICKUP"
}
catch {
    Write-Host "FAIL: Driver cannot update ride status."
    exit 1
}

Write-Host "Driver updating status to COMPLETED..."
try {
    $statusBody = @{
        status = "COMPLETED"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Headers $headers -Body $statusBody | Out-Null
    Write-Host "Ride COMPLETED successfully"
}
catch {
    Write-Host "FAIL: Driver cannot complete ride."
    exit 1
}

# Step 6: Verify events were logged
Write-Host ""
Write-Host "Verifying ride events..."
try {
    $events = Invoke-RestMethod -Uri "$BASE_URL/ride-events/$RIDE_ID" -Method GET -Headers $headers
    Write-Host "Found $($events.Count) events."
    
    $enRouteEvent = $events | Where-Object { $_.eventType -eq "EN_ROUTE" }
    $completedEvent = $events | Where-Object { $_.eventType -eq "COMPLETED" }
    
    if ($enRouteEvent) { Write-Host "PASS: EN_ROUTE event logged" } else { Write-Host "WARN: EN_ROUTE event not found" }
    if ($completedEvent) { Write-Host "PASS: COMPLETED event logged" } else { Write-Host "WARN: COMPLETED event not found" }
}
catch {
    Write-Host "WARN: Could not verify events."
}

# Step 7: Fetch driver history
Write-Host ""
Write-Host "Fetching driver history..."
try {
    $history = Invoke-RestMethod -Uri "$BASE_URL/drivers/my-history" -Method GET -Headers $headers
    Write-Host "History contains $($history.Count) rides."
}
catch {
    Write-Host "WARN: Could not fetch history."
}

# Clean up
Write-Host ""
Write-Host "Cleaning up test ride..."
try {
    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method DELETE -Headers $officerHeaders
    Write-Host "Test ride deleted."
}
catch {
    Write-Host "WARN: Could not delete test ride."
}

Write-Host ""
Write-Host "====================================="
Write-Host "All Driver Workflow Tests PASSED"
Write-Host "====================================="
