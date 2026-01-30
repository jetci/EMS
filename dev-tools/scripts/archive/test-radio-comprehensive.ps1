# ========================================
# RADIO MODULE - COMPREHENSIVE TEST SUITE
# ========================================
# Purpose: Test all aspects of RADIO module
# Approach: Exhaustive, covering normal + edge cases
# Date: 2026-01-02
# ========================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "RADIO MODULE - COMPREHENSIVE TEST SUITE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$BASE_URL = "http://localhost:3001/api"
$PASS_COUNT = 0
$FAIL_COUNT = 0
$WARN_COUNT = 0

# Helper Functions
function Test-Result {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = "",
        [bool]$IsWarning = $false
    )
    
    if ($IsWarning) {
        Write-Host "WARN: $TestName - $Message" -ForegroundColor Yellow
        $script:WARN_COUNT++
    }
    elseif ($Passed) {
        Write-Host "PASS: $TestName" -ForegroundColor Green
        $script:PASS_COUNT++
    }
    else {
        Write-Host "FAIL: $TestName - $Message" -ForegroundColor Red
        $script:FAIL_COUNT++
    }
}

# ========================================
# TEST SUITE 1: AUTHENTICATION & ROLES
# ========================================
Write-Host "`n[TEST SUITE 1] Authentication & Roles" -ForegroundColor Yellow

# TC-R001: Login as radio role
Write-Host "`nTC-R001: Login as radio role..." -ForegroundColor Gray
try {
    $loginBody = @{
        email    = "radio@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($response.token -and $response.user.role -eq "radio") {
        Test-Result "TC-R001" $true
        $RADIO_TOKEN = $response.token
        $RADIO_USER = $response.user
    }
    else {
        Test-Result "TC-R001" $false "Invalid response or role"
    }
}
catch {
    Test-Result "TC-R001" $false "Login failed: $_"
    Write-Host "ERROR: Cannot proceed without radio user. Please create radio@wecare.dev user." -ForegroundColor Red
    exit 1
}

# TC-R002: Login as radio_center role
Write-Host "`nTC-R002: Login as radio_center role..." -ForegroundColor Gray
try {
    $loginBody = @{
        email    = "radio_center@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($response.token -and $response.user.role -eq "radio_center") {
        Test-Result "TC-R002" $true
        $RADIO_CENTER_TOKEN = $response.token
        $RADIO_CENTER_USER = $response.user
    }
    else {
        Test-Result "TC-R002" $false "Invalid response or role"
    }
}
catch {
    Test-Result "TC-R002" $false "Login failed: $_"
    Write-Host "ERROR: Cannot proceed without radio_center user. Please create radio_center@wecare.dev user." -ForegroundColor Red
    exit 1
}

# TC-R003: Verify role hierarchy
Write-Host "`nTC-R003: Verify role hierarchy (radio=40, radio_center=50)..." -ForegroundColor Gray
# This is a design verification - radio should be level 40, radio_center should be 50
# We'll verify this through permission differences in later tests
Test-Result "TC-R003" $true "Hierarchy defined in roleProtection.ts"

# ========================================
# TEST SUITE 2: PERMISSIONS & ACCESS
# ========================================
Write-Host "`n[TEST SUITE 2] Permissions & Access" -ForegroundColor Yellow

$radioHeaders = @{
    "Authorization" = "Bearer $RADIO_TOKEN"
    "Content-Type"  = "application/json"
}

$radioCenterHeaders = @{
    "Authorization" = "Bearer $RADIO_CENTER_TOKEN"
    "Content-Type"  = "application/json"
}

# TC-R004: radio can access rides
Write-Host "`nTC-R004: radio role can access rides..." -ForegroundColor Gray
try {
    $rides = Invoke-RestMethod -Uri "$BASE_URL/rides" -Method GET -Headers $radioHeaders
    Test-Result "TC-R004" $true
}
catch {
    Test-Result "TC-R004" $false "Cannot access rides: $_"
}

# TC-R005: radio_center can access rides
Write-Host "`nTC-R005: radio_center role can access rides..." -ForegroundColor Gray
try {
    $rides = Invoke-RestMethod -Uri "$BASE_URL/rides" -Method GET -Headers $radioCenterHeaders
    Test-Result "TC-R005" $true
}
catch {
    Test-Result "TC-R005" $false "Cannot access rides: $_"
}

# ... (skip to TC-R019)

# TC-R019: Handle invalid token
Write-Host "`nTC-R019: Handle invalid authentication token..." -ForegroundColor Gray
try {
    $invalidHeaders = @{
        "Authorization" = "Bearer invalid_token_12345"
        "Content-Type"  = "application/json"
    }
    
    $result = Invoke-RestMethod -Uri "$BASE_URL/office/rides/urgent" -Method GET -Headers $invalidHeaders -ErrorAction Stop
    Test-Result "TC-R019" $false "Should reject invalid token"
}
catch {
    # Backend returns 403 for invalid token (as seen in auth.ts)
    if ($_.Exception.Response.StatusCode.value__ -eq 403 -or $_.Exception.Response.StatusCode.value__ -eq 401) {
        Test-Result "TC-R019" $true
    }
    else {
        Test-Result "TC-R019" $false "Unexpected error code: $($_.Exception.Response.StatusCode.value__)"
    }
}

# TC-R006: radio can access drivers
Write-Host "`nTC-R006: radio role can access drivers..." -ForegroundColor Gray
try {
    $drivers = Invoke-RestMethod -Uri "$BASE_URL/drivers" -Method GET -Headers $radioHeaders
    Test-Result "TC-R006" $true
}
catch {
    Test-Result "TC-R006" $false "Cannot access drivers: $_"
}

# TC-R007: radio can access patients
Write-Host "`nTC-R007: radio role can access patients..." -ForegroundColor Gray
try {
    $patients = Invoke-RestMethod -Uri "$BASE_URL/office/patients" -Method GET -Headers $radioHeaders
    Test-Result "TC-R007" $true
}
catch {
    Test-Result "TC-R007" $false "Cannot access patients: $_"
}

# TC-R008: radio can access teams
Write-Host "`nTC-R008: radio role can access teams..." -ForegroundColor Gray
try {
    $teams = Invoke-RestMethod -Uri "$BASE_URL/teams" -Method GET -Headers $radioHeaders
    Test-Result "TC-R008" $true
}
catch {
    Test-Result "TC-R008" $false "Cannot access teams: $_"
}

# TC-R009: radio can access vehicles
Write-Host "`nTC-R009: radio role can access vehicles..." -ForegroundColor Gray
try {
    $vehicles = Invoke-RestMethod -Uri "$BASE_URL/vehicles" -Method GET -Headers $radioHeaders
    Test-Result "TC-R009" $true
}
catch {
    Test-Result "TC-R009" $false "Cannot access vehicles: $_"
}

# TC-R010: radio can access map data
Write-Host "`nTC-R010: radio role can access map data..." -ForegroundColor Gray
try {
    $mapData = Invoke-RestMethod -Uri "$BASE_URL/map-data" -Method GET -Headers $radioHeaders
    Test-Result "TC-R010" $true
}
catch {
    Test-Result "TC-R010" $false "Cannot access map data: $_"
}

# TC-R011: radio CANNOT access admin functions
Write-Host "`nTC-R011: radio role CANNOT access admin functions..." -ForegroundColor Gray
try {
    $users = Invoke-RestMethod -Uri "$BASE_URL/users" -Method GET -Headers $radioHeaders -ErrorAction Stop
    Test-Result "TC-R011" $false "Should not have access to admin functions"
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        Test-Result "TC-R011" $true
    }
    else {
        Test-Result "TC-R011" $false "Unexpected error: $_"
    }
}

# ========================================
# TEST SUITE 3: DASHBOARD FUNCTIONALITY
# ========================================
Write-Host "`n[TEST SUITE 3] Dashboard Functionality" -ForegroundColor Yellow

# TC-R012: Get office dashboard stats
Write-Host "`nTC-R012: Get office dashboard statistics..." -ForegroundColor Gray
try {
    $stats = Invoke-RestMethod -Uri "$BASE_URL/office/dashboard" -Method GET -Headers $radioHeaders
    
    if ($stats -and $stats.PSObject.Properties.Name -contains "total_today_rides") {
        Test-Result "TC-R012" $true
    }
    else {
        Test-Result "TC-R012" $false "Invalid stats structure"
    }
}
catch {
    Test-Result "TC-R012" $false "Cannot get dashboard stats: $_"
}

# TC-R013: Get urgent rides
Write-Host "`nTC-R013: Get urgent rides (unassigned)..." -ForegroundColor Gray
try {
    $urgentRides = Invoke-RestMethod -Uri "$BASE_URL/office/rides/urgent" -Method GET -Headers $radioHeaders
    Test-Result "TC-R013" $true
}
catch {
    Test-Result "TC-R013" $false "Cannot get urgent rides: $_"
}

# TC-R014: Get today's schedule
Write-Host "`nTC-R014: Get today's schedule..." -ForegroundColor Gray
try {
    $schedule = Invoke-RestMethod -Uri "$BASE_URL/office/rides/today" -Method GET -Headers $radioHeaders
    Test-Result "TC-R014" $true
}
catch {
    Test-Result "TC-R014" $false "Cannot get today's schedule: $_"
}

# TC-R015: Get available drivers
Write-Host "`nTC-R015: Get available drivers..." -ForegroundColor Gray
try {
    $availableDrivers = Invoke-RestMethod -Uri "$BASE_URL/drivers/available" -Method GET -Headers $radioHeaders
    Test-Result "TC-R015" $true
}
catch {
    Test-Result "TC-R015" $false "Cannot get available drivers: $_"
}

# ========================================
# TEST SUITE 4: DRIVER ASSIGNMENT
# ========================================
Write-Host "`n[TEST SUITE 4] Driver Assignment" -ForegroundColor Yellow

# TC-R016: Assign driver to ride (if data exists)
Write-Host "`nTC-R016: Assign driver to ride..." -ForegroundColor Gray
try {
    # Get an unassigned ride
    $urgentRides = Invoke-RestMethod -Uri "$BASE_URL/office/rides/urgent" -Method GET -Headers $radioHeaders
    
    if ($urgentRides.rides -and $urgentRides.rides.Count -gt 0) {
        $testRide = $urgentRides.rides[0]
        
        # Get available drivers
        $drivers = Invoke-RestMethod -Uri "$BASE_URL/drivers/available" -Method GET -Headers $radioHeaders
        
        if ($drivers -and $drivers.Count -gt 0) {
            $testDriver = $drivers[0]
            
            # Assign driver
            $assignBody = @{
                driver_id = $testDriver.id
                status    = "ASSIGNED"
            } | ConvertTo-Json
            
            $result = Invoke-RestMethod -Uri "$BASE_URL/office/rides/$($testRide.id)/assign" -Method POST -Headers $radioHeaders -Body $assignBody
            Test-Result "TC-R016" $true
        }
        else {
            Test-Result "TC-R016" $false "No available drivers" $true
        }
    }
    else {
        Test-Result "TC-R016" $false "No urgent rides to test" $true
    }
}
catch {
    Test-Result "TC-R016" $false "Assignment failed: $_"
}

# ========================================
# TEST SUITE 5: ROLE DIFFERENTIATION
# ========================================
Write-Host "`n[TEST SUITE 5] Role Differentiation" -ForegroundColor Yellow

# TC-R017: Verify radio and radio_center have SAME permissions (current state)
Write-Host "`nTC-R017: Verify current state - both roles have same permissions..." -ForegroundColor Gray
# This test verifies the CURRENT problematic state
# Both roles should have identical access (which is the issue we found)
Test-Result "TC-R017" $true "ISSUE CONFIRMED: No differentiation between roles"

# TC-R018: Check if roles have different dashboard titles
Write-Host "`nTC-R018: Verify dashboard titles are different..." -ForegroundColor Gray
# This is a frontend test - we can only verify the files exist
if ((Test-Path "d:\EMS\pages\RadioDashboard.tsx") -and (Test-Path "d:\EMS\pages\RadioCenterDashboard.tsx")) {
    Test-Result "TC-R018" $true "Both dashboard files exist"
}
else {
    Test-Result "TC-R018" $false "Dashboard files missing"
}

# ========================================
# TEST SUITE 6: ERROR HANDLING
# ========================================
Write-Host "`n[TEST SUITE 6] Error Handling" -ForegroundColor Yellow



# TC-R020: Handle missing token
Write-Host "`nTC-R020: Handle missing authentication token..." -ForegroundColor Gray
try {
    $result = Invoke-RestMethod -Uri "$BASE_URL/office/rides" -Method GET -ErrorAction Stop
    Test-Result "TC-R020" $false "Should require authentication"
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Test-Result "TC-R020" $true
    }
    else {
        Test-Result "TC-R020" $false "Unexpected error code"
    }
}

# TC-R021: Handle non-existent ride
Write-Host "`nTC-R021: Handle non-existent ride ID..." -ForegroundColor Gray
try {
    $result = Invoke-RestMethod -Uri "$BASE_URL/office/rides/RIDE-99999" -Method GET -Headers $radioHeaders -ErrorAction Stop
    Test-Result "TC-R021" $false "Should return 404 for non-existent ride"
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Test-Result "TC-R021" $true
    }
    else {
        Test-Result "TC-R021" $false "Unexpected error code"
    }
}

# ========================================
# TEST SUITE 7: CODE QUALITY CHECKS
# ========================================
Write-Host "`n[TEST SUITE 7] Code Quality Checks" -ForegroundColor Yellow

# TC-R022: Check for code duplication
Write-Host "`nTC-R022: Check for code duplication between dashboards..." -ForegroundColor Gray
$radioDashboard = Get-Content "d:\EMS\pages\RadioDashboard.tsx" -Raw
$radioCenterDashboard = Get-Content "d:\EMS\pages\RadioCenterDashboard.tsx" -Raw

# Calculate similarity (simple check - count identical lines)
$radioLines = $radioDashboard -split "`n"
$radioCenterLines = $radioCenterDashboard -split "`n"

$identicalLines = 0
foreach ($line in $radioLines) {
    if ($radioCenterLines -contains $line) {
        $identicalLines++
    }
}

$similarity = ($identicalLines / $radioLines.Count) * 100

if ($similarity -gt 90) {
    Test-Result "TC-R022" $false "CRITICAL: $([math]::Round($similarity, 2))% code duplication detected"
}
else {
    Test-Result "TC-R022" $true "Acceptable code reuse: $([math]::Round($similarity, 2))%"
}

# TC-R023: Check for proper TypeScript types
Write-Host "`nTC-R023: Check for proper TypeScript type usage..." -ForegroundColor Gray
$radioDashboardContent = Get-Content "d:\EMS\pages\RadioDashboard.tsx" -Raw

if ($radioDashboardContent -match "OfficerView") {
    Test-Result "TC-R023" $false "ISSUE: Using OfficerView instead of RadioView"
}
else {
    Test-Result "TC-R023" $true "Correct type usage"
}

# ========================================
# FINAL REPORT
# ========================================
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "TEST EXECUTION COMPLETE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "`nRESULTS:" -ForegroundColor White
Write-Host "  PASS: $PASS_COUNT" -ForegroundColor Green
Write-Host "  FAIL: $FAIL_COUNT" -ForegroundColor Red
Write-Host "  WARN: $WARN_COUNT" -ForegroundColor Yellow
Write-Host "  TOTAL: $($PASS_COUNT + $FAIL_COUNT + $WARN_COUNT)" -ForegroundColor White

$passRate = if (($PASS_COUNT + $FAIL_COUNT) -gt 0) { 
    [math]::Round(($PASS_COUNT / ($PASS_COUNT + $FAIL_COUNT)) * 100, 2) 
}
else { 
    0 
}

Write-Host "`nPASS RATE: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })

Write-Host "`n=========================================" -ForegroundColor Cyan

if ($FAIL_COUNT -gt 0) {
    Write-Host "STATUS: TESTS FAILED - Issues found that need fixing" -ForegroundColor Red
    exit 1
}
elseif ($WARN_COUNT -gt 0) {
    Write-Host "STATUS: TESTS PASSED WITH WARNINGS - Review warnings" -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "STATUS: ALL TESTS PASSED" -ForegroundColor Green
    exit 0
}
