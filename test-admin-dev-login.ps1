# Test admin and developer login
Write-Host "=== TESTING ADMIN & DEVELOPER LOGIN ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001/api"

# Test 1: Admin
Write-Host "[1] Testing Admin Login" -ForegroundColor Yellow
$adminBody = @{
    email = "admin@wecare.ems"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $adminBody -ContentType "application/json"
    Write-Host "    ✅ SUCCESS!" -ForegroundColor Green
    Write-Host "       User: $($response.user.email)" -ForegroundColor Green
    Write-Host "       Role: $($response.user.role)" -ForegroundColor Green
    Write-Host "       Name: $($response.user.full_name)" -ForegroundColor Green
} catch {
    Write-Host "    ❌ FAILED!" -ForegroundColor Red
    Write-Host "       Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "       Status: $statusCode" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "       Response: $responseBody" -ForegroundColor Red
        } catch {}
    }
}
Write-Host ""

# Test 2: Developer
Write-Host "[2] Testing Developer Login" -ForegroundColor Yellow
$devBody = @{
    email = "dev@wecare.ems"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $devBody -ContentType "application/json"
    Write-Host "    ✅ SUCCESS!" -ForegroundColor Green
    Write-Host "       User: $($response.user.email)" -ForegroundColor Green
    Write-Host "       Role: $($response.user.role)" -ForegroundColor Green
    Write-Host "       Name: $($response.user.full_name)" -ForegroundColor Green
} catch {
    Write-Host "    ❌ FAILED!" -ForegroundColor Red
    Write-Host "       Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "       Status: $statusCode" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "       Response: $responseBody" -ForegroundColor Red
        } catch {}
    }
}
Write-Host ""

# Test 3: Other role (for comparison)
Write-Host "[3] Testing Radio Login (for comparison)" -ForegroundColor Yellow
$radioBody = @{
    email = "office1@wecare.dev"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $radioBody -ContentType "application/json"
    Write-Host "    ✅ SUCCESS!" -ForegroundColor Green
    Write-Host "       User: $($response.user.email)" -ForegroundColor Green
    Write-Host "       Role: $($response.user.role)" -ForegroundColor Green
} catch {
    Write-Host "    ❌ FAILED!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "If admin/dev failed but radio succeeded, there may be:" -ForegroundColor Yellow
Write-Host "- Role-based middleware blocking" -ForegroundColor Gray
Write-Host "- Special validation for admin/developer roles" -ForegroundColor Gray
Write-Host "- Frontend filtering by role" -ForegroundColor Gray
