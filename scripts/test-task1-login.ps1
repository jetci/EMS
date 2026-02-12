# Test Login - Debug Version
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LOGIN TEST - Debug Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing: admin@wecare.dev / password" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
        -Method POST `
        -Body (@{email = "admin@wecare.dev"; password = "password" } | ConvertTo-Json) `
        -ContentType "application/json"
    
    Write-Host "SUCCESS! Login worked!" -ForegroundColor Green
    Write-Host ""
    Write-Host "User Details:" -ForegroundColor Cyan
    Write-Host "  Email: $($response.user.email)" -ForegroundColor White
    Write-Host "  Role:  $($response.user.role)" -ForegroundColor White
    Write-Host "  ID:    $($response.user.id)" -ForegroundColor White
    Write-Host "  Name:  $($response.user.full_name)" -ForegroundColor White
    Write-Host ""
    Write-Host "Token: $($response.token.Substring(0, 30))..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  TASK 1: COMPLETE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
}
catch {
    Write-Host "FAILED! Login did not work" -ForegroundColor Red
    Write-Host ""
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Check backend console for debug logs!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  TASK 1: FAILED - Need to debug" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}
