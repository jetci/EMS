# Test Script: Community Role Security & Privacy
# Tests for data isolation and unauthorized access for community users

Write-Host "====================================="
Write-Host "Community Role Security & Privacy Test"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Community User 1
Write-Host ""
Write-Host "Logging in as Community User 1 (community1@wecare.dev)..."
$loginBody1 = @{ email = "community1@wecare.dev"; password = "password" } | ConvertTo-Json
$loginResponse1 = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody1 -ContentType "application/json"
$TOKEN1 = $loginResponse1.token
$USER1_ID = $loginResponse1.user.id
$headers1 = @{ "Authorization" = "Bearer $TOKEN1"; "Content-Type" = "application/json" }

# Step 2: Login as Community User 2
Write-Host ""
Write-Host "Logging in as Community User 2 (community2@wecare.dev)..."
$loginBody2 = @{ email = "community2@wecare.dev"; password = "password" } | ConvertTo-Json
$loginResponse2 = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody2 -ContentType "application/json"
$TOKEN2 = $loginResponse2.token
$USER2_ID = $loginResponse2.user.id
$headers2 = @{ "Authorization" = "Bearer $TOKEN2"; "Content-Type" = "application/json" }

# Step 3: Community User 1 creates a patient
Write-Host ""
Write-Host "Community User 1 creating a patient..."
$patientBody = @{ full_name = "Patient of Comm 1"; phone = "0811111111" } | ConvertTo-Json
$patientResponse = Invoke-RestMethod -Uri "$BASE_URL/patients" -Method POST -Body $patientBody -Headers $headers1
$PATIENT_ID = $patientResponse.id
Write-Host "Patient created: $PATIENT_ID"

# Step 4: Community User 2 tries to access User 1's patient
Write-Host ""
Write-Host "Test: Community User 2 accessing User 1's patient..."
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/patients/$PATIENT_ID" -Method GET -Headers $headers2
    Write-Host "FAIL: Community User 2 CAN access User 1's patient! (PRIVACY LEAK)"
}
catch {
    if ($_.Exception.Message -match "403") {
        Write-Host "PASS: Community User 2 denied access to User 1's patient."
    }
    else {
        Write-Host "FAIL: Unexpected error: $($_.Exception.Message)"
    }
}

# Step 5: Public access to patients list
Write-Host ""
Write-Host "Test: Public access to /api/patients..."
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/patients" -Method GET
    Write-Host "FAIL: Public CAN access patients list! (PRIVACY LEAK)"
}
catch {
    if ($_.Exception.Message -match "401") {
        Write-Host "PASS: Public denied access to patients list."
    }
    else {
        Write-Host "FAIL: Unexpected error: $($_.Exception.Message)"
    }
}

# Step 6: Community User 1 creates a ride
Write-Host ""
Write-Host "Community User 1 creating a ride..."
$rideBody = @{ 
    patient_id      = $PATIENT_ID; 
    patient_name    = "Patient of Comm 1"; 
    pickup_location = "Home"; 
    destination     = "Hospital";
    status          = "PENDING"
} | ConvertTo-Json
$rideResponse = Invoke-RestMethod -Uri "$BASE_URL/rides" -Method POST -Body $rideBody -Headers $headers1
$RIDE_ID = $rideResponse.id
Write-Host "Ride created: $RIDE_ID"

# Step 7: Community User 2 tries to access User 1's ride
Write-Host ""
Write-Host "Test: Community User 2 accessing User 1's ride..."
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method GET -Headers $headers2
    Write-Host "FAIL: Community User 2 CAN access User 1's ride! (PRIVACY LEAK)"
}
catch {
    if ($_.Exception.Message -match "403") {
        Write-Host "PASS: Community User 2 denied access to User 1's ride."
    }
    else {
        Write-Host "FAIL: Unexpected error: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "====================================="
Write-Host "Community Security Audit Complete"
Write-Host "====================================="
