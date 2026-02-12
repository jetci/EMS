# Check Backend Process and Logs
Write-Host "=== Backend Process Check ===" -ForegroundColor Cyan
Write-Host ""

# Find backend process
$backendProcess = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*backend*" -or 
    (Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue | Where-Object LocalPort -eq 3001)
}

if ($backendProcess) {
    Write-Host "✅ Backend process found:" -ForegroundColor Green
    Write-Host "   PID: $($backendProcess.Id)" -ForegroundColor Gray
    Write-Host "   CPU: $($backendProcess.CPU)" -ForegroundColor Gray
    Write-Host "   Memory: $([math]::Round($backendProcess.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor Gray
} else {
    Write-Host "❌ Backend process not found" -ForegroundColor Red
    Write-Host "   Please start backend manually" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=== Instructions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend is running. To see logs:" -ForegroundColor White
Write-Host "1. Go to the terminal/PowerShell window running backend" -ForegroundColor Gray
Write-Host "2. Look for logs after running the test script" -ForegroundColor Gray
Write-Host "3. Copy all logs related to PUT /api/auth/profile" -ForegroundColor Gray
Write-Host ""
Write-Host "Expected logs should include:" -ForegroundColor Yellow
Write-Host "  🛡️ [SQL Injection] PUT /api/auth/profile" -ForegroundColor Gray
Write-Host "  🔐 [CSRF Token] PUT /api/auth/profile" -ForegroundColor Gray
Write-Host "  ⏱️ [Rate Limiter] PUT /auth/profile" -ForegroundColor Gray
Write-Host "  🔓 [Auth Routes] PUT /auth/profile" -ForegroundColor Gray
Write-Host "  🔵 PUT /auth/profile called - UPDATED VERSION" -ForegroundColor Gray
Write-Host ""
Write-Host "If you DON'T see these logs, the request didn't reach the backend" -ForegroundColor Red
Write-Host ""
