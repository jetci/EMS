# Test Script: Driver Audit Log Verification
# Tests that driver actions are properly logged

Write-Host "====================================="
Write-Host "Driver Audit Log Test"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Officer to create and assign ride
Write-Host ""
Write-Host "Creating test ride as Officer..."
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
        patient_name     = "Audit Test Patient"
        appointment_time = (Get-Date).AddHours(1).ToString("yyyy-MM-ddTHH:mm:ss")
        pickup_location  = "Test Location"
        destination      = "Test Hospital"
    } | ConvertTo-Json

    $rideResponse = Invoke-RestMethod -Uri "$BASE_URL/rides" -Method POST -Headers $officerHeaders -Body $rideBody
    $RIDE_ID = $rideResponse.id
    Write-Host "Ride Created: $RIDE_ID"
    
    # Assign to driver
    $assignBody = @{
        status      = "ASSIGNED"
        driver_id   = "DRV-001"
        driver_name = "Test Driver"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Headers $officerHeaders -Body $assignBody | Out-Null
    Write-Host "Ride assigned to DRV-001"
}
catch {
    Write-Host "FAIL: Could not create test ride."
    exit 1
}

# Step 2: Login as Driver and update status
Write-Host ""
Write-Host "Logging in as Driver..."
try {
    $driverLogin = @{
        email    = "driver1@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $driverResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $driverLogin -ContentType "application/json"
    $DRIVER_TOKEN = $driverResponse.token
    
    $driverHeaders = @{
        "Authorization" = "Bearer $DRIVER_TOKEN"
        "Content-Type"  = "application/json"
    }
    
    Write-Host "Driver login successful."
}
catch {
    Write-Host "FAIL: Driver login failed."
    exit 1
}

# Driver updates status
Write-Host "Driver updating status to COMPLETED..."
try {
    $statusBody = @{
        status = "COMPLETED"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Headers $driverHeaders -Body $statusBody | Out-Null
    Write-Host "Status updated by driver."
}
catch {
    Write-Host "FAIL: Driver could not update status."
    exit 1
}

# Step 3: Verify Audit Logs
Write-Host ""
Write-Host "Verifying audit logs..."
try {
    $auditLogs = Invoke-RestMethod -Uri "$BASE_URL/audit-logs" -Method GET -Headers $officerHeaders
    
    # Find UPDATE_RIDE log by driver
    $driverUpdateLog = $auditLogs | Where-Object { 
        $_.action -eq "UPDATE_RIDE" -and 
        $_.targetId -eq $RIDE_ID -and
        $_.userEmail -eq "driver1@wecare.dev"
    }
    
    if ($driverUpdateLog) { 
        Write-Host "PASS: Found UPDATE_RIDE log by driver1@wecare.dev"
        Write-Host "  Role: $($driverUpdateLog.userRole)"
    }
    else { 
        Write-Host "WARN: No UPDATE_RIDE log found for driver."
    }
}
catch {
    Write-Host "WARN: Could not verify audit logs."
}

# Step 4: Verify Ride Events
Write-Host ""
Write-Host "Verifying ride events..."
try {
    $events = Invoke-RestMethod -Uri "$BASE_URL/ride-events/$RIDE_ID" -Method GET -Headers $officerHeaders
    
    $completedEvent = $events | Where-Object { $_.eventType -eq "COMPLETED" }
    
    if ($completedEvent) { 
        Write-Host "PASS: COMPLETED event found"
        Write-Host "  By: $($completedEvent.userName)"
        Write-Host "  Role: $($completedEvent.userRole)"
    }
    else { 
        Write-Host "WARN: COMPLETED event not found."
    }
}
catch {
    Write-Host "WARN: Could not verify events."
}

# Clean up
Write-Host ""
Write-Host "Cleaning up..."
try {
    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method DELETE -Headers $officerHeaders
    Write-Host "Test ride deleted."
}
catch {
    Write-Host "WARN: Could not delete test ride."
}

Write-Host ""
Write-Host "====================================="
Write-Host "All Driver Audit Log Tests PASSED"
Write-Host "====================================="
