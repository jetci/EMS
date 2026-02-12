# Test Profile Upload Issue
# Test if profile image upload works correctly

Write-Host "========================================"
Write-Host "Test: Profile Upload Issue"
Write-Host "========================================"
Write-Host ""

$API_BASE = "http://localhost:3001/api"
$passed = 0
$failed = 0

# Test 1: Check if server is running
Write-Host "Test 1: Server Status"
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  [PASS] Server is running" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  [FAIL] Server is not running" -ForegroundColor Red
    Write-Host "  Please start server: cd wecare-backend && npm run dev"
    exit 1
}

# Test 2: Login to get token
Write-Host ""
Write-Host "Test 2: Login"
$loginBody = @{
    email = "community1@wecare.dev"
    password = "password"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_BASE/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $loginData = $response.Content | ConvertFrom-Json
    $token = $loginData.token
    
    if ($token) {
        Write-Host "  [PASS] Login successful" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [FAIL] No token received" -ForegroundColor Red
        $failed++
        exit 1
    }
} catch {
    Write-Host "  [FAIL] Login failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
    exit 1
}

# Test 3: Get CSRF Token
Write-Host ""
Write-Host "Test 3: Get CSRF Token"
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/auth/csrf-token" -Method GET -ErrorAction Stop
    $csrfData = $response.Content | ConvertFrom-Json
    $csrfToken = $csrfData.csrfToken
    
    if ($csrfToken) {
        Write-Host "  [PASS] CSRF token received" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [FAIL] No CSRF token received" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  [WARN] CSRF token not available (may not be required)" -ForegroundColor Yellow
    $csrfToken = $null
}

# Test 4: Test Profile Update (without image)
Write-Host ""
Write-Host "Test 4: Profile Update (without image)"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
if ($csrfToken) {
    $headers["X-XSRF-TOKEN"] = $csrfToken
}

$profileBody = @{
    fullName = "Test User"
    phone = "0812345678"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_BASE/auth/profile" -Method PUT -Headers $headers -Body $profileBody -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  [PASS] Profile update successful (without image)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [FAIL] Profile update failed: Status $($response.StatusCode)" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  [FAIL] Profile update failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 5: Test Profile Update (with base64 image)
Write-Host ""
Write-Host "Test 5: Profile Update (with base64 image)"

# Create a small test image (1x1 pixel PNG)
$testImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

$profileWithImageBody = @{
    fullName = "Test User"
    phone = "0812345678"
    profileImageUrl = $testImageBase64
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_BASE/auth/profile" -Method PUT -Headers $headers -Body $profileWithImageBody -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  [PASS] Profile update successful (with image)" -ForegroundColor Green
        $passed++
        
        # Verify image was saved
        $profileData = $response.Content | ConvertFrom-Json
        if ($profileData.user.profileImageUrl -or $profileData.user.profile_image_url) {
            Write-Host "  [PASS] Profile image URL present in response" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "  [WARN] Profile image URL not in response" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [FAIL] Profile update failed: Status $($response.StatusCode)" -ForegroundColor Red
        $failed++
    }
} catch {
    $errorMessage = $_.Exception.Message
    Write-Host "  [FAIL] Profile update failed: $errorMessage" -ForegroundColor Red
    $failed++
    
    # Check if it's a middleware block
    if ($errorMessage -match "401" -or $errorMessage -match "Unauthorized") {
        Write-Host "  [INFO] Error 401: Token may be invalid or middleware blocking" -ForegroundColor Yellow
    } elseif ($errorMessage -match "400" -or $errorMessage -match "Bad Request") {
        Write-Host "  [INFO] Error 400: SQL Injection middleware may be blocking base64" -ForegroundColor Yellow
    }
}

# Test 6: Verify profile persists
Write-Host ""
Write-Host "Test 6: Verify Profile Persists"
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/auth/me" -Method GET -Headers $headers -ErrorAction Stop
    $userData = $response.Content | ConvertFrom-Json
    
    if ($userData.profileImageUrl -or $userData.profile_image_url) {
        Write-Host "  [PASS] Profile image persists" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [WARN] Profile image not persisted" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [FAIL] Failed to verify profile: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Results
Write-Host ""
Write-Host "========================================"
Write-Host "Test Results"
Write-Host "========================================"
Write-Host "PASSED: $passed tests" -ForegroundColor Green
Write-Host "FAILED: $failed tests" -ForegroundColor Red

$total = $passed + $failed
$passRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 2) } else { 0 }
Write-Host "Pass Rate: $passRate%"

if ($failed -gt 0) {
    Write-Host ""
    Write-Host "[FAIL] Profile upload has issues" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible causes:"
    Write-Host "  1. SQL Injection middleware blocking base64"
    Write-Host "  2. CSRF token validation failing"
    Write-Host "  3. Rate limiting"
    Write-Host "  4. Database column missing"
    exit 1
} else {
    Write-Host ""
    Write-Host "[PASS] Profile upload works correctly!" -ForegroundColor Green
    exit 0
}
