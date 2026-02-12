# Test Script: Privilege Escalation Prevention (C3)
# Tests role protection, privilege escalation prevention, and access control

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Privilege Escalation Prevention Test (C3)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Admin
Write-Host "`n[Step 1] Logging in as Admin..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email    = "admin@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $adminLogin = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $ADMIN_TOKEN = $adminLogin.token
    $ADMIN_ID = $adminLogin.user.id
    
    Write-Host "PASS: Admin login successful. ID: $ADMIN_ID" -ForegroundColor Green
}
catch {
    Write-Host "FAIL: Admin login failed: $_" -ForegroundColor Red
    exit 1
}

$adminHeaders = @{
    "Authorization" = "Bearer $ADMIN_TOKEN"
    "Content-Type"  = "application/json"
}

# Step 2: Test Admin Cannot Create DEVELOPER User
Write-Host "`n[Step 2] Testing Admin Cannot Create DEVELOPER User..." -ForegroundColor Yellow
try {
    $devBody = @{
        email    = "test_dev@test.com"
        password = "DevPass123!"
        fullName = "Test Developer"
        role     = "DEVELOPER"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $adminHeaders -Body $devBody -ErrorAction Stop
    Write-Host "FAIL: Admin was able to create DEVELOPER user (should be blocked)" -ForegroundColor Red
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "PASS: Admin correctly blocked from creating DEVELOPER user" -ForegroundColor Green
    }
    else {
        Write-Host "WARN: Unexpected status code: $statusCode" -ForegroundColor Yellow
    }
}

# Step 3: Test Admin Cannot View DEVELOPER Users
Write-Host "`n[Step 3] Testing Admin Cannot View DEVELOPER Users..." -ForegroundColor Yellow
try {
    $allUsers = Invoke-RestMethod -Uri "$BASE_URL/users" -Method GET -Headers $adminHeaders
    
    $devUsers = $allUsers | Where-Object { $_.role -eq "DEVELOPER" }
    
    if ($devUsers.Count -eq 0) {
        Write-Host "PASS: DEVELOPER users filtered from admin view" -ForegroundColor Green
    }
    else {
        Write-Host "FAIL: Admin can see $($devUsers.Count) DEVELOPER users" -ForegroundColor Red
    }
}
catch {
    Write-Host "WARN: Error testing user list: $_" -ForegroundColor Yellow
}

# Step 4: Test User Cannot Change Own Role
Write-Host "`n[Step 4] Testing User Cannot Change Own Role..." -ForegroundColor Yellow
try {
    $selfUpdateBody = @{
        role = "DEVELOPER"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/users/$ADMIN_ID" -Method PUT -Headers $adminHeaders -Body $selfUpdateBody -ErrorAction Stop
    Write-Host "FAIL: User was able to change own role (should be blocked)" -ForegroundColor Red
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "PASS: User correctly blocked from changing own role" -ForegroundColor Green
    }
    else {
        Write-Host "WARN: Unexpected status code: $statusCode" -ForegroundColor Yellow
    }
}

# Step 5: Test User Cannot Delete Self
Write-Host "`n[Step 5] Testing User Cannot Delete Self..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE_URL/users/$ADMIN_ID" -Method DELETE -Headers $adminHeaders -ErrorAction Stop
    Write-Host "FAIL: User was able to delete own account (should be blocked)" -ForegroundColor Red
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "PASS: User correctly blocked from deleting own account" -ForegroundColor Green
    }
    else {
        Write-Host "WARN: Unexpected status code: $statusCode" -ForegroundColor Yellow
    }
}

# Step 6: Test Role Hierarchy (Admin cannot create EXECUTIVE)
Write-Host "`n[Step 6] Testing Role Hierarchy..." -ForegroundColor Yellow
try {
    $execBody = @{
        email    = "test_exec@test.com"
        password = "ExecPass123!"
        fullName = "Test Executive"
        role     = "EXECUTIVE"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $adminHeaders -Body $execBody -ErrorAction Stop
    Write-Host "FAIL: Admin was able to create EXECUTIVE user (higher privilege)" -ForegroundColor Red
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "PASS: Admin correctly blocked from creating higher privilege user" -ForegroundColor Green
    }
    else {
        Write-Host "WARN: Unexpected status code: $statusCode" -ForegroundColor Yellow
    }
}

# Step 7: Test Admin Can Create Lower Privilege Users
Write-Host "`n[Step 7] Testing Admin Can Create Lower Privilege Users..." -ForegroundColor Yellow
try {
    $communityBody = @{
        email    = "test_community_$(Get-Date -Format 'HHmmss')@test.com"
        password = "CommunityPass123!"
        fullName = "Test Community User"
        role     = "community"
    } | ConvertTo-Json

    $newUser = Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $adminHeaders -Body $communityBody
    Write-Host "PASS: Admin can create lower privilege user (community). ID: $($newUser.id)" -ForegroundColor Green
    
    # Clean up
    try {
        Invoke-RestMethod -Uri "$BASE_URL/users/$($newUser.id)" -Method DELETE -Headers $adminHeaders -ErrorAction SilentlyContinue | Out-Null
    }
    catch {}
}
catch {
    Write-Host "FAIL: Admin cannot create lower privilege user: $_" -ForegroundColor Red
}

# Step 8: Login as DEVELOPER and Test Permissions
Write-Host "`n[Step 8] Testing DEVELOPER Permissions..." -ForegroundColor Yellow
try {
    $devLoginBody = @{
        email    = "jetci.jm@gmail.com"
        password = "password"
    } | ConvertTo-Json

    $devLogin = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $devLoginBody -ContentType "application/json"
    $DEV_TOKEN = $devLogin.token
    
    Write-Host "DEVELOPER login successful" -ForegroundColor Gray
    
    $devHeaders = @{
        "Authorization" = "Bearer $DEV_TOKEN"
        "Content-Type"  = "application/json"
    }
    
    # Test DEVELOPER can create DEVELOPER user
    $newDevBody = @{
        email    = "test_dev_$(Get-Date -Format 'HHmmss')@test.com"
        password = "DevPass123!"
        fullName = "Test Developer User"
        role     = "DEVELOPER"
    } | ConvertTo-Json

    $newDev = Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $devHeaders -Body $newDevBody
    Write-Host "PASS: DEVELOPER can create DEVELOPER user. ID: $($newDev.id)" -ForegroundColor Green
    
    # Clean up
    try {
        Invoke-RestMethod -Uri "$BASE_URL/users/$($newDev.id)" -Method DELETE -Headers $devHeaders -ErrorAction SilentlyContinue | Out-Null
    }
    catch {}
}
catch {
    Write-Host "WARN: Could not complete DEVELOPER test: $_" -ForegroundColor Yellow
}

# Step 9: Test Audit Logs for Privilege Escalation Attempts
Write-Host "`n[Step 9] Verifying Audit Logs..." -ForegroundColor Yellow
try {
    $auditLogs = Invoke-RestMethod -Uri "$BASE_URL/audit-logs" -Method GET -Headers $adminHeaders
    
    $escalationAttempts = $auditLogs | Where-Object { $_.action -like "*PRIVILEGE_ESCALATION*" -or $_.action -like "*SELF_DELETION*" }
    
    if ($escalationAttempts.Count -gt 0) {
        Write-Host "PASS: Found $($escalationAttempts.Count) privilege escalation attempts in audit logs" -ForegroundColor Green
    }
    else {
        Write-Host "WARN: No privilege escalation attempts found in audit logs" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "WARN: Could not verify audit logs: $_" -ForegroundColor Yellow
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Privilege Escalation Prevention Tests Complete" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
