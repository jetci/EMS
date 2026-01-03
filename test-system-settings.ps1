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

# 2. Read Settings
try {
    $settings = Invoke-RestMethod -Uri "$baseUrl/admin/settings" -Method Get -Headers $headers
    Write-Host "Read Settings Success: AppName = $($settings.appName)" -ForegroundColor Green
}
catch {
    Write-Host "Read Settings Failed: $($_.Exception.Message)" -ForegroundColor Red
    Exit
}

# 3. Update Settings
$newAppName = "EMS WeCare Updated"
$updateBody = @{ appName = $newAppName } | ConvertTo-Json
try {
    $updated = Invoke-RestMethod -Uri "$baseUrl/admin/settings" -Method Put -Body $updateBody -Headers $headers -ContentType "application/json"
    if ($updated.appName -eq $newAppName) {
        Write-Host "Update Settings Success: AppName changed to $($updated.appName)" -ForegroundColor Green
    }
    else {
        Write-Host "Update Settings Failed: AppName mismatch" -ForegroundColor Red
    }
}
catch {
    Write-Host "Update Settings Failed: $($_.Exception.Message)" -ForegroundColor Red
    Exit
}

# 4. Verify Update (Read Again)
$settingsFinal = Invoke-RestMethod -Uri "$baseUrl/admin/settings" -Method Get -Headers $headers
if ($settingsFinal.appName -eq $newAppName) {
    Write-Host "Verify Update Success" -ForegroundColor Green
}
else {
    Write-Host "Verify Update Failed" -ForegroundColor Red
}
