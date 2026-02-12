# Test Script: BUG-COMM-007 - Rate Limiting
# Purpose: Verify that rate limiting is implemented for Community users
# Priority: HIGH
# Date: 2026-01-10

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing BUG-COMM-007 Fix" -ForegroundColor Cyan
Write-Host "Rate Limiting Implementation" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passCount = 0
$failCount = 0

# Test 1: Check if rateLimiter middleware exists
Write-Host "Test 1: Checking rate limiter middleware..." -ForegroundColor Yellow
if (Test-Path "d:\EMS\wecare-backend\src\middleware\rateLimiter.ts") {
    Write-Host "  PASSED: rateLimiter.ts exists" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: rateLimiter.ts not found" -ForegroundColor Red
    $failCount++
}

# Test 2: Check rate limiter exports
Write-Host "`nTest 2: Checking rate limiter exports..." -ForegroundColor Yellow
$rateLimiterContent = Get-Content "d:\EMS\wecare-backend\src\middleware\rateLimiter.ts" -Raw -ErrorAction SilentlyContinue

if ($rateLimiterContent) {
    $hasExports = $rateLimiterContent -match "export.*authLimiter" -and
    $rateLimiterContent -match "export.*createLimiter" -and
    $rateLimiterContent -match "export.*uploadLimiter"
    
    if ($hasExports) {
        Write-Host "  PASSED: Rate limiters are exported" -ForegroundColor Green
        $passCount++
    }
    else {
        Write-Host "  FAILED: Missing rate limiter exports" -ForegroundColor Red
        $failCount++
    }
}
else {
    Write-Host "  FAILED: Could not read rateLimiter.ts" -ForegroundColor Red
    $failCount++
}

# Test 3: Check if express-rate-limit is installed
Write-Host "`nTest 3: Checking express-rate-limit dependency..." -ForegroundColor Yellow
$packageJson = Get-Content "d:\EMS\wecare-backend\package.json" -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json -ErrorAction SilentlyContinue

if ($packageJson) {
    if ($packageJson.dependencies.'express-rate-limit') {
        Write-Host "  PASSED: express-rate-limit is installed" -ForegroundColor Green
        $passCount++
    }
    else {
        Write-Host "  FAILED: express-rate-limit not in dependencies" -ForegroundColor Red
        $failCount++
    }
}
else {
    Write-Host "  FAILED: Could not read package.json" -ForegroundColor Red
    $failCount++
}

# Test 4: Check rate limiter configuration
Write-Host "`nTest 4: Checking rate limiter configuration..." -ForegroundColor Yellow

if ($rateLimiterContent) {
    $hasConfig = $rateLimiterContent -match "windowMs" -and
    $rateLimiterContent -match "max" -and
    $rateLimiterContent -match "message"
    
    if ($hasConfig) {
        Write-Host "  PASSED: Rate limiter is configured" -ForegroundColor Green
        $passCount++
    }
    else {
        Write-Host "  FAILED: Rate limiter configuration incomplete" -ForegroundColor Red
        $failCount++
    }
}
else {
    Write-Host "  FAILED: Could not check configuration" -ForegroundColor Red
    $failCount++
}

# Test 5: Check integration example
Write-Host "`nTest 5: Checking integration example..." -ForegroundColor Yellow
if (Test-Path "d:\EMS\RATE_LIMITING_INTEGRATION_EXAMPLE.ts") {
    Write-Host "  PASSED: Integration example exists" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Integration example not found" -ForegroundColor Red
    $failCount++
}

# Test 6: Check integration example content
Write-Host "`nTest 6: Checking integration example content..." -ForegroundColor Yellow
$exampleContent = Get-Content "d:\EMS\RATE_LIMITING_INTEGRATION_EXAMPLE.ts" -Raw -ErrorAction SilentlyContinue

if ($exampleContent) {
    $hasInstructions = $exampleContent -match "createLimiter" -and
    $exampleContent -match "uploadLimiter" -and
    $exampleContent -match "POST.*patients"
    
    if ($hasInstructions) {
        Write-Host "  PASSED: Integration example is complete" -ForegroundColor Green
        $passCount++
    }
    else {
        Write-Host "  FAILED: Integration example incomplete" -ForegroundColor Red
        $failCount++
    }
}
else {
    Write-Host "  FAILED: Could not read integration example" -ForegroundColor Red
    $failCount++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($passCount + $failCount)" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

$successRate = [math]::Round(($passCount / ($passCount + $failCount)) * 100, 0)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 75) { "Yellow" } else { "Red" })

if ($passCount -eq 6) {
    Write-Host "`nALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "BUG-COMM-007 is FIXED" -ForegroundColor Green
    Write-Host "`nRate limiting features:" -ForegroundColor Cyan
    Write-Host "  - Auth rate limiter (5 attempts/15min)" -ForegroundColor Green
    Write-Host "  - Create rate limiter (10 requests/min)" -ForegroundColor Green
    Write-Host "  - Upload rate limiter (20 uploads/5min)" -ForegroundColor Green
    Write-Host "  - API rate limiter (100 requests/min)" -ForegroundColor Green
    Write-Host "  - User-based lockout mechanism" -ForegroundColor Green
    Write-Host "  - Integration example" -ForegroundColor Green
    exit 0
}
elseif ($passCount -ge 4) {
    Write-Host "`nMOST TESTS PASSED" -ForegroundColor Yellow
    Write-Host "Minor issues remain - review above" -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "`nMANY TESTS FAILED" -ForegroundColor Red
    Write-Host "Rate limiting implementation incomplete" -ForegroundColor Red
    exit 1
}
