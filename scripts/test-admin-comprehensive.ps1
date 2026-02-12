# ========================================
# ADMIN MODULE - COMPREHENSIVE TEST SUITE
# ========================================
# Purpose: Verify ADMIN functionality (User Management, Audit Logs)
# Date: 2026-01-02
# ========================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "ADMIN MODULE - COMPREHENSIVE TEST SUITE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$BASE_URL = "http://localhost:3001/api"
$PASS_COUNT = 0
$FAIL_COUNT = 0
$TOKEN = ""
$TEST_USER_ID = ""

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
# TEST SUITE 1: AUTHENTICATION
# ========================================
Write-Host "`n[TEST SUITE 1] Authentication" -ForegroundColor Yellow

# TC-A001: Login as Admin
Write-Host "`nTC-A001: Login as Admin..." -ForegroundColor Gray
try {
    $loginBody = @{
        email    = "admin@wecare.dev" 
        password = "password"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($response.token -and $response.user.role -eq 'admin') {
        Test-Result "TC-A001" $true
        $TOKEN = $response.token
    }
    else {
        Test-Result "TC-A001" $false "Login failed or wrong role"
    }
}
catch {
    Test-Result "TC-A001" $false "Login failed: $_"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# ========================================
# TEST SUITE 2: USER MANAGEMENT
# ========================================
Write-Host "`n[TEST SUITE 2] User Management" -ForegroundColor Yellow

# TC-A002: Create User
Write-Host "`nTC-A002: Create User..." -ForegroundColor Gray
try {
    $userBody = @{
        email    = "test_user_admin@wecare.dev"
        password = "TestUser@123!" # Stronger password
        fullName = "Test User Admin"
        role     = "OFFICER"
    } | ConvertTo-Json

    $newUser = Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $userBody
    
    if ($newUser.id) {
        Test-Result "TC-A002" $true "Created User ID: $($newUser.id)"
        $TEST_USER_ID = $newUser.id
    }
    else {
        Test-Result "TC-A002" $false "Failed to create user"
    }
}
catch {
    Test-Result "TC-A002" $false "Error creating user: $_"
}

# TC-A003: List Users
Write-Host "`nTC-A003: List Users..." -ForegroundColor Gray
try {
    $users = Invoke-RestMethod -Uri "$BASE_URL/users" -Method GET -Headers $headers
    
    $found = $false
    if ($users -is [Array]) {
        foreach ($u in $users) {
            if ($u.id -eq $TEST_USER_ID) {
                $found = $true
                break
            }
        }
    }
    
    if ($found) {
        Test-Result "TC-A003" $true "Found created user in list"
    }
    else {
        Test-Result "TC-A003" $false "Created user not found in list"
    }
}
catch {
    Test-Result "TC-A003" $false "Error listing users: $_"
}

# TC-A004: Update User
if ($TEST_USER_ID) {
    Write-Host "`nTC-A004: Update User..." -ForegroundColor Gray
    try {
        $updateBody = @{
            fullName = "Updated Test User"
            status   = "Inactive"
        } | ConvertTo-Json

        $updatedUser = Invoke-RestMethod -Uri "$BASE_URL/users/$TEST_USER_ID" -Method PUT -Headers $headers -Body $updateBody
        
        if ($updatedUser.full_name -eq "Updated Test User" -and $updatedUser.status -eq "Inactive") {
            Test-Result "TC-A004" $true
        }
        else {
            Test-Result "TC-A004" $false "Update failed verification"
        }
    }
    catch {
        Test-Result "TC-A004" $false "Error updating user: $_"
    }
}
else {
    Write-Host "`nTC-A004: Update User - SKIPPED" -ForegroundColor Yellow
}

# TC-A005: Reset Password
if ($TEST_USER_ID) {
    Write-Host "`nTC-A005: Reset Password..." -ForegroundColor Gray
    try {
        $resetBody = @{
            newPassword = "NewPassword@456!" # Stronger password
        } | ConvertTo-Json

        $result = Invoke-RestMethod -Uri "$BASE_URL/users/$TEST_USER_ID/reset-password" -Method POST -Headers $headers -Body $resetBody
        
        if ($result.message -eq "Password reset successfully") {
            Test-Result "TC-A005" $true
        }
        else {
            Test-Result "TC-A005" $false "Reset failed"
        }
    }
    catch {
        Test-Result "TC-A005" $false "Error resetting password: $_"
    }
}
else {
    Write-Host "`nTC-A005: Reset Password - SKIPPED" -ForegroundColor Yellow
}

# TC-A006: Delete User
if ($TEST_USER_ID) {
    Write-Host "`nTC-A006: Delete User..." -ForegroundColor Gray
    try {
        Invoke-RestMethod -Uri "$BASE_URL/users/$TEST_USER_ID" -Method DELETE -Headers $headers
        
        # Verify deletion
        try {
            Invoke-RestMethod -Uri "$BASE_URL/users/$TEST_USER_ID" -Method GET -Headers $headers
            Test-Result "TC-A006" $false "User still exists after deletion"
        }
        catch {
            if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::NotFound) {
                Test-Result "TC-A006" $true "User successfully deleted (404 returned)"
            }
            else {
                Test-Result "TC-A006" $false "Unexpected error checking deletion: $_"
            }
        }
    }
    catch {
        Test-Result "TC-A006" $false "Error deleting user: $_"
    }
}
else {
    Write-Host "`nTC-A006: Delete User - SKIPPED" -ForegroundColor Yellow
}

# ========================================
# TEST SUITE 3: AUDIT LOGS
# ========================================
Write-Host "`n[TEST SUITE 3] Audit Logs" -ForegroundColor Yellow

# TC-A007: View Audit Logs
Write-Host "`nTC-A007: View Audit Logs..." -ForegroundColor Gray
try {
    $logs = Invoke-RestMethod -Uri "$BASE_URL/audit-logs" -Method GET -Headers $headers
    
    if ($logs -is [Array] -and $logs.Count -gt 0) {
        Test-Result "TC-A007" $true "Found $($logs.Count) audit logs"
    }
    else {
        Test-Result "TC-A007" $false "No audit logs found or invalid format"
    }
}
catch {
    Test-Result "TC-A007" $false "Error getting audit logs: $_"
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
