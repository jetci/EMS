# Test Script: Office Management Pages (Patients, Drivers, Rides)
$baseUrl = "http://localhost:5000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Office Management API Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0
$global:officeToken = $null
$global:patientId = $null
$global:driverId = $null
$global:rideId = $null

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

# --- PATIENTS ---
Write-Host "`n=== PATIENTS MANAGEMENT ===" -ForegroundColor Magenta

# Create Patient
$patientData = @{
    full_name       = "Test Office Patient"
    national_id     = "1234567890123"
    dob             = "1990-01-01"
    gender          = "ชาย"
    contact_phone   = "0812345678"
    id_card_address = @{ houseNumber = "1"; village = "Village A" }
    current_address = @{ houseNumber = "1"; village = "Village A" }
}
$patient = Test-API "Create Patient" "POST" "$baseUrl/office/patients" $patientData { param($r) $r.id -match "PAT-" } $global:officeToken
$global:patientId = $patient.id

# Update Patient
$updatePatientData = @{ full_name = "Test Office Patient Updated" }
Test-API "Update Patient" "PUT" "$baseUrl/office/patients/$($global:patientId)" $updatePatientData { param($r) $r.full_name -eq "Test Office Patient Updated" } $global:officeToken

# Delete Patient
Test-API "Delete Patient" "DELETE" "$baseUrl/office/patients/$($global:patientId)" $null $null $global:officeToken

# --- DRIVERS ---
Write-Host "`n=== DRIVERS MANAGEMENT ===" -ForegroundColor Magenta

# Create Driver
$driverData = @{
    full_name     = "Test Office Driver"
    phone         = "0998887777"
    email         = "testdriver@wecare.dev"
    status        = "AVAILABLE"
    vehicle_type  = "รถตู้"
    license_plate = "TEST-999"
}
$driver = Test-API "Create Driver" "POST" "$baseUrl/drivers" $driverData { param($r) $r.id -match "DRV-" } $global:officeToken
$global:driverId = $driver.id

# Update Driver
$updateDriverData = @{ full_name = "Test Office Driver Updated" }
Test-API "Update Driver" "PUT" "$baseUrl/drivers/$($global:driverId)" $updateDriverData { param($r) $r.full_name -eq "Test Office Driver Updated" } $global:officeToken

# Toggle Status (Update)
$statusData = @{ status = "INACTIVE" }
Test-API "Toggle Driver Status" "PUT" "$baseUrl/drivers/$($global:driverId)" $statusData { param($r) $r.status -eq "INACTIVE" } $global:officeToken

# Delete Driver
Test-API "Delete Driver" "DELETE" "$baseUrl/drivers/$($global:driverId)" $null $null $global:officeToken

# --- RIDES ---
Write-Host "`n=== RIDES MANAGEMENT ===" -ForegroundColor Magenta

# Create Ride (via Community endpoint for setup)
$commLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body (@{ email = "community1@wecare.dev"; password = "password" } | ConvertTo-Json) -ContentType "application/json"
$commToken = $commLogin.token
$rideData = @{
    patient_id       = "PAT-001"
    pickup_location  = "Test Pickup"
    destination      = "Test Dest"
    appointment_time = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss")
    trip_type        = "one_way"
    patient_name     = "Test Patient"
    status           = "PENDING"
}
$ride = Invoke-RestMethod -Uri "$baseUrl/community/rides" -Method POST -Body ($rideData | ConvertTo-Json) -Headers @{ Authorization = "Bearer $commToken" } -ContentType "application/json"
$global:rideId = $ride.id
Write-Host "  Created Test Ride: $($global:rideId)" -ForegroundColor Cyan

# Assign Driver
$assignData = @{ driver_id = "DRV-001" }
Test-API "Assign Driver" "POST" "$baseUrl/office/rides/$($global:rideId)/assign" $assignData { param($r) $r.status -eq "ASSIGNED" -and $r.driver_id -eq "DRV-001" } $global:officeToken

# Cancel Ride (using DELETE endpoint which acts as cancel in our logic)
Test-API "Cancel Ride (Delete)" "DELETE" "$baseUrl/community/rides/$($global:rideId)" $null $null $global:officeToken

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  OFFICE MANAGEMENT TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" }else { "Green" })
Write-Host ""
