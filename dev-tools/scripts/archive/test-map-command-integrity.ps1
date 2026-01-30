# Test Script: Map Command Center Integrity
# Tests for persistent driver locations and enriched ride data

Write-Host "====================================="
Write-Host "Map Command Center Integrity Test"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Radio Center
Write-Host ""
Write-Host "Logging in as Radio Center..."
$loginBody = @{ email = "office1@wecare.dev"; password = "password" } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$TOKEN = $loginResponse.token
$headers = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json" }

# Step 2: Update Driver Location (Simulate Driver App)
Write-Host ""
Write-Host "Updating location for Driver DRV-001..."
$locBody = @{ latitude = 19.9123; longitude = 99.2123; status = "ON_TRIP" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE_URL/driver-locations/DRV-001" -Method PUT -Body $locBody -Headers $headers | Out-Null
Write-Host "Location updated."

# Step 3: Fetch all locations and verify persistence
Write-Host ""
Write-Host "Verifying persistent location..."
$locations = Invoke-RestMethod -Uri "$BASE_URL/driver-locations" -Method GET -Headers $headers
$driverLoc = $locations | Where-Object { $_.driverId -eq "DRV-001" }

if ($driverLoc.latitude -eq 19.9123 -and $driverLoc.status -eq "ON_TRIP") {
    Write-Host "PASS: Driver location and status are persistent."
}
else {
    Write-Host "FAIL: Location or status mismatch. Lat: $($driverLoc.latitude), Status: $($driverLoc.status)"
}

# Step 4: Verify Enriched Rides (Spatial Data)
Write-Host ""
Write-Host "Verifying enriched rides (Spatial Data)..."
$rides = Invoke-RestMethod -Uri "$BASE_URL/rides" -Method GET -Headers $headers
$testRide = $rides | Where-Object { $_.patient_id -eq "PAT-001" }

if ($null -ne $testRide.latitude -and $null -ne $testRide.longitude) {
    Write-Host "PASS: Ride data enriched with patient coordinates ($($testRide.latitude), $($testRide.longitude))."
}
else {
    Write-Host "FAIL: Ride data missing coordinates."
}

Write-Host ""
Write-Host "====================================="
Write-Host "Map Command Center Tests Complete"
Write-Host "====================================="
