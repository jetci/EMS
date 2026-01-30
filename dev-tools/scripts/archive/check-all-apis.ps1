Write-Host "=== Testing All API Endpoints ===" -ForegroundColor Cyan

$endpoints = @(
    @{url="http://localhost:3001"; name="Backend Root"},
    @{url="http://localhost:3001/api/users"; name="Users API"},
    @{url="http://localhost:3001/api/teams"; name="Teams API"},
    @{url="http://localhost:3001/api/vehicles"; name="Vehicles API"},
    @{url="http://localhost:3001/api/vehicle-types"; name="Vehicle Types API"},
    @{url="http://localhost:3001/api/news"; name="News API"},
    @{url="http://localhost:3001/api/audit-logs"; name="Audit Logs API"},
    @{url="http://localhost:3001/api/dashboard/admin"; name="Admin Dashboard API"},
    @{url="http://localhost:3001/api/drivers"; name="Drivers API"},
    @{url="http://localhost:3001/api/patients"; name="Patients API"},
    @{url="http://localhost:3001/api/rides"; name="Rides API"}
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-RestMethod -Uri $endpoint.url -Method GET -ErrorAction Stop
        $count = if ($response -is [array]) { $response.Count } else { 1 }
        Write-Host "[OK] $($endpoint.name) - $count items" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] $($endpoint.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Testing Login ===" -ForegroundColor Cyan
$body = @{
    email = "jetci.jm@gmail.com"
    password = "g0KEk,^],k;yo"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/login" -Method POST -ContentType "application/json" -Body $body
    Write-Host "[OK] Login - Role: $($response.user.role)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Login - $($_.Exception.Message)" -ForegroundColor Red
}
