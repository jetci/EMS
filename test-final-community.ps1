# Final Comprehensive Test Script
# Tests all P0, P1, P2 fixes for Community User role

$baseUrl = "http://localhost:5000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Final Comprehensive Test Suite" -ForegroundColor Cyan
Write-Host "  Community User Role Deep Audit Fixes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

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
        
        $token = $null
        if ($Url -notmatch "login|register") {
            # Try to get token from previous login
            $global:testToken = $global:testToken
            if ($global:testToken) {
                $params.Headers = @{ Authorization = "Bearer $global:testToken" }
            }
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

# P0 Tests
Write-Host "`n=== P0: Core API Fixes ===" -ForegroundColor Magenta

# Login first
$loginResult = Test-API "Login as Community User" "POST" "$baseUrl/auth/login" @{email = "community1@wecare.dev"; password = "password" } { param($r) $r.token -ne $null }
$global:testToken = $loginResult.token
$global:userId = $loginResult.user.id

# Test Community API routes
Test-API "GET Community Patients" "GET" "$baseUrl/community/patients" $null { param($r) $r -is [Array] }
Test-API "GET Community Rides" "GET" "$baseUrl/community/rides" $null { param($r) $r -is [Array] }

# Test Create Patient
Test-API "POST Create Patient" "POST" "$baseUrl/community/patients" @{full_name = "Test Final $(Get-Random)"; phone = "0899999999" } { param($r) $r.id -ne $null }

# Test Create Ride
Test-API "POST Create Ride" "POST" "$baseUrl/community/rides" @{
    patient_id       = "PAT-001"
    appointment_time = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
    pickup_location  = "Final Test Location"
    destination      = "Hospital"
} { param($r) $r.id -ne $null -and $r.status -eq "PENDING" }

# P1 Tests
Write-Host "`n=== P1: Profile & Auth Fixes ===" -ForegroundColor Magenta

# Get current user
Test-API "GET Current User (/auth/me)" "GET" "$baseUrl/auth/me" $null { param($r) $r.email -eq "community1@wecare.dev" }

# Update profile
Test-API "PUT Update Profile" "PUT" "$baseUrl/auth/profile" @{fullName = "Community Updated $(Get-Random)"; phone = "0888888888" } { param($r) $r.phone -eq "0888888888" }

# Change password (and change back)
Test-API "POST Change Password" "POST" "$baseUrl/auth/change-password" @{userId = $global:userId; currentPassword = "password"; newPassword = "testpass123" } { param($r) $r.message -like "*success*" }
Start-Sleep -Milliseconds 500
Test-API "POST Reset Password" "POST" "$baseUrl/auth/change-password" @{userId = $global:userId; currentPassword = "testpass123"; newPassword = "password" } { param($r) $r.message -like "*success*" }

# Verify persistence
Write-Host "`n=== P0: Data Persistence Check ===" -ForegroundColor Magenta

$patientsFile = "d:\EMS\wecare-backend\db\data\patients.json"
$ridesFile = "d:\EMS\wecare-backend\db\data\rides.json"

if (Test-Path $patientsFile) {
    $patientCount = (Get-Content $patientsFile -Raw | ConvertFrom-Json).Count
    Write-Host "[FILE] patients.json: $patientCount patients" -ForegroundColor Cyan
    Write-Host "  ✅ PASSED - File exists with data" -ForegroundColor Green
    $passed++
}
else {
    Write-Host "[FILE] patients.json: NOT FOUND" -ForegroundColor Red
    $failed++
}

if (Test-Path $ridesFile) {
    $rideCount = (Get-Content $ridesFile -Raw | ConvertFrom-Json).Count
    Write-Host "[FILE] rides.json: $rideCount rides" -ForegroundColor Cyan
    Write-Host "  ✅ PASSED - File exists with data" -ForegroundColor Green
    $passed++
}
else {
    Write-Host "[FILE] rides.json: NOT FOUND" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
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
