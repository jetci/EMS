# Test Script: DRV-P0-01 - Driver API Tests
# Tests driver login with driver_id, my-rides endpoint, my-profile endpoint

$baseUrl = "http://localhost:5000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DRV-P0-01: Driver API Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0
$global:testToken = $null
$global:driverId = $null

function Test-API {
    param($Name, $Method, $Url, $Body, $Expected)
    
    Write-Host "[$Method] $Name" -ForegroundColor Yellow
    try {
        $params = @{
            Uri         = $Url
            Method      = $Method
            ContentType = "application/json; charset=utf-8"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 3
        }
        
        if ($global:testToken) {
            $params.Headers = @{ Authorization = "Bearer $global:testToken" }
        }
        
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

# Test 1: Driver Login with driver_id
Write-Host "`n=== Test 1: Driver Login with driver_id ===" -ForegroundColor Magenta

$loginResult = Test-API "Login as Driver" "POST" "$baseUrl/auth/login" @{
    email    = "driver1@wecare.dev"
    password = "password"
} { param($r) $r.token -ne $null -and $r.user.role -eq "driver" }

$global:testToken = $loginResult.token
$global:driverId = $loginResult.user.driver_id

Write-Host "[CHECK] Verify driver_id in response" -ForegroundColor Yellow
if ($loginResult.user.driver_id) {
    Write-Host "  ✅ PASSED - driver_id = $($loginResult.user.driver_id)" -ForegroundColor Green
    $passed++
}
else {
    Write-Host "  ❌ FAILED - driver_id not found in login response" -ForegroundColor Red
    $failed++
}

# Test 2: Get My Profile
Write-Host "`n=== Test 2: Get My Profile ===" -ForegroundColor Magenta

$profile = Test-API "GET /drivers/my-profile" "GET" "$baseUrl/drivers/my-profile" $null {
    param($r) $r.id -ne $null -and $r.full_name -ne $null
}

if ($profile) {
    Write-Host "  Driver: $($profile.full_name) ($($profile.id))" -ForegroundColor Cyan
}

# Test 3: Get My Rides
Write-Host "`n=== Test 3: Get My Rides ===" -ForegroundColor Magenta

$myRides = Test-API "GET /drivers/my-rides" "GET" "$baseUrl/drivers/my-rides" $null {
    param($r) $r -is [Array]
}

Write-Host "  Found $($myRides.Count) rides assigned to this driver" -ForegroundColor Cyan

# Test 4: Update My Profile
Write-Host "`n=== Test 4: Update My Profile ===" -ForegroundColor Magenta

$updateResult = Test-API "PUT /drivers/my-profile" "PUT" "$baseUrl/drivers/my-profile" @{
    phone = "088-888-8888"
} { param($r) $r.phone -eq "088-888-8888" }

# Test 5: Verify drivers.json created
Write-Host "`n=== Test 5: Data Persistence ===" -ForegroundColor Magenta

$driversFile = "d:\EMS\wecare-backend\db\data\drivers.json"
if (Test-Path $driversFile) {
    $driverCount = (Get-Content $driversFile -Raw | ConvertFrom-Json).Count
    Write-Host "[FILE] drivers.json: $driverCount drivers" -ForegroundColor Cyan
    Write-Host "  ✅ PASSED - File exists with data" -ForegroundColor Green
    $passed++
}
else {
    Write-Host "[FILE] drivers.json: NOT FOUND" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DRV-P0-01 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" }else { "Green" })
Write-Host ""
if ($failed -eq 0) {
    Write-Host "  🎉 ALL TESTS PASSED! 🎉" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  Some tests failed" -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan
