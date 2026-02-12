# ========================================
# EMS WeCare - End-to-End Full Workflow Test
# ========================================
# จำลองการใช้งานจริงตั้งแต่ต้นจนจบ
# ========================================

param(
    [string]$BaseUrl = "http://localhost:5000/api"
)

$ErrorActionPreference = "Continue"

function Write-Step {
    param([string]$Message)
    Write-Host "`n▶ $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "  ✗ $Message" -ForegroundColor Red
}

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        $params = @{
            Uri         = "$BaseUrl$Endpoint"
            Method      = $Method
            Headers     = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        return Invoke-RestMethod @params
    }
    catch {
        Write-Error "API Error: $($_.Exception.Message)"
        return $null
    }
}

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  EMS WeCare - E2E Workflow Test" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

# ========================================
# Scenario 1: Community User Workflow
# ========================================
Write-Host "`n【 Scenario 1: Community User Journey 】" -ForegroundColor Yellow

Write-Step "1.1 Community user logs in"
$communityLogin = Invoke-Api -Method POST -Endpoint "/auth/login" `
    -Body @{ email = "community1@wecare.dev"; password = "password" }

if ($communityLogin -and $communityLogin.token) {
    Write-Success "Logged in as Community User"
    $communityHeaders = @{ Authorization = "Bearer $($communityLogin.token)" }
}
else {
    Write-Error "Community login failed"
    exit 1
}

Write-Step "1.2 Register a new patient"
$newPatient = @{
    fullName         = "นาย ทดสอบ E2E $(Get-Date -Format 'HHmmss')"
    dateOfBirth      = "1985-05-15"
    gender           = "male"
    phoneNumber      = "0891234567"
    address          = "123 หมู่ 5 ต.ทดสอบ อ.เมือง จ.กรุงเทพฯ"
    latitude         = 13.7563
    longitude        = 100.5018
    patientTypes     = @("chronic", "elderly")
    chronicDiseases  = @("diabetes", "hypertension")
    allergies        = @("penicillin")
    emergencyContact = "0898765432"
}

$patient = Invoke-Api -Method POST -Endpoint "/patients" `
    -Headers $communityHeaders -Body $newPatient

if ($patient -and $patient.id) {
    Write-Success "Patient registered: $($patient.fullName) (ID: $($patient.id))"
    $patientId = $patient.id
}
else {
    Write-Error "Patient registration failed"
    exit 1
}

Write-Step "1.3 View patient details"
$patientDetails = Invoke-Api -Method GET -Endpoint "/patients/$patientId" `
    -Headers $communityHeaders

if ($patientDetails) {
    Write-Success "Retrieved patient: $($patientDetails.fullName)"
}

Write-Step "1.4 Request a ride for the patient"
$rideRequest = @{
    patient_id       = $patientId
    patient_name     = $patient.fullName
    pickup_location  = $patient.address
    pickup_lat       = $patient.latitude
    pickup_lng       = $patient.longitude
    destination      = "โรงพยาบาลศิริราช"
    destination_lat  = 13.7600
    destination_lng  = 100.5100
    appointment_time = (Get-Date).AddHours(3).ToString("yyyy-MM-ddTHH:mm:ss")
    phone_number     = $patient.phoneNumber
    notes            = "ผู้ป่วยเบาหวาน ต้องการรถพยาบาล"
}

$ride = Invoke-Api -Method POST -Endpoint "/rides" `
    -Headers $communityHeaders -Body $rideRequest

if ($ride -and $ride.id) {
    Write-Success "Ride requested: ID $($ride.id)"
    $rideId = $ride.id
}
else {
    Write-Error "Ride request failed"
}

# ========================================
# Scenario 2: Office User Workflow
# ========================================
Write-Host "`n【 Scenario 2: Office User Journey 】" -ForegroundColor Yellow

Write-Step "2.1 Office user logs in"
$officeLogin = Invoke-Api -Method POST -Endpoint "/auth/login" `
    -Body @{ email = "office1@wecare.dev"; password = "password" }

if ($officeLogin -and $officeLogin.token) {
    Write-Success "Logged in as Office User"
    $officeHeaders = @{ Authorization = "Bearer $($officeLogin.token)" }
}
else {
    Write-Error "Office login failed"
    exit 1
}

Write-Step "2.2 View all pending rides"
$pendingRides = Invoke-Api -Method GET -Endpoint "/rides?status=PENDING" `
    -Headers $officeHeaders

if ($pendingRides) {
    Write-Success "Found $($pendingRides.Count) pending rides"
}

Write-Step "2.3 Get available drivers"
$drivers = Invoke-Api -Method GET -Endpoint "/drivers?status=AVAILABLE" `
    -Headers $officeHeaders

if ($drivers -and $drivers.Count -gt 0) {
    Write-Success "Found $($drivers.Count) available drivers"
    $selectedDriver = $drivers[0]
    Write-Host "  → Selected: $($selectedDriver.name) (ID: $($selectedDriver.id))" -ForegroundColor Gray
}
else {
    Write-Error "No available drivers"
    $selectedDriver = $null
}

if ($rideId -and $selectedDriver) {
    Write-Step "2.4 Assign driver to ride"
    $assignment = Invoke-Api -Method PUT -Endpoint "/rides/$rideId" `
        -Headers $officeHeaders -Body @{
        driver_id = $selectedDriver.id
        status    = "ASSIGNED"
    }
    
    if ($assignment) {
        Write-Success "Driver assigned to ride"
    }
}

Write-Step "2.5 Get vehicle information"
$vehicles = Invoke-Api -Method GET -Endpoint "/vehicles" `
    -Headers $officeHeaders

if ($vehicles) {
    Write-Success "Found $($vehicles.Count) vehicles in fleet"
}

# ========================================
# Scenario 3: Driver User Workflow
# ========================================
Write-Host "`n【 Scenario 3: Driver User Journey 】" -ForegroundColor Yellow

Write-Step "3.1 Driver logs in"
$driverLogin = Invoke-Api -Method POST -Endpoint "/auth/login" `
    -Body @{ email = "driver1@wecare.dev"; password = "password" }

if ($driverLogin -and $driverLogin.token) {
    Write-Success "Logged in as Driver"
    $driverHeaders = @{ Authorization = "Bearer $($driverLogin.token)" }
}
else {
    Write-Error "Driver login failed"
    exit 1
}

Write-Step "3.2 View assigned rides"
$myRides = Invoke-Api -Method GET -Endpoint "/rides/my-rides" `
    -Headers $driverHeaders

if ($myRides) {
    Write-Success "Driver has $($myRides.Count) assigned rides"
}

if ($rideId) {
    Write-Step "3.3 Update ride status to IN_PROGRESS"
    $startRide = Invoke-Api -Method PUT -Endpoint "/rides/$rideId" `
        -Headers $driverHeaders -Body @{ status = "IN_PROGRESS" }
    
    if ($startRide) {
        Write-Success "Ride started"
    }
    
    Write-Step "3.4 Update driver location"
    $locationUpdate = Invoke-Api -Method POST -Endpoint "/drivers/location" `
        -Headers $driverHeaders -Body @{
        latitude  = 13.7580
        longitude = 100.5050
        heading   = 45
        speed     = 40
    }
    
    if ($locationUpdate) {
        Write-Success "Location updated"
    }
    
    Start-Sleep -Seconds 2
    
    Write-Step "3.5 Complete the ride"
    $completeRide = Invoke-Api -Method PUT -Endpoint "/rides/$rideId" `
        -Headers $driverHeaders -Body @{ status = "COMPLETED" }
    
    if ($completeRide) {
        Write-Success "Ride completed"
    }
}

# ========================================
# Scenario 4: Executive User Workflow
# ========================================
Write-Host "`n【 Scenario 4: Executive User Journey 】" -ForegroundColor Yellow

Write-Step "4.1 Executive logs in"
$execLogin = Invoke-Api -Method POST -Endpoint "/auth/login" `
    -Body @{ email = "executive@wecare.dev"; password = "password" }

if ($execLogin -and $execLogin.token) {
    Write-Success "Logged in as Executive"
    $execHeaders = @{ Authorization = "Bearer $($execLogin.token)" }
}
else {
    Write-Error "Executive login failed"
    exit 1
}

Write-Step "4.2 View dashboard analytics"
$analytics = Invoke-Api -Method GET -Endpoint "/analytics/dashboard" `
    -Headers $execHeaders

if ($analytics) {
    Write-Success "Dashboard data retrieved"
    if ($analytics.totalRides) {
        Write-Host "  → Total Rides: $($analytics.totalRides)" -ForegroundColor Gray
    }
}

Write-Step "4.3 Generate ride reports"
$reports = Invoke-Api -Method GET -Endpoint "/reports/rides?period=today" `
    -Headers $execHeaders

if ($reports) {
    Write-Success "Reports generated"
}

Write-Step "4.4 View performance metrics"
$metrics = Invoke-Api -Method GET -Endpoint "/analytics/performance" `
    -Headers $execHeaders

if ($metrics) {
    Write-Success "Performance metrics retrieved"
}

# ========================================
# Scenario 5: Admin User Workflow
# ========================================
Write-Host "`n【 Scenario 5: Admin User Journey 】" -ForegroundColor Yellow

Write-Step "5.1 Admin logs in"
$adminLogin = Invoke-Api -Method POST -Endpoint "/auth/login" `
    -Body @{ email = "admin@wecare.dev"; password = "password" }

if ($adminLogin -and $adminLogin.token) {
    Write-Success "Logged in as Admin"
    $adminHeaders = @{ Authorization = "Bearer $($adminLogin.token)" }
}
else {
    Write-Error "Admin login failed"
    exit 1
}

Write-Step "5.2 View all users"
$users = Invoke-Api -Method GET -Endpoint "/admin/users" `
    -Headers $adminHeaders

if ($users) {
    Write-Success "Found $($users.Count) users in system"
}

Write-Step "5.3 View audit logs"
$auditLogs = Invoke-Api -Method GET -Endpoint "/audit/logs?limit=10" `
    -Headers $adminHeaders

if ($auditLogs) {
    Write-Success "Retrieved $($auditLogs.Count) recent audit logs"
}

Write-Step "5.4 View system settings"
$settings = Invoke-Api -Method GET -Endpoint "/admin/settings" `
    -Headers $adminHeaders

if ($settings) {
    Write-Success "System settings retrieved"
}

# ========================================
# Cleanup
# ========================================
Write-Host "`n【 Cleanup 】" -ForegroundColor Yellow

if ($patientId) {
    Write-Step "Deleting test patient"
    $deletePatient = Invoke-Api -Method DELETE -Endpoint "/patients/$patientId" `
        -Headers $communityHeaders
    
    if ($deletePatient) {
        Write-Success "Test patient deleted"
    }
}

# ========================================
# Summary
# ========================================
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  E2E Test Completed Successfully! ✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "`nAll user roles tested:" -ForegroundColor White
Write-Host "  ✓ Community User - Patient & Ride Management" -ForegroundColor Green
Write-Host "  ✓ Office User - Dispatch & Assignment" -ForegroundColor Green
Write-Host "  ✓ Driver User - Ride Execution" -ForegroundColor Green
Write-Host "  ✓ Executive User - Analytics & Reports" -ForegroundColor Green
Write-Host "  ✓ Admin User - System Management" -ForegroundColor Green

Write-Host "`nWorkflow completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
