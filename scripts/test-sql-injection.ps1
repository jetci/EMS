# ========================================
# Test Script: RISK-003 - SQL Injection
# ========================================
# วัตถุประสงค์: ทดสอบว่าระบบป้องกัน SQL Injection ได้

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RISK-003: SQL Injection Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001/api"
$testResults = @()

# ========================================
# Test 1: SQL Injection ใน Login
# ========================================
Write-Host "Test 1: SQL Injection in Login" -ForegroundColor Cyan

$sqlInjectionPayloads = @(
    "admin@wecare.dev' OR '1'='1",
    "admin@wecare.dev' OR '1'='1' --",
    "admin@wecare.dev'; DROP TABLE users; --",
    "' OR 1=1 --",
    "admin' --",
    "' OR 'a'='a"
)

foreach ($payload in $sqlInjectionPayloads) {
    Write-Host "  Testing payload: $payload" -ForegroundColor Gray
    
    try {
        $body = @{
            email    = $payload
            password = "anything"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        # ถ้า Login สำเร็จ = SQL Injection ทำงาน!
        Write-Host "  ❌ FAIL: SQL Injection successful! Got token: $($response.token)" -ForegroundColor Red
        $testResults += @{ Test = "Login SQL Injection"; Payload = $payload; Status = "FAIL" }
        
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 400 -or $statusCode -eq 401) {
            Write-Host "  ✅ PASS: SQL Injection blocked (Status: $statusCode)" -ForegroundColor Green
            $testResults += @{ Test = "Login SQL Injection"; Payload = $payload; Status = "PASS" }
        }
        else {
            Write-Host "  ⚠️  WARNING: Unexpected status code: $statusCode" -ForegroundColor Yellow
            $testResults += @{ Test = "Login SQL Injection"; Payload = $payload; Status = "WARNING" }
        }
    }
}

Write-Host ""

# ========================================
# Test 2: SQL Injection ใน Patient Registration
# ========================================
Write-Host "Test 2: SQL Injection in Patient Registration" -ForegroundColor Cyan

# Login as Community User
try {
    $loginBody = @{
        email    = "community1@wecare.dev"
        password = "password"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"
    
    $token = $loginResponse.token
    Write-Host "  ✅ Logged in as Community User" -ForegroundColor Green
    
}
catch {
    Write-Host "  ❌ FATAL: Cannot login" -ForegroundColor Red
    exit 1
}

$sqlPayloads = @(
    "'; DROP TABLE patients; --",
    "' OR '1'='1",
    "<script>alert('XSS')</script>",
    "../../../etc/passwd",
    "'; DELETE FROM patients WHERE '1'='1"
)

foreach ($payload in $sqlPayloads) {
    Write-Host "  Testing payload in fullName: $payload" -ForegroundColor Gray
    
    try {
        $body = @{
            fullName     = $payload
            nationalId   = "1234567890123"
            contactPhone = "0812345678"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/patients" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -Headers @{ Authorization = "Bearer $token" } `
            -ErrorAction Stop
        
        # ถ้าสร้างสำเร็จ ต้องตรวจสอบว่า Payload ถูก Sanitize หรือไม่
        if ($response.fullName -eq $payload) {
            Write-Host "  ⚠️  WARNING: Payload accepted without sanitization" -ForegroundColor Yellow
            $testResults += @{ Test = "Patient SQL Injection"; Payload = $payload; Status = "WARNING" }
        }
        else {
            Write-Host "  ✅ PASS: Payload sanitized or rejected" -ForegroundColor Green
            $testResults += @{ Test = "Patient SQL Injection"; Payload = $payload; Status = "PASS" }
        }
        
        # Cleanup
        if ($response.id) {
            Invoke-RestMethod -Uri "$baseUrl/patients/$($response.id)" `
                -Method DELETE `
                -Headers @{ Authorization = "Bearer $token" } `
                -ErrorAction SilentlyContinue | Out-Null
        }
        
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 400) {
            Write-Host "  ✅ PASS: Validation blocked malicious input (Status: 400)" -ForegroundColor Green
            $testResults += @{ Test = "Patient SQL Injection"; Payload = $payload; Status = "PASS" }
        }
        else {
            Write-Host "  ⚠️  WARNING: Unexpected status code: $statusCode" -ForegroundColor Yellow
            $testResults += @{ Test = "Patient SQL Injection"; Payload = $payload; Status = "WARNING" }
        }
    }
}

Write-Host ""

# ========================================
# Test 3: Whitelist Characters Test
# ========================================
Write-Host "Test 3: Whitelist Characters Test" -ForegroundColor Cyan

$dangerousChars = @(
    @{ Name = "landmark"; Value = "'; DROP TABLE patients; --" },
    @{ Name = "landmark"; Value = "<script>alert('XSS')</script>" },
    @{ Name = "landmark"; Value = "../../../etc/passwd" },
    @{ Name = "landmark"; Value = "' OR '1'='1" }
)

foreach ($test in $dangerousChars) {
    Write-Host "  Testing $($test.Name) with: $($test.Value)" -ForegroundColor Gray
    
    try {
        $body = @{
            fullName     = "Test Patient"
            nationalId   = "1234567890123"
            contactPhone = "0812345678"
            landmark     = $test.Value
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/patients" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -Headers @{ Authorization = "Bearer $token" } `
            -ErrorAction Stop
        
        Write-Host "  ⚠️  WARNING: Dangerous characters accepted" -ForegroundColor Yellow
        $testResults += @{ Test = "Whitelist Test"; Field = $test.Name; Status = "WARNING" }
        
        # Cleanup
        if ($response.id) {
            Invoke-RestMethod -Uri "$baseUrl/patients/$($response.id)" `
                -Method DELETE `
                -Headers @{ Authorization = "Bearer $token" } `
                -ErrorAction SilentlyContinue | Out-Null
        }
        
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 400) {
            Write-Host "  ✅ PASS: Whitelist validation blocked dangerous characters" -ForegroundColor Green
            $testResults += @{ Test = "Whitelist Test"; Field = $test.Name; Status = "PASS" }
        }
        else {
            Write-Host "  ⚠️  WARNING: Unexpected status code: $statusCode" -ForegroundColor Yellow
            $testResults += @{ Test = "Whitelist Test"; Field = $test.Name; Status = "WARNING" }
        }
    }
}

Write-Host ""

# ========================================
# Test 4: Parameterized Query Verification
# ========================================
Write-Host "Test 4: Parameterized Query Verification" -ForegroundColor Cyan

# ทดสอบว่า Query ใช้ Parameterized Queries จริงหรือไม่
# โดยพยายาม Inject ใน ID parameter

$maliciousIds = @(
    "PAT-001' OR '1'='1",
    "PAT-001; DROP TABLE patients; --",
    "PAT-001' UNION SELECT * FROM users --"
)

foreach ($id in $maliciousIds) {
    Write-Host "  Testing GET /api/patients/$id" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/patients/$id" `
            -Method GET `
            -Headers @{ Authorization = "Bearer $token" } `
            -ErrorAction Stop
        
        Write-Host "  ⚠️  WARNING: Query executed (might be vulnerable)" -ForegroundColor Yellow
        $testResults += @{ Test = "Parameterized Query"; ID = $id; Status = "WARNING" }
        
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 404) {
            Write-Host "  ✅ PASS: Parameterized query protected (404 Not Found)" -ForegroundColor Green
            $testResults += @{ Test = "Parameterized Query"; ID = $id; Status = "PASS" }
        }
        else {
            Write-Host "  ⚠️  WARNING: Unexpected status code: $statusCode" -ForegroundColor Yellow
            $testResults += @{ Test = "Parameterized Query"; ID = $id; Status = "WARNING" }
        }
    }
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
$warnings = ($testResults | Where-Object { $_.Status -eq "WARNING" }).Count
$total = $testResults.Count

Write-Host ""
Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host "⚠️  Warnings: $warnings" -ForegroundColor Yellow
Write-Host ""

if ($failed -gt 0) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ RISK-003: SQL INJECTION VULNERABLE!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  CRITICAL: System is vulnerable to SQL Injection attacks!" -ForegroundColor Red
    Write-Host "Action Required: Fix SQL queries immediately!" -ForegroundColor Red
    exit 1
}
elseif ($warnings -gt 0) {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "⚠️  RISK-003: SQL INJECTION - WARNINGS FOUND" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Recommendation: Review warnings and improve validation" -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ RISK-003: SQL INJECTION PROTECTED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    exit 0
}
