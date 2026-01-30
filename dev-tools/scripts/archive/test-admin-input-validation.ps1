# Test Script: Input Validation (C2)
# Tests SQL injection prevention, input validation, and security measures

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Input Validation Test (C2)" -ForegroundColor Cyan
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
    
    if (-not $TOKEN) {
        Write-Host "FAIL: Login failed." -ForegroundColor Red
        exit 1
    }
    Write-Host "PASS: Login successful" -ForegroundColor Green
}
catch {
    Write-Host "FAIL: Login request failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# Step 2: Test SQL Injection Prevention
Write-Host "`n[Step 2] Testing SQL Injection Prevention..." -ForegroundColor Yellow

$sqlInjectionTests = @(
    @{ payload = "admin' OR '1'='1"; field = "email"; expected = "reject" },
    @{ payload = "'; DROP TABLE users; --"; field = "fullName"; expected = "reject" },
    @{ payload = "1 UNION SELECT * FROM users"; field = "search"; expected = "reject" },
    @{ payload = "admin@test.com'; DELETE FROM users WHERE '1'='1"; field = "email"; expected = "reject" }
)

foreach ($test in $sqlInjectionTests) {
    try {
        $testBody = @{
            email    = $test.payload
            password = "Test123!"
            fullName = "Test User"
            role     = "community"
        } | ConvertTo-Json

        Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $testBody -ErrorAction Stop
        Write-Host "FAIL: SQL injection payload was accepted: $($test.payload)" -ForegroundColor Red
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 400) {
            Write-Host "PASS: SQL injection payload correctly rejected: $($test.payload)" -ForegroundColor Green
        }
        else {
            Write-Host "WARN: Unexpected status code $statusCode for: $($test.payload)" -ForegroundColor Yellow
        }
    }
}

# Step 3: Test Email Format Validation
Write-Host "`n[Step 3] Testing Email Format Validation..." -ForegroundColor Yellow

$invalidEmails = @("notanemail", "missing@domain", "@nodomain.com", "spaces in@email.com", "double@@domain.com")

foreach ($email in $invalidEmails) {
    try {
        $testBody = @{
            email    = $email
            password = "ValidPass123!"
            fullName = "Test User"
            role     = "community"
        } | ConvertTo-Json

        Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $testBody -ErrorAction Stop
        Write-Host "FAIL: Invalid email accepted: $email" -ForegroundColor Red
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 400) {
            Write-Host "PASS: Invalid email rejected: $email" -ForegroundColor Green
        }
        else {
            Write-Host "WARN: Unexpected status code $statusCode for: $email" -ForegroundColor Yellow
        }
    }
}

# Step 4: Test Request Size Limit
Write-Host "`n[Step 4] Testing Request Size Limit..." -ForegroundColor Yellow

try {
    # Create a very large payload (> 10MB)
    $largeString = "A" * (11 * 1024 * 1024) # 11MB
    $largeBody = @{
        email    = "test@test.com"
        password = "Test123!"
        fullName = $largeString
        role     = "community"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $largeBody -ErrorAction Stop
    Write-Host "FAIL: Large payload was accepted (should be rejected)" -ForegroundColor Red
}
catch {
    $errorMessage = $_.Exception.Message
    if ($errorMessage -like "*413*" -or $errorMessage -like "*too large*" -or $errorMessage -like "*PayloadTooLargeError*") {
        Write-Host "PASS: Large payload correctly rejected" -ForegroundColor Green
    }
    else {
        Write-Host "WARN: Large payload rejected but with unexpected error: $errorMessage" -ForegroundColor Yellow
    }
}

# Step 5: Test XSS Prevention
Write-Host "`n[Step 5] Testing XSS Prevention..." -ForegroundColor Yellow

$xssPayloads = @(
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')",
    "<svg onload=alert('XSS')>"
)

foreach ($xss in $xssPayloads) {
    try {
        $testBody = @{
            email    = "test_xss_$(Get-Random)@test.com"
            password = "ValidPass123!"
            fullName = $xss
            role     = "community"
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $testBody -ErrorAction Stop
        
        # Check if XSS was sanitized
        if ($response.fullName -notlike "*<script>*" -and $response.fullName -notlike "*<img*" -and $response.fullName -notlike "*javascript:*") {
            Write-Host "PASS: XSS payload sanitized: $xss" -ForegroundColor Green
            # Clean up
            try {
                Invoke-RestMethod -Uri "$BASE_URL/users/$($response.id)" -Method DELETE -Headers $headers -ErrorAction SilentlyContinue | Out-Null
            }
            catch {}
        }
        else {
            Write-Host "FAIL: XSS payload NOT sanitized: $xss" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "WARN: Error testing XSS payload: $xss - $_" -ForegroundColor Yellow
    }
}

# Step 6: Test Field Length Limits
Write-Host "`n[Step 6] Testing Field Length Limits..." -ForegroundColor Yellow

try {
    $veryLongName = "A" * 200 # 200 characters (should be rejected if limit is 100)
    $testBody = @{
        email    = "test_length@test.com"
        password = "ValidPass123!"
        fullName = $veryLongName
        role     = "community"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $testBody -ErrorAction Stop
    Write-Host "FAIL: Very long name was accepted (should be rejected)" -ForegroundColor Red
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "PASS: Very long name correctly rejected" -ForegroundColor Green
    }
    else {
        Write-Host "WARN: Unexpected status code: $statusCode" -ForegroundColor Yellow
    }
}

# Step 7: Test Duplicate Email Prevention
Write-Host "`n[Step 7] Testing Duplicate Email Prevention..." -ForegroundColor Yellow

$testEmail = "duplicate_test_$(Get-Date -Format 'HHmmss')@test.com"

try {
    # Create first user
    $firstBody = @{
        email    = $testEmail
        password = "ValidPass123!"
        fullName = "First User"
        role     = "community"
    } | ConvertTo-Json

    $firstUser = Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $firstBody
    Write-Host "First user created: $($firstUser.id)" -ForegroundColor Gray

    # Try to create duplicate
    $duplicateBody = @{
        email    = $testEmail
        password = "DifferentPass123!"
        fullName = "Duplicate User"
        role     = "community"
    } | ConvertTo-Json

    try {
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

    # Clean up
    try {
        Invoke-RestMethod -Uri "$BASE_URL/users/$($firstUser.id)" -Method DELETE -Headers $headers -ErrorAction SilentlyContinue | Out-Null
    }
    catch {}
}
catch {
    Write-Host "WARN: Could not complete duplicate email test: $_" -ForegroundColor Yellow
}

# Step 8: Test Invalid Role
Write-Host "`n[Step 8] Testing Invalid Role Rejection..." -ForegroundColor Yellow

$invalidRoles = @("hacker", "superadmin", "root", "invalid_role")

foreach ($role in $invalidRoles) {
    try {
        $testBody = @{
            email    = "test_role_$(Get-Random)@test.com"
            password = "ValidPass123!"
            fullName = "Test User"
            role     = $role
        } | ConvertTo-Json

        Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $testBody -ErrorAction Stop
        Write-Host "FAIL: Invalid role accepted: $role" -ForegroundColor Red
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 400) {
            Write-Host "PASS: Invalid role rejected: $role" -ForegroundColor Green
        }
        else {
            Write-Host "WARN: Unexpected status code $statusCode for role: $role" -ForegroundColor Yellow
        }
    }
}

# Step 9: Test Missing Required Fields
Write-Host "`n[Step 9] Testing Missing Required Fields..." -ForegroundColor Yellow

$incompleteTests = @(
    @{ body = @{ password = "Test123!"; fullName = "Test"; role = "community" }; missing = "email" },
    @{ body = @{ email = "test@test.com"; fullName = "Test"; role = "community" }; missing = "password" },
    @{ body = @{ email = "test@test.com"; password = "Test123!"; role = "community" }; missing = "fullName" }
)

foreach ($test in $incompleteTests) {
    try {
        $testBody = $test.body | ConvertTo-Json
        Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $testBody -ErrorAction Stop
        Write-Host "FAIL: Request accepted with missing field: $($test.missing)" -ForegroundColor Red
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 400) {
            Write-Host "PASS: Request rejected with missing field: $($test.missing)" -ForegroundColor Green
        }
        else {
            Write-Host "WARN: Unexpected status code $statusCode for missing: $($test.missing)" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Input Validation Tests Complete" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
