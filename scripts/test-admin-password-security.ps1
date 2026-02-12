# Test Script: Admin Password Security
# Tests password hashing, validation, and security measures

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Admin Password Security Test" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$BASE_URL = "http://localhost:3001/api"
$TEST_EMAIL = "test_pwd_security_$(Get-Date -Format 'HHmmss')@wecare.dev"

# Step 1: Login as Admin
Write-Host "`n[Step 1] Logging in as Admin..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email    = "admin@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    
    if (-not $TOKEN) {
        Write-Host "FAIL: Login failed." -ForegroundColor Red
        exit 1
    }
    Write-Host "PASS: Login successful. Role: $($loginResponse.user.role)" -ForegroundColor Green
}
catch {
    Write-Host "FAIL: Login request failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# Step 2: Test weak password rejection
Write-Host "`n[Step 2] Testing weak password rejection..." -ForegroundColor Yellow
try {
    $weakPasswords = @("123", "password", "abc", "test")
    
    foreach ($weakPwd in $weakPasswords) {
        try {
            $userBody = @{
                email    = "test_weak_$weakPwd@wecare.dev"
                password = $weakPwd
                fullName = "Test Weak Password"
                role     = "community"
            } | ConvertTo-Json

            $response = Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $userBody -ErrorAction Stop
            Write-Host "FAIL: Weak password '$weakPwd' was accepted (should be rejected)" -ForegroundColor Red
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 400) {
                Write-Host "PASS: Weak password '$weakPwd' correctly rejected" -ForegroundColor Green
            }
            else {
                Write-Host "WARN: Unexpected error for weak password '$weakPwd': $statusCode" -ForegroundColor Yellow
            }
        }
    }
}
catch {
    Write-Host "WARN: Error testing weak passwords: $_" -ForegroundColor Yellow
}

# Step 3: Test password strength requirements
Write-Host "`n[Step 3] Testing password strength requirements..." -ForegroundColor Yellow
try {
    $testCases = @(
        @{ pwd = "short"; expected = "fail"; reason = "Too short" },
        @{ pwd = "nouppercase123!"; expected = "fail"; reason = "No uppercase" },
        @{ pwd = "NOLOWERCASE123!"; expected = "fail"; reason = "No lowercase" },
        @{ pwd = "NoNumbers!"; expected = "fail"; reason = "No numbers" },
        @{ pwd = "NoSpecial123"; expected = "fail"; reason = "No special chars" },
        @{ pwd = "ValidPass123!"; expected = "pass"; reason = "Valid password" }
    )

    foreach ($test in $testCases) {
        try {
            $userBody = @{
                email    = "test_strength_$(Get-Random)@wecare.dev"
                password = $test.pwd
                fullName = "Test Password Strength"
                role     = "community"
            } | ConvertTo-Json

            $response = Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $userBody -ErrorAction Stop
            
            if ($test.expected -eq "pass") {
                Write-Host "PASS: $($test.reason) - Password accepted" -ForegroundColor Green
                # Clean up created user
                try {
                    Invoke-RestMethod -Uri "$BASE_URL/users/$($response.id)" -Method DELETE -Headers $headers -ErrorAction SilentlyContinue | Out-Null
                }
                catch {}
            }
            else {
                Write-Host "FAIL: $($test.reason) - Password should have been rejected" -ForegroundColor Red
            }
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($test.expected -eq "fail" -and $statusCode -eq 400) {
                Write-Host "PASS: $($test.reason) - Password correctly rejected" -ForegroundColor Green
            }
            else {
                Write-Host "WARN: $($test.reason) - Unexpected result: $statusCode" -ForegroundColor Yellow
            }
        }
    }
}
catch {
    Write-Host "WARN: Error testing password strength: $_" -ForegroundColor Yellow
}

# Step 4: Create user with strong password
Write-Host "`n[Step 4] Creating user with strong password..." -ForegroundColor Yellow
try {
    $strongPassword = "SecurePass123!@#"
    $userBody = @{
        email    = $TEST_EMAIL
        password = $strongPassword
        fullName = "Test Password Security User"
        role     = "community"
    } | ConvertTo-Json

    $userResponse = Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $userBody
    $USER_ID = $userResponse.id
    Write-Host "PASS: User created with strong password: $USER_ID" -ForegroundColor Green
}
catch {
    Write-Host "FAIL: Failed to create user with strong password: $_" -ForegroundColor Red
    $USER_ID = $null
}

# Step 5: Test login with hashed password
Write-Host "`n[Step 5] Testing login with hashed password..." -ForegroundColor Yellow
if ($USER_ID) {
    try {
        $loginTestBody = @{
            email    = $TEST_EMAIL
            password = $strongPassword
        } | ConvertTo-Json

        $loginTestResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginTestBody -ContentType "application/json"
        
        if ($loginTestResponse.token) {
            Write-Host "PASS: Login successful with hashed password" -ForegroundColor Green
        }
        else {
            Write-Host "FAIL: Login failed with correct password" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "FAIL: Login failed: $_" -ForegroundColor Red
    }
}

# Step 6: Test login with wrong password
Write-Host "`n[Step 6] Testing login with wrong password..." -ForegroundColor Yellow
if ($USER_ID) {
    try {
        $wrongLoginBody = @{
            email    = $TEST_EMAIL
            password = "WrongPassword123!"
        } | ConvertTo-Json

        $wrongLoginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $wrongLoginBody -ContentType "application/json" -ErrorAction Stop
        Write-Host "FAIL: Login succeeded with wrong password (CRITICAL SECURITY ISSUE!)" -ForegroundColor Red
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401) {
            Write-Host "PASS: Login correctly rejected with wrong password" -ForegroundColor Green
        }
        else {
            Write-Host "WARN: Unexpected status code: $statusCode" -ForegroundColor Yellow
        }
    }
}

# Step 7: Test password reset with validation
Write-Host "`n[Step 7] Testing password reset with validation..." -ForegroundColor Yellow
if ($USER_ID) {
    # Test weak password reset (should fail)
    try {
        $weakResetBody = @{
            newPassword = "weak"
        } | ConvertTo-Json

        Invoke-RestMethod -Uri "$BASE_URL/users/$USER_ID/reset-password" -Method POST -Headers $headers -Body $weakResetBody -ErrorAction Stop
        Write-Host "FAIL: Weak password reset was accepted" -ForegroundColor Red
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 400) {
            Write-Host "PASS: Weak password reset correctly rejected" -ForegroundColor Green
        }
        else {
            Write-Host "WARN: Unexpected error: $statusCode" -ForegroundColor Yellow
        }
    }

    # Test strong password reset (should succeed)
    try {
        $newStrongPassword = "NewSecurePass456!@#"
        $strongResetBody = @{
            newPassword = $newStrongPassword
        } | ConvertTo-Json

        Invoke-RestMethod -Uri "$BASE_URL/users/$USER_ID/reset-password" -Method POST -Headers $headers -Body $strongResetBody
        Write-Host "PASS: Strong password reset successful" -ForegroundColor Green

        # Verify login with new password
        Start-Sleep -Seconds 1
        $newLoginBody = @{
            email    = $TEST_EMAIL
            password = $newStrongPassword
        } | ConvertTo-Json

        $newLoginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $newLoginBody -ContentType "application/json"
        if ($newLoginResponse.token) {
            Write-Host "PASS: Login successful with new password" -ForegroundColor Green
        }
        else {
            Write-Host "FAIL: Login failed with new password" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "FAIL: Strong password reset failed: $_" -ForegroundColor Red
    }
}

# Step 8: Test duplicate email prevention
Write-Host "`n[Step 8] Testing duplicate email prevention..." -ForegroundColor Yellow
try {
    $duplicateBody = @{
        email    = $TEST_EMAIL
        password = "AnotherPass123!"
        fullName = "Duplicate Email Test"
        role     = "community"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $duplicateBody -ErrorAction Stop
    Write-Host "FAIL: Duplicate email was accepted" -ForegroundColor Red
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 409) {
        Write-Host "PASS: Duplicate email correctly rejected" -ForegroundColor Green
    }
    else {
        Write-Host "WARN: Unexpected status code: $statusCode" -ForegroundColor Yellow
    }
}

# Step 9: Test invalid email format
Write-Host "`n[Step 9] Testing invalid email format..." -ForegroundColor Yellow
try {
    $invalidEmails = @("notanemail", "missing@domain", "@nodomain.com", "spaces in@email.com")
    
    foreach ($invalidEmail in $invalidEmails) {
        try {
            $invalidBody = @{
                email    = $invalidEmail
                password = "ValidPass123!"
                fullName = "Invalid Email Test"
                role     = "community"
            } | ConvertTo-Json

            Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $invalidBody -ErrorAction Stop
            Write-Host "FAIL: Invalid email '$invalidEmail' was accepted" -ForegroundColor Red
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 400) {
                Write-Host "PASS: Invalid email '$invalidEmail' correctly rejected" -ForegroundColor Green
            }
            else {
                Write-Host "WARN: Unexpected error for '$invalidEmail': $statusCode" -ForegroundColor Yellow
            }
        }
    }
}
catch {
    Write-Host "WARN: Error testing invalid emails: $_" -ForegroundColor Yellow
}

# Step 10: Verify audit logs for security events
Write-Host "`n[Step 10] Verifying audit logs for security events..." -ForegroundColor Yellow
try {
    $auditLogs = Invoke-RestMethod -Uri "$BASE_URL/audit-logs" -Method GET -Headers $headers
    
    $createUserLogs = $auditLogs | Where-Object { $_.action -eq "CREATE_USER" }
    $loginLogs = $auditLogs | Where-Object { $_.action -eq "LOGIN" }
    $resetPasswordLogs = $auditLogs | Where-Object { $_.action -eq "RESET_PASSWORD" }
    
    Write-Host "Found $($createUserLogs.Count) CREATE_USER logs" -ForegroundColor Cyan
    Write-Host "Found $($loginLogs.Count) LOGIN logs" -ForegroundColor Cyan
    Write-Host "Found $($resetPasswordLogs.Count) RESET_PASSWORD logs" -ForegroundColor Cyan
    
    if ($createUserLogs.Count -gt 0 -and $loginLogs.Count -gt 0) {
        Write-Host "PASS: Security events are being logged" -ForegroundColor Green
    }
    else {
        Write-Host "WARN: Some security events may not be logged" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "WARN: Could not verify audit logs: $_" -ForegroundColor Yellow
}

# Cleanup: Delete test user
if ($USER_ID) {
    Write-Host "`n[Cleanup] Deleting test user..." -ForegroundColor Yellow
    try {
        Invoke-RestMethod -Uri "$BASE_URL/users/$USER_ID" -Method DELETE -Headers $headers
        Write-Host "Test user deleted." -ForegroundColor Gray
    }
    catch {
        Write-Host "WARN: Could not delete test user: $_" -ForegroundColor Yellow
    }
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Password Security Tests Complete" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
