$baseUrl = "http://localhost:5000/api"

# 1. Login
$loginBody = @{ email = "driver1@wecare.dev"; password = "password" } | ConvertTo-Json
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

# 2. Get Profile
try {
    $profile = Invoke-RestMethod -Uri "$baseUrl/drivers/my-profile" -Method Get -Headers $headers
    Write-Host "Current Status: $($profile.status)"
}
catch {
    Write-Host "Get Profile Failed: $($_.Exception.Message)" -ForegroundColor Red
    Exit
}

# 3. Set OFFLINE
try {
    $updateBody = @{ status = "OFFLINE" } | ConvertTo-Json
    $updated = Invoke-RestMethod -Uri "$baseUrl/drivers/my-profile" -Method Put -Body $updateBody -Headers $headers -ContentType "application/json"
    if ($updated.status -eq "OFFLINE") {
        Write-Host "Update to OFFLINE: Success" -ForegroundColor Green
    }
    else {
        Write-Host "Update to OFFLINE: Failed (Got $($updated.status))" -ForegroundColor Red
    }
}
catch {
    Write-Host "Update to OFFLINE Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Set AVAILABLE
try {
    $updateBody = @{ status = "AVAILABLE" } | ConvertTo-Json
    $updated = Invoke-RestMethod -Uri "$baseUrl/drivers/my-profile" -Method Put -Body $updateBody -Headers $headers -ContentType "application/json"
    if ($updated.status -eq "AVAILABLE") {
        Write-Host "Update to AVAILABLE: Success" -ForegroundColor Green
    }
    else {
        Write-Host "Update to AVAILABLE: Failed (Got $($updated.status))" -ForegroundColor Red
    }
}
catch {
    Write-Host "Update to AVAILABLE Error: $($_.Exception.Message)" -ForegroundColor Red
}
