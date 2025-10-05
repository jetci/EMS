Write-Host "Stopping all node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

Start-Sleep -Seconds 2

Write-Host "Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\EMS\wecare-backend; npm run dev"

Start-Sleep -Seconds 8

Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\EMS; npm run dev"

Start-Sleep -Seconds 10

Write-Host "Checking status..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue

Write-Host "`nOpening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host "`nSystem started!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Login: jetci.jm@gmail.com / g0KEk,^],k;yo" -ForegroundColor Yellow
