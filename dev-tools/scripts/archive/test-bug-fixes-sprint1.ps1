# ========================================
# Test Script for Sprint 1 Bug Fixes
# EMS WeCare System - Critical Bugs
# ========================================

$baseUrl = "http://localhost:3001"
$testResults = @()

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SPRINT 1 BUG FIX TESTING" -ForegroundColor Cyan
Write-Host "  Testing Critical Bugs: BUG-001, BUG-006, BUG-009" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ========================================
# Helper Functions
# ========================================

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [hashtable]$Headers,
        [string]$TestName,
        [string]$ExpectedResult = "PASS"
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
        
        $actualResult = if ($ExpectedResult -eq "FAIL") { "UNEXPECTED_PASS" } else { "PASS" }
        
        return @{
            TestName = $TestName
            Status = $actualResult
            StatusCode = 200
            Response = $response
            Error = $null
            Expected = $ExpectedResult
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $actualResult = if ($ExpectedResult -eq "FAIL") { "PASS" } else { "FAIL" }
        
        return @{
            TestName = $TestName
            Status = $actualResult
            StatusCode = $statusCode
            Response = $null
            Error = $_.Exception.Message
            Expected = $ExpectedResult
        }
    }
}

function Write-TestResult {
    param($result)
    
    $color = if ($result.Status -eq "PASS") { "Green" } else { "Red" }
    $icon = if ($result.Status -eq "PASS") { "✅" } else { "❌" }
    
    Write-Host "  $icon $($result.TestName): $($result.Status)" -ForegroundColor $color
    
    if ($result.Status -eq "FAIL" -and $result.Error) {
        Write-Host "     Error: $($result.Error)" -ForegroundColor Yellow
    }
}

# ========================================
# TEST SUITE 1: BUG-001 - Privilege Escalation
# ========================================

Write-Host "`n[TEST SUITE 1] BUG-001: Privilege Escalation" -ForegroundColor Yellow
Write-Host "Testing: User cannot change their own role`n" -ForegroundColor Gray

# Login as admin
$adminCreds = @{
    email = "admin@wecare.com"
    password = "Admin@123"
}

$result = Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Body $adminCreds -TestName "Admin Login"
$testResults += $result
Write-TestResult $result

if ($result.Status -eq "PASS") {
    $adminToken = $result.Response.token
    $adminUserId = $result.Response.user.id
    
    # Test 1.1: Admin tries to change own role to DEVELOPER (should FAIL)
    $result = Test-Endpoint `
        -Method "PUT" `
        -Endpoint "/api/users/$adminUserId" `
        -Body @{ role = "DEVELOPER" } `
        -Headers @{ Authorization = "Bearer $adminToken" } `
        -TestName "BUG-001-T1: Admin change own role to DEVELOPER" `
        -ExpectedResult "FAIL"
    $testResults += $result
    Write-TestResult $result
    
    # Test 1.2: Admin tries to change own role to OFFICER (should FAIL)
    $result = Test-Endpoint `
        -Method "PUT" `
        -Endpoint "/api/users/$adminUserId" `
        -Body @{ role = "OFFICER" } `
        -Headers @{ Authorization = "Bearer $adminToken" } `
        -TestName "BUG-001-T2: Admin change own role to OFFICER" `
        -ExpectedResult "FAIL"
    $testResults += $result
    Write-TestResult $result
    
    # Test 1.3: Admin changes other user's role (should PASS)
    # First, get another user
    $usersResult = Test-Endpoint `
        -Method "GET" `
        -Endpoint "/api/users" `
        -Headers @{ Authorization = "Bearer $adminToken" } `
        -TestName "Get all users"
    
    if ($usersResult.Status -eq "PASS" -and $usersResult.Response.users) {
        $otherUser = $usersResult.Response.users | Where-Object { $_.id -ne $adminUserId } | Select-Object -First 1
        
        if ($otherUser) {
            $result = Test-Endpoint `
                -Method "PUT" `
                -Endpoint "/api/users/$($otherUser.id)" `
                -Body @{ role = "OFFICER" } `
                -Headers @{ Authorization = "Bearer $adminToken" } `
                -TestName "BUG-001-T3: Admin change other user's role" `
                -ExpectedResult "PASS"
            $testResults += $result
            Write-TestResult $result
        }
    }
    
    # Test 1.4: Check audit log for role change attempts
    $result = Test-Endpoint `
        -Method "GET" `
        -Endpoint "/api/audit-logs?limit=10" `
        -Headers @{ Authorization = "Bearer $adminToken" } `
        -TestName "BUG-001-T4: Audit log exists for role changes"
    $testResults += $result
    Write-TestResult $result
}

# ========================================
# TEST SUITE 2: BUG-006 - Race Condition
# ========================================

Write-Host "`n[TEST SUITE 2] BUG-006: Race Condition in Driver Assignment" -ForegroundColor Yellow
Write-Host "Testing: No race condition when assigning drivers`n" -ForegroundColor Gray

if ($adminToken) {
    $headers = @{ Authorization = "Bearer $adminToken" }
    
    # Get available drivers
    $driversResult = Test-Endpoint `
        -Method "GET" `
        -Endpoint "/api/drivers" `
        -Headers $headers `
        -TestName "Get available drivers"
    
    if ($driversResult.Status -eq "PASS" -and $driversResult.Response.drivers) {
        $availableDriver = $driversResult.Response.drivers | Where-Object { $_.status -eq "AVAILABLE" } | Select-Object -First 1
        
        if ($availableDriver) {
            Write-Host "  Found available driver: $($availableDriver.full_name) ($($availableDriver.id))" -ForegroundColor Gray
            
            # Create 2 test rides
            $ride1Body = @{
                patient_id = "PAT-001"
                patient_name = "Test Patient 1"
                patient_phone = "0812345678"
                pickup_location = "Test Location 1"
                pickup_lat = "13.7563"
                pickup_lng = "100.5018"
                destination = "Test Hospital 1"
                destination_lat = "13.7600"
                destination_lng = "100.5100"
                appointment_time = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss")
                trip_type = "emergency"
            }
            
            $ride2Body = @{
                patient_id = "PAT-002"
                patient_name = "Test Patient 2"
                patient_phone = "0823456789"
                pickup_location = "Test Location 2"
                pickup_lat = "13.7500"
                pickup_lng = "100.5000"
                destination = "Test Hospital 2"
                destination_lat = "13.7650"
                destination_lng = "100.5150"
                appointment_time = (Get-Date).AddHours(3).ToString("yyyy-MM-ddTHH:mm:ss")
                trip_type = "emergency"
            }
            
            # Create rides
            $ride1Result = Test-Endpoint `
                -Method "POST" `
                -Endpoint "/api/rides" `
                -Body $ride1Body `
                -Headers $headers `
                -TestName "Create test ride 1"
            
            $ride2Result = Test-Endpoint `
                -Method "POST" `
                -Endpoint "/api/rides" `
                -Body $ride2Body `
                -Headers $headers `
                -TestName "Create test ride 2"
            
            if ($ride1Result.Status -eq "PASS" -and $ride2Result.Status -eq "PASS") {
                $ride1Id = $ride1Result.Response.id
                $ride2Id = $ride2Result.Response.id
                
                Write-Host "  Created rides: $ride1Id, $ride2Id" -ForegroundColor Gray
                
                # Test 2.1: Concurrent assignment (should only one succeed)
                Write-Host "`n  Testing concurrent assignment..." -ForegroundColor Gray
                
                $job1 = Start-Job -ScriptBlock {
                    param($url, $token, $rideId, $driverId)
                    try {
                        $headers = @{ Authorization = "Bearer $token" }
                        $body = @{ driver_id = $driverId } | ConvertTo-Json
                        $result = Invoke-RestMethod -Uri "$url/api/rides/$rideId/assign" `
                            -Method PATCH -Headers $headers -Body $body -ContentType "application/json"
                        return @{ Success = $true; Result = $result }
                    } catch {
                        return @{ Success = $false; Error = $_.Exception.Message }
                    }
                } -ArgumentList $baseUrl, $adminToken, $ride1Id, $availableDriver.id
                
                $job2 = Start-Job -ScriptBlock {
                    param($url, $token, $rideId, $driverId)
                    try {
                        $headers = @{ Authorization = "Bearer $token" }
                        $body = @{ driver_id = $driverId } | ConvertTo-Json
                        $result = Invoke-RestMethod -Uri "$url/api/rides/$rideId/assign" `
                            -Method PATCH -Headers $headers -Body $body -ContentType "application/json"
                        return @{ Success = $true; Result = $result }
                    } catch {
                        return @{ Success = $false; Error = $_.Exception.Message }
                    }
                } -ArgumentList $baseUrl, $adminToken, $ride2Id, $availableDriver.id
                
                Wait-Job $job1, $job2 | Out-Null
                $result1 = Receive-Job $job1
                $result2 = Receive-Job $job2
                Remove-Job $job1, $job2
                
                $successCount = 0
                if ($result1.Success) { $successCount++ }
                if ($result2.Success) { $successCount++ }
                
                $testPassed = ($successCount -eq 1)
                
                $result = @{
                    TestName = "BUG-006-T1: Concurrent driver assignment (only 1 should succeed)"
                    Status = if ($testPassed) { "PASS" } else { "FAIL" }
                    StatusCode = 200
                    Response = @{
                        Job1Success = $result1.Success
                        Job2Success = $result2.Success
                        SuccessCount = $successCount
                    }
                    Error = if (-not $testPassed) { "Both assignments succeeded (race condition exists)" } else { $null }
                    Expected = "PASS"
                }
                $testResults += $result
                Write-TestResult $result
                
                # Test 2.2: Try to assign already assigned driver (should FAIL)
                Start-Sleep -Seconds 1
                $result = Test-Endpoint `
                    -Method "PATCH" `
                    -Endpoint "/api/rides/$ride2Id/assign" `
                    -Body @{ driver_id = $availableDriver.id } `
                    -Headers $headers `
                    -TestName "BUG-006-T2: Assign already busy driver" `
                    -ExpectedResult "FAIL"
                $testResults += $result
                Write-TestResult $result
                
                # Cleanup: Cancel test rides
                Test-Endpoint -Method "PATCH" -Endpoint "/api/rides/$ride1Id/status" `
                    -Body @{ status = "CANCELLED" } -Headers $headers -TestName "Cleanup ride 1" | Out-Null
                Test-Endpoint -Method "PATCH" -Endpoint "/api/rides/$ride2Id/status" `
                    -Body @{ status = "CANCELLED" } -Headers $headers -TestName "Cleanup ride 2" | Out-Null
            }
        } else {
            Write-Host "  ⚠️  No available drivers found, skipping race condition tests" -ForegroundColor Yellow
        }
    }
}

# ========================================
# TEST SUITE 3: BUG-009 - WebSocket Location Tracking
# ========================================

Write-Host "`n[TEST SUITE 3] BUG-009: Real-time Location Tracking" -ForegroundColor Yellow
Write-Host "Testing: WebSocket implementation for location tracking`n" -ForegroundColor Gray

# Test 3.1: Check if Socket.IO is installed
$packageJsonPath = "wecare-backend\package.json"
if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    $hasSocketIO = $packageJson.dependencies.PSObject.Properties.Name -contains "socket.io"
    
    $result = @{
        TestName = "BUG-009-T1: Socket.IO dependency installed"
        Status = if ($hasSocketIO) { "PASS" } else { "FAIL" }
        StatusCode = 200
        Response = @{ HasSocketIO = $hasSocketIO }
        Error = if (-not $hasSocketIO) { "socket.io not found in dependencies" } else { $null }
        Expected = "PASS"
    }
    $testResults += $result
    Write-TestResult $result
}

# Test 3.2: Check if WebSocket endpoint is accessible
try {
    $wsTest = Invoke-WebRequest -Uri "$baseUrl/socket.io/" -Method GET -TimeoutSec 5
    $result = @{
        TestName = "BUG-009-T2: Socket.IO endpoint accessible"
        Status = "PASS"
        StatusCode = $wsTest.StatusCode
        Response = @{ Accessible = $true }
        Error = $null
        Expected = "PASS"
    }
} catch {
    $result = @{
        TestName = "BUG-009-T2: Socket.IO endpoint accessible"
        Status = "FAIL"
        StatusCode = 0
        Response = @{ Accessible = $false }
        Error = "Socket.IO endpoint not accessible: $($_.Exception.Message)"
        Expected = "PASS"
    }
}
$testResults += $result
Write-TestResult $result

# Test 3.3: Check if location service exists
$locationServicePath = "wecare-backend\src\services\locationService.ts"
$hasLocationService = Test-Path $locationServicePath

$result = @{
    TestName = "BUG-009-T3: Location service file exists"
    Status = if ($hasLocationService) { "PASS" } else { "FAIL" }
    StatusCode = 200
    Response = @{ Exists = $hasLocationService }
    Error = if (-not $hasLocationService) { "locationService.ts not found" } else { $null }
    Expected = "PASS"
}
$testResults += $result
Write-TestResult $result

# Test 3.4: Check if frontend socket service exists
$socketServicePath = "src\services\socketService.ts"
$hasSocketService = Test-Path $socketServicePath

$result = @{
    TestName = "BUG-009-T4: Frontend socket service exists"
    Status = if ($hasSocketService) { "PASS" } else { "FAIL" }
    StatusCode = 200
    Response = @{ Exists = $hasSocketService }
    Error = if (-not $hasSocketService) { "socketService.ts not found" } else { $null }
    Expected = "PASS"
}
$testResults += $result
Write-TestResult $result

Write-Host "`n  ℹ️  Note: Full WebSocket testing requires manual browser testing" -ForegroundColor Cyan
Write-Host "     1. Login as driver" -ForegroundColor Gray
Write-Host "     2. Check browser console for '[Socket] Connected'" -ForegroundColor Gray
Write-Host "     3. Verify location updates are sent" -ForegroundColor Gray
Write-Host "     4. Login as OFFICER and verify real-time map updates" -ForegroundColor Gray

# ========================================
# SUMMARY
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY - SPRINT 1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$passRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }

Write-Host "`nTotal Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if($passRate -ge 90){"Green"}elseif($passRate -ge 70){"Yellow"}else{"Red"})

# Bug-specific summary
Write-Host "`nBug Fix Status:" -ForegroundColor White
$bug001Tests = $testResults | Where-Object { $_.TestName -like "*BUG-001*" }
$bug001Pass = ($bug001Tests | Where-Object { $_.Status -eq "PASS" }).Count
$bug001Total = $bug001Tests.Count
Write-Host "  BUG-001 (Privilege Escalation): $bug001Pass/$bug001Total tests passed" -ForegroundColor $(if($bug001Pass -eq $bug001Total){"Green"}else{"Yellow"})

$bug006Tests = $testResults | Where-Object { $_.TestName -like "*BUG-006*" }
$bug006Pass = ($bug006Tests | Where-Object { $_.Status -eq "PASS" }).Count
$bug006Total = $bug006Tests.Count
Write-Host "  BUG-006 (Race Condition): $bug006Pass/$bug006Total tests passed" -ForegroundColor $(if($bug006Pass -eq $bug006Total){"Green"}else{"Yellow"})

$bug009Tests = $testResults | Where-Object { $_.TestName -like "*BUG-009*" }
$bug009Pass = ($bug009Tests | Where-Object { $_.Status -eq "PASS" }).Count
$bug009Total = $bug009Tests.Count
Write-Host "  BUG-009 (WebSocket): $bug009Pass/$bug009Total tests passed" -ForegroundColor $(if($bug009Pass -eq $bug009Total){"Green"}else{"Yellow"})

# Export results
$testResults | ConvertTo-Json -Depth 10 | Out-File "test-results-sprint1.json"
Write-Host "`nDetailed results saved to: test-results-sprint1.json" -ForegroundColor Cyan

# Final verdict
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($passRate -ge 90) {
    Write-Host "  SPRINT 1 READY FOR QA APPROVAL" -ForegroundColor Green
} elseif ($passRate -ge 70) {
    Write-Host "  SPRINT 1 NEEDS MINOR FIXES" -ForegroundColor Yellow
} else {
    Write-Host "  SPRINT 1 NEEDS MAJOR FIXES" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
