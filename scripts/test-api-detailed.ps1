Write-Host "=== Testing All API Endpoints (Detailed) ===" -ForegroundColor Cyan

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
    Write-Host "`nTesting $key..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri $endpoints[$key] -Method GET -ErrorAction Stop
        $count = if ($response -is [array]) { $response.Count } else { 1 }
        Write-Host "[OK] $key - $count items" -ForegroundColor Green
        
        if ($response -is [array] -and $response.Count -gt 0) {
            Write-Host "Sample data:" -ForegroundColor Gray
            $response[0] | ConvertTo-Json -Compress | Write-Host -ForegroundColor Gray
        }
    } catch {
        Write-Host "[FAIL] $key" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        }
    }
}
