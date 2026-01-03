# Test Script: Admin Audit Logs
$baseUrl = "http://localhost:5000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Admin Audit Logs Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0
$global:adminToken = $null

function Test-API {
    param($Name, $Method, $Url, $Body, $Expected, $Token)
    
    Write-Host "[$Method] $Name" -ForegroundColor Yellow
    try {
        $params = @{
            Uri         = $Url
            Method      = $Method
            ContentType = "application/json; charset=utf-8"
            ErrorAction = "Stop"
        }
        if ($Body) { $params.Body = $Body | ConvertTo-Json -Depth 3 }
        if ($Token) { $params.Headers = @{ Authorization = "Bearer $Token" } }
        
        $response = Invoke-RestMethod @params
        
        if ($Expected) {
            $checkPassed = & $Expected $response
            if ($checkPassed) {
                Write-Host "  ✅ PASSED" -ForegroundColor Green
                $script:passed++
            }
            else {
                Write-Host "  ❌ FAILED - Expectation not met" -ForegroundColor Red
                $script:failed++
            }
        }
        else {
            Write-Host "  ✅ PASSED" -ForegroundColor Green
            $script:passed++
        }
        return $response
    }
    catch {
        Write-Host "  ❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
        return $null
    }
}

# 1. Login
$login = Test-API "Login Admin" "POST" "$baseUrl/auth/login" @{ email = "admin@wecare.dev"; password = "admin123" } { param($r) $r.token -ne $null }
$global:adminToken = $login.token

# 2. Get Logs
Test-API "Get Audit Logs" "GET" "$baseUrl/audit-logs" $null { param($r) $r.Count -ge 0 } $global:adminToken

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ADMIN LOGS TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" }else { "Green" })
Write-Host ""
