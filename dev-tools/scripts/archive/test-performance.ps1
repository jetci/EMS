# ========================================
# EMS WeCare - Performance & Load Test
# ========================================
# ทดสอบประสิทธิภาพและความสามารถรับโหลด
# ========================================

param(
    [string]$BaseUrl = "http://localhost:5000/api",
    [int]$ConcurrentUsers = 10,
    [int]$RequestsPerUser = 5,
    [switch]$DetailedOutput
)

$script:TotalRequests = 0
$script:SuccessRequests = 0
$script:FailedRequests = 0
$script:ResponseTimes = @()
$script:Errors = @()

function Write-Header {
    param([string]$Title)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Measure-ApiCall {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [string]$TestName = "API Call"
    )
    
    $script:TotalRequests++
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $params = @{
            Uri         = "$BaseUrl$Endpoint"
            Method      = $Method
            Headers     = $Headers
            ContentType = "application/json"
            TimeoutSec  = 30
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        $stopwatch.Stop()
        
        $script:SuccessRequests++
        $script:ResponseTimes += $stopwatch.ElapsedMilliseconds
        
        if ($DetailedOutput) {
            Write-Host "  ✓ $TestName - ${Method} ${Endpoint} - $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Green
        }
        
        return @{
            Success      = $true
            Data         = $response
            ResponseTime = $stopwatch.ElapsedMilliseconds
        }
    }
    catch {
        $stopwatch.Stop()
        $script:FailedRequests++
        $script:Errors += @{
            TestName = $TestName
            Endpoint = $Endpoint
            Error    = $_.Exception.Message
            Time     = Get-Date
        }
        
        if ($DetailedOutput) {
            Write-Host "  ✗ $TestName - ${Method} ${Endpoint} - Failed" -ForegroundColor Red
        }
        
        return @{
            Success      = $false
            Error        = $_.Exception.Message
            ResponseTime = $stopwatch.ElapsedMilliseconds
        }
    }
}

function Get-AuthToken {
    param([string]$Email, [string]$Password)
    
    $result = Measure-ApiCall -Method POST -Endpoint "/auth/login" `
        -Body @{ email = $Email; password = $Password } `
        -TestName "Login"
    
    if ($result.Success) {
        return $result.Data.token
    }
    return $null
}

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  EMS WeCare - Performance Test" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Configuration:" -ForegroundColor White
Write-Host "  Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host "  Concurrent Users: $ConcurrentUsers" -ForegroundColor Gray
Write-Host "  Requests per User: $RequestsPerUser" -ForegroundColor Gray
Write-Host "  Total Expected Requests: $($ConcurrentUsers * $RequestsPerUser)" -ForegroundColor Gray

# ========================================
# Test 1: Single User Baseline
# ========================================
Write-Header "Test 1: Single User Baseline Performance"

$token = Get-AuthToken -Email "office1@wecare.dev" -Password "password"

if ($token) {
    $headers = @{ Authorization = "Bearer $token" }
    
    Write-Host "Running baseline tests..." -ForegroundColor Yellow
    
    # Test various endpoints
    Measure-ApiCall -Method GET -Endpoint "/patients" -Headers $headers -TestName "List Patients" | Out-Null
    Measure-ApiCall -Method GET -Endpoint "/rides" -Headers $headers -TestName "List Rides" | Out-Null
    Measure-ApiCall -Method GET -Endpoint "/drivers" -Headers $headers -TestName "List Drivers" | Out-Null
    Measure-ApiCall -Method GET -Endpoint "/vehicles" -Headers $headers -TestName "List Vehicles" | Out-Null
    
    $baselineAvg = ($script:ResponseTimes | Measure-Object -Average).Average
    Write-Host "`nBaseline Average Response Time: $([math]::Round($baselineAvg, 2))ms" -ForegroundColor Cyan
}

# ========================================
# Test 2: Concurrent User Load Test
# ========================================
Write-Header "Test 2: Concurrent User Load Test"

$script:ResponseTimes = @()
$script:TotalRequests = 0
$script:SuccessRequests = 0
$script:FailedRequests = 0

Write-Host "Simulating $ConcurrentUsers concurrent users..." -ForegroundColor Yellow

$jobs = @()
$startTime = Get-Date

for ($i = 1; $i -le $ConcurrentUsers; $i++) {
    $job = Start-Job -ScriptBlock {
        param($BaseUrl, $RequestsPerUser, $UserId)
        
        function Invoke-TestApi {
            param($Method, $Endpoint, $Headers, $Body)
            try {
                $params = @{
                    Uri         = "$BaseUrl$Endpoint"
                    Method      = $Method
                    Headers     = $Headers
                    ContentType = "application/json"
                    TimeoutSec  = 30
                }
                if ($Body) { $params.Body = ($Body | ConvertTo-Json -Depth 10) }
                
                $sw = [System.Diagnostics.Stopwatch]::StartNew()
                $response = Invoke-RestMethod @params
                $sw.Stop()
                
                return @{ Success = $true; Time = $sw.ElapsedMilliseconds }
            }
            catch {
                return @{ Success = $false; Error = $_.Exception.Message }
            }
        }
        
        # Login
        $loginResult = Invoke-TestApi -Method POST -Endpoint "/auth/login" `
            -Body @{ email = "office1@wecare.dev"; password = "password" }
        
        if (-not $loginResult.Success) {
            return @{ UserId = $UserId; Results = @(); Error = "Login failed" }
        }
        
        $token = (Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post `
                -Body (@{ email = "office1@wecare.dev"; password = "password" } | ConvertTo-Json) `
                -ContentType "application/json").token
        
        $headers = @{ Authorization = "Bearer $token" }
        $results = @()
        
        # Perform requests
        for ($j = 1; $j -le $RequestsPerUser; $j++) {
            $endpoints = @("/patients", "/rides", "/drivers", "/vehicles")
            $endpoint = $endpoints[($j % $endpoints.Length)]
            
            $result = Invoke-TestApi -Method GET -Endpoint $endpoint -Headers $headers
            $results += $result
            
            Start-Sleep -Milliseconds (Get-Random -Minimum 100 -Maximum 500)
        }
        
        return @{ UserId = $UserId; Results = $results }
        
    } -ArgumentList $BaseUrl, $RequestsPerUser, $i
    
    $jobs += $job
}

Write-Host "Waiting for all jobs to complete..." -ForegroundColor Yellow
$jobResults = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job

$endTime = Get-Date
$totalDuration = ($endTime - $startTime).TotalSeconds

# Analyze results
$allResults = @()
$successCount = 0
$failCount = 0

foreach ($jobResult in $jobResults) {
    foreach ($result in $jobResult.Results) {
        $allResults += $result
        if ($result.Success) {
            $successCount++
            $script:ResponseTimes += $result.Time
        }
        else {
            $failCount++
        }
    }
}

Write-Host "`nLoad Test Results:" -ForegroundColor Cyan
Write-Host "  Total Duration: $([math]::Round($totalDuration, 2))s" -ForegroundColor White
Write-Host "  Total Requests: $($allResults.Count)" -ForegroundColor White
Write-Host "  Successful: $successCount" -ForegroundColor Green
Write-Host "  Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "  Requests/Second: $([math]::Round($allResults.Count / $totalDuration, 2))" -ForegroundColor Cyan

# ========================================
# Test 3: Response Time Analysis
# ========================================
Write-Header "Test 3: Response Time Analysis"

if ($script:ResponseTimes.Count -gt 0) {
    $stats = $script:ResponseTimes | Measure-Object -Average -Minimum -Maximum
    $sorted = $script:ResponseTimes | Sort-Object
    $p50 = $sorted[[math]::Floor($sorted.Count * 0.5)]
    $p95 = $sorted[[math]::Floor($sorted.Count * 0.95)]
    $p99 = $sorted[[math]::Floor($sorted.Count * 0.99)]
    
    Write-Host "Response Time Statistics:" -ForegroundColor White
    Write-Host "  Average: $([math]::Round($stats.Average, 2))ms" -ForegroundColor Cyan
    Write-Host "  Minimum: $($stats.Minimum)ms" -ForegroundColor Green
    Write-Host "  Maximum: $($stats.Maximum)ms" -ForegroundColor Yellow
    Write-Host "  Median (P50): ${p50}ms" -ForegroundColor Cyan
    Write-Host "  P95: ${p95}ms" -ForegroundColor Cyan
    Write-Host "  P99: ${p99}ms" -ForegroundColor Cyan
    
    # Performance Rating
    $avgTime = $stats.Average
    $rating = if ($avgTime -lt 100) { "Excellent ⭐⭐⭐⭐⭐" }
    elseif ($avgTime -lt 300) { "Good ⭐⭐⭐⭐" }
    elseif ($avgTime -lt 500) { "Fair ⭐⭐⭐" }
    elseif ($avgTime -lt 1000) { "Poor ⭐⭐" }
    else { "Very Poor ⭐" }
    
    Write-Host "`nPerformance Rating: $rating" -ForegroundColor $(
        if ($avgTime -lt 100) { "Green" }
        elseif ($avgTime -lt 500) { "Yellow" }
        else { "Red" }
    )
}

# ========================================
# Test 4: Stress Test - Create/Delete Operations
# ========================================
Write-Header "Test 4: Stress Test - CRUD Operations"

$token = Get-AuthToken -Email "community1@wecare.dev" -Password "password"

if ($token) {
    $headers = @{ Authorization = "Bearer $token" }
    
    Write-Host "Creating and deleting patients rapidly..." -ForegroundColor Yellow
    
    $createdPatients = @()
    $createTimes = @()
    $deleteTimes = @()
    
    # Create multiple patients
    for ($i = 1; $i -le 10; $i++) {
        $result = Measure-ApiCall -Method POST -Endpoint "/patients" `
            -Headers $headers `
            -Body @{
            fullName    = "Stress Test Patient $i"
            dateOfBirth = "1990-01-01"
            gender      = "male"
            phoneNumber = "08$(Get-Random -Minimum 10000000 -Maximum 99999999)"
            address     = "Test Address $i"
        } `
            -TestName "Create Patient $i"
        
        if ($result.Success) {
            $createdPatients += $result.Data.id
            $createTimes += $result.ResponseTime
        }
    }
    
    # Delete all created patients
    foreach ($patientId in $createdPatients) {
        $result = Measure-ApiCall -Method DELETE -Endpoint "/patients/$patientId" `
            -Headers $headers `
            -TestName "Delete Patient"
        
        if ($result.Success) {
            $deleteTimes += $result.ResponseTime
        }
    }
    
    Write-Host "`nCRUD Performance:" -ForegroundColor Cyan
    if ($createTimes.Count -gt 0) {
        Write-Host "  Average Create Time: $([math]::Round(($createTimes | Measure-Object -Average).Average, 2))ms" -ForegroundColor White
    }
    if ($deleteTimes.Count -gt 0) {
        Write-Host "  Average Delete Time: $([math]::Round(($deleteTimes | Measure-Object -Average).Average, 2))ms" -ForegroundColor White
    }
}

# ========================================
# Test 5: Database Query Performance
# ========================================
Write-Header "Test 5: Database Query Performance"

$token = Get-AuthToken -Email "office1@wecare.dev" -Password "password"

if ($token) {
    $headers = @{ Authorization = "Bearer $token" }
    
    Write-Host "Testing various query patterns..." -ForegroundColor Yellow
    
    # Test different query types
    $queries = @(
        @{ Name = "All Patients"; Endpoint = "/patients" }
        @{ Name = "All Rides"; Endpoint = "/rides" }
        @{ Name = "All Drivers"; Endpoint = "/drivers" }
        @{ Name = "Pending Rides"; Endpoint = "/rides?status=PENDING" }
        @{ Name = "Available Drivers"; Endpoint = "/drivers?status=AVAILABLE" }
    )
    
    foreach ($query in $queries) {
        $result = Measure-ApiCall -Method GET -Endpoint $query.Endpoint `
            -Headers $headers -TestName $query.Name
        
        if ($result.Success) {
            Write-Host "  ✓ $($query.Name): $($result.ResponseTime)ms" -ForegroundColor Green
        }
    }
}

# ========================================
# Summary Report
# ========================================
Write-Header "Performance Test Summary"

$totalTests = $script:TotalRequests
$successRate = if ($totalTests -gt 0) { 
    [math]::Round(($script:SuccessRequests / $totalTests) * 100, 2) 
}
else { 0 }

Write-Host "Overall Statistics:" -ForegroundColor White
Write-Host "  Total Requests: $totalTests" -ForegroundColor Cyan
Write-Host "  Successful: $script:SuccessRequests ($successRate%)" -ForegroundColor Green
Write-Host "  Failed: $script:FailedRequests" -ForegroundColor $(if ($script:FailedRequests -gt 0) { "Red" } else { "Green" })

if ($script:ResponseTimes.Count -gt 0) {
    $overallAvg = ($script:ResponseTimes | Measure-Object -Average).Average
    Write-Host "  Average Response Time: $([math]::Round($overallAvg, 2))ms" -ForegroundColor Cyan
}

# Error Summary
if ($script:Errors.Count -gt 0) {
    Write-Host "`nErrors Encountered:" -ForegroundColor Red
    $script:Errors | ForEach-Object {
        Write-Host "  • $($_.TestName): $($_.Error)" -ForegroundColor Yellow
    }
}

# Recommendations
Write-Host "`nRecommendations:" -ForegroundColor Cyan
if ($overallAvg -lt 200) {
    Write-Host "  ✓ Performance is excellent. System is ready for production." -ForegroundColor Green
}
elseif ($overallAvg -lt 500) {
    Write-Host "  ⚠ Performance is acceptable but could be improved." -ForegroundColor Yellow
    Write-Host "    - Consider database indexing" -ForegroundColor Gray
    Write-Host "    - Review slow queries" -ForegroundColor Gray
}
else {
    Write-Host "  ✗ Performance needs improvement." -ForegroundColor Red
    Write-Host "    - Optimize database queries" -ForegroundColor Gray
    Write-Host "    - Add caching layer" -ForegroundColor Gray
    Write-Host "    - Review API response sizes" -ForegroundColor Gray
}

# Save detailed report
$reportPath = "d:\EMS\performance-test-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$report = @{
    Timestamp     = Get-Date
    Configuration = @{
        BaseUrl         = $BaseUrl
        ConcurrentUsers = $ConcurrentUsers
        RequestsPerUser = $RequestsPerUser
    }
    Results       = @{
        TotalRequests       = $totalTests
        SuccessRequests     = $script:SuccessRequests
        FailedRequests      = $script:FailedRequests
        SuccessRate         = $successRate
        AverageResponseTime = $overallAvg
        ResponseTimes       = $script:ResponseTimes
    }
    Errors        = $script:Errors
}

$report | ConvertTo-Json -Depth 10 | Out-File $reportPath
Write-Host "`nDetailed report saved to: $reportPath" -ForegroundColor Cyan

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Performance Test Completed!" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
