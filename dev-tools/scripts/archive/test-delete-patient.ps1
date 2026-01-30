# Test script for verifying patient deletion logic
$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:3001"

function Get-Token {
    param($email, $password)
    try {
        $body = @{ email = $email; password = $password } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json"
        return $response.token
    }
    catch {
        Write-Error "Login failed for $email"
    }
}

# 1. Login as Community User
Write-Host "Logging in as community user..."
$communityToken = Get-Token "community1@wecare.dev" "password"
$headers = @{ Authorization = "Bearer $communityToken" }

# 2. Create a test patient
Write-Host "Creating test patient..."
$patientData = @{
    fullName       = "Test Remove Patient"
    age            = 50
    gender         = "ชาย"
    currentAddress = "{}"
} | ConvertTo-Json

try {
    $patient = Invoke-RestMethod -Uri "$baseUrl/api/patients" -Method Post -Headers $headers -Body $patientData -ContentType "application/json"
    $patientId = $patient.id
    Write-Host "Created patient: $patientId"
}
catch {
    Write-Error "Failed to create patient: $_"
}

# 3. Verify patient exists
try {
    $check = Invoke-RestMethod -Uri "$baseUrl/api/patients/$patientId" -Headers $headers
    Write-Host "Patient exists: $($check.fullName)"
}
catch {
    Write-Error "Patient not found after creation"
}

# 4. Delete patient
Write-Host "Deleting patient..."
try {
    Invoke-RestMethod -Uri "$baseUrl/api/patients/$patientId" -Method Delete -Headers $headers
    Write-Host "Delete request successful"
}
catch {
    Write-Error "Delete request failed: $_"
}

# 5. Verify patient is gone
Write-Host "Verifying deletion..."
try {
    $check = Invoke-RestMethod -Uri "$baseUrl/api/patients/$patientId" -Headers $headers
    Write-Error "Patient still exists!"
}
catch {
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::NotFound) {
        Write-Host "Success: Patient not found (404) as expected"
    }
    else {
        Write-Error "Unexpected error: $_"
    }
}
