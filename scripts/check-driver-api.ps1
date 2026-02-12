# Sanity Check for Driver API
$baseUrl = "http://localhost:5000/api"

try {
    # 1. Login
    $login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body (@{ email = "driver1@wecare.dev"; password = "password" } | ConvertTo-Json) -ContentType "application/json"
    
    if ($login.user.driver_id -ne "DRV-001") {
        Write-Host "⚠️ Login Response missing driver_id or incorrect: $($login.user.driver_id)" -ForegroundColor Red
    }
    else {
        Write-Host "✅ Login OK. Driver ID: $($login.user.driver_id)" -ForegroundColor Green
    }

    $token = $login.token

    # 2. Get Profile
    try {
        $profile = Invoke-RestMethod -Uri "$baseUrl/drivers/my-profile" -Method GET -Headers @{ Authorization = "Bearer $token" }
        Write-Host "✅ Get Profile OK: $($profile.full_name)" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Get Profile Failed: $($_.Exception.Message)" -ForegroundColor Red
        # Print response body if available
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Response: $($reader.ReadToEnd())" -ForegroundColor Yellow
    }

    # 3. Get Rides
    try {
        $rides = Invoke-RestMethod -Uri "$baseUrl/drivers/my-rides" -Method GET -Headers @{ Authorization = "Bearer $token" }
        Write-Host "✅ Get Rides OK: Found $($rides.Count) rides" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Get Rides Failed: $($_.Exception.Message)" -ForegroundColor Red
    }

}
catch {
    Write-Host "❌ Critical Error: $($_.Exception.Message)" -ForegroundColor Red
}
