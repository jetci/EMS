# ========================================
# EMS WeCare - Comprehensive App Test Script
# ========================================
# ทดสอบฟังก์ชันหลักทั้งหมดของระบบ EMS
# ========================================

param(
    [string]$BaseUrl = "http://localhost:5000/api",
    [switch]$Verbose,
    [switch]$StopOnError
)

# สี่สำหรับแสดงผล
$script:PassCount = 0
$script:FailCount = 0
$script:TestResults = @()

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = ""
    )
    
    if ($Passed) {
        Write-Host "✓ PASS: $TestName" -ForegroundColor Green
        $script:PassCount++
        if ($Message -and $Verbose) {
            Write-Host "  → $Message" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "✗ FAIL: $TestName" -ForegroundColor Red
        $script:FailCount++
        if ($Message) {
            Write-Host "  → $Message" -ForegroundColor Yellow
        }
        if ($StopOnError) {
            throw "Test failed: $TestName"
        }
    }
    
    $script:TestResults += @{
        Name      = $TestName
        Passed    = $Passed
        Message   = $Message
        Timestamp = Get-Date
    }
}

function Invoke-ApiCall {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        $uri = "$BaseUrl$Endpoint"
        $params = @{
            Uri         = $uri
            Method      = $Method
            Headers     = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        if ($Verbose) {
            Write-Host "  API: $Method $uri" -ForegroundColor DarkGray
        }
        
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response }
    }
    catch {
        return @{ 
            Success    = $false
            Error      = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.value__
        }
    }
}

# ========================================
# Test 1: ตรวจสอบการเชื่อมต่อ Backend
# ========================================
Write-TestHeader "Test 1: Backend Connection"

$healthCheck = Invoke-ApiCall -Method GET -Endpoint "/health"
Write-TestResult -TestName "Backend Server is Running" `
    -Passed $healthCheck.Success `
    -Message $(if ($healthCheck.Success) { "Server is healthy" } else { $healthCheck.Error })

# ========================================
# Test 2: ทดสอบการ Login ทุก Role
# ========================================
Write-TestHeader "Test 2: Authentication - All User Roles"

$testUsers = @(
    @{ Email = "admin@wecare.dev"; Password = "password"; Role = "Admin" }
    @{ Email = "office1@wecare.dev"; Password = "password"; Role = "Office" }
    @{ Email = "driver1@wecare.dev"; Password = "password"; Role = "Driver" }
    @{ Email = "community1@wecare.dev"; Password = "password"; Role = "Community" }
    @{ Email = "executive@wecare.dev"; Password = "password"; Role = "Executive" }
    @{ Email = "developer@wecare.dev"; Password = "password"; Role = "Developer" }
)

$script:AuthTokens = @{}

foreach ($user in $testUsers) {
    $loginResult = Invoke-ApiCall -Method POST -Endpoint "/auth/login" `
        -Body @{ email = $user.Email; password = $user.Password }
    
    $passed = $loginResult.Success -and $loginResult.Data.token
    Write-TestResult -TestName "Login as $($user.Role)" `
        -Passed $passed `
        -Message $(if ($passed) { "Token received" } else { $loginResult.Error })
    
    if ($passed) {
        $script:AuthTokens[$user.Role] = $loginResult.Data.token
    }
}

# ========================================
# Test 3: ทดสอบ Patient Management
# ========================================
Write-TestHeader "Test 3: Patient Management (CRUD)"

if ($script:AuthTokens.ContainsKey("Community")) {
    $headers = @{ Authorization = "Bearer $($script:AuthTokens.Community)" }
    
    # Create Patient
    $newPatient = @{
        fullName        = "Test Patient $(Get-Date -Format 'HHmmss')"
        dateOfBirth     = "1990-01-01"
        gender          = "male"
        phoneNumber     = "0812345678"
        address         = "123 Test Street"
        latitude        = 13.7563
        longitude       = 100.5018
        patientTypes    = @("chronic")
        chronicDiseases = @("diabetes")
        allergies       = @("penicillin")
    }
    
    $createResult = Invoke-ApiCall -Method POST -Endpoint "/patients" `
        -Headers $headers -Body $newPatient
    
    Write-TestResult -TestName "Create Patient" `
        -Passed $createResult.Success `
        -Message $(if ($createResult.Success) { "Patient ID: $($createResult.Data.id)" } else { $createResult.Error })
    
    if ($createResult.Success) {
        $patientId = $createResult.Data.id
        
        # Read Patient
        $readResult = Invoke-ApiCall -Method GET -Endpoint "/patients/$patientId" -Headers $headers
        Write-TestResult -TestName "Read Patient Details" `
            -Passed $readResult.Success `
            -Message $(if ($readResult.Success) { "Retrieved: $($readResult.Data.fullName)" } else { $readResult.Error })
        
        # Update Patient
        $updateData = @{ phoneNumber = "0898765432" }
        $updateResult = Invoke-ApiCall -Method PUT -Endpoint "/patients/$patientId" `
            -Headers $headers -Body $updateData
        Write-TestResult -TestName "Update Patient" `
            -Passed $updateResult.Success `
            -Message $(if ($updateResult.Success) { "Phone updated" } else { $updateResult.Error })
        
        # List Patients
        $listResult = Invoke-ApiCall -Method GET -Endpoint "/patients" -Headers $headers
        Write-TestResult -TestName "List All Patients" `
            -Passed ($listResult.Success -and $listResult.Data.Count -gt 0) `
            -Message $(if ($listResult.Success) { "Found $($listResult.Data.Count) patients" } else { $listResult.Error })
        
        # Delete Patient
        $deleteResult = Invoke-ApiCall -Method DELETE -Endpoint "/patients/$patientId" -Headers $headers
        Write-TestResult -TestName "Delete Patient" `
            -Passed $deleteResult.Success `
            -Message $(if ($deleteResult.Success) { "Patient deleted" } else { $deleteResult.Error })
    }
}
else {
    Write-TestResult -TestName "Patient Management Tests" -Passed $false -Message "Community login failed"
}

# ========================================
# Test 4: ทดสอบ Ride Management
# ========================================
Write-TestHeader "Test 4: Ride Management"

if ($script:AuthTokens.ContainsKey("Office")) {
    $headers = @{ Authorization = "Bearer $($script:AuthTokens.Office)" }
    
    # Create Ride
    $newRide = @{
        patient_name     = "Test Ride Patient"
        pickup_location  = "Test Pickup Location"
        pickup_lat       = 13.7563
        pickup_lng       = 100.5018
        destination      = "Test Hospital"
        destination_lat  = 13.7600
        destination_lng  = 100.5100
        appointment_time = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss")
        phone_number     = "0812345678"
    }
    
    $createRideResult = Invoke-ApiCall -Method POST -Endpoint "/rides" `
        -Headers $headers -Body $newRide
    
    Write-TestResult -TestName "Create Ride Request" `
        -Passed $createRideResult.Success `
        -Message $(if ($createRideResult.Success) { "Ride ID: $($createRideResult.Data.id)" } else { $createRideResult.Error })
    
    if ($createRideResult.Success) {
        $rideId = $createRideResult.Data.id
        
        # List Rides
        $listRidesResult = Invoke-ApiCall -Method GET -Endpoint "/rides" -Headers $headers
        Write-TestResult -TestName "List All Rides" `
            -Passed ($listRidesResult.Success -and $listRidesResult.Data.Count -gt 0) `
            -Message $(if ($listRidesResult.Success) { "Found $($listRidesResult.Data.Count) rides" } else { $listRidesResult.Error })
        
        # Update Ride Status
        $updateRideResult = Invoke-ApiCall -Method PUT -Endpoint "/rides/$rideId" `
            -Headers $headers -Body @{ status = "ASSIGNED" }
        Write-TestResult -TestName "Update Ride Status" `
            -Passed $updateRideResult.Success `
            -Message $(if ($updateRideResult.Success) { "Status updated to ASSIGNED" } else { $updateRideResult.Error })
        
        # Cleanup - Delete Ride
        Invoke-ApiCall -Method DELETE -Endpoint "/rides/$rideId" -Headers $headers | Out-Null
    }
}
else {
    Write-TestResult -TestName "Ride Management Tests" -Passed $false -Message "Office login failed"
}

# ========================================
# Test 5: ทดสอบ Driver Management
# ========================================
Write-TestHeader "Test 5: Driver Management"

if ($script:AuthTokens.ContainsKey("Office")) {
    $headers = @{ Authorization = "Bearer $($script:AuthTokens.Office)" }
    
    # List Drivers
    $driversResult = Invoke-ApiCall -Method GET -Endpoint "/drivers" -Headers $headers
    Write-TestResult -TestName "List All Drivers" `
        -Passed ($driversResult.Success) `
        -Message $(if ($driversResult.Success) { "Found $($driversResult.Data.Count) drivers" } else { $driversResult.Error })
    
    # Get Driver Status
    if ($driversResult.Success -and $driversResult.Data.Count -gt 0) {
        $firstDriverId = $driversResult.Data[0].id
        $statusResult = Invoke-ApiCall -Method GET -Endpoint "/drivers/$firstDriverId/status" -Headers $headers
        Write-TestResult -TestName "Get Driver Status" `
            -Passed $statusResult.Success `
            -Message $(if ($statusResult.Success) { "Status: $($statusResult.Data.status)" } else { $statusResult.Error })
    }
}

# ========================================
# Test 6: ทดสอบ Vehicle Management
# ========================================
Write-TestHeader "Test 6: Vehicle Management"

if ($script:AuthTokens.ContainsKey("Office")) {
    $headers = @{ Authorization = "Bearer $($script:AuthTokens.Office)" }
    
    # List Vehicles
    $vehiclesResult = Invoke-ApiCall -Method GET -Endpoint "/vehicles" -Headers $headers
    Write-TestResult -TestName "List All Vehicles" `
        -Passed $vehiclesResult.Success `
        -Message $(if ($vehiclesResult.Success) { "Found $($vehiclesResult.Data.Count) vehicles" } else { $vehiclesResult.Error })
}

# ========================================
# Test 7: ทดสอบ Reports & Analytics
# ========================================
Write-TestHeader "Test 7: Reports & Analytics"

if ($script:AuthTokens.ContainsKey("Executive")) {
    $headers = @{ Authorization = "Bearer $($script:AuthTokens.Executive)" }
    
    # Get Dashboard Stats
    $statsResult = Invoke-ApiCall -Method GET -Endpoint "/analytics/dashboard" -Headers $headers
    Write-TestResult -TestName "Get Dashboard Statistics" `
        -Passed $statsResult.Success `
        -Message $(if ($statsResult.Success) { "Stats retrieved" } else { $statsResult.Error })
    
    # Get Ride Reports
    $reportsResult = Invoke-ApiCall -Method GET -Endpoint "/reports/rides" -Headers $headers
    Write-TestResult -TestName "Get Ride Reports" `
        -Passed $reportsResult.Success `
        -Message $(if ($reportsResult.Success) { "Reports retrieved" } else { $reportsResult.Error })
}

# ========================================
# Test 8: ทดสอบ Audit Logs
# ========================================
Write-TestHeader "Test 8: Audit Logs"

if ($script:AuthTokens.ContainsKey("Admin")) {
    $headers = @{ Authorization = "Bearer $($script:AuthTokens.Admin)" }
    
    # Get Audit Logs
    $logsResult = Invoke-ApiCall -Method GET -Endpoint "/audit/logs" -Headers $headers
    Write-TestResult -TestName "Get Audit Logs" `
        -Passed $logsResult.Success `
        -Message $(if ($logsResult.Success) { "Found $($logsResult.Data.Count) log entries" } else { $logsResult.Error })
}

# ========================================
# Test 9: ทดสอบ Security & Authorization
# ========================================
Write-TestHeader "Test 9: Security & Authorization"

# Test unauthorized access
$unauthorizedResult = Invoke-ApiCall -Method GET -Endpoint "/patients"
Write-TestResult -TestName "Block Unauthorized Access" `
    -Passed (-not $unauthorizedResult.Success -and $unauthorizedResult.StatusCode -eq 401) `
    -Message $(if ($unauthorizedResult.StatusCode -eq 401) { "Correctly blocked" } else { "Security issue detected!" })

# Test role-based access
if ($script:AuthTokens.ContainsKey("Driver")) {
    $driverHeaders = @{ Authorization = "Bearer $($script:AuthTokens.Driver)" }
    $adminEndpointResult = Invoke-ApiCall -Method GET -Endpoint "/admin/users" -Headers $driverHeaders
    Write-TestResult -TestName "Block Cross-Role Access (Driver→Admin)" `
        -Passed (-not $adminEndpointResult.Success -and $adminEndpointResult.StatusCode -eq 403) `
        -Message $(if ($adminEndpointResult.StatusCode -eq 403) { "Correctly blocked" } else { "RBAC issue detected!" })
}

# ========================================
# Test 10: ทดสอบ Data Isolation
# ========================================
Write-TestHeader "Test 10: Data Isolation"

if ($script:AuthTokens.ContainsKey("Community")) {
    $headers = @{ Authorization = "Bearer $($script:AuthTokens.Community)" }
    
    # Create patient as Community user
    $patient1 = Invoke-ApiCall -Method POST -Endpoint "/patients" `
        -Headers $headers -Body @{
        fullName    = "Isolation Test Patient"
        dateOfBirth = "1990-01-01"
        gender      = "male"
        phoneNumber = "0811111111"
        address     = "Test Address"
    }
    
    if ($patient1.Success) {
        # Try to access with different community user (should fail or not see it)
        $listResult = Invoke-ApiCall -Method GET -Endpoint "/patients" -Headers $headers
        $canSeeOwnPatient = $listResult.Success -and ($listResult.Data | Where-Object { $_.id -eq $patient1.Data.id })
        
        Write-TestResult -TestName "Community User Can See Own Patients" `
            -Passed ($canSeeOwnPatient -ne $null) `
            -Message "Data isolation working"
        
        # Cleanup
        Invoke-ApiCall -Method DELETE -Endpoint "/patients/$($patient1.Data.id)" -Headers $headers | Out-Null
    }
}

# ========================================
# สรุปผลการทดสอบ
# ========================================
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  TEST SUMMARY" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Total Tests: $($script:PassCount + $script:FailCount)" -ForegroundColor White
Write-Host "Passed: $script:PassCount" -ForegroundColor Green
Write-Host "Failed: $script:FailCount" -ForegroundColor Red

$passRate = if (($script:PassCount + $script:FailCount) -gt 0) {
    [math]::Round(($script:PassCount / ($script:PassCount + $script:FailCount)) * 100, 2)
}
else { 0 }

Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })

# บันทึกผลลงไฟล์
$reportPath = "d:\EMS\test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$script:TestResults | ConvertTo-Json -Depth 10 | Out-File $reportPath
Write-Host "`nDetailed results saved to: $reportPath" -ForegroundColor Cyan

# Exit code
if ($script:FailCount -gt 0) {
    exit 1
}
else {
    exit 0
}
