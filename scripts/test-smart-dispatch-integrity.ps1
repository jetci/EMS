# Test Script: Smart Dispatching API Integrity
# Tests for enriched available drivers data

Write-Host "====================================="
Write-Host "Smart Dispatching API Integrity Test"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login
Write-Host ""
Write-Host "Logging in..."
$loginBody = @{ email = "office1@wecare.dev"; password = "password" } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$TOKEN = $loginResponse.token
$headers = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json" }

# Step 2: Ensure Driver is AVAILABLE and has location
Write-Host ""
Write-Host "Setting DRV-001 to AVAILABLE with location..."
$locBody = @{ latitude = 19.9123; longitude = 99.2123; status = "AVAILABLE" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE_URL/driver-locations/DRV-001" -Method PUT -Body $locBody -Headers $headers | Out-Null

Write-Host "Fetching available drivers..."
$drivers = Invoke-RestMethod -Uri "$BASE_URL/drivers/available" -Method GET -Headers $headers

# Step 3: Verify Spatial Enrichment
Write-Host ""
Write-Host "Verifying spatial data for drivers..."
$driverWithLoc = $drivers | Where-Object { $_.id -eq "DRV-001" }

if ($null -ne $driverWithLoc.latitude -and $null -ne $driverWithLoc.longitude) {
    Write-Host "PASS: Available driver data enriched with coordinates ($($driverWithLoc.latitude), $($driverWithLoc.longitude))."
}
else {
    Write-Host "FAIL: Available driver data missing coordinates. (Check if DRV-001 has location in driver_locations.json)"
}

# Step 4: Verify Status Filtering
Write-Host ""
Write-Host "Verifying status filtering..."
$onTripDrivers = $drivers | Where-Object { $_.status -eq "ON_TRIP" }
if ($onTripDrivers.Count -eq 0 -or $null -eq $onTripDrivers) {
    Write-Host "PASS: Only AVAILABLE drivers returned."
}
else {
    Write-Host "FAIL: Found drivers with status other than AVAILABLE."
}

Write-Host ""
Write-Host "====================================="
Write-Host "Smart Dispatching Tests Complete"
Write-Host "====================================="
