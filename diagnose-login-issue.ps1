# Comprehensive login diagnosis script

Write-Host "=== LOGIN SYSTEM DIAGNOSIS ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check which ports are listening
Write-Host "1. Checking active ports..." -ForegroundColor Yellow
$ports = Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -in @(3000,3001,5173)} | Select-Object LocalAddress, LocalPort, State
$ports | Format-Table
Write-Host ""

# 2. Test backend on port 3001
Write-Host "2. Testing backend on port 3001..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -Body '{"email":"admin@wecare.ems","password":"Admin@123"}' -ContentType "application/json" -ErrorAction Stop
    Write-Host "   Port 3001: SUCCESS - Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   Port 3001: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3. Test backend on port 3000
Write-Host "3. Testing backend on port 3000..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body '{"email":"admin@wecare.ems","password":"Admin@123"}' -ContentType "application/json" -ErrorAction Stop
    Write-Host "   Port 3000: SUCCESS - Status $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content | ConvertFrom-Json
    Write-Host "   User: $($content.user.email) - Role: $($content.user.role)" -ForegroundColor Green
} catch {
    Write-Host "   Port 3000: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    }
}
Write-Host ""

# 4. Check frontend config
Write-Host "4. Checking frontend API configuration..." -ForegroundColor Yellow
$apiConfig = Get-Content "d:\EMS\src\services\api.ts" | Select-String -Pattern "API_BASE_URL|getApiBaseUrl" -Context 0,3
Write-Host $apiConfig
Write-Host ""

# 5. Check if backend is actually running
Write-Host "5. Checking backend process..." -ForegroundColor Yellow
$backendProcess = Get-Process -Name node -ErrorAction SilentlyContinue | Select-Object Id, StartTime
if ($backendProcess) {
    Write-Host "   Backend processes found:" -ForegroundColor Green
    $backendProcess | Format-Table
} else {
    Write-Host "   No backend process found!" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== DIAGNOSIS COMPLETE ===" -ForegroundColor Cyan
