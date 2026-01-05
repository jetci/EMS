# Test Login After Port Fix

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Login (Port 3001)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "[1/2] Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -TimeoutSec 3
    Write-Host "  Backend is running on port 3001" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor Gray
}
catch {
    Write-Host "  Backend not responding on port 3001" -ForegroundColor Red
    Write-Host "  Make sure to run: npm start" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 2: Login
Write-Host "[2/2] Testing admin login..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
        -Method POST `
        -Body (@{email = "admin@wecare.dev"; password = "password" } | ConvertTo-Json) `
        -ContentType "application/json"
    
    Write-Host "  LOGIN SUCCESS!" -ForegroundColor Green
    Write-Host "  User: $($response.user.email)" -ForegroundColor White
    Write-Host "  Role: $($response.user.role)" -ForegroundColor White
    Write-Host "  Token: $($response.token.Substring(0, 30))..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "  Login failed with status: $statusCode" -ForegroundColor Red
    
    if ($statusCode -eq 401) {
        Write-Host "  Credentials incorrect or password not hashed" -ForegroundColor Yellow
    }
    elseif ($statusCode -eq 500) {
        Write-Host "  Backend error - check backend console" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "  Check backend terminal for debug logs" -ForegroundColor Cyan
}
