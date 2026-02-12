# Start Frontend Server at Port 5173

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting EMS WeCare Frontend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Backend is running
Write-Host "Checking Backend Server..." -ForegroundColor Yellow
$backend = netstat -ano | findstr :3001
if ($backend) {
    Write-Host "✅ Backend is running on Port 3001" -ForegroundColor Green
}
else {
    Write-Host "❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "   Please start Backend first:" -ForegroundColor Yellow
    Write-Host "   cd wecare-backend" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host ""

# Check if Port 5173 is available
Write-Host "Checking Port 5173..." -ForegroundColor Yellow
$port5173 = netstat -ano | findstr :5173
if ($port5173) {
    Write-Host "❌ Port 5173 is already in use!" -ForegroundColor Red
    Write-Host "   Killing process..." -ForegroundColor Yellow
    
    # Extract PID and kill
    $pid = ($port5173 -split '\s+')[-1]
    taskkill /PID $pid /F
    Start-Sleep -Seconds 2
}

Write-Host "✅ Port 5173 is available" -ForegroundColor Green
Write-Host ""

# Set PORT environment variable
$env:PORT = "5173"

Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "Port: 5173" -ForegroundColor Gray
Write-Host ""

# Start Frontend
npm run dev

# This will keep running until Ctrl+C
