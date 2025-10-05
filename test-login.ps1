$body = @{
    email = "admin@wecare.dev"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/login" -Method POST -ContentType "application/json" -Body $body
    Write-Host "SUCCESS: Login worked!" -ForegroundColor Green
    Write-Host "User: $($response.user.full_name)"
    Write-Host "Role: $($response.user.role)"
    Write-Host "Token: $($response.token.Substring(0,20))..."
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
}
