$baseUrl = "http://localhost:5000/api"
$body = @{ newPassword = "password" } | ConvertTo-Json

try {
    # USR-001 is Admin ID
    Invoke-RestMethod -Uri "$baseUrl/users/USR-001/reset-password" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Admin password reset to 'password': PASS" -ForegroundColor Green
}
catch {
    Write-Host "Admin password reset failed: $($_.Exception.Message)" -ForegroundColor Red
}
