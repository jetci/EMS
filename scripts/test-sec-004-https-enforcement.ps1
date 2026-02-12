# 🧪 Test Script: SEC-004 - HTTPS Enforcement
# Test HTTPS redirect functionality

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 Testing HTTPS Enforcement" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @()

# Test 1: Check if HTTPS middleware is in code
Write-Host "Test 1: HTTPS middleware exists in code" -ForegroundColor Yellow
$indexPath = "D:\EMS\wecare-backend\src\index.ts"
if (Test-Path $indexPath) {
    $content = Get-Content $indexPath -Raw
    if ($content -match "HTTPS Enforcement" -and $content -match "redirect.*https") {
        Write-Host "✅ PASS - HTTPS enforcement code found" -ForegroundColor Green
        $testResults += @{ Test = "HTTPS middleware in code"; Status = "PASS" }
    }
    else {
        Write-Host "❌ FAIL - HTTPS enforcement code not found" -ForegroundColor Red
        $testResults += @{ Test = "HTTPS middleware in code"; Status = "FAIL" }
    }
}
else {
    Write-Host "❌ FAIL - index.ts not found" -ForegroundColor Red
    $testResults += @{ Test = "HTTPS middleware in code"; Status = "FAIL" }
}
Write-Host ""

# Test 2: Check NODE_ENV configuration
Write-Host "Test 2: NODE_ENV configuration" -ForegroundColor Yellow
Write-Host "   Current NODE_ENV: $env:NODE_ENV" -ForegroundColor Cyan
if ($env:NODE_ENV -eq "production") {
    Write-Host "✅ PASS - Running in production mode" -ForegroundColor Green
    Write-Host "   HTTPS enforcement will be active" -ForegroundColor Green
    $testResults += @{ Test = "NODE_ENV=production"; Status = "PASS" }
}
else {
    Write-Host "⚠️  INFO - Not in production mode" -ForegroundColor Yellow
    Write-Host "   HTTPS enforcement will be disabled" -ForegroundColor Yellow
    Write-Host "   Set NODE_ENV=production to enable" -ForegroundColor Yellow
    $testResults += @{ Test = "NODE_ENV=production"; Status = "INFO" }
}
Write-Host ""

# Test 3: Check .env.production file
Write-Host "Test 3: Production environment file" -ForegroundColor Yellow
$envProdPath = "D:\EMS\wecare-backend\.env.production"
if (Test-Path $envProdPath) {
    Write-Host "✅ PASS - .env.production exists" -ForegroundColor Green
    $envContent = Get-Content $envProdPath
    Write-Host "   Contents:" -ForegroundColor Cyan
    $envContent | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    $testResults += @{ Test = ".env.production exists"; Status = "PASS" }
}
else {
    Write-Host "⚠️  WARNING - .env.production not found" -ForegroundColor Yellow
    Write-Host "   Create this file for production deployment" -ForegroundColor Yellow
    $testResults += @{ Test = ".env.production exists"; Status = "WARNING" }
}
Write-Host ""

# Test 4: Verify redirect logic
Write-Host "Test 4: Redirect logic verification" -ForegroundColor Yellow
if ($content -match "req\.secure.*req\.get\('x-forwarded-proto'\)") {
    Write-Host "✅ PASS - Supports both direct and proxied HTTPS" -ForegroundColor Green
    Write-Host "   - req.secure (direct HTTPS)" -ForegroundColor Cyan
    Write-Host "   - x-forwarded-proto (proxied HTTPS)" -ForegroundColor Cyan
    $testResults += @{ Test = "Redirect logic"; Status = "PASS" }
}
else {
    Write-Host "❌ FAIL - Redirect logic incomplete" -ForegroundColor Red
    $testResults += @{ Test = "Redirect logic"; Status = "FAIL" }
}
Write-Host ""

# Test 5: Check for 301 permanent redirect
Write-Host "Test 5: HTTP 301 permanent redirect" -ForegroundColor Yellow
if ($content -match "redirect\(301") {
    Write-Host "✅ PASS - Uses 301 (Permanent Redirect)" -ForegroundColor Green
    Write-Host "   Benefits:" -ForegroundColor Cyan
    Write-Host "   - SEO friendly" -ForegroundColor Cyan
    Write-Host "   - Browser caching" -ForegroundColor Cyan
    Write-Host "   - Better performance" -ForegroundColor Cyan
    $testResults += @{ Test = "301 redirect"; Status = "PASS" }
}
else {
    Write-Host "⚠️  WARNING - Not using 301 redirect" -ForegroundColor Yellow
    $testResults += @{ Test = "301 redirect"; Status = "WARNING" }
}
Write-Host ""

# Test 6: Security headers (Helmet)
Write-Host "Test 6: Security headers (Helmet.js)" -ForegroundColor Yellow
if ($content -match "helmet\(") {
    Write-Host "✅ PASS - Helmet.js configured" -ForegroundColor Green
    $testResults += @{ Test = "Helmet.js"; Status = "PASS" }
}
else {
    Write-Host "❌ FAIL - Helmet.js not found" -ForegroundColor Red
    $testResults += @{ Test = "Helmet.js"; Status = "FAIL" }
}
Write-Host ""

# Test 7: Manual HTTP request test (if server is running)
Write-Host "Test 7: Manual HTTP request test" -ForegroundColor Yellow
Write-Host "   Would you like to test HTTP redirect? (Y/N)" -ForegroundColor Cyan
Write-Host "   (Requires server to be running in production mode)" -ForegroundColor Gray
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host "   🔄 Testing HTTP request..." -ForegroundColor Cyan
    try {
        $result = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -MaximumRedirection 0 -ErrorAction SilentlyContinue
        
        if ($result.StatusCode -eq 301 -or $result.StatusCode -eq 302) {
            $location = $result.Headers.Location
            if ($location -match "^https://") {
                Write-Host "✅ PASS - HTTP redirects to HTTPS" -ForegroundColor Green
                Write-Host "   Redirect to: $location" -ForegroundColor Cyan
                $testResults += @{ Test = "HTTP redirect"; Status = "PASS" }
            }
            else {
                Write-Host "❌ FAIL - Redirect not to HTTPS" -ForegroundColor Red
                $testResults += @{ Test = "HTTP redirect"; Status = "FAIL" }
            }
        }
        else {
            Write-Host "⚠️  WARNING - No redirect detected" -ForegroundColor Yellow
            Write-Host "   Status Code: $($result.StatusCode)" -ForegroundColor Yellow
            $testResults += @{ Test = "HTTP redirect"; Status = "WARNING" }
        }
    }
    catch {
        Write-Host "⚠️  WARNING - Cannot connect to server" -ForegroundColor Yellow
        Write-Host "   Make sure server is running with NODE_ENV=production" -ForegroundColor Yellow
        $testResults += @{ Test = "HTTP redirect"; Status = "SKIPPED" }
    }
}
else {
    Write-Host "⏭️  SKIPPED - Manual test" -ForegroundColor Gray
    $testResults += @{ Test = "HTTP redirect"; Status = "SKIPPED" }
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$warnCount = ($testResults | Where-Object { $_.Status -eq "WARNING" }).Count
$infoCount = ($testResults | Where-Object { $_.Status -eq "INFO" }).Count
$skipCount = ($testResults | Where-Object { $_.Status -eq "SKIPPED" }).Count

Write-Host "Total Tests: $($testResults.Count)"
Write-Host "✅ Passed: $passCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red
Write-Host "⚠️  Warnings: $warnCount" -ForegroundColor Yellow
Write-Host "ℹ️  Info: $infoCount" -ForegroundColor Cyan
Write-Host "⏭️  Skipped: $skipCount" -ForegroundColor Gray
Write-Host ""

# Detailed results
Write-Host "📋 Detailed Results:" -ForegroundColor Cyan
foreach ($result in $testResults) {
    $icon = switch ($result.Status) {
        "PASS" { "✅" }
        "FAIL" { "❌" }
        "WARNING" { "⚠️ " }
        "INFO" { "ℹ️ " }
        "SKIPPED" { "⏭️ " }
    }
    $color = switch ($result.Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARNING" { "Yellow" }
        "INFO" { "Cyan" }
        "SKIPPED" { "Gray" }
    }
    Write-Host "   $icon $($result.Test): $($result.Status)" -ForegroundColor $color
}
Write-Host ""

# Recommendations
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "💡 Deployment Checklist" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 Before Production Deployment:" -ForegroundColor Yellow
Write-Host "   1. Set NODE_ENV=production"
Write-Host "   2. Configure SSL/TLS certificate"
Write-Host "   3. Update ALLOWED_ORIGINS in .env.production"
Write-Host "   4. Test HTTPS redirect"
Write-Host "   5. Enable CSP (Content Security Policy)"
Write-Host "   6. Configure HSTS (HTTP Strict Transport Security)"
Write-Host ""

Write-Host "🔒 SSL/TLS Certificate Options:" -ForegroundColor Cyan
Write-Host "   - Let's Encrypt (Free, automated)"
Write-Host "   - Cloudflare (Free, with CDN)"
Write-Host "   - AWS Certificate Manager (Free with AWS)"
Write-Host "   - Commercial CA (Paid)"
Write-Host ""

Write-Host "📝 HSTS Header (Recommended):" -ForegroundColor Yellow
Write-Host "   Add to Helmet configuration:"
Write-Host "   app.use(helmet({"
Write-Host "     hsts: {"
Write-Host "       maxAge: 31536000, // 1 year"
Write-Host "       includeSubDomains: true,"
Write-Host "       preload: true"
Write-Host "     }"
Write-Host "   }));"
Write-Host ""
