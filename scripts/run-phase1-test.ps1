# Phase 1.2 Test Script - UnifiedRadioDashboard
# ทดสอบว่าหน้าใหม่ทำงานเหมือนหน้าเดิม 100%

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Phase 1.2: Testing UnifiedRadioDashboard" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "[1/5] Checking Backend..." -ForegroundColor Yellow
$backendRunning = Test-NetConnection -ComputerName localhost -Port 3001 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($backendRunning) {
    Write-Host "  ✅ Backend is running (port 3001)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "  Please start backend first: cd wecare-backend && npm start" -ForegroundColor Yellow
    exit 1
}

# Check if frontend is running
Write-Host "[2/5] Checking Frontend..." -ForegroundColor Yellow
$frontendRunning = Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($frontendRunning) {
    Write-Host "  ✅ Frontend is running (port 5173)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Frontend is NOT running!" -ForegroundColor Red
    Write-Host "  Please start frontend first: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Check if files exist
Write-Host "[3/5] Checking Files..." -ForegroundColor Yellow
$files = @(
    "src\pages\unified\UnifiedRadioDashboard.tsx",
    "src\pages\RadioDashboard.tsx",
    "src\pages\RadioCenterDashboard.tsx",
    "src\pages\TestUnifiedRadioPage.tsx"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file NOT FOUND!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "  ❌ Some files are missing!" -ForegroundColor Red
    exit 1
}

# Open test page
Write-Host "[4/5] Opening Test Page..." -ForegroundColor Yellow
Write-Host "  📄 Opening: test-unified-radio-manual.html" -ForegroundColor Cyan
Start-Process "test-unified-radio-manual.html"
Start-Sleep -Seconds 2

# Open browser for manual testing
Write-Host "[5/5] Opening Browser..." -ForegroundColor Yellow
Write-Host "  🌐 Opening: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📝 Manual Testing Instructions:" -ForegroundColor Yellow
Write-Host "  1. Login with DEVELOPER account" -ForegroundColor White
Write-Host "  2. Navigate to test_unified_radio (manual URL)" -ForegroundColor White
Write-Host "  3. Test both Radio and Radio Center roles" -ForegroundColor White
Write-Host "  4. Fill out the test checklist in the HTML page" -ForegroundColor White
Write-Host ""

Start-Process "http://localhost:5173"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Environment Ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Complete manual testing" -ForegroundColor White
Write-Host "2. Document results in TEST_RESULTS_PHASE1.md" -ForegroundColor White
Write-Host "3. If PASSED -> Proceed to Phase 1.3" -ForegroundColor White
Write-Host "4. If FAILED -> Fix issues and re-test" -ForegroundColor White
Write-Host ""
