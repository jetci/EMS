# Kill process on port 3001
Write-Host "Checking for process on port 3001..." -ForegroundColor Yellow

try {
    $process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
    
    if ($process) {
        Write-Host "Found process ID: $process" -ForegroundColor Cyan
        Write-Host "Stopping process..." -ForegroundColor Yellow
        Stop-Process -Id $process -Force
        Write-Host "Process stopped successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
    }
    else {
        Write-Host "No process found on port 3001" -ForegroundColor Green
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Find and close the terminal window running the old backend" -ForegroundColor Yellow
}
