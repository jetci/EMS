# Test Script: Admin User Management
$baseUrl = "http://localhost:5000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Admin User Management Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0
$global:adminToken = $null
$global:userId = $null

function Test-API {
    param($Name, $Method, $Url, $Body, $Expected, $Token)
    
    Write-Host "[$Method] $Name" -ForegroundColor Yellow
    try {
        $params = @{
            Uri         = $Url
            Method      = $Method
            ContentType = "application/json; charset=utf-8"
            ErrorAction = "Stop"
        }
        if ($Body) { $params.Body = $Body | ConvertTo-Json -Depth 3 }
        if ($Token) { $params.Headers = @{ Authorization = "Bearer $Token" } }
        
        $response = Invoke-RestMethod @params
        
        if ($Expected) {
            $checkPassed = & $Expected $response
            if ($checkPassed) {
                Write-Host "  ✅ PASSED" -ForegroundColor Green
                $script:passed++
            }
            else {
                Write-Host "  ❌ FAILED - Expectation not met" -ForegroundColor Red
                $script:failed++
            }
        }
        else {
            Write-Host "  ✅ PASSED" -ForegroundColor Green
            $script:passed++
        }
        return $response
    }
    catch {
        Write-Host "  ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
        return $null
    }
}

# 1. Login
$login = Test-API "Login Admin" "POST" "$baseUrl/auth/login" @{ email = "admin@wecare.dev"; password = "admin123" } { param($r) $r.token -ne $null }
$global:adminToken = $login.token

# 2. Get Users
Test-API "Get Users" "GET" "$baseUrl/users" $null { param($r) $r.Count -ge 0 } $global:adminToken

# 3. Create User
$userData = @{
    fullName = "Test User"
    email    = "testuser@wecare.dev"
    password = "password"
    role     = "community"
}
$user = Test-API "Create User" "POST" "$baseUrl/users" $userData { param($r) $r.id -match "USR-" } $global:adminToken
$global:userId = $user.id

# 4. Update User
$updateData = @{ fullName = "Test User Updated" }
Test-API "Update User" "PUT" "$baseUrl/users/$($global:userId)" $updateData { param($r) $r.fullName -eq "Test User Updated" } $global:adminToken

# 5. Reset Password
$resetData = @{ newPassword = "newpassword123" }
Test-API "Reset Password" "POST" "$baseUrl/users/$($global:userId)/reset-password" $resetData { param($r) $r.message -eq "Password reset successfully" } $global:adminToken

# 6. Delete User
Test-API "Delete User" "DELETE" "$baseUrl/users/$($global:userId)" $null $null $global:adminToken

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ADMIN USERS TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" }else { "Green" })
Write-Host ""
