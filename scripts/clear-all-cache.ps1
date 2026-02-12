# Clear All Cache - Backend & Frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Clearing All Cache" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Clear Backend Cache
Write-Host "[1/5] Clearing backend ts-node cache..." -ForegroundColor Yellow
if (Test-Path "d:\EMS\wecare-backend\node_modules\.cache") {
    Remove-Item -Recurse -Force "d:\EMS\wecare-backend\node_modules\.cache"
    Write-Host "  Backend cache cleared" -ForegroundColor Green
}
else {
    Write-Host "  No backend cache found" -ForegroundColor Gray
}
Write-Host ""

# 2. Clear Backend dist
Write-Host "[2/5] Clearing backend dist folder..." -ForegroundColor Yellow
if (Test-Path "d:\EMS\wecare-backend\dist") {
    Remove-Item -Recurse -Force "d:\EMS\wecare-backend\dist"
    Write-Host "  Dist folder cleared" -ForegroundColor Green
}
else {
    Write-Host "  No dist folder found" -ForegroundColor Gray
}
Write-Host ""

# 3. Clear Frontend Cache
Write-Host "[3/5] Clearing frontend Vite cache..." -ForegroundColor Yellow
if (Test-Path "d:\EMS\node_modules\.vite") {
    Remove-Item -Recurse -Force "d:\EMS\node_modules\.vite"
    Write-Host "  Vite cache cleared" -ForegroundColor Green
}
else {
    Write-Host "  No Vite cache found" -ForegroundColor Gray
}
Write-Host ""

# 4. Clear Frontend dist
Write-Host "[4/5] Clearing frontend dist folder..." -ForegroundColor Yellow
if (Test-Path "d:\EMS\dist") {
    Remove-Item -Recurse -Force "d:\EMS\dist"
    Write-Host "  Frontend dist cleared" -ForegroundColor Green
}
else {
    Write-Host "  No frontend dist found" -ForegroundColor Gray
}
Write-Host ""

# 5. Rebuild Backend
Write-Host "[5/5] Rebuilding backend..." -ForegroundColor Yellow
Push-Location "d:\EMS\wecare-backend"
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Backend rebuilt successfully" -ForegroundColor Green
}
else {
    Write-Host "  Backend build failed!" -ForegroundColor Red
    Write-Host "  Error: $buildOutput" -ForegroundColor Gray
}
Pop-Location
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Cache Cleared Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Stop backend (Ctrl+C in backend terminal)" -ForegroundColor White
Write-Host "  2. Run: npm start (use compiled version)" -ForegroundColor White
Write-Host "  3. Refresh browser (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "  4. Test login" -ForegroundColor White
