# Quick Test - Login with existing admin user
Write-Host "=== Quick Login Test ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing login with admin@wecare.dev..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
        -Method POST `
        -Body (@{email = "admin@wecare.dev"; password = "password" } | ConvertTo-Json) `
        -ContentType "application/json"
    
    Write-Host "[OK] Login successful!" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($loginResponse.user.role)" -ForegroundColor Gray
    Write-Host "   ID: $($loginResponse.user.id)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✅ Password hashing is working correctly!" -ForegroundColor Green
}
catch {
    Write-Host "[FAIL] Login failed: $($_.Exception.Message)" -ForegroundColor Red
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   Status Code: $statusCode" -ForegroundColor Gray
}
