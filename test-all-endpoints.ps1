Write-Host "Testing all API endpoints..." -ForegroundColor Cyan

$endpoints = @{
    "Teams" = "http://localhost:3001/api/teams"
    "Users" = "http://localhost:3001/api/users"
    "Drivers" = "http://localhost:3001/api/drivers"
    "Patients" = "http://localhost:3001/api/patients"
    "Rides" = "http://localhost:3001/api/rides"
    "Vehicles" = "http://localhost:3001/api/vehicles"
    "Vehicle Types" = "http://localhost:3001/api/vehicle-types"
    "News" = "http://localhost:3001/api/news"
    "Audit Logs" = "http://localhost:3001/api/audit-logs"
    "Dashboard Admin" = "http://localhost:3001/api/dashboard/admin"
}

foreach ($key in $endpoints.Keys) {
    try {
        $response = Invoke-RestMethod -Uri $endpoints[$key] -Method GET
        $count = if ($response -is [array]) { $response.Count } else { 1 }
        Write-Host "[OK] $key - $count items" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] $key - $($_.Exception.Message)" -ForegroundColor Red
    }
}
