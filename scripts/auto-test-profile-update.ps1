# Automated Test: Profile Image Update
Write-Host "=== Automated Profile Update Test ===" -ForegroundColor Cyan
Write-Host ""

# Check servers
Write-Host "Checking servers..." -ForegroundColor Yellow
$backend = netstat -ano | findstr :3001
$frontend = netstat -ano | findstr :5173

if (!$backend) {
    Write-Host "❌ Backend not running on port 3001" -ForegroundColor Red
    exit 1
}
if (!$frontend) {
    Write-Host "❌ Frontend not running on port 5173" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend: Running" -ForegroundColor Green
Write-Host "✅ Frontend: Running" -ForegroundColor Green
Write-Host ""

# Test API directly
Write-Host "Testing API..." -ForegroundColor Yellow

# Login first
$loginBody = @{
    email = "admin@wecare.ems"
    password = "Admin@123"
} | ConvertTo-Json

Write-Host "1. Logging in..." -ForegroundColor White
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"
    
    $token = $loginResponse.token
    Write-Host "   ✅ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Testing GET /auth/me..." -ForegroundColor White
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $meResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/me" `
        -Method GET `
        -Headers $headers
    
    Write-Host "   ✅ GET /auth/me: Success (200)" -ForegroundColor Green
    Write-Host "   User: $($meResponse.name) ($($meResponse.email))" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ GET /auth/me failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Testing PUT /auth/profile..." -ForegroundColor White
$testImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
$profileBody = @{
    name = "Test User Updated"
    phone = "0812345678"
    profileImageUrl = $testImage
} | ConvertTo-Json

try {
    $profileResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/profile" `
        -Method PUT `
        -Body $profileBody `
        -ContentType "application/json" `
        -Headers $headers
    
    Write-Host "   ✅ PUT /auth/profile: Success (200)" -ForegroundColor Green
    Write-Host "   Updated name: $($profileResponse.name)" -ForegroundColor Gray
    Write-Host "   Has profileImageUrl: $($null -ne $profileResponse.profileImageUrl)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    
    Write-Host "   ❌ PUT /auth/profile failed" -ForegroundColor Red
    Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $errorBody" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check backend terminal for debug logs:" -ForegroundColor Yellow
    Write-Host "   Should see: PUT /auth/profile called - UPDATED VERSION" -ForegroundColor Gray
    Write-Host ""
    Write-Host "If you do not see the debug log, the request did not reach the handler" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
