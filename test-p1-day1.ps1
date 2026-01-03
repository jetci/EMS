# ============================================================================
# EMS WeCare - P1 Day 1 Testing Script
# ============================================================================
# Tests: SEC-003 (CORS) + API-002 (Pagination)
# ============================================================================

param(
    [string]$BaseUrl = "http://localhost:3001",
    [string]$Token = "",
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# Colors
$ColorReset = "`e[0m"
$ColorRed = "`e[91m"
$ColorGreen = "`e[92m"
$ColorYellow = "`e[93m"
$ColorBlue = "`e[94m"
$ColorCyan = "`e[96m"

# Test Results
$script:TotalTests = 0
$script:PassedTests = 0
$script:FailedTests = 0

# ============================================================================
# Helper Functions
# ============================================================================

function Write-Header {
    param([string]$Text)
    Write-Host "`n$ColorCyan═══════════════════════════════════════════════════════════════$ColorReset"
    Write-Host "$ColorCyan  $Text$ColorReset"
    Write-Host "$ColorCyan═══════════════════════════════════════════════════════════════$ColorReset`n"
}

function Write-TestStart {
    param([string]$TestName)
    Write-Host "$ColorBlue▶ Testing:$ColorReset $TestName" -NoNewline
    $script:TotalTests++
}

function Write-TestPass {
    param([string]$Message = "")
    Write-Host " $ColorGreen✓ PASS$ColorReset"
    if ($Message) { Write-Host "  $ColorGreen→ $Message$ColorReset" }
    $script:PassedTests++
}

function Write-TestFail {
    param([string]$Message)
    Write-Host " $ColorRed✗ FAIL$ColorReset"
    Write-Host "  $ColorRed→ $Message$ColorReset"
    $script:FailedTests++
}

function Invoke-ApiRequest {
    param(
        [string]$Method = "GET",
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [string]$Origin = $null
    )
    
    $uri = "$BaseUrl$Endpoint"
    $params = @{
        Uri         = $uri
        Method      = $Method
        Headers     = $Headers
        ContentType = "application/json"
    }
    
    if ($Origin) {
        $params.Headers["Origin"] = $Origin
    }
    
    try {
        $response = Invoke-WebRequest @params -UseBasicParsing
        return @{ 
            Success = $true
            StatusCode = $response.StatusCode
            Headers = $response.Headers
            Content = $response.Content | ConvertFrom-Json
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        return @{ 
            Success = $false
            StatusCode = $statusCode
            Error = $_.Exception.Message
        }
    }
}

# ============================================================================
# SEC-003: CORS Configuration Tests
# ============================================================================

Write-Header "SEC-003: CORS Configuration Tests"

# Test 1: Allowed origin (localhost:3000)
Write-TestStart "Allowed origin (localhost:3000)"
$result = Invoke-ApiRequest -Endpoint "/api/health" -Origin "http://localhost:3000"
if ($result.Success -and $result.Headers["Access-Control-Allow-Origin"] -eq "http://localhost:3000") {
    Write-TestPass "CORS headers present for allowed origin"
} else {
    Write-TestFail "Missing CORS headers for allowed origin"
}

# Test 2: Allowed origin (localhost:5173)
Write-TestStart "Allowed origin (localhost:5173)"
$result = Invoke-ApiRequest -Endpoint "/api/health" -Origin "http://localhost:5173"
if ($result.Success -and $result.Headers["Access-Control-Allow-Origin"] -eq "http://localhost:5173") {
    Write-TestPass "CORS headers present for Vite dev server"
} else {
    Write-TestFail "Missing CORS headers for Vite origin"
}

# Test 3: Unauthorized origin
Write-TestStart "Unauthorized origin (malicious-site.com)"
$result = Invoke-ApiRequest -Endpoint "/api/health" -Origin "http://malicious-site.com"
if ($result.Success -and -not $result.Headers.ContainsKey("Access-Control-Allow-Origin")) {
    Write-TestPass "No CORS headers for unauthorized origin"
} else {
    Write-TestFail "CORS headers present for unauthorized origin (security risk!)"
}

# Test 4: Preflight request
Write-TestStart "Preflight request (OPTIONS)"
try {
    $response = Invoke-WebRequest `
        -Uri "$BaseUrl/api/patients" `
        -Method OPTIONS `
        -Headers @{ "Origin" = "http://localhost:3000" } `
        -UseBasicParsing
    
    if ($response.StatusCode -eq 200 -and $response.Headers["Access-Control-Max-Age"]) {
        $maxAge = $response.Headers["Access-Control-Max-Age"]
        Write-TestPass "Preflight OK, Max-Age: $maxAge seconds"
    } else {
        Write-TestFail "Preflight failed or missing Max-Age header"
    }
} catch {
    Write-TestFail "Preflight request failed: $($_.Exception.Message)"
}

# Test 5: CORS credentials
Write-TestStart "CORS credentials header"
$result = Invoke-ApiRequest -Endpoint "/api/health" -Origin "http://localhost:3000"
if ($result.Headers["Access-Control-Allow-Credentials"] -eq "true") {
    Write-TestPass "Credentials allowed"
} else {
    Write-TestFail "Credentials not allowed"
}

# ============================================================================
# API-002: Pagination Tests
# ============================================================================

Write-Header "API-002: Pagination Tests"

# Get auth token if not provided
if (-not $Token) {
    Write-Host "$ColorYellow⚠ No token provided. Attempting to login...$ColorReset"
    try {
        $loginBody = @{
            email = "community1@wecare.dev"
            password = "password123"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod `
            -Uri "$BaseUrl/api/auth/login" `
            -Method POST `
            -Body $loginBody `
            -ContentType "application/json"
        
        $Token = $loginResponse.token
        Write-Host "$ColorGreen✓ Login successful$ColorReset"
    } catch {
        Write-Host "$ColorRed✗ Login failed. Please provide token manually.$ColorReset"
        Write-Host "Usage: .\test-p1-day1.ps1 -Token 'your-jwt-token'"
        exit 1
    }
}

$authHeaders = @{
    "Authorization" = "Bearer $Token"
    "Origin" = "http://localhost:3000"
}

# Test 6: Default pagination (patients)
Write-TestStart "Default pagination (patients)"
try {
    $response = Invoke-RestMethod `
        -Uri "$BaseUrl/api/patients" `
        -Method GET `
        -Headers $authHeaders
    
    if ($response.data -and $response.pagination) {
        $p = $response.pagination
        if ($p.page -eq 1 -and $p.limit -eq 20) {
            Write-TestPass "Default: page=1, limit=20, total=$($p.total)"
        } else {
            Write-TestFail "Incorrect defaults: page=$($p.page), limit=$($p.limit)"
        }
    } else {
        Write-TestFail "Missing 'data' or 'pagination' in response"
    }
} catch {
    Write-TestFail "Request failed: $($_.Exception.Message)"
}

# Test 7: Custom pagination (patients)
Write-TestStart "Custom pagination (page=2, limit=10)"
try {
    $response = Invoke-RestMethod `
        -Uri "$BaseUrl/api/patients?page=2&limit=10" `
        -Method GET `
        -Headers $authHeaders
    
    $p = $response.pagination
    if ($p.page -eq 2 -and $p.limit -eq 10) {
        Write-TestPass "Custom pagination working, data count: $($response.data.Count)"
    } else {
        Write-TestFail "Incorrect pagination: page=$($p.page), limit=$($p.limit)"
    }
} catch {
    Write-TestFail "Request failed: $($_.Exception.Message)"
}

# Test 8: Large limit (should cap at 100)
Write-TestStart "Large limit (limit=1000 → cap at 100)"
try {
    $response = Invoke-RestMethod `
        -Uri "$BaseUrl/api/patients?limit=1000" `
        -Method GET `
        -Headers $authHeaders
    
    $p = $response.pagination
    if ($p.limit -eq 100) {
        Write-TestPass "Limit capped at 100 (security)"
    } else {
        Write-TestFail "Limit not capped: $($p.limit)"
    }
} catch {
    Write-TestFail "Request failed: $($_.Exception.Message)"
}

# Test 9: Invalid page (should default to 1)
Write-TestStart "Invalid page (page=-1 → default to 1)"
try {
    $response = Invoke-RestMethod `
        -Uri "$BaseUrl/api/patients?page=-1" `
        -Method GET `
        -Headers $authHeaders
    
    $p = $response.pagination
    if ($p.page -eq 1) {
        Write-TestPass "Invalid page defaulted to 1"
    } else {
        Write-TestFail "Page not defaulted: $($p.page)"
    }
} catch {
    Write-TestFail "Request failed: $($_.Exception.Message)"
}

# Test 10: Pagination metadata
Write-TestStart "Pagination metadata completeness"
try {
    $response = Invoke-RestMethod `
        -Uri "$BaseUrl/api/patients" `
        -Method GET `
        -Headers $authHeaders
    
    $p = $response.pagination
    $requiredFields = @('page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev')
    $missingFields = $requiredFields | Where-Object { -not $p.PSObject.Properties.Name.Contains($_) }
    
    if ($missingFields.Count -eq 0) {
        Write-TestPass "All metadata fields present: $($requiredFields -join ', ')"
    } else {
        Write-TestFail "Missing fields: $($missingFields -join ', ')"
    }
} catch {
    Write-TestFail "Request failed: $($_.Exception.Message)"
}

# Test 11: hasNext and hasPrev flags
Write-TestStart "Navigation flags (hasNext, hasPrev)"
try {
    $response = Invoke-RestMethod `
        -Uri "$BaseUrl/api/patients?page=1&limit=5" `
        -Method GET `
        -Headers $authHeaders
    
    $p = $response.pagination
    if ($p.page -eq 1 -and $p.hasPrev -eq $false) {
        Write-TestPass "First page: hasPrev=false ✓"
    } else {
        Write-TestFail "First page: hasPrev should be false"
    }
    
    if ($p.total -gt $p.limit -and $p.hasNext -eq $true) {
        Write-TestPass "Has more pages: hasNext=true ✓"
    } elseif ($p.total -le $p.limit -and $p.hasNext -eq $false) {
        Write-TestPass "No more pages: hasNext=false ✓"
    }
} catch {
    Write-TestFail "Request failed: $($_.Exception.Message)"
}

# Test 12: Rides pagination
Write-TestStart "Rides pagination"
try {
    $response = Invoke-RestMethod `
        -Uri "$BaseUrl/api/rides?page=1&limit=10" `
        -Method GET `
        -Headers $authHeaders
    
    if ($response.data -and $response.pagination) {
        $p = $response.pagination
        Write-TestPass "Rides pagination working, total: $($p.total)"
    } else {
        Write-TestFail "Missing pagination in rides response"
    }
} catch {
    Write-TestFail "Request failed: $($_.Exception.Message)"
}

# Test 13: Response format structure
Write-TestStart "Response format structure"
try {
    $response = Invoke-RestMethod `
        -Uri "$BaseUrl/api/patients?limit=1" `
        -Method GET `
        -Headers $authHeaders
    
    $hasData = $response.PSObject.Properties.Name.Contains('data')
    $hasPagination = $response.PSObject.Properties.Name.Contains('pagination')
    $dataIsArray = $response.data -is [Array]
    
    if ($hasData -and $hasPagination -and $dataIsArray) {
        Write-TestPass "Response structure: { data: [], pagination: {} } ✓"
    } else {
        Write-TestFail "Incorrect response structure"
    }
} catch {
    Write-TestFail "Request failed: $($_.Exception.Message)"
}

# ============================================================================
# Performance Tests
# ============================================================================

Write-Header "Performance Tests"

# Test 14: Response time (small page)
Write-TestStart "Response time (limit=20)"
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-RestMethod `
        -Uri "$BaseUrl/api/patients?limit=20" `
        -Method GET `
        -Headers $authHeaders
    $stopwatch.Stop()
    
    $ms = $stopwatch.ElapsedMilliseconds
    if ($ms -lt 500) {
        Write-TestPass "Fast response: ${ms}ms ⚡"
    } elseif ($ms -lt 1000) {
        Write-TestPass "Good response: ${ms}ms"
    } else {
        Write-TestFail "Slow response: ${ms}ms"
    }
} catch {
    Write-TestFail "Request failed: $($_.Exception.Message)"
}

# Test 15: Response size
Write-TestStart "Response size (limit=20 vs limit=100)"
try {
    $response20 = Invoke-RestMethod `
        -Uri "$BaseUrl/api/patients?limit=20" `
        -Method GET `
        -Headers $authHeaders
    
    $response100 = Invoke-RestMethod `
        -Uri "$BaseUrl/api/patients?limit=100" `
        -Method GET `
        -Headers $authHeaders
    
    $size20 = ($response20 | ConvertTo-Json -Depth 10).Length
    $size100 = ($response100 | ConvertTo-Json -Depth 10).Length
    
    Write-TestPass "Size: 20 items = ${size20} bytes, 100 items = ${size100} bytes"
} catch {
    Write-TestFail "Request failed: $($_.Exception.Message)"
}

# ============================================================================
# Summary
# ============================================================================

Write-Header "Test Summary"

$passRate = if ($script:TotalTests -gt 0) { 
    [math]::Round(($script:PassedTests / $script:TotalTests) * 100, 1) 
} else { 
    0 
}

Write-Host "Total Tests:  $($script:TotalTests)"
Write-Host "Passed:       $ColorGreen$($script:PassedTests)$ColorReset"
Write-Host "Failed:       $ColorRed$($script:FailedTests)$ColorReset"
Write-Host "Pass Rate:    $passRate%"

if ($script:FailedTests -eq 0) {
    Write-Host "`n$ColorGreen✅ All tests passed! Day 1 is ready for production.$ColorReset`n"
    exit 0
} else {
    Write-Host "`n$ColorRed⚠️ Some tests failed. Please review the issues above.$ColorReset`n"
    exit 1
}
