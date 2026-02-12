# Restart Backend and Frontend Servers
Write-Host "=== Restarting Servers ===" -ForegroundColor Cyan

# Kill all node processes
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe /T 2>$null
Start-Sleep -Seconds 2

# Start Backend
Write-Host "`nStarting Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\EMS\wecare-backend; Write-Host 'Backend Server' -ForegroundColor Cyan; npm run dev"

# Wait for backend to start
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\EMS; Write-Host 'Frontend Server' -ForegroundColor Cyan; npm run dev"

# Wait and check
Start-Sleep -Seconds 5

Write-Host "`n=== Checking Server Status ===" -ForegroundColor Cyan
$backend = netstat -ano | findstr :3001
$frontend = netstat -ano | findstr :5173

if ($backend) {
    Write-Host "Backend: Running on http://localhost:3001" -ForegroundColor Green
} else {
    Write-Host "Backend: NOT RUNNING" -ForegroundColor Red
}

if ($frontend) {
    Write-Host "Frontend: Running on http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "Frontend: NOT RUNNING" -ForegroundColor Red
}

Write-Host "`n=== Servers Started ===" -ForegroundColor Green
Write-Host "Backend will have debug logs enabled" -ForegroundColor Yellow
Write-Host "Watch the Backend terminal for debug messages" -ForegroundColor Yellow
