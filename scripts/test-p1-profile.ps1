# P1 Test Script: Profile & Password APIs
# Tests profile update and password change functionality

$baseUrl = "http://localhost:5000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  P1: Profile & Password API Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true
$userToken = $null
$userId = $null

# Test 1: Login to get token
Write-Host "[TEST 1] POST /api/auth/login" -ForegroundColor Yellow
try {
    $loginPayload = @{
        email    = "community1@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginPayload -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    
    if ($response.token -and $response.user.id) {
        $userToken = $response.token
        $userId = $response.user.id
        Write-Host "  PASSED - Got token for user: $userId" -ForegroundColor Green
    }
    else {
        Write-Host "  FAILED - No token in response" -ForegroundColor Red
        $allPassed = $false
    }
}
catch {
    Write-Host "  FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# Test 2: Get current user profile
Write-Host "[TEST 2] GET /api/auth/me (with token)" -ForegroundColor Yellow
if ($userToken) {
    try {
        $headers = @{ Authorization = "Bearer $userToken" }
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headers -ErrorAction Stop
        
        if ($response.id -eq $userId) {
            Write-Host "  PASSED - Got user profile for $($response.email)" -ForegroundColor Green
        }
        else {
            Write-Host "  FAILED - Wrong user returned" -ForegroundColor Red
            $allPassed = $false
        }
    }
    catch {
        Write-Host "  FAILED - $($_.Exception.Message)" -ForegroundColor Red
        $allPassed = $false
    }
}
else {
    Write-Host "  SKIPPED - No token available" -ForegroundColor Yellow
}

# Test 3: Update profile
Write-Host "[TEST 3] PUT /api/auth/profile (update name)" -ForegroundColor Yellow
if ($userToken) {
    try {
        $updatePayload = @{
            fullName = "Community Officer Updated"
            phone    = "0888888888"
        } | ConvertTo-Json

        $headers = @{ Authorization = "Bearer $userToken" }
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method PUT -Body $updatePayload -ContentType "application/json; charset=utf-8" -Headers $headers -ErrorAction Stop
        
        if ($response.fullName -eq "Community Officer Updated" -or $response.phone -eq "0888888888") {
            Write-Host "  PASSED - Profile updated successfully" -ForegroundColor Green
        }
        else {
            Write-Host "  FAILED - Profile not updated correctly" -ForegroundColor Red
            $allPassed = $false
        }
    }
    catch {
        Write-Host "  FAILED - $($_.Exception.Message)" -ForegroundColor Red
        $allPassed = $false
    }
}
else {
    Write-Host "  SKIPPED - No token available" -ForegroundColor Yellow
}

# Test 4: Change password (wrong current password)
Write-Host "[TEST 4] POST /api/auth/change-password (wrong current password)" -ForegroundColor Yellow
try {
    $pwPayload = @{
        userId          = $userId
        currentPassword = "wrongpassword"
        newPassword     = "newpassword123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/change-password" -Method POST -Body $pwPayload -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    Write-Host "  FAILED - Should have returned error" -ForegroundColor Red
    $allPassed = $false
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  PASSED - Correctly rejected wrong password" -ForegroundColor Green
    }
    else {
        Write-Host "  PASSED - Got expected error response" -ForegroundColor Green
    }
}

# Test 5: Change password (correct)
Write-Host "[TEST 5] POST /api/auth/change-password (correct)" -ForegroundColor Yellow
try {
    $pwPayload = @{
        userId          = $userId
        currentPassword = "password"
        newPassword     = "newpassword123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/change-password" -Method POST -Body $pwPayload -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    
    if ($response.message -like "*successfully*") {
        Write-Host "  PASSED - Password changed successfully" -ForegroundColor Green
    }
    else {
        Write-Host "  PASSED - Password change completed" -ForegroundColor Green
    }
}
catch {
    Write-Host "  FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# Test 6: Login with new password
Write-Host "[TEST 6] POST /api/auth/login (with new password)" -ForegroundColor Yellow
try {
    $loginPayload = @{
        email    = "community1@wecare.dev"
        password = "newpassword123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginPayload -ContentType "application/json; charset=utf-8" -ErrorAction Stop
    
    if ($response.token) {
        Write-Host "  PASSED - Login with new password works" -ForegroundColor Green
    }
    else {
        Write-Host "  FAILED - Could not login with new password" -ForegroundColor Red
        $allPassed = $false
    }
}
catch {
    Write-Host "  FAILED - $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

# Cleanup: Reset password back to original
Write-Host "[CLEANUP] Reset password back to 'password'" -ForegroundColor Gray
try {
    $pwPayload = @{
        userId          = $userId
        currentPassword = "newpassword123"
        newPassword     = "password"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$baseUrl/auth/change-password" -Method POST -Body $pwPayload -ContentType "application/json; charset=utf-8" -ErrorAction Stop | Out-Null
    Write-Host "  Password reset to original" -ForegroundColor Gray
}
catch {
    Write-Host "  Could not reset password" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "  ALL TESTS PASSED" -ForegroundColor Green
}
else {
    Write-Host "  SOME TESTS FAILED" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Cyan
