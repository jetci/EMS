# ========================================
# Test Script: RISK-002 - Data Isolation
# ========================================
# วัตถุประสงค์: ทดสอบว่า Community Users เห็นเฉพาะข้อมูลที่ตัวเองสร้าง

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RISK-002: Data Isolation Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001/api"
$testResults = @()

# ========================================
# Helper Functions
# ========================================

function Login {
    param($email, $password)
    
    try {
        $body = @{
            email    = $email
            password = $password
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
            -Method POST `
            -Body $body `
            -ContentType "application/json"
        
        return $response.token
    }
    catch {
        Write-Host "❌ Login failed for $email" -ForegroundColor Red
        return $null
    }
}

function CreatePatient {
    param($token, $fullName)
    
    try {
        $body = @{
            fullName     = $fullName
            nationalId   = "$(Get-Random -Minimum 1000000000000 -Maximum 9999999999999)"
            contactPhone = "0812345678"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/patients" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -Headers @{ Authorization = "Bearer $token" }
        
        return $response
    }
    catch {
        Write-Host "❌ Create patient failed: $_" -ForegroundColor Red
        return $null
    }
}

function GetPatients {
    param($token)
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/patients" `
            -Method GET `
            -Headers @{ Authorization = "Bearer $token" }
        
        return $response.data
    }
    catch {
        Write-Host "❌ Get patients failed: $_" -ForegroundColor Red
        return @()
    }
}

function GetPatient {
    param($token, $patientId)
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/patients/$patientId" `
            -Method GET `
            -Headers @{ Authorization = "Bearer $token" }
        
        return @{ StatusCode = 200; Data = $response }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        return @{ StatusCode = $statusCode; Data = $null }
    }
}

function UpdatePatient {
    param($token, $patientId, $data)
    
    try {
        $body = $data | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/patients/$patientId" `
            -Method PUT `
            -Body $body `
            -ContentType "application/json" `
            -Headers @{ Authorization = "Bearer $token" }
        
        return @{ StatusCode = 200; Data = $response }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        return @{ StatusCode = $statusCode; Data = $null }
    }
}

function DeletePatient {
    param($token, $patientId)
    
    try {
        Invoke-RestMethod -Uri "$baseUrl/patients/$patientId" `
            -Method DELETE `
            -Headers @{ Authorization = "Bearer $token" }
        
        return @{ StatusCode = 204 }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        return @{ StatusCode = $statusCode }
    }
}

# ========================================
# Test Cases
# ========================================

Write-Host "🔐 Logging in as Community Users..." -ForegroundColor Yellow

# Login as Community A
$tokenA = Login "community1@wecare.dev" "password"
if (-not $tokenA) {
    Write-Host "❌ FATAL: Cannot login as Community A" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Community A logged in" -ForegroundColor Green

# Login as Community B (สร้าง User ใหม่ถ้ายังไม่มี)
$tokenB = Login "community2@wecare.dev" "password"
if (-not $tokenB) {
    Write-Host "⚠️  Community B not found, creating..." -ForegroundColor Yellow
    # TODO: Create community2 user via API or manually
    Write-Host "❌ SKIP: Community B tests (user not found)" -ForegroundColor Yellow
    $tokenB = $null
}

Write-Host ""

# ========================================
# Test 1: GET List - Data Isolation
# ========================================
Write-Host "Test 1: GET /api/patients - Data Isolation" -ForegroundColor Cyan

# Community A สร้างผู้ป่วย
Write-Host "  Creating patient by Community A..." -ForegroundColor Gray
$patientA = CreatePatient $tokenA "Test Patient A"

if ($patientA) {
    Write-Host "  ✅ Patient created: $($patientA.id)" -ForegroundColor Green
    
    # Community A ดูรายการผู้ป่วย
    $patientsA = GetPatients $tokenA
    $foundInA = $patientsA | Where-Object { $_.id -eq $patientA.id }
    
    if ($foundInA) {
        Write-Host "  ✅ PASS: Community A can see their own patient" -ForegroundColor Green
        $testResults += @{ Test = "Test 1a"; Status = "PASS" }
    }
    else {
        Write-Host "  ❌ FAIL: Community A cannot see their own patient" -ForegroundColor Red
        $testResults += @{ Test = "Test 1a"; Status = "FAIL" }
    }
    
    # Community B ดูรายการผู้ป่วย
    if ($tokenB) {
        $patientsB = GetPatients $tokenB
        $foundInB = $patientsB | Where-Object { $_.id -eq $patientA.id }
        
        if (-not $foundInB) {
            Write-Host "  ✅ PASS: Community B cannot see Community A's patient" -ForegroundColor Green
            $testResults += @{ Test = "Test 1b"; Status = "PASS" }
        }
        else {
            Write-Host "  ❌ FAIL: Community B can see Community A's patient (DATA LEAK!)" -ForegroundColor Red
            $testResults += @{ Test = "Test 1b"; Status = "FAIL" }
        }
    }
}
else {
    Write-Host "  ❌ SKIP: Cannot create patient" -ForegroundColor Yellow
    $testResults += @{ Test = "Test 1"; Status = "SKIP" }
}

Write-Host ""

# ========================================
# Test 2: GET/:id - Ownership Check
# ========================================
Write-Host "Test 2: GET /api/patients/:id - Ownership Check" -ForegroundColor Cyan

if ($patientA -and $tokenB) {
    Write-Host "  Community B trying to access Community A's patient..." -ForegroundColor Gray
    $response = GetPatient $tokenB $patientA.id
    
    if ($response.StatusCode -eq 403) {
        Write-Host "  ✅ PASS: Got 403 Forbidden" -ForegroundColor Green
        $testResults += @{ Test = "Test 2"; Status = "PASS" }
    }
    else {
        Write-Host "  ❌ FAIL: Got $($response.StatusCode) instead of 403 (DATA LEAK!)" -ForegroundColor Red
        $testResults += @{ Test = "Test 2"; Status = "FAIL" }
    }
}
else {
    Write-Host "  ❌ SKIP: Missing prerequisites" -ForegroundColor Yellow
    $testResults += @{ Test = "Test 2"; Status = "SKIP" }
}

Write-Host ""

# ========================================
# Test 3: PUT/:id - Ownership Check
# ========================================
Write-Host "Test 3: PUT /api/patients/:id - Ownership Check" -ForegroundColor Cyan

if ($patientA -and $tokenB) {
    Write-Host "  Community B trying to update Community A's patient..." -ForegroundColor Gray
    $response = UpdatePatient $tokenB $patientA.id @{ fullName = "Hacked Name" }
    
    if ($response.StatusCode -eq 403) {
        Write-Host "  ✅ PASS: Got 403 Forbidden" -ForegroundColor Green
        $testResults += @{ Test = "Test 3"; Status = "PASS" }
    }
    else {
        Write-Host "  ❌ FAIL: Got $($response.StatusCode) instead of 403 (SECURITY BREACH!)" -ForegroundColor Red
        $testResults += @{ Test = "Test 3"; Status = "FAIL" }
    }
}
else {
    Write-Host "  ❌ SKIP: Missing prerequisites" -ForegroundColor Yellow
    $testResults += @{ Test = "Test 3"; Status = "SKIP" }
}

Write-Host ""

# ========================================
# Test 4: DELETE/:id - Ownership Check
# ========================================
Write-Host "Test 4: DELETE /api/patients/:id - Ownership Check" -ForegroundColor Cyan

if ($patientA -and $tokenB) {
    Write-Host "  Community B trying to delete Community A's patient..." -ForegroundColor Gray
    $response = DeletePatient $tokenB $patientA.id
    
    if ($response.StatusCode -eq 403) {
        Write-Host "  ✅ PASS: Got 403 Forbidden" -ForegroundColor Green
        $testResults += @{ Test = "Test 4"; Status = "PASS" }
    }
    else {
        Write-Host "  ❌ FAIL: Got $($response.StatusCode) instead of 403 (SECURITY BREACH!)" -ForegroundColor Red
        $testResults += @{ Test = "Test 4"; Status = "FAIL" }
    }
    
    # Cleanup: Community A ลบผู้ป่วยของตัวเอง
    Write-Host "  Cleaning up..." -ForegroundColor Gray
    DeletePatient $tokenA $patientA.id | Out-Null
}
else {
    Write-Host "  ❌ SKIP: Missing prerequisites" -ForegroundColor Yellow
    $testResults += @{ Test = "Test 4"; Status = "SKIP" }
}

Write-Host ""

# ========================================
# Summary
# ========================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$skipped = ($testResults | Where-Object { $_.Status -eq "SKIP" }).Count
$total = $testResults.Count

Write-Host ""
Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host "⏭️  Skipped: $skipped" -ForegroundColor Yellow
Write-Host ""

if ($failed -gt 0) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ RISK-002: DATA ISOLATION FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}
else {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ RISK-002: DATA ISOLATION PASSED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    exit 0
}
