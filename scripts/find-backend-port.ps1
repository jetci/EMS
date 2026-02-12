# Find which port the backend is actually running on
Write-Host "=== FINDING BACKEND PORT ===" -ForegroundColor Cyan
Write-Host ""

# Get all node processes
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Node processes found:" -ForegroundColor Yellow
    $nodeProcesses | Select-Object Id, StartTime | Format-Table
    
    # Get all listening ports
    Write-Host "Checking listening ports..." -ForegroundColor Yellow
    $listeningPorts = Get-NetTCPConnection -State Listen | Where-Object {$_.OwningProcess -in $nodeProcesses.Id}
    
    if ($listeningPorts) {
        Write-Host "Ports used by Node processes:" -ForegroundColor Green
        $listeningPorts | Select-Object LocalAddress, LocalPort, OwningProcess | Format-Table
        
        # Test each port
        foreach ($port in $listeningPorts.LocalPort | Select-Object -Unique) {
            Write-Host "Testing port $port..." -ForegroundColor Yellow
            
            # Test health endpoint
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$port/api/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
                Write-Host "  /api/health: SUCCESS (Status $($response.StatusCode))" -ForegroundColor Green
            } catch {
                Write-Host "  /api/health: Not available" -ForegroundColor Gray
            }
            
            # Test login endpoint
            try {
                $body = '{"email":"admin@wecare.ems","password":"Admin@123"}'
                $response = Invoke-WebRequest -Uri "http://localhost:$port/api/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 2 -ErrorAction Stop
                Write-Host "  /api/auth/login: SUCCESS (Status $($response.StatusCode))" -ForegroundColor Green
                Write-Host "  THIS IS THE BACKEND PORT!" -ForegroundColor Cyan -BackgroundColor Green
            } catch {
                $statusCode = $_.Exception.Response.StatusCode.value__
                Write-Host "  /api/auth/login: Status $statusCode" -ForegroundColor Red
            }
            Write-Host ""
        }
    } else {
        Write-Host "No listening ports found for Node processes" -ForegroundColor Red
    }
} else {
    Write-Host "No Node processes running!" -ForegroundColor Red
}
