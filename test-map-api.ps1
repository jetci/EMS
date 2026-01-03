$baseUrl = "http://localhost:3001/api"
$adminEmail = "admin@wecare.dev"
$adminPass = "password"

# 1. Login as Admin
Write-Host "Logging in as Admin..." -ForegroundColor Cyan
$loginBody = @{
    email    = $adminEmail
    password = $adminPass
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login Successful. Token received." -ForegroundColor Green
}
catch {
    Write-Error "Login Failed: $_"
    exit 1
}

$headers = @{
    Authorization  = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Create a Map Shape (Marker)
Write-Host "Creating a Marker..." -ForegroundColor Cyan
$markerBody = @{
    type        = "marker"
    name        = "Test Marker"
    description = "A test marker created by script"
    coordinates = @{ lat = 19.9; lng = 99.2 }
} | ConvertTo-Json

try {
    $markerResponse = Invoke-RestMethod -Uri "$baseUrl/map-data" -Method Post -Headers $headers -Body $markerBody
    $markerId = $markerResponse.id
    Write-Host "Marker Created: $markerId" -ForegroundColor Green
}
catch {
    Write-Error "Create Marker Failed: $_"
    exit 1
}

# 3. Update the Shape (Move Marker)
Write-Host "Updating Marker Position..." -ForegroundColor Cyan
$updateBody = @{
    coordinates = @{ lat = 20.0; lng = 99.3 }
    name        = "Updated Marker Name"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/map-data/$markerId" -Method Put -Headers $headers -Body $updateBody
    if ($updateResponse.name -eq "Updated Marker Name" -and $updateResponse.coordinates.lat -eq 20.0) {
        Write-Host "Marker Updated Successfully." -ForegroundColor Green
    }
    else {
        Write-Error "Marker Update Mismatch: $($updateResponse | ConvertTo-Json)"
        exit 1
    }
}
catch {
    Write-Error "Update Marker Failed: $_"
    exit 1
}

# 4. Verify Audit Log
Write-Host "Verifying Audit Log..." -ForegroundColor Cyan
try {
    $logs = Invoke-RestMethod -Uri "$baseUrl/audit-logs" -Method Get -Headers $headers
    $createLog = $logs | Where-Object { $_.action -eq "CREATE_MAP_SHAPE" -and $_.targetId -eq $markerId }
    $updateLog = $logs | Where-Object { $_.action -eq "UPDATE_MAP_SHAPE" -and $_.targetId -eq $markerId }

    if ($createLog) { Write-Host "Found CREATE log." -ForegroundColor Green } else { Write-Error "Missing CREATE log" }
    if ($updateLog) { Write-Host "Found UPDATE log." -ForegroundColor Green } else { Write-Error "Missing UPDATE log" }
}
catch {
    Write-Error "Fetch Audit Logs Failed: $_"
}

# 5. Delete the Shape
Write-Host "Deleting Marker..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$baseUrl/map-data/$markerId" -Method Delete -Headers $headers
    Write-Host "Marker Deleted." -ForegroundColor Green
}
catch {
    Write-Error "Delete Marker Failed: $_"
    exit 1
}

Write-Host "All Map API & Audit Tests PASSED" -ForegroundColor Green
