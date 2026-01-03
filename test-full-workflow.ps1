# Comprehensive End-to-End System Workflow Test
# This script simulates a full cycle from patient registration to ride completion across all roles.

$BASE_URL = "http://localhost:3001/api"
$ErrorActionPreference = "Stop"

function Write-Header($text) {
    Write-Host "`n====================================================" -ForegroundColor Cyan
    Write-Host " $text" -ForegroundColor Cyan
    Write-Host "====================================================`n" -ForegroundColor Cyan
}

function Login($email, $password) {
    Write-Host "Logging in as $email..."
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $body -ContentType "application/json"
    return $response
}

try {
    Write-Header "PHASE 1: COMMUNITY ROLE - Registration & Request"
    
    $commAuth = Login "community1@wecare.dev" "password"
    $headers = @{ "Authorization" = "Bearer $($commAuth.token)"; "Content-Type" = "application/json" }
    
    # 1. Register Patient
    Write-Host "Registering a new patient..."
    $patientBody = @{
        fullName       = "Test Workflow Patient"
        title          = "นาย"
        firstName      = "Workflow"
        lastName       = "Patient"
        nationalId     = "1234567890123"
        dob            = "1990-01-01"
        age            = 34
        patientTypes   = @("ผู้ป่วยภาวะพึงพิง")
        contactPhone   = "0899999999"
        currentAddress = @{
            houseNumber = "123/45"
            village     = "หมู่ 1 บ้านหนองตุ้ม"
            tambon      = "เวียง"
            amphoe      = "ฝาง"
            changwat    = "เชียงใหม่"
        }
        latitude       = "19.9213"
        longitude      = "99.2131"
    } | ConvertTo-Json
    
    $patient = Invoke-RestMethod -Uri "$BASE_URL/patients" -Method POST -Body $patientBody -Headers $headers
    $PATIENT_ID = $patient.id
    Write-Host "Patient Created: $PATIENT_ID" -ForegroundColor Green

    # 2. Request Ride
    Write-Host "Requesting a ride for the patient..."
    $rideBody = @{
        patient_id       = $PATIENT_ID
        patient_name     = "Test Workflow Patient"
        appointment_time = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        pickup_location  = "123/45 หมู่ 1 บ้านหนองตุ้ม"
        destination      = "โรงพยาบาลฝาง"
        trip_type        = "นัดหมอตามปกติ"
        status           = "PENDING"
    } | ConvertTo-Json
    
    $ride = Invoke-RestMethod -Uri "$BASE_URL/rides" -Method POST -Body $rideBody -Headers $headers
    $RIDE_ID = $ride.id
    Write-Host "Ride Requested: $RIDE_ID" -ForegroundColor Green

    Write-Header "PHASE 2: RADIO CENTER - Assignment"
    
    $officeAuth = Login "office1@wecare.dev" "password"
    $officeHeaders = @{ "Authorization" = "Bearer $($officeAuth.token)"; "Content-Type" = "application/json" }
    
    # 3. Assign Driver
    Write-Host "Assigning driver to ride $RIDE_ID..."
    $assignBody = @{
        status      = "ASSIGNED"
        driver_id   = "USR-003" # driver1@wecare.dev
        driver_name = "Driver One"
    } | ConvertTo-Json
    
    $updatedRide = Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Body $assignBody -Headers $officeHeaders
    Write-Host "Driver Assigned Successfully." -ForegroundColor Green

    Write-Header "PHASE 3: DRIVER - Execution"
    
    $driverAuth = Login "driver1@wecare.dev" "password"
    $driverHeaders = @{ "Authorization" = "Bearer $($driverAuth.token)"; "Content-Type" = "application/json" }
    
    # 4. En Route
    Write-Host "Driver starting trip (EN_ROUTE_TO_PICKUP)..."
    $statusBody = @{ status = "EN_ROUTE_TO_PICKUP" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Body $statusBody -Headers $driverHeaders
    
    # 5. Arrived
    Write-Host "Driver arrived at pickup (ARRIVED_AT_PICKUP)..."
    $statusBody = @{ status = "ARRIVED_AT_PICKUP" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Body $statusBody -Headers $driverHeaders
    
    # 6. In Progress
    Write-Host "Patient picked up (IN_PROGRESS)..."
    $statusBody = @{ status = "IN_PROGRESS" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Body $statusBody -Headers $driverHeaders
    
    # 7. Completed
    Write-Host "Trip completed (COMPLETED)..."
    $statusBody = @{ status = "COMPLETED" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/rides/$RIDE_ID" -Method PUT -Body $statusBody -Headers $driverHeaders
    Write-Host "Trip Finished." -ForegroundColor Green

    Write-Header "PHASE 4: EXECUTIVE - Verification"
    
    $execAuth = Login "executive1@wecare.dev" "password"
    $execHeaders = @{ "Authorization" = "Bearer $($execAuth.token)"; "Content-Type" = "application/json" }
    
    # 8. Check Dashboard Data
    Write-Host "Fetching executive dashboard data..."
    $dashboard = Invoke-RestMethod -Uri "$BASE_URL/dashboard/executive/stats" -Method GET -Headers $execHeaders
    Write-Host "Total Rides in Dashboard: $($dashboard.total_rides)" -ForegroundColor Green
    
    Write-Header "PHASE 5: ADMIN - Audit Logs"
    
    $adminAuth = Login "admin@wecare.dev" "password"
    $adminHeaders = @{ "Authorization" = "Bearer $($adminAuth.token)"; "Content-Type" = "application/json" }
    
    # 9. Verify Audit Logs
    Write-Host "Checking audit logs for the completed ride..."
    $logs = Invoke-RestMethod -Uri "$BASE_URL/audit-logs" -Method GET -Headers $adminHeaders
    $rideLogs = $logs | Where-Object { $_.targetId -eq $RIDE_ID }
    Write-Host "Found $($rideLogs.Count) log entries for Ride $RIDE_ID" -ForegroundColor Green

    Write-Header "ALL TESTS PASSED SUCCESSFULLY!"

}
catch {
    Write-Host "`n!!! TEST FAILED !!!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) { Write-Host "Details: $($_.ErrorDetails)" -ForegroundColor Red }
    exit 1
}
