# ========================================
# DEVELOPER LOGIN TEST
# ========================================

$BASE_URL = "http://localhost:3001/api"
$EMAIL = "jetci.jm@gmail.com"
$PASSWORD = "g0KEk,^],k;yo"

Write-Host "Testing Developer Login..." -ForegroundColor Cyan

try {
    $loginBody = @{
        email    = $EMAIL
        password = $PASSWORD
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($response.token -and $response.user.role -eq 'DEVELOPER') {
        Write-Host "PASS: Login successful!" -ForegroundColor Green
        Write-Host "Token: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
        exit 0
    }
    else {
        Write-Host "FAIL: Login failed or wrong role" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "FAIL: Login error: $_" -ForegroundColor Red
    exit 1
}
