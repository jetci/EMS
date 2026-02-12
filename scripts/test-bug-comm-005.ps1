# Test Script: BUG-COMM-005 - API Base URL Environment Variable
# Purpose: Verify that the application uses environment variable for API URL
# Priority: CRITICAL
# Date: 2026-01-09

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 Testing BUG-COMM-005 Fix" -ForegroundColor Cyan
Write-Host "Test: API Base URL Environment Variable" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Check if hardcoded URL is removed
Write-Host "📝 Test 1: Checking for hardcoded URLs..." -ForegroundColor Yellow

$hardcodedUrls = Select-String -Path "d:\EMS\pages\CommunityRegisterPatientPage.tsx" -Pattern "localhost:3001" -SimpleMatch

if ($hardcodedUrls) {
    Write-Host "❌ FAILED: Found hardcoded URL in CommunityRegisterPatientPage.tsx" -ForegroundColor Red
    $hardcodedUrls | ForEach-Object { Write-Host "   Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Red }
    $test1Pass = $false
}
else {
    Write-Host "✅ PASSED: No hardcoded URLs found" -ForegroundColor Green
    $test1Pass = $true
}

# Test 2: Check if environment variable is used
Write-Host "`n📝 Test 2: Checking for environment variable usage..." -ForegroundColor Yellow

$envVarUsage = Select-String -Path "d:\EMS\pages\CommunityRegisterPatientPage.tsx" -Pattern "VITE_API_BASE_URL"

if ($envVarUsage) {
    Write-Host "✅ PASSED: Environment variable VITE_API_BASE_URL is used" -ForegroundColor Green
    $envVarUsage | ForEach-Object { Write-Host "   Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Green }
    $test2Pass = $true
}
else {
    Write-Host "❌ FAILED: Environment variable not found" -ForegroundColor Red
    $test2Pass = $false
}

# Test 3: Check .env.production file
Write-Host "`n📝 Test 3: Checking .env.production configuration..." -ForegroundColor Yellow

if (Test-Path "d:\EMS\.env.production") {
    $envContent = Get-Content "d:\EMS\.env.production"
    $apiBaseUrl = $envContent | Where-Object { $_ -match "VITE_API_BASE_URL" }
    
    if ($apiBaseUrl) {
        Write-Host "✅ PASSED: VITE_API_BASE_URL is configured" -ForegroundColor Green
        Write-Host "   $apiBaseUrl" -ForegroundColor Green
        $test3Pass = $true
    }
    else {
        Write-Host "❌ FAILED: VITE_API_BASE_URL not found in .env.production" -ForegroundColor Red
        $test3Pass = $false
    }
}
else {
    Write-Host "⚠️  WARNING: .env.production file not found" -ForegroundColor Yellow
    $test3Pass = $false
}

# Test 4: Check for URL path duplication
Write-Host "`n📝 Test 4: Checking for URL path duplication..." -ForegroundColor Yellow

$duplicatePath = Select-String -Path "d:\EMS\pages\CommunityRegisterPatientPage.tsx" -Pattern "/api/api/" -SimpleMatch

if ($duplicatePath) {
    Write-Host "❌ FAILED: Found duplicate /api/api/ path" -ForegroundColor Red
    $duplicatePath | ForEach-Object { Write-Host "   Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Red }
    $test4Pass = $false
}
else {
    Write-Host "✅ PASSED: No URL path duplication found" -ForegroundColor Green
    $test4Pass = $true
}

# Test 5: Verify the actual code implementation
Write-Host "`n📝 Test 5: Verifying code implementation..." -ForegroundColor Yellow

$codeLines = Get-Content "d:\EMS\pages\CommunityRegisterPatientPage.tsx"
$foundPattern = $false

foreach ($line in $codeLines) {
    if ($line -like "*API_BASE*VITE_API_BASE_URL*") {
        Write-Host "✅ PASSED: Correct implementation found" -ForegroundColor Green
        Write-Host "   Code: $($line.Trim())" -ForegroundColor Green
        $foundPattern = $true
        break
    }
}

if ($foundPattern) {
    $test5Pass = $true
}
else {
    Write-Host "❌ FAILED: Implementation pattern not found" -ForegroundColor Red
    $test5Pass = $false
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$totalTests = 5
$passedTests = @($test1Pass, $test2Pass, $test3Pass, $test4Pass, $test5Pass) | Where-Object { $_ -eq $true } | Measure-Object | Select-Object -ExpandProperty Count

Write-Host "`nTotal Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passedTests / $totalTests) * 100, 2))%" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })

if ($passedTests -eq $totalTests) {
    Write-Host "`n✅ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "BUG-COMM-005 has been successfully fixed." -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`n⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
    Write-Host "Please review the failed tests above." -ForegroundColor Yellow
    exit 1
}
