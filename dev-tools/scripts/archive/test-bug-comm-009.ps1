# Test Script: BUG-COMM-009 - Path Traversal Vulnerability
# Purpose: Verify that file deletion is protected against path traversal attacks
# Priority: CRITICAL
# Date: 2026-01-09

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing BUG-COMM-009 Fix" -ForegroundColor Cyan
Write-Host "Path Traversal Vulnerability" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passCount = 0
$failCount = 0

# Test 1: Check for path sanitization (remove ..)
Write-Host "Test 1: Checking for path sanitization..." -ForegroundColor Yellow
$file = "d:\EMS\wecare-backend\src\routes\patients.ts"
$content = Get-Content $file -Raw

if ($content -match "sanitizedPath.*replace.*\\.\\.\\/g") {
    Write-Host "  PASSED: Path sanitization found" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Path sanitization not found" -ForegroundColor Red
    $failCount++
}

# Test 2: Check for uploads directory validation
Write-Host "`nTest 2: Checking for directory validation..." -ForegroundColor Yellow

if ($content -match "uploadsDir.*path\.resolve") {
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

# Test 4: Check for error logging on invalid paths
Write-Host "`nTest 4: Checking for security error logging..." -ForegroundColor Yellow

if ($content -match "console\.error.*Security.*Invalid file path") {
    Write-Host "  PASSED: Security error logging found" -ForegroundColor Green
    $passCount++
}
else {
    Write-Host "  FAILED: Security error logging not found" -ForegroundColor Red
    $failCount++
}

# Test 5: Check both profile image and attachments are protected
Write-Host "`nTest 5: Checking protection coverage..." -ForegroundColor Yellow

$profileProtected = $content -match "existing\.profile_image_url.*sanitizedPath"
$attachmentProtected = $content -match "attachment\.file_path.*sanitizedPath"

if ($profileProtected -and $attachmentProtected) {
    Write-Host "  PASSED: Both profile image and attachments protected" -ForegroundColor Green
    $passCount++
}
else {
    if (-not $profileProtected) {
        Write-Host "  FAILED: Profile image not protected" -ForegroundColor Red
    }
    if (-not $attachmentProtected) {
        Write-Host "  FAILED: Attachments not protected" -ForegroundColor Red
    }
    $failCount++
}

# Test 6: Verify path.resolve is used instead of path.join
Write-Host "`nTest 6: Checking for path.resolve usage..." -ForegroundColor Yellow

# Count occurrences in the file deletion section
$deleteSection = $content -match "(?s)Delete actual files.*?catch \(fileError"
if ($deleteSection) {
    $sectionText = $Matches[0]
    if ($sectionText -match "path\.resolve" -and $sectionText -notmatch "path\.join.*profile_image_url|path\.join.*file_path") {
        Write-Host "  PASSED: Using path.resolve for security" -ForegroundColor Green
        $passCount++
    }
    else {
        Write-Host "  FAILED: Still using path.join (insecure)" -ForegroundColor Red
        $failCount++
    }
}
else {
    Write-Host "  WARNING: Could not find file deletion section" -ForegroundColor Yellow
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
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })

if ($passCount -eq 6) {
    Write-Host "`nALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "BUG-COMM-009 is FIXED" -ForegroundColor Green
    Write-Host "`nSecurity improvements:" -ForegroundColor Cyan
    Write-Host "  - Path sanitization (removes ..)" -ForegroundColor Green
    Write-Host "  - Directory validation (uploads only)" -ForegroundColor Green
    Write-Host "  - Error logging for security events" -ForegroundColor Green
    Write-Host "  - Protection for both images and attachments" -ForegroundColor Green
    exit 0
}
elseif ($passCount -ge 4) {
    Write-Host "`nMOST TESTS PASSED" -ForegroundColor Yellow
    Write-Host "Review failed tests above" -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host "`nMANY TESTS FAILED" -ForegroundColor Red
    Write-Host "Critical security issues remain" -ForegroundColor Red
    exit 1
}
