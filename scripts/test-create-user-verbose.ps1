# Test Create User with Verbose Error
Write-Host "=== Test Create User (Verbose) ===" -ForegroundColor Cyan

# Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"admin@wecare.ems","password":"Admin@123"}'

$token = $loginResponse.token
Write-Host "Token obtained" -ForegroundColor Green

# Create User with error handling
Write-Host "`nCreating user..." -ForegroundColor Yellow

$body = @{
    email = "newuser$(Get-Date -Format 'HHmmss')@wecare.dev"
    password = "TestPass123!"
    fullName = "New Test User"
    role = "community"
} | ConvertTo-Json

Write-Host "Request body: $body" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/users" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ "Authorization" = "Bearer $token" } `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "Success!" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "Failed!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
}
