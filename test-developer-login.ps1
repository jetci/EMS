$body = @{
    email = "jetci.jm@gmail.com"
    password = "g0KEk,^],k;yo"
} | ConvertTo-Json

Write-Host "Testing DEVELOPER Login..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/login" -Method POST -ContentType "application/json" -Body $body
    Write-Host "`n[SUCCESS] Login successful!" -ForegroundColor Green
    Write-Host "User: $($response.user.full_name)" -ForegroundColor Green
    Write-Host "Email: $($response.user.email)" -ForegroundColor Green
    Write-Host "Role: $($response.user.role)" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0,30))..." -ForegroundColor Green
} catch {
    Write-Host "`n[ERROR] Login failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host "`n--- Testing API Endpoints ---" -ForegroundColor Cyan

$endpoints = @(
    "/api/users",
    "/api/teams", 
    "/api/vehicles",
    "/api/vehicle-types",
    "/api/news",
    "/api/audit-logs",
    "/api/dashboard/admin",
    "/api/drivers",
    "/api/patients",
    "/api/office/patients"
)

foreach ($endpoint in $endpoints) {
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:3001$endpoint" -Method GET
        Write-Host "[OK] $endpoint - $($result.Count) items" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] $endpoint - $($_.Exception.Message)" -ForegroundColor Red
    }
}
