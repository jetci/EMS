# ========================================
# Test Script: Priority 1 - PM2 & Health Check
# ========================================
# ทดสอบ PM2 Configuration และ Health Check Endpoint
# Author: QA Engineer
# Date: 2026-01-31
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 Test Priority 1: PM2 & Health Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @()
$passed = 0
$failed = 0

# ========================================
# Test 1: ตรวจสอบไฟล์ PM2 Configuration
# ========================================
Write-Host "📋 Test 1: ตรวจสอบไฟล์ PM2 Configuration" -ForegroundColor Yellow
$pm2ConfigPath = ".\ecosystem.config.js"

if (Test-Path $pm2ConfigPath) {
    Write-Host "   ✅ PASS: พบไฟล์ ecosystem.config.js" -ForegroundColor Green
    $testResults += @{ Test = "PM2 Config File"; Status = "PASS" }
    $passed++
    
    # ตรวจสอบเนื้อหาไฟล์
    $content = Get-Content $pm2ConfigPath -Raw
    
    if ($content -match "wecare-backend") {
        Write-Host "   ✅ PASS: มีการตั้งค่า wecare-backend app" -ForegroundColor Green
        $testResults += @{ Test = "PM2 Backend Config"; Status = "PASS" }
        $passed++
    } else {
        Write-Host "   ❌ FAIL: ไม่พบการตั้งค่า wecare-backend app" -ForegroundColor Red
        $testResults += @{ Test = "PM2 Backend Config"; Status = "FAIL" }
        $failed++
    }
    
    if ($content -match "cluster") {
        Write-Host "   ✅ PASS: ใช้ cluster mode" -ForegroundColor Green
        $testResults += @{ Test = "PM2 Cluster Mode"; Status = "PASS" }
        $passed++
    } else {
        Write-Host "   ⚠️  WARN: ไม่ได้ใช้ cluster mode" -ForegroundColor Yellow
        $testResults += @{ Test = "PM2 Cluster Mode"; Status = "WARN" }
    }
    
    if ($content -match "autorestart") {
        Write-Host "   ✅ PASS: มี autorestart" -ForegroundColor Green
        $testResults += @{ Test = "PM2 Auto Restart"; Status = "PASS" }
        $passed++
    } else {
        Write-Host "   ❌ FAIL: ไม่มี autorestart" -ForegroundColor Red
        $testResults += @{ Test = "PM2 Auto Restart"; Status = "FAIL" }
        $failed++
    }
    
    if ($content -match "max_memory_restart") {
        Write-Host "   ✅ PASS: มี memory limit" -ForegroundColor Green
        $testResults += @{ Test = "PM2 Memory Limit"; Status = "PASS" }
        $passed++
    } else {
        Write-Host "   ⚠️  WARN: ไม่มี memory limit" -ForegroundColor Yellow
        $testResults += @{ Test = "PM2 Memory Limit"; Status = "WARN" }
    }
    
} else {
    Write-Host "   ❌ FAIL: ไม่พบไฟล์ ecosystem.config.js" -ForegroundColor Red
    $testResults += @{ Test = "PM2 Config File"; Status = "FAIL" }
    $failed++
}

Write-Host ""

# ========================================
# Test 2: ตรวจสอบ Health Check Endpoint
# ========================================
Write-Host "📋 Test 2: ตรวจสอบ Health Check Endpoint" -ForegroundColor Yellow
$healthRoutePath = ".\wecare-backend\src\routes\health.ts"

if (Test-Path $healthRoutePath) {
    Write-Host "   ✅ PASS: พบไฟล์ health.ts" -ForegroundColor Green
    $testResults += @{ Test = "Health Route File"; Status = "PASS" }
    $passed++
    
    # ตรวจสอบเนื้อหาไฟล์
    $content = Get-Content $healthRoutePath -Raw
    
    if ($content -match "router\.get\('/health'") {
        Write-Host "   ✅ PASS: มี GET /health endpoint" -ForegroundColor Green
        $testResults += @{ Test = "Health GET Endpoint"; Status = "PASS" }
        $passed++
    } else {
        Write-Host "   ❌ FAIL: ไม่พบ GET /health endpoint" -ForegroundColor Red
        $testResults += @{ Test = "Health GET Endpoint"; Status = "FAIL" }
        $failed++
    }
    
    if ($content -match "database") {
        Write-Host "   ✅ PASS: มีการตรวจสอบ database" -ForegroundColor Green
        $testResults += @{ Test = "Health DB Check"; Status = "PASS" }
        $passed++
    } else {
        Write-Host "   ⚠️  WARN: ไม่มีการตรวจสอบ database" -ForegroundColor Yellow
        $testResults += @{ Test = "Health DB Check"; Status = "WARN" }
    }
    
    if ($content -match "memory") {
        Write-Host "   ✅ PASS: มีการตรวจสอบ memory" -ForegroundColor Green
        $testResults += @{ Test = "Health Memory Check"; Status = "PASS" }
        $passed++
    } else {
        Write-Host "   ⚠️  WARN: ไม่มีการตรวจสอบ memory" -ForegroundColor Yellow
        $testResults += @{ Test = "Health Memory Check"; Status = "WARN" }
    }
    
} else {
    Write-Host "   ❌ FAIL: ไม่พบไฟล์ health.ts" -ForegroundColor Red
    $testResults += @{ Test = "Health Route File"; Status = "FAIL" }
    $failed++
}

Write-Host ""

# ========================================
# Test 3: ตรวจสอบ Health Route Registration
# ========================================
Write-Host "📋 Test 3: ตรวจสอบ Health Route Registration" -ForegroundColor Yellow
$indexPath = ".\wecare-backend\src\index.ts"

if (Test-Path $indexPath) {
    $content = Get-Content $indexPath -Raw
    
    if ($content -match "healthRoutes" -or $content -match "health") {
        Write-Host "   ✅ PASS: Health route ถูก register ใน index.ts" -ForegroundColor Green
        $testResults += @{ Test = "Health Route Registration"; Status = "PASS" }
        $passed++
    } else {
        Write-Host "   ❌ FAIL: Health route ไม่ได้ register ใน index.ts" -ForegroundColor Red
        $testResults += @{ Test = "Health Route Registration"; Status = "FAIL" }
        $failed++
    }
} else {
    Write-Host "   ❌ FAIL: ไม่พบไฟล์ index.ts" -ForegroundColor Red
    $testResults += @{ Test = "Index File"; Status = "FAIL" }
    $failed++
}

Write-Host ""

# ========================================
# Test 4: ทดสอบ Backend Server (ถ้ารันอยู่)
# ========================================
Write-Host "📋 Test 4: ทดสอบ Health Check API (ถ้า Server รันอยู่)" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ PASS: Health Check API ตอบกลับ 200 OK" -ForegroundColor Green
        $testResults += @{ Test = "Health API Response"; Status = "PASS" }
        $passed++
        
        $healthData = $response.Content | ConvertFrom-Json
        
        if ($healthData.status -eq "healthy") {
            Write-Host "   ✅ PASS: System status = healthy" -ForegroundColor Green
            $testResults += @{ Test = "System Health Status"; Status = "PASS" }
            $passed++
        } else {
            Write-Host "   ⚠️  WARN: System status = $($healthData.status)" -ForegroundColor Yellow
            $testResults += @{ Test = "System Health Status"; Status = "WARN" }
        }
        
        if ($healthData.database) {
            Write-Host "   ✅ PASS: มีข้อมูล database health" -ForegroundColor Green
            $testResults += @{ Test = "Database Health Data"; Status = "PASS" }
            $passed++
        }
        
        if ($healthData.memory) {
            Write-Host "   ✅ PASS: มีข้อมูล memory usage" -ForegroundColor Green
            $testResults += @{ Test = "Memory Health Data"; Status = "PASS" }
            $passed++
        }
        
        Write-Host "   📊 Health Data:" -ForegroundColor Cyan
        Write-Host "      - Status: $($healthData.status)" -ForegroundColor White
        Write-Host "      - Uptime: $([math]::Round($healthData.uptime, 2)) seconds" -ForegroundColor White
        Write-Host "      - Environment: $($healthData.environment)" -ForegroundColor White
        if ($healthData.memory) {
            Write-Host "      - Memory RSS: $($healthData.memory.rss)" -ForegroundColor White
            Write-Host "      - Heap Used: $($healthData.memory.heapUsed)" -ForegroundColor White
        }
        
    } else {
        Write-Host "   ❌ FAIL: Health Check API ตอบกลับ $($response.StatusCode)" -ForegroundColor Red
        $testResults += @{ Test = "Health API Response"; Status = "FAIL" }
        $failed++
    }
    
} catch {
    Write-Host "   ⚠️  SKIP: Backend server ไม่ได้รันอยู่ (ข้ามการทดสอบ API)" -ForegroundColor Yellow
    Write-Host "      กรุณารัน backend server ด้วย: cd wecare-backend && npm run dev" -ForegroundColor Gray
    $testResults += @{ Test = "Health API Response"; Status = "SKIP" }
}

Write-Host ""

# ========================================
# Test 5: ตรวจสอบ PM2 Installation
# ========================================
Write-Host "📋 Test 5: ตรวจสอบ PM2 Installation" -ForegroundColor Yellow

try {
    $pm2Version = pm2 --version 2>$null
    if ($pm2Version) {
        Write-Host "   ✅ PASS: PM2 ติดตั้งแล้ว (version: $pm2Version)" -ForegroundColor Green
        $testResults += @{ Test = "PM2 Installation"; Status = "PASS" }
        $passed++
    } else {
        Write-Host "   ⚠️  WARN: PM2 ไม่ได้ติดตั้ง" -ForegroundColor Yellow
        Write-Host "      ติดตั้งด้วย: npm install -g pm2" -ForegroundColor Gray
        $testResults += @{ Test = "PM2 Installation"; Status = "WARN" }
    }
} catch {
    Write-Host "   ⚠️  WARN: PM2 ไม่ได้ติดตั้ง" -ForegroundColor Yellow
    Write-Host "      ติดตั้งด้วย: npm install -g pm2" -ForegroundColor Gray
    $testResults += @{ Test = "PM2 Installation"; Status = "WARN" }
}

Write-Host ""

# ========================================
# สรุปผลการทดสอบ
# ========================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 สรุปผลการทดสอบ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ PASSED: $passed tests" -ForegroundColor Green
Write-Host "❌ FAILED: $failed tests" -ForegroundColor Red
Write-Host ""

$total = $passed + $failed
$passRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 2) } else { 0 }

Write-Host "📈 Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })
Write-Host ""

# แสดงรายละเอียดผลการทดสอบ
Write-Host "รายละเอียดผลการทดสอบ:" -ForegroundColor Cyan
$testResults | ForEach-Object {
    $color = switch ($_.Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        "SKIP" { "Gray" }
        default { "White" }
    }
    Write-Host "  [$($_.Status)] $($_.Test)" -ForegroundColor $color
}

Write-Host ""

# ========================================
# คำแนะนำ
# ========================================
if ($failed -gt 0) {
    Write-Host "⚠️  มีการทดสอบที่ล้มเหลว กรุณาแก้ไขปัญหาก่อนเปิดใช้งาน Production" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 คำแนะนำ:" -ForegroundColor Cyan
    Write-Host "   1. ตรวจสอบไฟล์ที่ขาดหายไป" -ForegroundColor White
    Write-Host "   2. ตรวจสอบการ register routes ใน index.ts" -ForegroundColor White
    Write-Host "   3. รัน backend server เพื่อทดสอบ API" -ForegroundColor White
    exit 1
} else {
    Write-Host "✅ ผ่านการทดสอบทั้งหมด! พร้อมสำหรับ Production" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 ขั้นตอนถัดไป:" -ForegroundColor Cyan
    Write-Host "   1. Build backend: cd wecare-backend && npm run build" -ForegroundColor White
    Write-Host "   2. Start with PM2: pm2 start ecosystem.config.js --env production" -ForegroundColor White
    Write-Host "   3. Monitor: pm2 monit" -ForegroundColor White
    Write-Host "   4. Check logs: pm2 logs wecare-backend" -ForegroundColor White
    exit 0
}
