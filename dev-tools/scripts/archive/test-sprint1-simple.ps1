# Sprint 1 Bug Fix Testing - Simplified Version
# Testing: BUG-001, BUG-006, BUG-009

$baseUrl = "http://localhost:3001"
$testResults = @()

Write-Host ""
Write-Host "========================================"
Write-Host "  SPRINT 1 BUG FIX TESTING"
Write-Host "  Critical Bugs: BUG-001, BUG-006, BUG-009"
Write-Host "========================================"
Write-Host ""

# Helper function
function Test-API {
    param($Method, $Endpoint, $Body, $Headers, $TestName, $ShouldFail = $false)
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            ContentType = "application/json"
            TimeoutSec = 10
        }
        
        if ($Headers) { $params.Headers = $Headers }
        if ($Body) { $params.Body = ($Body | ConvertTo-Json -Depth 10) }
        
        $response = Invoke-RestMethod @params
        $status = if ($ShouldFail) { "UNEXPECTED_PASS" } else { "PASS" }
        
        return @{
            TestName = $TestName
            Status = $status
            Response = $response
            Error = $null
        }
    }
    catch {
        $status = if ($ShouldFail) { "PASS" } else { "FAIL" }
        
        return @{
            TestName = $TestName
            Status = $status
            Response = $null
            Error = $_.Exception.Message
        }
    }
}

# TEST SUITE 1: BUG-001 - Privilege Escalation
Write-Host "[TEST 1] BUG-001: Privilege Escalation" -ForegroundColor Yellow
Write-Host ""

# Login as admin
$adminCreds = @{ email = "admin@wecare.com"; password = "Admin@123" }
$result = Test-API -Method "POST" -Endpoint "/api/auth/login" -Body $adminCreds -TestName "Admin Login"
$testResults += $result

if ($result.Status -eq "PASS") {
    $token = $result.Response.token
    $userId = $result.Response.user.id
    
    Write-Host "  [PASS] Admin logged in: $($result.Response.user.email)" -ForegroundColor Green
    
    # Test: Admin tries to change own role (should FAIL)
    $result = Test-API -Method "PUT" -Endpoint "/api/users/$userId" `
        -Body @{ role = "DEVELOPER" } `
        -Headers @{ Authorization = "Bearer $token" } `
        -TestName "BUG-001: Admin change own role" `
        -ShouldFail $true
    $testResults += $result
    
    if ($result.Status -eq "PASS") {
        Write-Host "  [PASS] BUG-001 FIXED: Cannot change own role" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] BUG-001 NOT FIXED: Can still change own role!" -ForegroundColor Red
    }
} else {
    Write-Host "  [FAIL] Cannot login as admin" -ForegroundColor Red
}

Write-Host ""

# TEST SUITE 2: BUG-006 - Race Condition
Write-Host "[TEST 2] BUG-006: Race Condition" -ForegroundColor Yellow
Write-Host ""

if ($token) {
    # Get available driver
    $driversResult = Test-API -Method "GET" -Endpoint "/api/drivers" `
        -Headers @{ Authorization = "Bearer $token" } `
        -TestName "Get drivers"
    
    if ($driversResult.Status -eq "PASS") {
        $driver = $driversResult.Response.drivers | Where-Object { $_.status -eq "AVAILABLE" } | Select-Object -First 1
        
        if ($driver) {
            Write-Host "  Found available driver: $($driver.full_name)" -ForegroundColor Gray
            
            # Create 2 test rides
            $ride1 = @{
                patient_id = "PAT-001"
                patient_name = "Test Patient 1"
                patient_phone = "0812345678"
                pickup_location = "Location 1"
                pickup_lat = "13.7563"
                pickup_lng = "100.5018"
                destination = "Hospital 1"
                destination_lat = "13.7600"
                destination_lng = "100.5100"
                appointment_time = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss")
                trip_type = "emergency"
            }
            
            $ride2 = @{
                patient_id = "PAT-002"
                patient_name = "Test Patient 2"
                patient_phone = "0823456789"
                pickup_location = "Location 2"
                pickup_lat = "13.7500"
                pickup_lng = "100.5000"
                destination = "Hospital 2"
                destination_lat = "13.7650"
                destination_lng = "100.5150"
                appointment_time = (Get-Date).AddHours(3).ToString("yyyy-MM-ddTHH:mm:ss")
                trip_type = "emergency"
            }
            
            $r1 = Test-API -Method "POST" -Endpoint "/api/rides" -Body $ride1 `
                -Headers @{ Authorization = "Bearer $token" } -TestName "Create ride 1"
            
            $r2 = Test-API -Method "POST" -Endpoint "/api/rides" -Body $ride2 `
                -Headers @{ Authorization = "Bearer $token" } -TestName "Create ride 2"
            
            if ($r1.Status -eq "PASS" -and $r2.Status -eq "PASS") {
                $rideId1 = $r1.Response.id
                $rideId2 = $r2.Response.id
                
                Write-Host "  Created test rides: $rideId1, $rideId2" -ForegroundColor Gray
                Write-Host "  Testing concurrent assignment..." -ForegroundColor Gray
                
                # Concurrent assignment
                $job1 = Start-Job -ScriptBlock {
                    param($url, $token, $rideId, $driverId)
                    try {
                        $headers = @{ Authorization = "Bearer $token" }
                        $body = @{ driver_id = $driverId } | ConvertTo-Json
                        Invoke-RestMethod -Uri "$url/api/rides/$rideId/assign" `
                            -Method PATCH -Headers $headers -Body $body -ContentType "application/json"
                        return $true
                    } catch {
                        return $false
                    }
                } -ArgumentList $baseUrl, $token, $rideId1, $driver.id
                
                $job2 = Start-Job -ScriptBlock {
                    param($url, $token, $rideId, $driverId)
                    try {
                        $headers = @{ Authorization = "Bearer $token" }
                        $body = @{ driver_id = $driverId } | ConvertTo-Json
                        Invoke-RestMethod -Uri "$url/api/rides/$rideId/assign" `
                            -Method PATCH -Headers $headers -Body $body -ContentType "application/json"
                        return $true
                    } catch {
                        return $false
                    }
                } -ArgumentList $baseUrl, $token, $rideId2, $driver.id
                
                Wait-Job $job1, $job2 | Out-Null
                $success1 = Receive-Job $job1
                $success2 = Receive-Job $job2
                Remove-Job $job1, $job2
                
                $successCount = 0
                if ($success1) { $successCount++ }
                if ($success2) { $successCount++ }
                
                if ($successCount -eq 1) {
                    Write-Host "  [PASS] BUG-006 FIXED: Only 1 assignment succeeded" -ForegroundColor Green
                    $testResults += @{ TestName = "BUG-006: Race condition"; Status = "PASS" }
                } else {
                    Write-Host "  [FAIL] BUG-006 NOT FIXED: Both assignments succeeded!" -ForegroundColor Red
                    $testResults += @{ TestName = "BUG-006: Race condition"; Status = "FAIL" }
                }
                
                # Cleanup
                Test-API -Method "PATCH" -Endpoint "/api/rides/$rideId1/status" `
                    -Body @{ status = "CANCELLED" } -Headers @{ Authorization = "Bearer $token" } `
                    -TestName "Cleanup" | Out-Null
                Test-API -Method "PATCH" -Endpoint "/api/rides/$rideId2/status" `
                    -Body @{ status = "CANCELLED" } -Headers @{ Authorization = "Bearer $token" } `
                    -TestName "Cleanup" | Out-Null
            }
        } else {
            Write-Host "  [SKIP] No available drivers" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# TEST SUITE 3: BUG-009 - WebSocket
Write-Host "[TEST 3] BUG-009: WebSocket Implementation" -ForegroundColor Yellow
Write-Host ""

# Check Socket.IO dependency
$packagePath = "wecare-backend\package.json"
if (Test-Path $packagePath) {
    $package = Get-Content $packagePath | ConvertFrom-Json
    $hasSocketIO = $package.dependencies.PSObject.Properties.Name -contains "socket.io"
    
    if ($hasSocketIO) {
        Write-Host "  [PASS] Socket.IO dependency installed" -ForegroundColor Green
        $testResults += @{ TestName = "BUG-009: Socket.IO installed"; Status = "PASS" }
    } else {
        Write-Host "  [FAIL] Socket.IO not installed" -ForegroundColor Red
        $testResults += @{ TestName = "BUG-009: Socket.IO installed"; Status = "FAIL" }
    }
}

# Check WebSocket endpoint
try {
    $wsTest = Invoke-WebRequest -Uri "$baseUrl/socket.io/" -Method GET -TimeoutSec 5
    Write-Host "  [PASS] Socket.IO endpoint accessible" -ForegroundColor Green
    $testResults += @{ TestName = "BUG-009: WebSocket endpoint"; Status = "PASS" }
} catch {
    Write-Host "  [FAIL] Socket.IO endpoint not accessible" -ForegroundColor Red
    $testResults += @{ TestName = "BUG-009: WebSocket endpoint"; Status = "FAIL" }
}

# Check service files
$locationService = Test-Path "wecare-backend\src\services\locationService.ts"
$socketService = Test-Path "src\services\socketService.ts"

if ($locationService) {
    Write-Host "  [PASS] Backend location service exists" -ForegroundColor Green
    $testResults += @{ TestName = "BUG-009: Backend service"; Status = "PASS" }
} else {
    Write-Host "  [FAIL] Backend location service missing" -ForegroundColor Red
    $testResults += @{ TestName = "BUG-009: Backend service"; Status = "FAIL" }
}

if ($socketService) {
    Write-Host "  [PASS] Frontend socket service exists" -ForegroundColor Green
    $testResults += @{ TestName = "BUG-009: Frontend service"; Status = "PASS" }
} else {
    Write-Host "  [FAIL] Frontend socket service missing" -ForegroundColor Red
    $testResults += @{ TestName = "BUG-009: Frontend service"; Status = "FAIL" }
}

Write-Host ""
Write-Host "  Note: Full WebSocket testing requires manual browser testing" -ForegroundColor Cyan

# SUMMARY
Write-Host ""
Write-Host "========================================"
Write-Host "  TEST SUMMARY"
Write-Host "========================================"
Write-Host ""

$total = $testResults.Count
$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$passRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 2) } else { 0 }

Write-Host "Total Tests: $total"
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%"
Write-Host ""

# Bug summary
$bug001 = $testResults | Where-Object { $_.TestName -like "*BUG-001*" }
$bug006 = $testResults | Where-Object { $_.TestName -like "*BUG-006*" }
$bug009 = $testResults | Where-Object { $_.TestName -like "*BUG-009*" }

Write-Host "Bug Fix Status:"
Write-Host "  BUG-001: $(($bug001 | Where-Object { $_.Status -eq 'PASS' }).Count)/$($bug001.Count) passed"
Write-Host "  BUG-006: $(($bug006 | Where-Object { $_.Status -eq 'PASS' }).Count)/$($bug006.Count) passed"
Write-Host "  BUG-009: $(($bug009 | Where-Object { $_.Status -eq 'PASS' }).Count)/$($bug009.Count) passed"

Write-Host ""
Write-Host "========================================"
if ($passRate -ge 90) {
    Write-Host "  SPRINT 1 READY FOR QA APPROVAL" -ForegroundColor Green
} elseif ($passRate -ge 70) {
    Write-Host "  SPRINT 1 NEEDS MINOR FIXES" -ForegroundColor Yellow
} else {
    Write-Host "  SPRINT 1 NEEDS MAJOR FIXES" -ForegroundColor Red
}
Write-Host "========================================"
Write-Host ""

# Export
$testResults | ConvertTo-Json -Depth 10 | Out-File "test-results-sprint1.json"
Write-Host "Results saved to: test-results-sprint1.json"
Write-Host ""
