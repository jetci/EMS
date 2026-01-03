# ========================================
# DEVELOPER MODULE - SECURITY AUDIT SUITE
# ========================================
# Purpose: Verify security protections for the DEVELOPER role
# Date: 2026-01-02
# ========================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "DEVELOPER MODULE - SECURITY AUDIT SUITE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$BASE_URL = "http://localhost:3001/api"
$PASS_COUNT = 0
$FAIL_COUNT = 0
$ADMIN_TOKEN = ""
$DEV_TOKEN = ""
$DEV_USER_ID = ""

# Helper Functions
function Test-Result {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = ""
    )
    
    if ($Passed) {
        Write-Host "PASS: $TestName" -ForegroundColor Green
        $script:PASS_COUNT++
    }
    else {
        Write-Host "FAIL: $TestName - $Message" -ForegroundColor Red
        $script:FAIL_COUNT++
    }
}

# ========================================
# SETUP: GET TOKENS & IDS
# ========================================
Write-Host "`n[SETUP] Authenticating..." -ForegroundColor Yellow

# Login as Admin
try {
    $adminLogin = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body (@{ email = "admin@wecare.dev"; password = "password" } | ConvertTo-Json) -ContentType "application/json"
    $ADMIN_TOKEN = $adminLogin.token
    Write-Host "Admin Logged In" -ForegroundColor Gray
}
catch {
    Write-Host "Failed to login as Admin" -ForegroundColor Red
    exit 1
}

# Login as Developer
try {
    $devLogin = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body (@{ email = "jetci.jm@gmail.com"; password = "DevPass123!" } | ConvertTo-Json) -ContentType "application/json"
    $DEV_TOKEN = $devLogin.token
    $DEV_USER_ID = $devLogin.user.id
    Write-Host "Developer Logged In (ID: $DEV_USER_ID)" -ForegroundColor Gray
}
catch {
    Write-Host "Failed to login as Developer" -ForegroundColor Red
    exit 1
}

$adminHeaders = @{ "Authorization" = "Bearer $ADMIN_TOKEN"; "Content-Type" = "application/json" }
$devHeaders = @{ "Authorization" = "Bearer $DEV_TOKEN"; "Content-Type" = "application/json" }

# ========================================
# TEST SUITE 1: ADMIN RESTRICTIONS
# ========================================
Write-Host "`n[TEST SUITE 1] Admin Restrictions" -ForegroundColor Yellow

# TC-DEV-001: Admin tries to DELETE Developer
Write-Host "`nTC-DEV-001: Admin tries to DELETE Developer..." -ForegroundColor Gray
try {
    Invoke-RestMethod -Uri "$BASE_URL/users/$DEV_USER_ID" -Method DELETE -Headers $adminHeaders
    Test-Result "TC-DEV-001" $false "Admin was able to delete Developer!"
}
catch {
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Forbidden) {
        Test-Result "TC-DEV-001" $true "Blocked with 403 Forbidden"
    } 
    elseif ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::NotFound) {
        # Some systems hide protected users as 404
        Test-Result "TC-DEV-001" $true "Blocked with 404 Not Found (Hidden)"
    }
    else {
        Test-Result "TC-DEV-001" $false "Unexpected status: $($_.Exception.Response.StatusCode)"
    }
}

# TC-DEV-002: Admin tries to UPDATE Developer
Write-Host "`nTC-DEV-002: Admin tries to UPDATE Developer..." -ForegroundColor Gray
try {
    $body = @{ full_name = "Hacked Developer" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/users/$DEV_USER_ID" -Method PUT -Headers $adminHeaders -Body $body
    Test-Result "TC-DEV-002" $false "Admin was able to update Developer!"
}
catch {
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Forbidden -or $_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::NotFound) {
        Test-Result "TC-DEV-002" $true "Blocked correctly"
    }
    else {
        Test-Result "TC-DEV-002" $false "Unexpected status: $($_.Exception.Response.StatusCode)"
    }
}

# TC-DEV-003: Admin tries to CREATE 'DEVELOPER' User
Write-Host "`nTC-DEV-003: Admin tries to CREATE 'DEVELOPER' User..." -ForegroundColor Gray
try {
    $body = @{
        email    = "fake_dev@wecare.dev"
        password = "Password123!"
        fullName = "Fake Dev"
        role     = "DEVELOPER"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $adminHeaders -Body $body
    Test-Result "TC-DEV-003" $false "Admin was able to create a DEVELOPER role!"
}
catch {
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Forbidden) {
        Test-Result "TC-DEV-003" $true "Blocked with 403 Forbidden"
    }
    else {
        Test-Result "TC-DEV-003" $false "Unexpected status: $($_.Exception.Response.StatusCode)"
    }
}

# ========================================
# TEST SUITE 2: DEVELOPER CAPABILITIES
# ========================================
Write-Host "`n[TEST SUITE 2] Developer Capabilities" -ForegroundColor Yellow

# TC-DEV-004: Developer creates Admin User
Write-Host "`nTC-DEV-004: Developer creates Admin User..." -ForegroundColor Gray
try {
    $body = @{
        email    = "dev_created_admin@wecare.dev"
        password = "Password123!"
        fullName = "Dev Created Admin"
        role     = "admin"
    } | ConvertTo-Json
    
    $newUser = Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $devHeaders -Body $body
    
    if ($newUser.id) {
        Test-Result "TC-DEV-004" $true "Developer created Admin successfully"
        # Cleanup
        try { Invoke-RestMethod -Uri "$BASE_URL/users/$($newUser.id)" -Method DELETE -Headers $devHeaders } catch {}
    }
    else {
        Test-Result "TC-DEV-004" $false "Failed to create user"
    }
}
catch {
    Test-Result "TC-DEV-004" $false "Error: $_"
}

# ========================================
# FINAL REPORT
# ========================================
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "TEST EXECUTION COMPLETE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "`nRESULTS:" -ForegroundColor White
Write-Host "  PASS: $PASS_COUNT" -ForegroundColor Green
Write-Host "  FAIL: $FAIL_COUNT" -ForegroundColor Red

if ($FAIL_COUNT -eq 0) {
    Write-Host "`nSTATUS: ALL TESTS PASSED" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`nSTATUS: TESTS FAILED" -ForegroundColor Red
    exit 1
}
