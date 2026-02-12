# ========================================
# OFFICER MODULE - MANAGEMENT TEST SUITE
# ========================================
# Purpose: Verify OFFICER role functionality as "Management & Planning"
# Date: 2026-01-02
# ========================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "OFFICER MODULE - MANAGEMENT TEST SUITE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$BASE_URL = "http://localhost:3001/api"
$PASS_COUNT = 0
$FAIL_COUNT = 0

# Helper Functions
function Test-Result {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = ""
    )
    
    if ($Passed) {
        Write-Host "PASS: $TestName" -ForegroundColor Green
        $script:PASS_COUNT++
    }
    else {
        Write-Host "FAIL: $TestName - $Message" -ForegroundColor Red
        $script:FAIL_COUNT++
    }
}

# ========================================
# TEST SUITE 1: AUTHENTICATION
# ========================================
Write-Host "`n[TEST SUITE 1] Authentication" -ForegroundColor Yellow

# TC-O001: Login as OFFICER
Write-Host "`nTC-O001: Login as OFFICER..." -ForegroundColor Gray
try {
    # Using admin@wecare.dev as it has OFFICER privileges
    $loginBody = @{
        email    = "admin@wecare.dev" 
        password = "password"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($response.token) {
        Test-Result "TC-O001" $true
        $TOKEN = $response.token
    }
    else {
        Test-Result "TC-O001" $false "Login failed"
    }
}
catch {
    Test-Result "TC-O001" $false "Login failed: $_"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# ========================================
# TEST SUITE 2: DASHBOARD RESOURCES
# ========================================
Write-Host "`n[TEST SUITE 2] Dashboard Resources (Management View)" -ForegroundColor Yellow

# TC-O002: Get Dashboard Stats
Write-Host "`nTC-O002: Get Dashboard Stats..." -ForegroundColor Gray
try {
    $stats = Invoke-RestMethod -Uri "$BASE_URL/office/dashboard" -Method GET -Headers $headers
    if ($stats.total_patients -ne $null) {
        Test-Result "TC-O002" $true
    }
    else {
        Test-Result "TC-O002" $false "Invalid stats structure"
    }
}
catch {
    Test-Result "TC-O002" $false "Cannot get dashboard stats: $_"
}

# TC-O003: Get Vehicles (For Status Table)
Write-Host "`nTC-O003: Get Vehicles..." -ForegroundColor Gray
try {
    $vehicles = Invoke-RestMethod -Uri "$BASE_URL/vehicles" -Method GET -Headers $headers
    if ($vehicles -is [Array]) {
        Test-Result "TC-O003" $true "Found $($vehicles.Count) vehicles"
    }
    else {
        Test-Result "TC-O003" $false "Invalid vehicles response"
    }
}
catch {
    Test-Result "TC-O003" $false "Cannot get vehicles: $_"
}

# TC-O004: Get News (For Announcements)
Write-Host "`nTC-O004: Get News..." -ForegroundColor Gray
try {
    $news = Invoke-RestMethod -Uri "$BASE_URL/news" -Method GET -Headers $headers
    if ($news -is [Array]) {
        Test-Result "TC-O004" $true "Found $($news.Count) news items"
    }
    else {
        Test-Result "TC-O004" $false "Invalid news response"
    }
}
catch {
    Test-Result "TC-O004" $false "Cannot get news: $_"
}

# ========================================
# TEST SUITE 3: MANAGEMENT CAPABILITIES
# ========================================
Write-Host "`n[TEST SUITE 3] Management Capabilities" -ForegroundColor Yellow

# TC-O005: Access Drivers Management
Write-Host "`nTC-O005: Access Drivers Management..." -ForegroundColor Gray
try {
    $drivers = Invoke-RestMethod -Uri "$BASE_URL/drivers" -Method GET -Headers $headers
    Test-Result "TC-O005" $true
}
catch {
    Test-Result "TC-O005" $false "Cannot access drivers: $_"
}

# TC-O006: Access Patients Management
Write-Host "`nTC-O006: Access Patients Management..." -ForegroundColor Gray
try {
    $patients = Invoke-RestMethod -Uri "$BASE_URL/office/patients" -Method GET -Headers $headers
    Test-Result "TC-O006" $true
}
catch {
    Test-Result "TC-O006" $false "Cannot access patients: $_"
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

if ($FAIL_COUNT -eq 0) {
    Write-Host "`nSTATUS: ALL TESTS PASSED" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`nSTATUS: TESTS FAILED" -ForegroundColor Red
    exit 1
}
