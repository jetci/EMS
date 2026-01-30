# Test both possible passwords
$uri = "http://localhost:3000/api/auth/login"

Write-Host "=== TESTING LOGIN WITH DIFFERENT PASSWORDS ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Admin@123
Write-Host "Test 1: Password = Admin@123" -ForegroundColor Yellow
$body1 = '{"email":"admin@wecare.ems","password":"Admin@123"}'
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $body1 -ContentType "application/json"
    Write-Host "  SUCCESS!" -ForegroundColor Green
    Write-Host "  User: $($response.user.email) - Role: $($response.user.role)" -ForegroundColor Green
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  Status Code: $statusCode" -ForegroundColor Red
    }
}
Write-Host ""

# Test 2: password123
Write-Host "Test 2: Password = password123" -ForegroundColor Yellow
$body2 = '{"email":"admin@wecare.ems","password":"password123"}'
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $body2 -ContentType "application/json"
    Write-Host "  SUCCESS!" -ForegroundColor Green
    Write-Host "  User: $($response.user.email) - Role: $($response.user.role)" -ForegroundColor Green
    Write-Host "  Token: $($response.token.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  Status Code: $statusCode" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: Try other common users
Write-Host "Test 3: Developer account" -ForegroundColor Yellow
$body3 = '{"email":"dev@wecare.ems","password":"password123"}'
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $body3 -ContentType "application/json"
    Write-Host "  SUCCESS!" -ForegroundColor Green
    Write-Host "  User: $($response.user.email) - Role: $($response.user.role)" -ForegroundColor Green
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
