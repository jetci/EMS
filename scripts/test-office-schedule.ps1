# Test Script: Office Schedule & Vehicles
$baseUrl = "http://localhost:5000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Office Schedule & Vehicles Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0
$global:officeToken = $null
$global:vehicleId = $null

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
$login = Test-API "Login Office" "POST" "$baseUrl/auth/login" @{ email = "office1@wecare.dev"; password = "password" } { param($r) $r.token -ne $null }
$global:officeToken = $login.token

# 2. Get Vehicles
Test-API "Get Vehicles" "GET" "$baseUrl/vehicles" $null { param($r) $r.vehicles.Count -ge 0 } $global:officeToken

# 3. Create Vehicle
$vehicleData = @{
    licensePlate = "TEST-1234"
    type         = "รถตู้"
    capacity     = 10
}
$vehicle = Test-API "Create Vehicle" "POST" "$baseUrl/vehicles" $vehicleData { param($r) $r.id -match "VEH-" } $global:officeToken
$global:vehicleId = $vehicle.id

# 4. Update Vehicle
$updateData = @{ licensePlate = "TEST-5678" }
Test-API "Update Vehicle" "PUT" "$baseUrl/vehicles/$($global:vehicleId)" $updateData { param($r) $r.licensePlate -eq "TEST-5678" } $global:officeToken

# 5. Delete Vehicle
Test-API "Delete Vehicle" "DELETE" "$baseUrl/vehicles/$($global:vehicleId)" $null $null $global:officeToken

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SCHEDULE & VEHICLES TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" }else { "Green" })
Write-Host ""
