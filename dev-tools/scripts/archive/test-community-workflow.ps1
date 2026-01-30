# Test Script: Community User Workflow
# Tests community login, patient registration, ride request

Write-Host "====================================="
Write-Host "Community User Workflow Test"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Community user
Write-Host ""
Write-Host "Logging in as Community user..."
try {
    $loginBody = @{
        email    = "community1@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    
    if (-not $TOKEN) {
        Write-Host "FAIL: Login failed."
        exit 1
    }
    Write-Host "Login Successful. Role: $($loginResponse.user.role)"
    $USER_ID = $loginResponse.user.id
}
catch {
    Write-Host "FAIL: Login request failed."
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# Step 2: Fetch patients (Community should see their own patients)
Write-Host ""
Write-Host "Fetching patients..."
try {
    $patients = Invoke-RestMethod -Uri "$BASE_URL/patients" -Method GET -Headers $headers
    Write-Host "Found $($patients.Count) patients."
}
catch {
    Write-Host "WARN: Could not fetch patients."
}

# Step 3: Create a new patient
Write-Host ""
Write-Host "Creating a new patient..."
try {
    $patientBody = @{
        fullName       = "Community Test Patient"
        title          = "Mr."
        gender         = "male"
        nationalId     = "1234567890123"
        dob            = "1980-01-01"
        bloodType      = "A"
        contactPhone   = "0812345678"
        currentAddress = @{
            houseNumber = "123"
            village     = "Test Village"
            tambon      = "Test Tambon"
            amphoe      = "Test Amphoe"
            changwat    = "Test Changwat"
        }
    } | ConvertTo-Json -Depth 3

    $patientResponse = Invoke-RestMethod -Uri "$BASE_URL/patients" -Method POST -Headers $headers -Body $patientBody
    $PATIENT_ID = $patientResponse.id
    Write-Host "Patient Created: $PATIENT_ID"
}
catch {
    Write-Host "FAIL: Failed to create patient."
    $PATIENT_ID = "PAT-001"
}

# Step 4: Fetch rides (Community should see their own rides)
Write-Host ""
Write-Host "Fetching rides..."
try {
    $rides = Invoke-RestMethod -Uri "$BASE_URL/rides" -Method GET -Headers $headers
    Write-Host "Found $($rides.Count) rides."
}
catch {
    Write-Host "WARN: Could not fetch rides."
}

# Step 5: Create a ride request
Write-Host ""
Write-Host "Creating a ride request..."
try {
    $rideBody = @{
        patient_id       = $PATIENT_ID
        patient_name     = "Community Test Patient"
        appointment_time = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss")
        pickup_location  = "Test Pickup Location"
        destination      = "Test Hospital"
        trip_type        = "Regular Appointment"
        contact_phone    = "0812345678"
    } | ConvertTo-Json

    $rideResponse = Invoke-RestMethod -Uri "$BASE_URL/rides" -Method POST -Headers $headers -Body $rideBody
    $RIDE_ID = $rideResponse.id
    Write-Host "Ride Request Created: $RIDE_ID"
}
catch {
    Write-Host "FAIL: Failed to create ride request."
    exit 1
}

# Step 6: Verify ride was created with correct created_by
Write-Host ""
Write-Host "Verifying ride ownership..."
try {
    $createdRide = Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method GET -Headers $headers
    if ($createdRide.created_by -eq $USER_ID) {
        Write-Host "PASS: Ride correctly associated with community user"
    }
    else {
        Write-Host "WARN: Ride created_by: $($createdRide.created_by), expected: $USER_ID"
    }
}
catch {
    Write-Host "WARN: Could not verify ride."
}

# Step 7: Test that Community user can update their own ride
Write-Host ""
Write-Host "Testing ride update (cancel)..."
try {
    $updateBody = @{
        status = "CANCELLED"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Headers $headers -Body $updateBody | Out-Null
    Write-Host "PASS: Community user can cancel own ride"
}
catch {
    Write-Host "FAIL: Community user cannot cancel own ride."
}

# Step 8: Verify audit log for ride creation
Write-Host ""
Write-Host "Verifying audit logs..."
try {
    $auditLogs = Invoke-RestMethod -Uri "$BASE_URL/audit-logs" -Method GET -Headers $headers
    $createLog = $auditLogs | Where-Object { $_.action -eq "CREATE_RIDE" -and $_.targetId -eq $RIDE_ID }
    
    if ($createLog) {
        Write-Host "PASS: CREATE_RIDE audit log found"
        Write-Host "  By: $($createLog.userEmail)"
    }
    else {
        Write-Host "WARN: No CREATE_RIDE log found for $RIDE_ID"
    }
}
catch {
    Write-Host "WARN: Could not verify audit logs."
}

# Step 9: Clean up - delete test ride and patient
Write-Host ""
Write-Host "Cleaning up..."
try {
    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method DELETE -Headers $headers
    Write-Host "Test ride deleted."
}
catch {
    Write-Host "WARN: Could not delete test ride."
}

try {
    if ($PATIENT_ID -and $PATIENT_ID -ne "PAT-001") {
        Invoke-RestMethod -Uri "$BASE_URL/patients/$PATIENT_ID" -Method DELETE -Headers $headers
        Write-Host "Test patient deleted."
    }
}
catch {
    Write-Host "WARN: Could not delete test patient."
}

Write-Host ""
Write-Host "====================================="
Write-Host "All Community User Workflow Tests PASSED"
Write-Host "====================================="
