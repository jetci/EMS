# Test Script: Executive Dashboard Data Integrity
# Tests real KPI calculation and date filtering

Write-Host "====================================="
Write-Host "Executive Dashboard Integrity Test"
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

# Step 2: Get initial stats
Write-Host ""
Write-Host "Fetching initial dashboard data..."
$initialData = Invoke-RestMethod -Uri "$BASE_URL/dashboard/executive" -Method GET -Headers $headers
$initialEfficiency = $initialData.stats.efficiency
Write-Host "Initial Efficiency: $initialEfficiency%"
Write-Host "Initial Total Rides: $($initialData.stats.totalRides)"

# Step 3: Create a new COMPLETED ride to see if Efficiency changes
Write-Host ""
Write-Host "Simulating a new COMPLETED ride..."
# We use the rides API directly (as admin for simplicity in test setup)
$adminLoginBody = @{ email = "admin@wecare.dev"; password = "password" } | ConvertTo-Json
$adminToken = (Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $adminLoginBody -ContentType "application/json").token
$adminHeaders = @{ "Authorization" = "Bearer $adminToken"; "Content-Type" = "application/json" }

$newRideBody = @{
    patient_id       = "PAT-001"
    patient_name     = "Test Patient"
    status           = "COMPLETED"
    appointment_time = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    distance         = 20
} | ConvertTo-Json

$rideResponse = Invoke-RestMethod -Uri "$BASE_URL/rides" -Method POST -Headers $adminHeaders -Body $newRideBody
$RIDE_ID = $rideResponse.id
Write-Host "New COMPLETED ride created: $RIDE_ID"

# Step 4: Verify KPI update
Write-Host ""
Write-Host "Fetching updated dashboard data..."
$updatedData = Invoke-RestMethod -Uri "$BASE_URL/dashboard/executive" -Method GET -Headers $headers
$updatedEfficiency = $updatedData.stats.efficiency
Write-Host "Updated Efficiency: $updatedEfficiency%"
Write-Host "Updated Total Rides: $($updatedData.stats.totalRides)"

if ($updatedData.stats.totalRides -gt $initialData.stats.totalRides) {
    Write-Host "PASS: Total Rides count updated."
}
else {
    Write-Host "FAIL: Total Rides count did not update."
}

# Step 5: Test Date Filtering
Write-Host ""
Write-Host "Testing Date Filtering (Future date)..."
$futureDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$filteredData = Invoke-RestMethod -Uri "$BASE_URL/dashboard/executive?startDate=$futureDate" -Method GET -Headers $headers
Write-Host "Rides starting from tomorrow: $($filteredData.stats.totalRides)"

if ($filteredData.stats.totalRides -lt $updatedData.stats.totalRides) {
    Write-Host "PASS: Date filtering is working."
}
else {
    Write-Host "FAIL: Date filtering did not change the results."
}

# Clean up
Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method DELETE -Headers $adminHeaders | Out-Null
Write-Host ""
Write-Host "====================================="
Write-Host "Executive Integrity Tests Complete"
Write-Host "====================================="
