# Test Script: Dispatch Audit Logging
# Tests that ASSIGN_DRIVER action is properly logged

Write-Host "====================================="
Write-Host "Dispatch Audit Logging Test"
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
        patient_name     = "Test Patient for Dispatch"
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

# Step 3: Get a driver ID
Write-Host "Fetching drivers..."
try {
    $drivers = Invoke-RestMethod -Uri "$BASE_URL/drivers" -Method GET -Headers $headers
    if ($drivers.Count -eq 0) {
        Write-Host "WARN: No drivers found. Using mock driver."
        $DRIVER_ID = "DRV-001"
        $DRIVER_NAME = "Test Driver"
    }
    else {
        $DRIVER_ID = $drivers[0].id
        $DRIVER_NAME = $drivers[0].fullName
        Write-Host "Using driver: $DRIVER_NAME ($DRIVER_ID)"
    }
}
catch {
    Write-Host "WARN: Could not fetch drivers."
    $DRIVER_ID = "DRV-001"
    $DRIVER_NAME = "Test Driver"
}

# Step 4: Assign driver to ride (Dispatch action)
Write-Host ""
Write-Host "Assigning driver to ride (Dispatch)..."
try {
    $assignBody = @{
        status      = "ASSIGNED"
        driver_id   = $DRIVER_ID
        driver_name = $DRIVER_NAME
    } | ConvertTo-Json

    $assignResponse = Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Headers $headers -Body $assignBody
    Write-Host "Driver assigned successfully. Status: $($assignResponse.status)"
}
catch {
    Write-Host "WARN: Failed to assign driver."
}

# Step 5: Verify Audit Logs
Write-Host ""
Write-Host "Verifying Audit Logs..."
try {
    $auditLogs = Invoke-RestMethod -Uri "$BASE_URL/audit-logs" -Method GET -Headers $headers
    
    $createLog = $auditLogs | Where-Object { $_.action -eq "CREATE_RIDE" -and $_.targetId -eq $RIDE_ID }
    $assignLog = $auditLogs | Where-Object { $_.action -eq "ASSIGN_DRIVER" -and $_.targetId -eq $RIDE_ID }
    
    $allPassed = $true
    
    if ($createLog) { 
        Write-Host "PASS: Found CREATE_RIDE audit log for $RIDE_ID" 
    }
    else { 
        Write-Host "FAIL: No CREATE_RIDE log found for $RIDE_ID"
        $allPassed = $false
    }
    
    if ($assignLog) { 
        Write-Host "PASS: Found ASSIGN_DRIVER audit log for $RIDE_ID"
    }
    else { 
        Write-Host "FAIL: No ASSIGN_DRIVER log found for $RIDE_ID"
        $allPassed = $false
    }
    
    if (-not $allPassed) {
        exit 1
    }
}
catch {
    Write-Host "FAIL: Could not verify audit logs."
    exit 1
}

# Step 6: Clean up - delete the test ride
Write-Host ""
Write-Host "Cleaning up - deleting test ride..."
try {
    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method DELETE -Headers $headers
    Write-Host "Test ride deleted."
}
catch {
    Write-Host "WARN: Could not delete test ride."
}

Write-Host ""
Write-Host "====================================="
Write-Host "All Dispatch Audit Logging Tests PASSED"
Write-Host "====================================="
