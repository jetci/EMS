# Test all possible login combinations
Write-Host "=== TESTING ALL POSSIBLE LOGIN COMBINATIONS ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# Test combinations
$testCases = @(
    @{ email = "admin@wecare.ems"; password = "Admin@123"; name = "admin@wecare.ems / Admin@123" },
    @{ email = "admin@wecare.ems"; password = "password123"; name = "admin@wecare.ems / password123" },
    @{ email = "admin@wecare.ems"; password = "password"; name = "admin@wecare.ems / password" },
    @{ email = "admin@wecare.dev"; password = "Admin@123"; name = "admin@wecare.dev / Admin@123" },
    @{ email = "admin@wecare.dev"; password = "password123"; name = "admin@wecare.dev / password123" },
    @{ email = "admin@wecare.dev"; password = "password"; name = "admin@wecare.dev / password" },
    @{ email = "dev@wecare.ems"; password = "password123"; name = "dev@wecare.ems / password123" },
    @{ email = "dev@wecare.ems"; password = "password"; name = "dev@wecare.ems / password" }
)

$successCount = 0

foreach ($test in $testCases) {
    Write-Host "Testing: $($test.name)" -ForegroundColor Yellow
    
    $body = @{
        email = $test.email
        password = $test.password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        Write-Host "  ✅ SUCCESS!" -ForegroundColor Green
        Write-Host "     User: $($response.user.email)" -ForegroundColor Green
        Write-Host "     Role: $($response.user.role)" -ForegroundColor Green
        Write-Host "     Name: $($response.user.full_name)" -ForegroundColor Green
        $successCount++
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401) {
            Write-Host "  ❌ Invalid credentials (401)" -ForegroundColor Red
        } elseif ($statusCode -eq 500) {
            Write-Host "  ❌ Server error (500)" -ForegroundColor Red
        } else {
            Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    Write-Host ""
}

Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Successful logins: $successCount / $($testCases.Count)" -ForegroundColor $(if ($successCount -gt 0) { "Green" } else { "Red" })
