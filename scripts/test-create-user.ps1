# Test Create User API
Write-Host "=== Test Create User API ===" -ForegroundColor Cyan

# 1. Login as admin
Write-Host "`n1. Logging in as admin..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"admin@wecare.ems","password":"Admin@123"}'

$token = $loginResponse.token
Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor Green

# 2. Test Create User
Write-Host "`n2. Creating new user..." -ForegroundColor Yellow
try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/users" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $token" } `
        -Body (@{
            email = "testuser$(Get-Date -Format 'HHmmss')@wecare.dev"
            password = "TestPass123!"
            fullName = "Test User"
            role = "community"
        } | ConvertTo-Json)
    
    Write-Host "   Success! User created:" -ForegroundColor Green
    Write-Host "   ID: $($createResponse.id)" -ForegroundColor White
    Write-Host "   Email: $($createResponse.email)" -ForegroundColor White
    Write-Host "   Name: $($createResponse.full_name)" -ForegroundColor White
    Write-Host "   Role: $($createResponse.role)" -ForegroundColor White
} catch {
    Write-Host "   Failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
}

# 3. List all users
Write-Host "`n3. Listing all users..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/users" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    Write-Host "   Total users: $($usersResponse.Count)" -ForegroundColor Green
    $usersResponse | Select-Object -Last 3 | ForEach-Object {
        Write-Host "   - $($_.email) ($($_.role))" -ForegroundColor White
    }
} catch {
    Write-Host "   Failed to list users" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
