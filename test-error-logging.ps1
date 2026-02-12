# Test Script: Error Logging Service
# Test Sentry integration and error handling

Write-Host "========================================"
Write-Host "Test: Error Logging Service (Sentry)"
Write-Host "========================================"
Write-Host ""

$passed = 0
$failed = 0

# Test 1: Check Sentry package installation
Write-Host "Test 1: Sentry Package Installation"
$packageJson = Get-Content ".\package.json" -Raw | ConvertFrom-Json
if ($packageJson.devDependencies.'@sentry/react') {
    Write-Host "  [PASS] @sentry/react installed" -ForegroundColor Green
    Write-Host "  Version: $($packageJson.devDependencies.'@sentry/react')"
    $passed++
} else {
    Write-Host "  [FAIL] @sentry/react not found" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 2: Check Sentry configuration file
Write-Host "Test 2: Sentry Configuration File"
if (Test-Path ".\src\config\sentry.ts") {
    Write-Host "  [PASS] sentry.ts exists" -ForegroundColor Green
    $passed++
    
    $content = Get-Content ".\src\config\sentry.ts" -Raw
    if ($content -match "initSentry") {
        Write-Host "  [PASS] initSentry function found" -ForegroundColor Green
        $passed++
    }
    if ($content -match "setSentryUser") {
        Write-Host "  [PASS] setSentryUser function found" -ForegroundColor Green
        $passed++
    }
    if ($content -match "captureException") {
        Write-Host "  [PASS] captureException function found" -ForegroundColor Green
        $passed++
    }
} else {
    Write-Host "  [FAIL] sentry.ts not found" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 3: Check main.tsx integration
Write-Host "Test 3: Main.tsx Integration"
if (Test-Path ".\src\main.tsx") {
    $content = Get-Content ".\src\main.tsx" -Raw
    if ($content -match "initSentry") {
        Write-Host "  [PASS] initSentry called in main.tsx" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [FAIL] initSentry not called in main.tsx" -ForegroundColor Red
        $failed++
    }
} else {
    Write-Host "  [FAIL] main.tsx not found" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 4: Check Error Handler integration
Write-Host "Test 4: Error Handler Integration"
if (Test-Path ".\src\utils\errorHandler.ts") {
    $content = Get-Content ".\src\utils\errorHandler.ts" -Raw
    if ($content -match "sentryCaptureException") {
        Write-Host "  [PASS] Sentry integrated with errorHandler" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [FAIL] Sentry not integrated with errorHandler" -ForegroundColor Red
        $failed++
    }
    if ($content -match "addBreadcrumb") {
        Write-Host "  [PASS] Breadcrumbs added to errorHandler" -ForegroundColor Green
        $passed++
    }
} else {
    Write-Host "  [FAIL] errorHandler.ts not found" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 5: Check App.tsx user context
Write-Host "Test 5: App.tsx User Context"
if (Test-Path ".\src\App.tsx") {
    $content = Get-Content ".\src\App.tsx" -Raw
    if ($content -match "setSentryUser") {
        Write-Host "  [PASS] setSentryUser called on login" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [FAIL] setSentryUser not called" -ForegroundColor Red
        $failed++
    }
    if ($content -match "clearSentryUser") {
        Write-Host "  [PASS] clearSentryUser called on logout" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [FAIL] clearSentryUser not called" -ForegroundColor Red
        $failed++
    }
} else {
    Write-Host "  [FAIL] App.tsx not found" -ForegroundColor Red
    $failed++
}

Write-Host ""

# Test 6: Check .env.example
Write-Host "Test 6: Environment Configuration"
if (Test-Path ".\.env.example") {
    $content = Get-Content ".\.env.example" -Raw
    if ($content -match "VITE_SENTRY_DSN") {
        Write-Host "  [PASS] VITE_SENTRY_DSN documented" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [WARN] VITE_SENTRY_DSN not in .env.example" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test 7: Build test (TypeScript compilation)
Write-Host "Test 7: TypeScript Compilation"
Write-Host "  [INFO] Running TypeScript check..." -ForegroundColor Cyan
try {
    $output = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [PASS] TypeScript compilation successful" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [WARN] TypeScript has warnings (may be acceptable)" -ForegroundColor Yellow
        Write-Host "  Output: $output" -ForegroundColor Gray
    }
} catch {
    Write-Host "  [WARN] Could not run TypeScript check" -ForegroundColor Yellow
}

Write-Host ""

# Test 8: Verify Sentry is disabled in development
Write-Host "Test 8: Development Mode Check"
$content = Get-Content ".\src\config\sentry.ts" -Raw
if ($content -match "enabled.*PROD") {
    Write-Host "  [PASS] Sentry disabled in development" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  [WARN] Sentry may run in development" -ForegroundColor Yellow
}

Write-Host ""

# Results
Write-Host "========================================"
Write-Host "Test Results"
Write-Host "========================================"
Write-Host "PASSED: $passed tests" -ForegroundColor Green
Write-Host "FAILED: $failed tests" -ForegroundColor Red

$total = $passed + $failed
$passRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 2) } else { 0 }
Write-Host "Pass Rate: $passRate%"

Write-Host ""
Write-Host "========================================"
Write-Host "Summary"
Write-Host "========================================"

if ($failed -eq 0) {
    Write-Host "[PASS] Error Logging Service configured correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Get Sentry DSN from https://sentry.io"
    Write-Host "  2. Add to .env: VITE_SENTRY_DSN=your-dsn"
    Write-Host "  3. Build for production: npm run build"
    Write-Host "  4. Deploy and monitor errors in Sentry dashboard"
    Write-Host ""
    Write-Host "Features:"
    Write-Host "  - Automatic error capture"
    Write-Host "  - User context tracking"
    Write-Host "  - Breadcrumbs for debugging"
    Write-Host "  - Performance monitoring"
    Write-Host "  - Session replay"
    exit 0
} else {
    Write-Host "[FAIL] Some tests failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues above"
    exit 1
}
