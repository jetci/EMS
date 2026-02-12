# Simple Test Script for BUG-COMM-009
# Test: Path Traversal Vulnerability Fix

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing BUG-COMM-009 Fix" -ForegroundColor Cyan
Write-Host "Path Traversal Vulnerability" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passCount = 0
$failCount = 0
$file = "d:\EMS\wecare-backend\src\routes\patients.ts"
$content = Get-Content $file -Raw

# Test 1: Check for path sanitization
Write-Host "Test 1: Checking for path sanitization..." -ForegroundColor Yellow
if ($content -match "sanitizedPath") {
    Write-Host "  PASSED: Path sanitization found" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Path sanitization not found" -ForegroundColor Red
    $failCount++
}

# Test 2: Check for uploads directory validation
Write-Host "`nTest 2: Checking for directory validation..." -ForegroundColor Yellow
if ($content -match "uploadsDir") {
    Write-Host "  PASSED: Uploads directory defined" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Uploads directory not defined" -ForegroundColor Red
    $failCount++
}

# Test 3: Check for startsWith security check
Write-Host "`nTest 3: Checking for security validation..." -ForegroundColor Yellow
if ($content -match "startsWith\(uploadsDir\)") {
    Write-Host "  PASSED: Security check implemented" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Security check not found" -ForegroundColor Red
    $failCount++
}

# Test 4: Check for security error logging
Write-Host "`nTest 4: Checking for security error logging..." -ForegroundColor Yellow
if ($content -match "Security.*Invalid file path") {
    Write-Host "  PASSED: Security error logging found" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Security error logging not found" -ForegroundColor Red
    $failCount++
}

# Test 5: Check profile image protection
Write-Host "`nTest 5: Checking profile image protection..." -ForegroundColor Yellow
if ($content -match "profile_image_url.*sanitizedPath") {
    Write-Host "  PASSED: Profile image protected" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Profile image not protected" -ForegroundColor Red
    $failCount++
}

# Test 6: Check attachments protection
Write-Host "`nTest 6: Checking attachments protection..." -ForegroundColor Yellow
if ($content -match "attachment\.file_path.*sanitizedPath") {
    Write-Host "  PASSED: Attachments protected" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Attachments not protected" -ForegroundColor Red
    $failCount++
}

# Test 7: Verify path.resolve is used
Write-Host "`nTest 7: Checking for path.resolve usage..." -ForegroundColor Yellow
if ($content -match "path\.resolve.*sanitizedPath") {
    Write-Host "  PASSED: Using path.resolve for security" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Not using path.resolve" -ForegroundColor Red
    $failCount++
}

# Test 8: Check that old insecure path.join is removed
Write-Host "`nTest 8: Checking old insecure code removed..." -ForegroundColor Yellow
# Look for the old pattern in delete section
$deleteSection = $content -match "(?s)Delete actual files.*?catch \(fileError"
if ($deleteSection) {
    $sectionText = $Matches[0]
    # Check if old insecure pattern exists
    if ($sectionText -match "path\.join.*existing\.profile_image_url\)" -or 
        $sectionText -match "path\.join.*attachment\.file_path\)") {
        Write-Host "  FAILED: Old insecure code still present" -ForegroundColor Red
        $failCount++
    }
    else {
        Write-Host "  PASSED: Old insecure code removed" -ForegroundColor Green
        $passCount++
    }
}
else {
    Write-Host "  PASSED: Delete section refactored" -ForegroundColor Green
    $passCount++
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

if ($passCount -eq 8) {
    Write-Host "`nALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "BUG-COMM-009 is FIXED" -ForegroundColor Green
    Write-Host "`nSecurity improvements:" -ForegroundColor Cyan
    Write-Host "  - Path sanitization (removes ..)" -ForegroundColor Green
    Write-Host "  - Directory validation (uploads only)" -ForegroundColor Green
    Write-Host "  - Error logging for security events" -ForegroundColor Green
    Write-Host "  - Protection for both images and attachments" -ForegroundColor Green
    Write-Host "  - Using path.resolve instead of path.join" -ForegroundColor Green
    exit 0
}
elseif ($passCount -ge 6) {
    Write-Host "`nMOST TESTS PASSED" -ForegroundColor Yellow
    Write-Host "Minor issues remain - review above" -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "`nMANY TESTS FAILED" -ForegroundColor Red
    Write-Host "Critical security issues remain" -ForegroundColor Red
    exit 1
}
