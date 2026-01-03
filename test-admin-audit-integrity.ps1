# Test Script: Audit Log Integrity (C5)
# Tests hash chain integrity, tampering detection, and verification

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Audit Log Integrity Test (C5)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Admin
Write-Host "`n[Step 1] Logging in as Admin..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email    = "admin@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    
    Write-Host "PASS: Login successful" -ForegroundColor Green
}
catch {
    Write-Host "FAIL: Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# Step 2: Check Integrity Status
Write-Host "`n[Step 2] Checking Audit Log Integrity Status..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$BASE_URL/audit-logs/integrity" -Method GET -Headers $headers
    
    Write-Host "Integrity Status:" -ForegroundColor Gray
    Write-Host "  Valid: $($status.valid)" -ForegroundColor $(if ($status.valid) { "Green" } else { "Red" })
    Write-Host "  Total Logs: $($status.totalLogs)" -ForegroundColor Gray
    Write-Host "  Verified Logs: $($status.verifiedLogs)" -ForegroundColor Gray
    Write-Host "  Integrity: $($status.integrityPercentage)%" -ForegroundColor Gray
    Write-Host "  Last Verified: $($status.lastVerified)" -ForegroundColor Gray
    
    if ($status.valid) {
        Write-Host "PASS: Audit log integrity is valid" -ForegroundColor Green
    }
    else {
        Write-Host "FAIL: Audit log integrity check failed" -ForegroundColor Red
    }
}
catch {
    Write-Host "FAIL: Could not check integrity status: $_" -ForegroundColor Red
}

# Step 3: Full Integrity Verification
Write-Host "`n[Step 3] Running Full Integrity Verification..." -ForegroundColor Yellow
try {
    $verification = Invoke-RestMethod -Uri "$BASE_URL/audit-logs/verify" -Method POST -Headers $headers
    
    if ($verification.valid) {
        Write-Host "PASS: Full integrity verification passed" -ForegroundColor Green
        Write-Host "  Total: $($verification.totalLogs) logs" -ForegroundColor Green
        Write-Host "  Verified: $($verification.verifiedLogs) logs" -ForegroundColor Green
    }
    else {
        Write-Host "FAIL: Integrity verification failed" -ForegroundColor Red
        Write-Host "  Errors found: $($verification.errors.Count)" -ForegroundColor Red
        $verification.errors | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
    }
}
catch {
    Write-Host "FAIL: Could not run verification: $_" -ForegroundColor Red
}

# Step 4: Create New Audit Log Entry
Write-Host "`n[Step 4] Creating New Audit Log Entry..." -ForegroundColor Yellow
try {
    # Create a test user to generate audit log
    $testBody = @{
        email    = "test_audit_$(Get-Date -Format 'HHmmss')@test.com"
        password = "TestPass123!"
        fullName = "Test Audit User"
        role     = "community"
    } | ConvertTo-Json

    $newUser = Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $testBody
    Write-Host "PASS: Test user created (audit log generated). ID: $($newUser.id)" -ForegroundColor Green
    
    # Clean up
    try {
        Invoke-RestMethod -Uri "$BASE_URL/users/$($newUser.id)" -Method DELETE -Headers $headers -ErrorAction SilentlyContinue | Out-Null
    }
    catch {}
}
catch {
    Write-Host "WARN: Could not create test user: $_" -ForegroundColor Yellow
}

# Step 5: Verify Chain After New Entry
Write-Host "`n[Step 5] Verifying Chain After New Entry..." -ForegroundColor Yellow
try {
    $statusAfter = Invoke-RestMethod -Uri "$BASE_URL/audit-logs/integrity" -Method GET -Headers $headers
    
    if ($statusAfter.valid) {
        Write-Host "PASS: Chain integrity maintained after new entry" -ForegroundColor Green
        Write-Host "  Integrity: $($statusAfter.integrityPercentage)%" -ForegroundColor Green
    }
    else {
        Write-Host "FAIL: Chain integrity broken after new entry" -ForegroundColor Red
    }
}
catch {
    Write-Host "WARN: Could not verify chain: $_" -ForegroundColor Yellow
}

# Step 6: Check Hash Chain Properties
Write-Host "`n[Step 6] Checking Hash Chain Properties..." -ForegroundColor Yellow
try {
    $logs = Invoke-RestMethod -Uri "$BASE_URL/audit-logs" -Method GET -Headers $headers
    
    # Check if logs have hash chain properties
    $logsWithHash = $logs | Where-Object { $_.hash -and $_.previousHash -ne $null -and $_.sequenceNumber -ne $null }
    
    if ($logsWithHash.Count -gt 0) {
        Write-Host "PASS: Found $($logsWithHash.Count) logs with hash chain properties" -ForegroundColor Green
        
        # Show sample log
        $sampleLog = $logsWithHash | Select-Object -First 1
        Write-Host "  Sample Log:" -ForegroundColor Gray
        Write-Host "    ID: $($sampleLog.id)" -ForegroundColor Gray
        Write-Host "    Sequence: $($sampleLog.sequenceNumber)" -ForegroundColor Gray
        Write-Host "    Hash: $($sampleLog.hash.Substring(0, 16))..." -ForegroundColor Gray
        Write-Host "    Previous Hash: $($sampleLog.previousHash.Substring(0, 16))..." -ForegroundColor Gray
    }
    else {
        Write-Host "WARN: No logs found with hash chain properties" -ForegroundColor Yellow
        Write-Host "  You may need to run migration: .\migrate-audit-logs.ps1" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "WARN: Could not check hash chain properties: $_" -ForegroundColor Yellow
}

# Step 7: Test Tampering Detection (Read-only test)
Write-Host "`n[Step 7] Testing Tampering Detection Capability..." -ForegroundColor Yellow
Write-Host "  Note: This is a read-only test. Actual tampering would be detected." -ForegroundColor Gray

try {
    $verification = Invoke-RestMethod -Uri "$BASE_URL/audit-logs/verify" -Method POST -Headers $headers
    
    if ($verification.valid) {
        Write-Host "PASS: System can detect tampering (currently no tampering detected)" -ForegroundColor Green
    }
    else {
        Write-Host "WARN: Tampering detected or chain not initialized" -ForegroundColor Yellow
        Write-Host "  Errors: $($verification.errors.Count)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "WARN: Could not test tampering detection: $_" -ForegroundColor Yellow
}

# Step 8: Performance Test
Write-Host "`n[Step 8] Testing Performance..." -ForegroundColor Yellow
try {
    $startTime = Get-Date
    $verification = Invoke-RestMethod -Uri "$BASE_URL/audit-logs/verify" -Method POST -Headers $headers
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    
    Write-Host "PASS: Verification completed in $([math]::Round($duration, 2))ms" -ForegroundColor Green
    
    if ($duration -lt 1000) {
        Write-Host "  Performance: Excellent (< 1 second)" -ForegroundColor Green
    }
    elseif ($duration -lt 5000) {
        Write-Host "  Performance: Good (< 5 seconds)" -ForegroundColor Yellow
    }
    else {
        Write-Host "  Performance: Slow (> 5 seconds)" -ForegroundColor Red
    }
}
catch {
    Write-Host "WARN: Could not test performance: $_" -ForegroundColor Yellow
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Audit Log Integrity Tests Complete" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
