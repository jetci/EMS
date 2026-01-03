# Test Script: CSRF Protection (C4)
# Tests CSRF token generation, validation, and protection

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "CSRF Protection Test (C4)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$BASE_URL = "http://localhost:3001/api"

# Step 1: Get CSRF Token
Write-Host "`n[Step 1] Getting CSRF Token..." -ForegroundColor Yellow
try {
    $csrfResponse = Invoke-WebRequest -Uri "$BASE_URL/csrf-token" -Method GET -SessionVariable session
    $csrfData = $csrfResponse.Content | ConvertFrom-Json
    $CSRF_TOKEN = $csrfData.csrfToken
    
    if ($CSRF_TOKEN) {
        Write-Host "PASS: CSRF token received: $($CSRF_TOKEN.Substring(0, 16))..." -ForegroundColor Green
    }
    else {
        Write-Host "FAIL: No CSRF token received" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "FAIL: Could not get CSRF token: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Login as Admin
Write-Host "`n[Step 2] Logging in as Admin..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email    = "admin@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -WebSession $session
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $TOKEN = $loginData.token
    
    Write-Host "PASS: Login successful" -ForegroundColor Green
}
catch {
    Write-Host "FAIL: Login failed: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Test POST Without CSRF Token (Should Fail)
Write-Host "`n[Step 3] Testing POST Without CSRF Token..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type"  = "application/json"
    }
    
    $testBody = @{
        email    = "test_no_csrf@test.com"
        password = "TestPass123!"
        fullName = "Test No CSRF"
        role     = "community"
    } | ConvertTo-Json

    Invoke-WebRequest -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $testBody -ErrorAction Stop | Out-Null
    Write-Host "WARN: Request succeeded without CSRF token (protection may not be active)" -ForegroundColor Yellow
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "PASS: Request correctly blocked without CSRF token (403)" -ForegroundColor Green
    }
    else {
        Write-Host "WARN: Unexpected status code: $statusCode" -ForegroundColor Yellow
    }
}

# Step 4: Test POST With Invalid CSRF Token (Should Fail)
Write-Host "`n[Step 4] Testing POST With Invalid CSRF Token..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type"  = "application/json"
        "X-XSRF-TOKEN"  = "invalid-token-12345"
    }
    
    $testBody = @{
        email    = "test_invalid_csrf@test.com"
        password = "TestPass123!"
        fullName = "Test Invalid CSRF"
        role     = "community"
    } | ConvertTo-Json

    Invoke-WebRequest -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $testBody -WebSession $session -ErrorAction Stop | Out-Null
    Write-Host "WARN: Request succeeded with invalid CSRF token" -ForegroundColor Yellow
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "PASS: Request correctly blocked with invalid CSRF token (403)" -ForegroundColor Green
    }
    else {
        Write-Host "WARN: Unexpected status code: $statusCode" -ForegroundColor Yellow
    }
}

# Step 5: Test POST With Valid CSRF Token (Should Succeed)
Write-Host "`n[Step 5] Testing POST With Valid CSRF Token..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type"  = "application/json"
        "X-XSRF-TOKEN"  = $CSRF_TOKEN
    }
    
    $testBody = @{
        email    = "test_valid_csrf_$(Get-Date -Format 'HHmmss')@test.com"
        password = "TestPass123!"
        fullName = "Test Valid CSRF"
        role     = "community"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $testBody -WebSession $session
    $userData = $response.Content | ConvertFrom-Json
    
    Write-Host "PASS: Request succeeded with valid CSRF token. User ID: $($userData.id)" -ForegroundColor Green
    
    # Clean up
    try {
        Invoke-WebRequest -Uri "$BASE_URL/users/$($userData.id)" -Method DELETE -Headers $headers -WebSession $session -ErrorAction SilentlyContinue | Out-Null
    }
    catch {}
}
catch {
    Write-Host "FAIL: Request failed with valid CSRF token: $_" -ForegroundColor Red
}

# Step 6: Test GET Request (Should Work Without CSRF)
Write-Host "`n[Step 6] Testing GET Request Without CSRF Token..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
    }
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/users" -Method GET -Headers $headers -WebSession $session
    $users = $response.Content | ConvertFrom-Json
    
    Write-Host "PASS: GET request works without CSRF token (as expected). Found $($users.Count) users" -ForegroundColor Green
}
catch {
    Write-Host "FAIL: GET request failed: $_" -ForegroundColor Red
}

# Step 7: Test CSRF Token Refresh
Write-Host "`n[Step 7] Testing CSRF Token Refresh..." -ForegroundColor Yellow
try {
    $newCsrfResponse = Invoke-WebRequest -Uri "$BASE_URL/csrf-token" -Method GET -WebSession $session
    $newCsrfData = $newCsrfResponse.Content | ConvertFrom-Json
    $NEW_CSRF_TOKEN = $newCsrfData.csrfToken
    
    if ($NEW_CSRF_TOKEN -and $NEW_CSRF_TOKEN -ne $CSRF_TOKEN) {
        Write-Host "PASS: New CSRF token generated: $($NEW_CSRF_TOKEN.Substring(0, 16))..." -ForegroundColor Green
    }
    elseif ($NEW_CSRF_TOKEN -eq $CSRF_TOKEN) {
        Write-Host "PASS: CSRF token refreshed (same token returned)" -ForegroundColor Green
    }
    else {
        Write-Host "FAIL: No new CSRF token received" -ForegroundColor Red
    }
}
catch {
    Write-Host "WARN: Could not refresh CSRF token: $_" -ForegroundColor Yellow
}

# Step 8: Test Cookie Presence
Write-Host "`n[Step 8] Verifying CSRF Cookie..." -ForegroundColor Yellow
try {
    $csrfCookie = $session.Cookies.GetCookies($BASE_URL) | Where-Object { $_.Name -eq "XSRF-TOKEN" }
    
    if ($csrfCookie) {
        Write-Host "PASS: CSRF cookie found: $($csrfCookie.Name) = $($csrfCookie.Value.Substring(0, 16))..." -ForegroundColor Green
    }
    else {
        Write-Host "WARN: CSRF cookie not found (may use different storage)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "WARN: Could not verify CSRF cookie: $_" -ForegroundColor Yellow
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "CSRF Protection Tests Complete" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
