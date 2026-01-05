# ========================================
# QA Deep Automated Testing Script
# EMS WeCare System - Comprehensive Test
# ========================================

$baseUrl = "http://localhost:3001"
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [hashtable]$Headers,
        [string]$TestName
    )
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            ContentType = "application/json"
            TimeoutSec = 10
        }
        
        if ($Headers) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        
        return @{
            TestName = $TestName
            Status = "PASS"
            StatusCode = 200
            Response = $response
            Error = $null
        }
    }
    catch {
        return @{
            TestName = $TestName
            Status = "FAIL"
            StatusCode = $_.Exception.Response.StatusCode.value__
            Response = $null
            Error = $_.Exception.Message
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  QA DEEP AUTOMATED TESTING" -ForegroundColor Cyan
Write-Host "  EMS WeCare System v4.0" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ========================================
# TEST SUITE 1: API Health & System
# ========================================
Write-Host "[1] API Health & System Tests" -ForegroundColor Yellow

$result = Test-Endpoint -Method "GET" -Endpoint "/api/system/health" -TestName "System Health Check"
$testResults += $result
Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})

# ========================================
# TEST SUITE 2: Authentication
# ========================================
Write-Host "`n[2] Authentication Tests" -ForegroundColor Yellow

# Test Admin Login
$adminCreds = @{
    email = "admin@wecare.com"
    password = "Admin@123"
}
$result = Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Body $adminCreds -TestName "Admin Login"
$testResults += $result
$adminToken = $result.Response.token
Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})

# Test Community Login
$communityCreds = @{
    email = "community@wecare.com"
    password = "Community@123"
}
$result = Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Body $communityCreds -TestName "Community Login"
$testResults += $result
$communityToken = $result.Response.token
Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})

# Test Driver Login
$driverCreds = @{
    email = "driver@wecare.com"
    password = "Driver@123"
}
$result = Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Body $driverCreds -TestName "Driver Login"
$testResults += $result
$driverToken = $result.Response.token
Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})

# Test Invalid Login
$invalidCreds = @{
    email = "invalid@test.com"
    password = "wrong"
}
$result = Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Body $invalidCreds -TestName "Invalid Login (Should Fail)"
$testResults += $result
Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "FAIL"){"Green"}else{"Red"})

# ========================================
# TEST SUITE 3: RBAC (Role-Based Access Control)
# ========================================
Write-Host "`n[3] RBAC Tests" -ForegroundColor Yellow

if ($adminToken) {
    $headers = @{ Authorization = "Bearer $adminToken" }
    
    # Admin should access users
    $result = Test-Endpoint -Method "GET" -Endpoint "/api/users" -Headers $headers -TestName "Admin Access Users"
    $testResults += $result
    Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})
}

if ($communityToken) {
    $headers = @{ Authorization = "Bearer $communityToken" }
    
    # Community should NOT access users
    $result = Test-Endpoint -Method "GET" -Endpoint "/api/users" -Headers $headers -TestName "Community Access Users (Should Fail)"
    $testResults += $result
    Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "FAIL"){"Green"}else{"Red"})
    
    # Community should access patients
    $result = Test-Endpoint -Method "GET" -Endpoint "/api/patients" -Headers $headers -TestName "Community Access Patients"
    $testResults += $result
    Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})
}

# ========================================
# TEST SUITE 4: Database Operations
# ========================================
Write-Host "`n[4] Database CRUD Tests" -ForegroundColor Yellow

if ($adminToken) {
    $headers = @{ Authorization = "Bearer $adminToken" }
    
    # Get all users
    $result = Test-Endpoint -Method "GET" -Endpoint "/api/users" -Headers $headers -TestName "GET All Users"
    $testResults += $result
    Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})
    
    # Get all patients
    $result = Test-Endpoint -Method "GET" -Endpoint "/api/patients" -Headers $headers -TestName "GET All Patients"
    $testResults += $result
    Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})
    
    # Get all drivers
    $result = Test-Endpoint -Method "GET" -Endpoint "/api/drivers" -Headers $headers -TestName "GET All Drivers"
    $testResults += $result
    Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})
    
    # Get all rides
    $result = Test-Endpoint -Method "GET" -Endpoint "/api/rides" -Headers $headers -TestName "GET All Rides"
    $testResults += $result
    Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})
    
    # Get all teams
    $result = Test-Endpoint -Method "GET" -Endpoint "/api/teams" -Headers $headers -TestName "GET All Teams"
    $testResults += $result
    Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})
    
    # Get all vehicles
    $result = Test-Endpoint -Method "GET" -Endpoint "/api/vehicles" -Headers $headers -TestName "GET All Vehicles"
    $testResults += $result
    Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})
    
    # Get all news
    $result = Test-Endpoint -Method "GET" -Endpoint "/api/news" -Headers $headers -TestName "GET All News"
    $testResults += $result
    Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})
}

# ========================================
# TEST SUITE 5: Business Logic
# ========================================
Write-Host "`n[5] Business Logic Tests" -ForegroundColor Yellow

if ($communityToken) {
    $headers = @{ Authorization = "Bearer $communityToken" }
    
    # Create Patient
    $newPatient = @{
        full_name = "QA Test Patient"
        national_id = "1234567890123"
        contact_phone = "0812345678"
        current_village = "Test Village"
        current_tambon = "Test Tambon"
        current_amphoe = "Test Amphoe"
        current_changwat = "Bangkok"
        latitude = "13.7563"
        longitude = "100.5018"
    }
    $result = Test-Endpoint -Method "POST" -Endpoint "/api/patients" -Body $newPatient -Headers $headers -TestName "Create Patient"
    $testResults += $result
    $patientId = $result.Response.id
    Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})
    
    if ($patientId) {
        # Create Ride Request
        $newRide = @{
            patient_id = $patientId
            patient_name = "QA Test Patient"
            patient_phone = "0812345678"
            pickup_location = "Test Pickup Location"
            pickup_lat = "13.7563"
            pickup_lng = "100.5018"
            destination = "Test Hospital"
            destination_lat = "13.7600"
            destination_lng = "100.5100"
            appointment_time = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss")
            trip_type = "emergency"
            notes = "QA Test Ride"
        }
        $result = Test-Endpoint -Method "POST" -Endpoint "/api/rides" -Body $newRide -Headers $headers -TestName "Create Ride Request"
        $testResults += $result
        $rideId = $result.Response.id
        Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})
    }
}

# ========================================
# TEST SUITE 6: Security Tests
# ========================================
Write-Host "`n[6] Security Tests" -ForegroundColor Yellow

# Test without token
$result = Test-Endpoint -Method "GET" -Endpoint "/api/users" -TestName "Access Without Token (Should Fail)"
$testResults += $result
Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "FAIL"){"Green"}else{"Red"})

# Test with invalid token
$headers = @{ Authorization = "Bearer invalid_token_12345" }
$result = Test-Endpoint -Method "GET" -Endpoint "/api/users" -Headers $headers -TestName "Access With Invalid Token (Should Fail)"
$testResults += $result
Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "FAIL"){"Green"}else{"Red"})

# Test SQL Injection
$sqlInjection = @{
    email = "admin@wecare.com' OR '1'='1"
    password = "anything"
}
$result = Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Body $sqlInjection -TestName "SQL Injection Test (Should Fail)"
$testResults += $result
Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "FAIL"){"Green"}else{"Red"})

# ========================================
# TEST SUITE 7: Dashboard & Reports
# ========================================
Write-Host "`n[7] Dashboard & Reports Tests" -ForegroundColor Yellow

if ($adminToken) {
    $headers = @{ Authorization = "Bearer $adminToken" }
    
    # Dashboard Stats
    $result = Test-Endpoint -Method "GET" -Endpoint "/api/dashboard/stats" -Headers $headers -TestName "Dashboard Stats"
    $testResults += $result
    Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})
    
    # Audit Logs
    $result = Test-Endpoint -Method "GET" -Endpoint "/api/audit-logs" -Headers $headers -TestName "Audit Logs"
    $testResults += $result
    Write-Host "  - $($result.TestName): $($result.Status)" -ForegroundColor $(if($result.Status -eq "PASS"){"Green"}else{"Red"})
}

# ========================================
# SUMMARY
# ========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$passRate = [math]::Round(($passedTests / $totalTests) * 100, 2)

Write-Host "`nTotal Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if($passRate -ge 80){"Green"}elseif($passRate -ge 60){"Yellow"}else{"Red"})

# Export results to JSON
$testResults | ConvertTo-Json -Depth 10 | Out-File "qa-test-results.json"
Write-Host "`nDetailed results saved to: qa-test-results.json" -ForegroundColor Cyan

Write-Host "`n========================================`n" -ForegroundColor Cyan
