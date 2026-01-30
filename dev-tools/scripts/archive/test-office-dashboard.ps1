# Test Script: Office Dashboard & Routes
$baseUrl = "http://localhost:5000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Office Dashboard API Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0
$global:officeToken = $null
$global:pendingRideId = $null

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

# 1. Login as Office User
Write-Host "`n=== Step 1: Login as Office User ===" -ForegroundColor Magenta
$login = Test-API "Login Office" "POST" "$baseUrl/auth/login" @{
    email    = "office1@wecare.dev"
    password = "password"
} { param($r) $r.token -ne $null }

$global:officeToken = $login.token

# 2. Create Pending Ride (as Community) to ensure we have urgent data
Write-Host "`n=== Step 2: Create Pending Ride ===" -ForegroundColor Magenta
$commLogin = Test-API "Login Community" "POST" "$baseUrl/auth/login" @{ email = "community1@wecare.dev"; password = "password" }
$commToken = $commLogin.token

$rideData = @{
    patient_id       = "PAT-001"
    pickup_location  = "Urgent Pickup"
    destination      = "Hospital"
    appointment_time = (Get-Date).AddHours(3).ToString("yyyy-MM-ddTHH:mm:ss")
    trip_type        = "one_way"
    patient_name     = "Urgent Patient"
    status           = "PENDING"
}

$ride = Test-API "Create Pending Ride" "POST" "$baseUrl/community/rides" $rideData { param($r) $r.status -eq "PENDING" } $commToken
$global:pendingRideId = $ride.id
Write-Host "  Created Pending Ride: $($global:pendingRideId)" -ForegroundColor Cyan

# 3. Get Dashboard Stats
Write-Host "`n=== Step 3: Get Dashboard Stats ===" -ForegroundColor Magenta
$stats = Test-API "Get Stats" "GET" "$baseUrl/office/dashboard" $null {
    param($r) $r.total_drivers -ge 0 -and $r.pending_requests -ge 1
} $global:officeToken

Write-Host "  Stats: Pending=$($stats.pending_requests), Drivers=$($stats.total_drivers)" -ForegroundColor Cyan

# 4. Get Urgent Rides
Write-Host "`n=== Step 4: Get Urgent Rides ===" -ForegroundColor Magenta
$urgent = Test-API "Get Urgent Rides" "GET" "$baseUrl/office/rides/urgent" $null {
    param($r) $r.rides -is [Array] -and ($r.rides | Where-Object { $_.id -eq $global:pendingRideId })
} $global:officeToken

# 5. Get Today's Schedule
Write-Host "`n=== Step 5: Get Today's Schedule ===" -ForegroundColor Magenta
$today = Test-API "Get Today's Schedule" "GET" "$baseUrl/office/rides/today" $null {
    param($r) $r.rides -is [Array]
} $global:officeToken

# 6. Assign Driver
Write-Host "`n=== Step 6: Assign Driver ===" -ForegroundColor Magenta
$assignData = @{ driver_id = "DRV-001" }
$assign = Test-API "Assign Driver" "POST" "$baseUrl/office/rides/$($global:pendingRideId)/assign" $assignData {
    param($r) $r.status -eq "ASSIGNED" -and $r.driver_id -eq "DRV-001"
} $global:officeToken

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  OFFICE API TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" }else { "Green" })
Write-Host ""
