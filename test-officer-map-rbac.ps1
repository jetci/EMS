# Test Script: Map API RBAC for Radio Center / OFFICER Role
# Tests that the OFFICER role can access Map Data CRUD operations

Write-Host "====================================="
Write-Host "Map API RBAC Test for Radio Center"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Officer user
Write-Host "`nLogging in as Officer..."
try {
    $loginBody = @{
        email    = "officer1@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    
    if (-not $TOKEN) {
        Write-Host "[FAIL] Login failed for Officer user. Token not received."
        exit 1
    }
    Write-Host "Login Successful. Token received."
}
catch {
    Write-Host "[FAIL] Login request failed: $($_.Exception.Message)"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# Step 2: Create a Marker
Write-Host "Creating a Marker as Officer..."
try {
    $createBody = @{
        type        = "marker"
        name        = "Officer Test Marker"
        description = "Created by Officer role"
        coordinates = @{ lat = 19.95; lng = 99.25 }
    } | ConvertTo-Json
    
    $createResponse = Invoke-RestMethod -Uri "$BASE_URL/map-data" -Method POST -Headers $headers -Body $createBody
    $SHAPE_ID = $createResponse.id
    Write-Host "Marker Created: $SHAPE_ID"
}
catch {
    Write-Host "[FAIL] Officer cannot create map shape: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
    exit 1
}

# Step 3: Update the Marker
Write-Host "Updating Marker as Officer..."
try {
    $updateBody = @{
        name = "Updated by Officer"
    } | ConvertTo-Json
    
    $updateResponse = Invoke-RestMethod -Uri "$BASE_URL/map-data/$SHAPE_ID" -Method PUT -Headers $headers -Body $updateBody
    Write-Host "Marker Updated Successfully."
}
catch {
    Write-Host "[FAIL] Officer cannot update map shape: $($_.Exception.Message)"
    exit 1
}

# Step 4: Delete the Marker
Write-Host "Deleting Marker as Officer..."
try {
    Invoke-RestMethod -Uri "$BASE_URL/map-data/$SHAPE_ID" -Method DELETE -Headers $headers
    Write-Host "Marker Deleted."
}
catch {
    Write-Host "[FAIL] Officer cannot delete map shape: $($_.Exception.Message)"
    exit 1
}

# Step 5: Verify Audit Log
Write-Host "Verifying Audit Log..."
try {
    $auditLogs = Invoke-RestMethod -Uri "$BASE_URL/audit-logs" -Method GET -Headers $headers
    $createLog = $auditLogs | Where-Object { $_.action -eq "CREATE_MAP_SHAPE" -and $_.userRole -eq "OFFICER" }
    $updateLog = $auditLogs | Where-Object { $_.action -eq "UPDATE_MAP_SHAPE" -and $_.userRole -eq "OFFICER" }
    
    if ($createLog) { Write-Host "Found CREATE log for OFFICER." } else { Write-Host "[WARN] No CREATE log found for OFFICER role." }
    if ($updateLog) { Write-Host "Found UPDATE log for OFFICER." } else { Write-Host "[WARN] No UPDATE log found for OFFICER role." }
}
catch {
    Write-Host "[WARN] Could not verify audit logs."
}

Write-Host "`n====================================="
Write-Host "All Map API RBAC Tests for OFFICER PASSED"
Write-Host "====================================="
