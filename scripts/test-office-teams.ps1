# Test Script: Office Teams Management
$baseUrl = "http://localhost:5000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Office Teams Management Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0
$global:officeToken = $null
$global:teamId = $null

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
$login = Test-API "Login Office" "POST" "$baseUrl/auth/login" @{ email = "office1@wecare.dev"; password = "password" } { param($r) $r.token -ne $null }
$global:officeToken = $login.token

# 2. Get Teams
Test-API "Get Teams" "GET" "$baseUrl/teams" $null { param($r) $r.teams.Count -ge 0 } $global:officeToken

# 3. Create Team
$teamData = @{
    name        = "Test Team Alpha"
    description = "Test Description"
    driverId    = "DRV-001"
    staffIds    = @("USR-002")
}
$team = Test-API "Create Team" "POST" "$baseUrl/teams" $teamData { param($r) $r.id -match "TEAM-" } $global:officeToken
$global:teamId = $team.id

# 4. Update Team
$updateData = @{ name = "Test Team Alpha Updated" }
Test-API "Update Team" "PUT" "$baseUrl/teams/$($global:teamId)" $updateData { param($r) $r.name -eq "Test Team Alpha Updated" } $global:officeToken

# 5. Delete Team
Test-API "Delete Team" "DELETE" "$baseUrl/teams/$($global:teamId)" $null $null $global:officeToken

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEAMS TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" }else { "Green" })
Write-Host ""
