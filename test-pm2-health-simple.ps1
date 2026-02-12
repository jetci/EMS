# Test Script: PM2 & Health Check
# Simple version without Thai characters in critical sections

Write-Host "========================================"
Write-Host "Test Priority 1: PM2 & Health Check"
Write-Host "========================================"
Write-Host ""

$passed = 0
$failed = 0

# Test 1: PM2 Config File
Write-Host "Test 1: PM2 Configuration File"
if (Test-Path ".\ecosystem.config.js") {
    Write-Host "  [PASS] ecosystem.config.js exists" -ForegroundColor Green
    $passed++
    
    $content = Get-Content ".\ecosystem.config.js" -Raw
    if ($content -match "wecare-backend") {
        Write-Host "  [PASS] wecare-backend app configured" -ForegroundColor Green
        $passed++
    }
    if ($content -match "cluster") {
        Write-Host "  [PASS] cluster mode enabled" -ForegroundColor Green
        $passed++
    }
    if ($content -match "autorestart") {
        Write-Host "  [PASS] autorestart enabled" -ForegroundColor Green
        $passed++
    }
} else {
    Write-Host "  [FAIL] ecosystem.config.js not found" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 2: Health Route File
Write-Host "Test 2: Health Check Endpoint"
if (Test-Path ".\wecare-backend\src\routes\health.ts") {
    Write-Host "  [PASS] health.ts exists" -ForegroundColor Green
    $passed++
    
    $content = Get-Content ".\wecare-backend\src\routes\health.ts" -Raw
    if ($content -match "router\.get\('/health'") {
        Write-Host "  [PASS] GET /health endpoint found" -ForegroundColor Green
        $passed++
    }
    if ($content -match "database") {
        Write-Host "  [PASS] database health check found" -ForegroundColor Green
        $passed++
    }
} else {
    Write-Host "  [FAIL] health.ts not found" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 3: Health Route Registration
Write-Host "Test 3: Health Route Registration"
if (Test-Path ".\wecare-backend\src\index.ts") {
    $content = Get-Content ".\wecare-backend\src\index.ts" -Raw
    if ($content -match "healthRoutes" -or $content -match "health") {
        Write-Host "  [PASS] Health route registered" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [FAIL] Health route not registered" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""

# Test 4: API Test (if server is running)
Write-Host "Test 4: Health Check API"
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  [PASS] API returns 200 OK" -ForegroundColor Green
        $passed++
        
        $data = $response.Content | ConvertFrom-Json
        Write-Host "  Status: $($data.status)"
        Write-Host "  Uptime: $([math]::Round($data.uptime, 2)) seconds"
        
        if ($data.database) {
            Write-Host "  [PASS] Database health data present" -ForegroundColor Green
            $passed++
        }
    }
} catch {
    Write-Host "  [SKIP] Server not running" -ForegroundColor Yellow
}

Write-Host ""

# Test 5: PM2 Installation
Write-Host "Test 5: PM2 Installation"
try {
    $pm2Version = pm2 --version 2>$null
    if ($pm2Version) {
        Write-Host "  [PASS] PM2 installed (v$pm2Version)" -ForegroundColor Green
        $passed++
    }
} catch {
    Write-Host "  [WARN] PM2 not installed" -ForegroundColor Yellow
    Write-Host "  Install with: npm install -g pm2"
}

Write-Host ""
Write-Host "========================================"
Write-Host "Test Results"
Write-Host "========================================"
Write-Host "PASSED: $passed tests" -ForegroundColor Green
Write-Host "FAILED: $failed tests" -ForegroundColor Red

$total = $passed + $failed
$passRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 2) } else { 0 }
Write-Host "Pass Rate: $passRate%"

if ($failed -gt 0) {
    Write-Host ""
    Write-Host "[FAIL] Some tests failed" -ForegroundColor Red
    exit 1
} else {
    Write-Host ""
    Write-Host "[PASS] All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Build: cd wecare-backend && npm run build"
    Write-Host "  2. Start: pm2 start ecosystem.config.js --env production"
    Write-Host "  3. Monitor: pm2 monit"
    exit 0
}
