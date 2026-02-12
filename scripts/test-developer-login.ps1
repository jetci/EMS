$baseUrl = "http://localhost:5000/api"

# 1. Login as Developer
$loginBody = @{ email = "jetci.jm@gmail.com"; password = "g0KEk,^],k;yo" } | ConvertTo-Json
try {
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginRes.token
    $user = $loginRes.user
    
    Write-Host "Login Success" -ForegroundColor Green
    Write-Host "Role: $($user.role)"
    
    if ($user.role -eq "DEVELOPER") {
        Write-Host "Role Check: PASS" -ForegroundColor Green
    }
    else {
        Write-Host "Role Check: FAIL (Expected DEVELOPER, got $($user.role))" -ForegroundColor Red
        Exit
    }
}
catch {
    Write-Host "Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    Exit
}

# 2. Access Admin Dashboard API
$headers = @{ Authorization = "Bearer $token" }
try {
    $dashRes = Invoke-RestMethod -Uri "$baseUrl/dashboard/admin" -Method Get -Headers $headers
    Write-Host "Admin Dashboard Access: PASS" -ForegroundColor Green
    Write-Host "Total Users: $($dashRes.totalUsers)"
}
catch {
    Write-Host "Admin Dashboard Access: FAIL ($($_.Exception.Message))" -ForegroundColor Red
}
