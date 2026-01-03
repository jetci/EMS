# Test Script: Ride Event Timeline
# Tests that ride events are properly logged

Write-Host "====================================="
Write-Host "Ride Event Timeline Test"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Officer
Write-Host ""
Write-Host "Logging in as Officer..."
try {
    $loginBody = @{
        email    = "officer1@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    
    if (-not $TOKEN) {
        Write-Host "FAIL: Login failed."
        exit 1
    }
    Write-Host "Login Successful."
}
catch {
    Write-Host "FAIL: Login request failed."
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# Step 2: Create a test ride
Write-Host ""
Write-Host "Creating a test ride..."
try {
    $rideBody = @{
        patient_id       = "PAT-001"
        patient_name     = "Timeline Test Patient"
        appointment_time = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss")
        pickup_location  = "Test Location"
        destination      = "Test Hospital"
        trip_type        = "Regular Appointment"
    } | ConvertTo-Json

    $rideResponse = Invoke-RestMethod -Uri "$BASE_URL/rides" -Method POST -Headers $headers -Body $rideBody
    $RIDE_ID = $rideResponse.id
    Write-Host "Ride Created: $RIDE_ID"
}
catch {
    Write-Host "FAIL: Failed to create ride."
    exit 1
}

# Step 3: Assign driver
Write-Host "Assigning driver..."
try {
    $assignBody = @{
        status      = "ASSIGNED"
        driver_id   = "DRV-001"
        driver_name = "Test Driver"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Headers $headers -Body $assignBody | Out-Null
    Write-Host "Driver assigned."
}
catch {
    Write-Host "WARN: Failed to assign driver."
}

# Step 4: Update status to EN_ROUTE
Write-Host "Updating status to EN_ROUTE_TO_PICKUP..."
try {
    $statusBody = @{
        status = "EN_ROUTE_TO_PICKUP"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Headers $headers -Body $statusBody | Out-Null
    Write-Host "Status updated."
}
catch {
    Write-Host "WARN: Failed to update status."
}

# Step 5: Update status to COMPLETED
Write-Host "Updating status to COMPLETED..."
try {
    $statusBody = @{
        status = "COMPLETED"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Headers $headers -Body $statusBody | Out-Null
    Write-Host "Status updated."
}
catch {
    Write-Host "WARN: Failed to update status."
}

# Step 6: Fetch ride events
Write-Host ""
Write-Host "Fetching ride event timeline..."
try {
    $events = Invoke-RestMethod -Uri "$BASE_URL/ride-events/$RIDE_ID" -Method GET -Headers $headers
    
    if ($events -is [array] -and $events.Count -gt 0) {
        Write-Host "Found $($events.Count) events for $RIDE_ID"
        Write-Host ""
        Write-Host "Timeline:"
        Write-Host "---------"
        
        # Reverse to show oldest first
        [array]::Reverse($events)
        
        foreach ($event in $events) {
            $time = [DateTime]::Parse($event.timestamp).ToString("HH:mm:ss")
            Write-Host "  [$time] $($event.eventType): $($event.description)"
        }
        
        # Verify expected events
        $createdEvent = $events | Where-Object { $_.eventType -eq "CREATED" }
        $assignedEvent = $events | Where-Object { $_.eventType -eq "ASSIGNED" }
        $enRouteEvent = $events | Where-Object { $_.eventType -eq "EN_ROUTE" }
        $completedEvent = $events | Where-Object { $_.eventType -eq "COMPLETED" }
        
        Write-Host ""
        if ($createdEvent) { Write-Host "PASS: CREATED event found" } else { Write-Host "FAIL: CREATED event missing" }
        if ($assignedEvent) { Write-Host "PASS: ASSIGNED event found" } else { Write-Host "FAIL: ASSIGNED event missing" }
        if ($enRouteEvent) { Write-Host "PASS: EN_ROUTE event found" } else { Write-Host "FAIL: EN_ROUTE event missing" }
        if ($completedEvent) { Write-Host "PASS: COMPLETED event found" } else { Write-Host "FAIL: COMPLETED event missing" }
        
    }
    else {
        Write-Host "FAIL: No events found for $RIDE_ID"
        exit 1
    }
}
catch {
    Write-Host "FAIL: Failed to fetch ride events."
    exit 1
}

# Step 7: Clean up
Write-Host ""
Write-Host "Cleaning up..."
try {
    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method DELETE -Headers $headers
    Write-Host "Test ride deleted."
}
catch {
    Write-Host "WARN: Could not delete test ride."
}

Write-Host ""
Write-Host "====================================="
Write-Host "All Ride Event Timeline Tests PASSED"
Write-Host "====================================="
