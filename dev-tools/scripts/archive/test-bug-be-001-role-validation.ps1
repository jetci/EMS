# BUG-BE-001: Role Validation at Router Level - Manual Test Script
# This script tests role-based access control for all sensitive endpoints

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:3001"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BUG-BE-001: Role Validation Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test user credentials (from wecare-backend/db/data/users.json)
$testUsers = @{
    developer   = @{ email = "jetci.jm@gmail.com"; password = "g0KEk,^],k;yo"; expectedRole = "DEVELOPER" }
    admin       = @{ email = "admin@wecare.dev"; password = "password"; expectedRole = "admin" }
    officer     = @{ email = "officer1@wecare.dev"; password = "password"; expectedRole = "OFFICER" }
    radioCenter = @{ email = "office1@wecare.dev"; password = "password"; expectedRole = "radio_center" }
    driver      = @{ email = "driver1@wecare.dev"; password = "password"; expectedRole = "driver" }
    community   = @{ email = "community1@wecare.dev"; password = "password"; expectedRole = "community" }
    executive   = @{ email = "executive1@wecare.dev"; password = "password"; expectedRole = "EXECUTIVE" }
}

# Function to login and get token
function Get-AuthToken {
    param([string]$email, [string]$password)
    
    try {
        $loginBody = @{
            email    = $email
            password = $password
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
            -Method Post `
            -Body $loginBody `
            -ContentType "application/json" `
            -ErrorAction Stop

        return $response.token
    }
    catch {
        Write-Host "❌ Login failed for $email" -ForegroundColor Red
        return $null
    }
}

# Function to test endpoint access
function Test-EndpointAccess {
    param(
        [string]$endpoint,
        [string]$token,
        [string]$role,
        [bool]$shouldSucceed
    )

    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }

        $response = Invoke-WebRequest -Uri "$baseUrl$endpoint" `
            -Method Get `
            -Headers $headers `
            -ErrorAction Stop

        if ($shouldSucceed) {
            Write-Host "✅ $role can access $endpoint (Expected: ALLOW)" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "❌ $role can access $endpoint (Expected: DENY)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if (-not $shouldSucceed -and ($statusCode -eq 403 -or $statusCode -eq 401)) {
            Write-Host "✅ $role denied access to $endpoint (Expected: DENY)" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "❌ $role got unexpected response for $endpoint (Status: $statusCode)" -ForegroundColor Red
            return $false
        }
    }
}

# Login all users and get tokens
Write-Host "🔐 Logging in test users..." -ForegroundColor Yellow
Write-Host ""

$tokens = @{}
foreach ($userKey in $testUsers.Keys) {
    $user = $testUsers[$userKey]
    Write-Host "Logging in as $($user.expectedRole)..." -NoNewline
    $token = Get-AuthToken -email $user.email -password $user.password
    if ($token) {
        $tokens[$userKey] = $token
        Write-Host " ✅" -ForegroundColor Green
    }
    else {
        Write-Host " ❌" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Endpoint Access Control" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalTests = 0
$passedTests = 0

# Test 1: Patient Routes (/api/patients)
Write-Host "📋 Test 1: Patient Routes (/api/patients)" -ForegroundColor Yellow
$tests = @(
    @{ role = "admin"; shouldSucceed = $true },
    @{ role = "developer"; shouldSucceed = $true },
    @{ role = "officer"; shouldSucceed = $true },
    @{ role = "radioCenter"; shouldSucceed = $true },
    @{ role = "community"; shouldSucceed = $true },
    @{ role = "executive"; shouldSucceed = $true },
    @{ role = "driver"; shouldSucceed = $false }
)

foreach ($test in $tests) {
    $totalTests++
    if (Test-EndpointAccess -endpoint "/api/patients" -token $tokens[$test.role] -role $test.role -shouldSucceed $test.shouldSucceed) {
        $passedTests++
    }
}
Write-Host ""

# Test 2: User Management Routes (/api/users)
Write-Host "👥 Test 2: User Management Routes (/api/users)" -ForegroundColor Yellow
$tests = @(
    @{ role = "admin"; shouldSucceed = $true },
    @{ role = "developer"; shouldSucceed = $true },
    @{ role = "officer"; shouldSucceed = $false },
    @{ role = "community"; shouldSucceed = $false },
    @{ role = "driver"; shouldSucceed = $false }
)

foreach ($test in $tests) {
    $totalTests++
    if (Test-EndpointAccess -endpoint "/api/users" -token $tokens[$test.role] -role $test.role -shouldSucceed $test.shouldSucceed) {
        $passedTests++
    }
}
Write-Host ""

# Test 3: Audit Logs Routes (/api/audit-logs)
Write-Host "📊 Test 3: Audit Logs Routes (/api/audit-logs)" -ForegroundColor Yellow
$tests = @(
    @{ role = "admin"; shouldSucceed = $true },
    @{ role = "developer"; shouldSucceed = $true },
    @{ role = "executive"; shouldSucceed = $true },
    @{ role = "officer"; shouldSucceed = $false },
    @{ role = "community"; shouldSucceed = $false }
)

foreach ($test in $tests) {
    $totalTests++
    if (Test-EndpointAccess -endpoint "/api/audit-logs" -token $tokens[$test.role] -role $test.role -shouldSucceed $test.shouldSucceed) {
        $passedTests++
    }
}
Write-Host ""

# Test 4: Driver Routes (/api/drivers)
Write-Host "🚗 Test 4: Driver Routes (/api/drivers)" -ForegroundColor Yellow
$tests = @(
    @{ role = "admin"; shouldSucceed = $true },
    @{ role = "developer"; shouldSucceed = $true },
    @{ role = "officer"; shouldSucceed = $true },
    @{ role = "driver"; shouldSucceed = $true },
    @{ role = "community"; shouldSucceed = $false }
)

foreach ($test in $tests) {
    $totalTests++
    if (Test-EndpointAccess -endpoint "/api/drivers" -token $tokens[$test.role] -role $test.role -shouldSucceed $test.shouldSucceed) {
        $passedTests++
    }
}
Write-Host ""

# Test 5: Ride Routes (/api/rides)
Write-Host "🚑 Test 5: Ride Routes (/api/rides)" -ForegroundColor Yellow
$tests = @(
    @{ role = "admin"; shouldSucceed = $true },
    @{ role = "developer"; shouldSucceed = $true },
    @{ role = "officer"; shouldSucceed = $true },
    @{ role = "driver"; shouldSucceed = $true },
    @{ role = "community"; shouldSucceed = $true },
    @{ role = "executive"; shouldSucceed = $true }
)

foreach ($test in $tests) {
    $totalTests++
    if (Test-EndpointAccess -endpoint "/api/rides" -token $tokens[$test.role] -role $test.role -shouldSucceed $test.shouldSucceed) {
        $passedTests++
    }
}
Write-Host ""

# Test 6: Unauthenticated Access
Write-Host "🔒 Test 6: Unauthenticated Access" -ForegroundColor Yellow
$totalTests++
try {
    Invoke-WebRequest -Uri "$baseUrl/api/patients" -Method Get -ErrorAction Stop
    Write-Host "❌ Unauthenticated access allowed (Expected: DENY)" -ForegroundColor Red
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✅ Unauthenticated access denied (Expected: DENY)" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "❌ Unexpected status code: $statusCode" -ForegroundColor Red
    }
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red
Write-Host ""

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })
Write-Host ""

if ($passedTests -eq $totalTests) {
    Write-Host "✅ BUG-BE-001: FIXED - All tests passed!" -ForegroundColor Green
    Write-Host "Role-based access control is working correctly at router level." -ForegroundColor Green
    exit 0
}
else {
    Write-Host "❌ BUG-BE-001: NOT FIXED - Some tests failed" -ForegroundColor Red
    Write-Host "Please review the failed tests and fix the role protection middleware." -ForegroundColor Red
    exit 1
}
