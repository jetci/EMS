# Complete backend diagnosis
Write-Host "=== BACKEND STATUS DIAGNOSIS ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node processes
Write-Host "[1] Node Processes:" -ForegroundColor Yellow
$nodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcs) {
    $nodeProcs | Select-Object Id, @{N='CPU(s)';E={$_.CPU}}, @{N='Memory(MB)';E={[math]::Round($_.WS/1MB,2)}}, StartTime | Format-Table
} else {
    Write-Host "    ❌ NO NODE PROCESSES RUNNING!" -ForegroundColor Red
}
Write-Host ""

# 2. Check listening ports
Write-Host "[2] Listening Ports:" -ForegroundColor Yellow
$ports = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | 
    Where-Object {$_.LocalPort -in @(3000,3001,5173)} |
    Select-Object LocalAddress, LocalPort, State, OwningProcess
if ($ports) {
    $ports | Format-Table
} else {
    Write-Host "    ❌ No ports 3000, 3001, or 5173 are listening!" -ForegroundColor Red
}
Write-Host ""

# 3. Test each port
Write-Host "[3] Testing Ports:" -ForegroundColor Yellow

foreach ($port in @(3000, 3001, 5173)) {
    Write-Host "    Port $port..." -ForegroundColor Gray
    
    # Test root
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -Method GET -TimeoutSec 2 -ErrorAction Stop
        Write-Host "      ✅ Responds on root (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "      ❌ No response on root" -ForegroundColor Red
    }
    
    # Test /api/health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port/api/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
        Write-Host "      ✅ /api/health works (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        # Silent fail
    }
    
    # Test /api/auth/login
    try {
        $body = '{"email":"test","password":"test"}'
        $response = Invoke-WebRequest -Uri "http://localhost:$port/api/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "      ✅ /api/auth/login responds (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Host "      ⚠️  /api/auth/login returns $statusCode" -ForegroundColor Yellow
        }
    }
}
Write-Host ""

# 4. Check backend directory
Write-Host "[4] Backend Files:" -ForegroundColor Yellow
$backendPath = "d:\EMS\wecare-backend"
if (Test-Path $backendPath) {
    Write-Host "    ✅ Backend directory exists" -ForegroundColor Green
    
    if (Test-Path "$backendPath\.env") {
        Write-Host "    ✅ .env file exists" -ForegroundColor Green
    } else {
        Write-Host "    ❌ .env file MISSING!" -ForegroundColor Red
    }
    
    if (Test-Path "$backendPath\package.json") {
        Write-Host "    ✅ package.json exists" -ForegroundColor Green
    }
    
    if (Test-Path "$backendPath\node_modules") {
        Write-Host "    ✅ node_modules exists" -ForegroundColor Green
    } else {
        Write-Host "    ❌ node_modules MISSING - run npm install!" -ForegroundColor Red
    }
} else {
    Write-Host "    ❌ Backend directory NOT FOUND!" -ForegroundColor Red
}
Write-Host ""

# 5. Recommendation
Write-Host "=== DIAGNOSIS RESULT ===" -ForegroundColor Cyan
if (-not $nodeProcs) {
    Write-Host "❌ BACKEND IS NOT RUNNING!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start backend:" -ForegroundColor Yellow
    Write-Host "  cd d:\EMS\wecare-backend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
} elseif (-not $ports) {
    Write-Host "⚠️  Node is running but not listening on expected ports" -ForegroundColor Yellow
    Write-Host "   Check backend console for errors" -ForegroundColor Gray
} else {
    Write-Host "✅ Backend appears to be running" -ForegroundColor Green
    Write-Host "   Check specific port responses above" -ForegroundColor Gray
}
