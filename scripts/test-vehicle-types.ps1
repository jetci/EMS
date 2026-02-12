$baseUrl = "http://localhost:5000/api"

# 1. Login
$loginBody = @{ email = "admin@wecare.dev"; password = "admin123" } | ConvertTo-Json
try {
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginRes.token
    $headers = @{ Authorization = "Bearer $token" }
    Write-Host "Login Success" -ForegroundColor Green
}
catch {
    Write-Host "Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    Exit
}

# 2. Create
$createBody = @{ name = "Test Van"; capacity = 10; description = "Test Desc"; wheelchairAccessible = $true } | ConvertTo-Json
try {
    $created = Invoke-RestMethod -Uri "$baseUrl/vehicle-types" -Method Post -Body $createBody -Headers $headers -ContentType "application/json"
    Write-Host "Create Success: $($created.id) - $($created.name)" -ForegroundColor Green
    $id = $created.id
}
catch {
    Write-Host "Create Failed: $($_.Exception.Message)" -ForegroundColor Red
    Exit
}

# 3. Read
$types = Invoke-RestMethod -Uri "$baseUrl/vehicle-types" -Method Get -Headers $headers
if ($types | Where-Object { $_.id -eq $id }) {
    Write-Host "Read Success: Found ID $id" -ForegroundColor Green
}
else {
    Write-Host "Read Failed: ID $id not found" -ForegroundColor Red
}

# 4. Update
$updateBody = @{ name = "Updated Van" } | ConvertTo-Json
try {
    $updated = Invoke-RestMethod -Uri "$baseUrl/vehicle-types/$id" -Method Put -Body $updateBody -Headers $headers -ContentType "application/json"
    if ($updated.name -eq "Updated Van") {
        Write-Host "Update Success: Name changed to $($updated.name)" -ForegroundColor Green
    }
    else {
        Write-Host "Update Failed: Name mismatch" -ForegroundColor Red
    }
}
catch {
    Write-Host "Update Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Delete
try {
    Invoke-RestMethod -Uri "$baseUrl/vehicle-types/$id" -Method Delete -Headers $headers
    Write-Host "Delete Success" -ForegroundColor Green
}
catch {
    Write-Host "Delete Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Verify Delete
$typesFinal = Invoke-RestMethod -Uri "$baseUrl/vehicle-types" -Method Get -Headers $headers
if ($typesFinal | Where-Object { $_.id -eq $id }) {
    Write-Host "Verify Delete Failed: ID $id still exists" -ForegroundColor Red
}
else {
    Write-Host "Verify Delete Success: ID $id gone" -ForegroundColor Green
}
