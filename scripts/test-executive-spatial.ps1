# Test Script: Executive Spatial Data Integrity
# Tests that patient locations are correctly provided for the map

Write-Host "====================================="
Write-Host "Executive Spatial Data Test"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Executive
Write-Host ""
Write-Host "Logging in as Executive..."
try {
    $loginBody = @{
        email    = "executive1@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    Write-Host "Login Successful."
}
catch {
    Write-Host "FAIL: Login failed."
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# Step 2: Fetch dashboard data
Write-Host ""
Write-Host "Fetching dashboard data..."
$data = Invoke-RestMethod -Uri "$BASE_URL/dashboard/executive" -Method GET -Headers $headers

# Step 3: Verify patientLocations
Write-Host ""
Write-Host "Verifying patientLocations..."
if ($null -eq $data.patientLocations) {
    Write-Host "FAIL: patientLocations is missing from response."
    exit 1
}

$locationCount = $data.patientLocations.Count
Write-Host "Found $locationCount patient locations."

if ($locationCount -gt 0) {
    $firstLoc = $data.patientLocations[0]
    Write-Host "Sample Location: $($firstLoc.name) ($($firstLoc.lat), $($firstLoc.lng))"
    
    # Check if it's a number (not a string)
    if ($firstLoc.lat.GetType().Name -match "Double|Decimal|Single") {
        Write-Host "PASS: Coordinates are numeric types ($($firstLoc.lat.GetType().Name))."
    }
    else {
        Write-Host "FAIL: Coordinates are not numeric types (Type: $($firstLoc.lat.GetType().Name))."
    }
}
else {
    Write-Host "WARN: No patient locations found. Ensure there are patients with coordinates in patients.json."
}

Write-Host ""
Write-Host "====================================="
Write-Host "Executive Spatial Data Tests Complete"
Write-Host "====================================="
