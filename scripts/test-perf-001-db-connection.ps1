# PERF-001: Database Connection Pooling - Test Script
# Tests database performance optimizations and health monitoring

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:3001"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PERF-001: Database Performance Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalTests = 0
$passedTests = 0

# Test 1: Health Check Endpoint
Write-Host "📋 Test 1: Health Check Endpoint" -ForegroundColor Yellow
$totalTests++

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get -ErrorAction Stop
    
    if ($response.status -eq "healthy" -and $response.database.healthy) {
        Write-Host "✅ Health check passed" -ForegroundColor Green
        Write-Host "   Database: $($response.database.message)" -ForegroundColor Gray
        Write-Host "   WAL Mode: $($response.database.stats.walMode)" -ForegroundColor Gray
        Write-Host "   Cache Size: $($response.database.stats.cacheSize)" -ForegroundColor Gray
        $passedTests++
    }
    else {
        Write-Host "❌ Health check failed: $($response.database.message)" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Health check endpoint failed" -ForegroundColor Red
}
Write-Host ""

# Test 2: Database Stats
Write-Host "📋 Test 2: Database Stats Endpoint" -ForegroundColor Yellow
$totalTests++

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health/database" -Method Get -ErrorAction Stop
    
    if ($response.healthy) {
        Write-Host "✅ Database stats retrieved" -ForegroundColor Green
        Write-Host "   Connection Open: $($response.connection.isOpen)" -ForegroundColor Gray
        Write-Host "   In Transaction: $($response.connection.inTransaction)" -ForegroundColor Gray
        $passedTests++
    }
    else {
        Write-Host "❌ Database stats check failed" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Database stats endpoint failed" -ForegroundColor Red
}
Write-Host ""

# Test 3: Concurrent Query Performance
Write-Host "📋 Test 3: Concurrent Query Performance" -ForegroundColor Yellow
$totalTests++

Write-Host "Logging in..." -NoNewline
try {
    $loginBody = @{
        email    = "admin@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json" `
        -ErrorAction Stop

    $token = $loginResponse.token
    Write-Host " ✅" -ForegroundColor Green
}
catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "Cannot proceed with concurrent tests without authentication" -ForegroundColor Red
    $token = $null
}

if ($token) {
    Write-Host "Running 10 concurrent requests..." -NoNewline
    
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $jobs = @()
    $startTime = Get-Date
    
    # Launch 10 concurrent requests
    for ($i = 1; $i -le 10; $i++) {
        $jobs += Start-Job -ScriptBlock {
            param($url, $headers)
            try {
                $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers -ErrorAction Stop
                return @{ success = $true; count = $response.rides.Count }
            }
            catch {
                return @{ success = $false; error = $_.Exception.Message }
            }
        } -ArgumentList "$baseUrl/api/rides", $headers
    }
    
    # Wait for all jobs to complete
    $jobs | Wait-Job | Out-Null
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    
    # Check results
    $results = $jobs | Receive-Job
    $successCount = ($results | Where-Object { $_.success }).Count
    
    # Cleanup jobs
    $jobs | Remove-Job
    
    if ($successCount -eq 10) {
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "   All 10 requests succeeded" -ForegroundColor Gray
        Write-Host "   Total time: $([math]::Round($duration, 2))ms" -ForegroundColor Gray
        Write-Host "   Average: $([math]::Round($duration / 10, 2))ms per request" -ForegroundColor Gray
        $passedTests++
    }
    else {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "   Only $successCount/10 requests succeeded" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: Database Lock Handling
Write-Host "📋 Test 4: Database Lock Handling (Busy Timeout)" -ForegroundColor Yellow
$totalTests++

if ($token) {
    Write-Host "Testing busy timeout with concurrent writes..." -NoNewline
    
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $jobs = @()
    
    # Launch 5 concurrent write operations
    for ($i = 1; $i -le 5; $i++) {
        $jobs += Start-Job -ScriptBlock {
            param($url, $headers, $i)
            try {
                $body = @{
                    title    = "Test News $i - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
                    content  = "Testing concurrent writes"
                    category = "Test"
                    priority = "normal"
                } | ConvertTo-Json
                
                $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body -ContentType "application/json" -ErrorAction Stop
                return @{ success = $true }
            }
            catch {
                return @{ success = $false; error = $_.Exception.Message }
            }
        } -ArgumentList "$baseUrl/api/news", $headers, $i
    }
    
    # Wait for all jobs
    $jobs | Wait-Job | Out-Null
    $results = $jobs | Receive-Job
    $successCount = ($results | Where-Object { $_.success }).Count
    $jobs | Remove-Job
    
    if ($successCount -ge 4) {
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "   $successCount/5 concurrent writes succeeded (acceptable)" -ForegroundColor Gray
        $passedTests++
    }
    else {
        Write-Host " ⚠️" -ForegroundColor Yellow
        Write-Host "   Only $successCount/5 writes succeeded (may indicate lock issues)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 5: Memory Usage
Write-Host "📋 Test 5: Memory Usage Check" -ForegroundColor Yellow
$totalTests++

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get -ErrorAction Stop
    
    $heapUsed = [int]($response.memory.heapUsed -replace 'MB', '')
    $heapTotal = [int]($response.memory.heapTotal -replace 'MB', '')
    
    Write-Host "   Heap Used: $($response.memory.heapUsed)" -ForegroundColor Gray
    Write-Host "   Heap Total: $($response.memory.heapTotal)" -ForegroundColor Gray
    Write-Host "   RSS: $($response.memory.rss)" -ForegroundColor Gray
    
    if ($heapUsed -lt 200) {
        Write-Host "✅ Memory usage is acceptable" -ForegroundColor Green
        $passedTests++
    }
    else {
        Write-Host "⚠️  Memory usage is high" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Memory check failed" -ForegroundColor Red
}
Write-Host ""

# Test 6: WAL Mode Verification
Write-Host "📋 Test 6: WAL Mode Verification" -ForegroundColor Yellow
$totalTests++

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health/database" -Method Get -ErrorAction Stop
    
    if ($response.details.walMode -eq "wal") {
        Write-Host "✅ WAL mode is enabled" -ForegroundColor Green
        Write-Host "   Foreign Keys: $($response.details.foreignKeys)" -ForegroundColor Gray
        Write-Host "   Page Size: $($response.details.pageSize)" -ForegroundColor Gray
        $passedTests++
    }
    else {
        Write-Host "❌ WAL mode is not enabled (current: $($response.details.walMode))" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ WAL mode check failed" -ForegroundColor Red
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
    Write-Host "✅ PERF-001: FIXED - All tests passed!" -ForegroundColor Green
    Write-Host "Database connection is optimized with:" -ForegroundColor Green
    Write-Host "  - Persistent connection (no reconnection overhead)" -ForegroundColor Green
    Write-Host "  - WAL mode (concurrent reads)" -ForegroundColor Green
    Write-Host "  - Busy timeout (handles locks gracefully)" -ForegroundColor Green
    Write-Host "  - Optimized cache size (better performance)" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "❌ PERF-001: NEEDS REVIEW - Some tests failed" -ForegroundColor Red
    Write-Host "Please review the failed tests." -ForegroundColor Red
    exit 1
}
