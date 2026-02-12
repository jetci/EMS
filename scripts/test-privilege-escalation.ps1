# Test BUG-001: Privilege Escalation
# Strategy: Register new admin user, then try to escalate privileges

Write-Host "=== Testing BUG-001: Privilege Escalation ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Register a new test admin user
Write-Host "Step 1: Registering test user..." -ForegroundColor Yellow
try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
        -Method POST `
        -Body (@{
            email    = "testadmin@test.com"
            password = "TestPassword123!"
            name     = "Test Admin"
            role     = "community"
        } | ConvertTo-Json) `
        -ContentType "application/json"
    
    $token = $registerResponse.token
    $userId = $registerResponse.user.id
    $currentRole = $registerResponse.user.role
    
    Write-Host "[OK] User registered successfully" -ForegroundColor Green
    Write-Host "   User ID: $userId" -ForegroundColor Gray
    Write-Host "   Current Role: $currentRole" -ForegroundColor Gray
    Write-Host ""
}
catch {
    Write-Host "[INFO] Registration failed (user may exist), trying login..." -ForegroundColor Yellow
    
    # Try to login instead
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
            -Method POST `
            -Body (@{email = "testadmin@test.com"; password = "TestPassword123!" } | ConvertTo-Json) `
            -ContentType "application/json"
        
        $token = $loginResponse.token
        $userId = $loginResponse.user.id
        $currentRole = $loginResponse.user.role
        
        Write-Host "[OK] Login successful" -ForegroundColor Green
        Write-Host "   User ID: $userId" -ForegroundColor Gray
        Write-Host "   Current Role: $currentRole" -ForegroundColor Gray
        Write-Host ""
    }
    catch {
        Write-Host "[FAIL] Both register and login failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Try to change own role to admin
Write-Host "Step 2: Attempting to escalate privileges (community -> admin)..." -ForegroundColor Yellow
try {
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/users/$userId" `
        -Method PUT `
        -Headers @{Authorization = "Bearer $token" } `
        -Body (@{role = "admin" } | ConvertTo-Json) `
        -ContentType "application/json"
    
    Write-Host "[FAIL] VULNERABILITY FOUND! User was able to change own role!" -ForegroundColor Red
    Write-Host "   New Role: $($updateResponse.role)" -ForegroundColor Red
    Write-Host ""
    Write-Host "[CRITICAL] BUG-001 CONFIRMED: Privilege Escalation is possible" -ForegroundColor Red
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 403) {
        Write-Host "[OK] PROTECTED! System prevented privilege escalation (403 Forbidden)" -ForegroundColor Green
        try {
            $errorMessage = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "   Error: $($errorMessage.error)" -ForegroundColor Gray
            if ($errorMessage.details) {
                Write-Host "   Details: $($errorMessage.details)" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "   Error: Forbidden" -ForegroundColor Gray
        }
        Write-Host ""
        Write-Host "[PASS] BUG-001 FIXED: Privilege Escalation is blocked" -ForegroundColor Green
    }
    elseif ($statusCode -eq 401) {
        Write-Host "[WARN] Unauthorized (401) - Token may be invalid or user lacks permission" -ForegroundColor Yellow
    }
    else {
        Write-Host "[WARN] Unexpected status code: $statusCode" -ForegroundColor Yellow
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
