# Migration Script: Rebuild Audit Log Hash Chain
# Run this ONCE to add hash chain to existing audit logs

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Audit Log Hash Chain Migration" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$BASE_URL = "http://localhost:3001/api"

Write-Host "`n⚠️  WARNING: This will rebuild the hash chain for all audit logs" -ForegroundColor Yellow
Write-Host "This should only be run ONCE during initial deployment" -ForegroundColor Yellow
Write-Host "`nDo you want to continue? (yes/no): " -NoNewline -ForegroundColor Yellow
$confirmation = Read-Host

if ($confirmation -ne "yes") {
    Write-Host "`nMigration cancelled." -ForegroundColor Yellow
    exit 0
}

# Login as DEVELOPER
Write-Host "`n[Step 1] Logging in as DEVELOPER..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email    = "jetci.jm@gmail.com"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    
    Write-Host "PASS: DEVELOPER login successful" -ForegroundColor Green
}
catch {
    Write-Host "FAIL: DEVELOPER login failed: $_" -ForegroundColor Red
    Write-Host "Please ensure DEVELOPER account exists and password is correct" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# Check current integrity status
Write-Host "`n[Step 2] Checking current integrity status..." -ForegroundColor Yellow
try {
    $statusBefore = Invoke-RestMethod -Uri "$BASE_URL/audit-logs/integrity" -Method GET -Headers $headers
    
    Write-Host "Current Status:" -ForegroundColor Gray
    Write-Host "  Total Logs: $($statusBefore.totalLogs)" -ForegroundColor Gray
    Write-Host "  Verified Logs: $($statusBefore.verifiedLogs)" -ForegroundColor Gray
    Write-Host "  Integrity: $($statusBefore.integrityPercentage)%" -ForegroundColor Gray
    Write-Host "  Valid: $($statusBefore.valid)" -ForegroundColor Gray
}
catch {
    Write-Host "WARN: Could not check current status: $_" -ForegroundColor Yellow
}

# Rebuild hash chain
Write-Host "`n[Step 3] Rebuilding hash chain..." -ForegroundColor Yellow
try {
    $rebuildResult = Invoke-RestMethod -Uri "$BASE_URL/audit-logs/rebuild-chain" -Method POST -Headers $headers
    
    if ($rebuildResult.success) {
        Write-Host "✅ Hash chain rebuilt successfully!" -ForegroundColor Green
        Write-Host "  Rebuilt: $($rebuildResult.rebuilt) logs" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Hash chain rebuild failed" -ForegroundColor Red
        Write-Host "  Errors: $($rebuildResult.errors -join ', ')" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "FAIL: Could not rebuild hash chain: $_" -ForegroundColor Red
    exit 1
}

# Verify integrity after rebuild
Write-Host "`n[Step 4] Verifying integrity after rebuild..." -ForegroundColor Yellow
try {
    $verifyResult = Invoke-RestMethod -Uri "$BASE_URL/audit-logs/verify" -Method POST -Headers $headers
    
    if ($verifyResult.valid) {
        Write-Host "✅ Integrity verification PASSED!" -ForegroundColor Green
        Write-Host "  Total Logs: $($verifyResult.totalLogs)" -ForegroundColor Green
        Write-Host "  Verified Logs: $($verifyResult.verifiedLogs)" -ForegroundColor Green
        Write-Host "  Errors: $($verifyResult.errors.Count)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Integrity verification FAILED" -ForegroundColor Red
        Write-Host "  Errors:" -ForegroundColor Red
        $verifyResult.errors | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
        exit 1
    }
}
catch {
    Write-Host "WARN: Could not verify integrity: $_" -ForegroundColor Yellow
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Migration Complete" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "`n✅ Audit log hash chain has been successfully established!" -ForegroundColor Green
Write-Host "All future audit logs will automatically maintain the chain." -ForegroundColor Green
