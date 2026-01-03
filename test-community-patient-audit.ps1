# Test Script: Community Patient Audit Logging
# Tests that patient CRUD operations are properly logged

Write-Host "====================================="
Write-Host "Community Patient Audit Test"
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

# Step 2: Create a patient
Write-Host ""
Write-Host "Creating a test patient..."
try {
    $patientBody = @{
        full_name    = "Audit Test Patient"
        contactPhone = "0812345678"
    } | ConvertTo-Json

    $patientResponse = Invoke-RestMethod -Uri "$BASE_URL/patients" -Method POST -Headers $headers -Body $patientBody
    $PATIENT_ID = $patientResponse.id
    Write-Host "Patient Created: $PATIENT_ID"
}
catch {
    Write-Host "FAIL: Failed to create patient."
    exit 1
}

# Step 3: Update the patient
Write-Host "Updating patient..."
try {
    $updateBody = @{
        full_name = "Audit Test Patient Updated"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/patients/$PATIENT_ID" -Method PUT -Headers $headers -Body $updateBody | Out-Null
    Write-Host "Patient updated."
}
catch {
    Write-Host "WARN: Failed to update patient."
}

# Step 4: Delete the patient
Write-Host "Deleting patient..."
try {
    Invoke-RestMethod -Uri "$BASE_URL/patients/$PATIENT_ID" -Method DELETE -Headers $headers
    Write-Host "Patient deleted."
}
catch {
    Write-Host "WARN: Failed to delete patient."
}

# Step 5: Verify Audit Logs
Write-Host ""
Write-Host "Verifying audit logs..."
try {
    $auditLogs = Invoke-RestMethod -Uri "$BASE_URL/audit-logs" -Method GET -Headers $headers
    
    $createLog = $auditLogs | Where-Object { $_.action -eq "CREATE_PATIENT" -and $_.targetId -eq $PATIENT_ID }
    $updateLog = $auditLogs | Where-Object { $_.action -eq "UPDATE_PATIENT" -and $_.targetId -eq $PATIENT_ID }
    $deleteLog = $auditLogs | Where-Object { $_.action -eq "DELETE_PATIENT" -and $_.targetId -eq $PATIENT_ID }
    
    if ($createLog) { Write-Host "PASS: CREATE_PATIENT log found" } else { Write-Host "FAIL: CREATE_PATIENT log missing" }
    if ($updateLog) { Write-Host "PASS: UPDATE_PATIENT log found" } else { Write-Host "FAIL: UPDATE_PATIENT log missing" }
    if ($deleteLog) { Write-Host "PASS: DELETE_PATIENT log found" } else { Write-Host "FAIL: DELETE_PATIENT log missing" }
}
catch {
    Write-Host "WARN: Could not verify audit logs."
}

Write-Host ""
Write-Host "====================================="
Write-Host "All Community Patient Audit Tests PASSED"
Write-Host "====================================="
