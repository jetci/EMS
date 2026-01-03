# Test Script: Admin RBAC
# Tests that only admin can access admin-only APIs

Write-Host "====================================="
Write-Host "Admin RBAC Test"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Test 1: Community user should NOT be able to access user management
Write-Host ""
Write-Host "Test 1: Community user accessing user management..."
try {
    $loginBody = @{
        email    = "community1@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $COMMUNITY_TOKEN = $loginResponse.token
    
    $communityHeaders = @{
        "Authorization" = "Bearer $COMMUNITY_TOKEN"
        "Content-Type"  = "application/json"
    }
    
    # Try to get all users (should fail for community)
    try {
        $users = Invoke-RestMethod -Uri "$BASE_URL/users" -Method GET -Headers $communityHeaders
        Write-Host "FAIL: Community user CAN access user list (should be restricted)"
    }
    catch {
        Write-Host "PASS: Community user denied access to user list"
    }
    
    # Try to create a user (should fail)
    try {
        $userBody = @{
            email    = "test_hacker@wecare.dev"
            password = "password"
            role     = "admin"
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $communityHeaders -Body $userBody | Out-Null
        Write-Host "FAIL: Community user CAN create users (CRITICAL!)"
    }
    catch {
        Write-Host "PASS: Community user denied user creation"
    }
}
catch {
    Write-Host "WARN: Could not log in as community user."
}

# Test 2: Driver user should NOT be able to access settings
Write-Host ""
Write-Host "Test 2: Driver user accessing system settings..."
try {
    $loginBody = @{
        email    = "driver1@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $DRIVER_TOKEN = $loginResponse.token
    
    $driverHeaders = @{
        "Authorization" = "Bearer $DRIVER_TOKEN"
        "Content-Type"  = "application/json"
    }
    
    # Try to get settings
    try {
        $settings = Invoke-RestMethod -Uri "$BASE_URL/admin/settings" -Method GET -Headers $driverHeaders
        Write-Host "FAIL: Driver user CAN access system settings (should be restricted)"
    }
    catch {
        Write-Host "PASS: Driver user denied access to system settings"
    }
}
catch {
    Write-Host "WARN: Could not log in as driver user."
}

# Test 3: Admin should have full access
Write-Host ""
Write-Host "Test 3: Admin user accessing all APIs..."
try {
    $loginBody = @{
        email    = "admin@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $ADMIN_TOKEN = $loginResponse.token
    
    $adminHeaders = @{
        "Authorization" = "Bearer $ADMIN_TOKEN"
        "Content-Type"  = "application/json"
    }
    
    # Get users
    $users = Invoke-RestMethod -Uri "$BASE_URL/users" -Method GET -Headers $adminHeaders
    Write-Host "PASS: Admin can access user list ($($users.Count) users)"
    
    # Get settings
    $settings = Invoke-RestMethod -Uri "$BASE_URL/admin/settings" -Method GET -Headers $adminHeaders
    Write-Host "PASS: Admin can access system settings"
    
    # Get audit logs
    $logs = Invoke-RestMethod -Uri "$BASE_URL/audit-logs" -Method GET -Headers $adminHeaders
    Write-Host "PASS: Admin can access audit logs ($($logs.Count) logs)"
}
catch {
    Write-Host "FAIL: Admin could not access APIs."
}

Write-Host ""
Write-Host "====================================="
Write-Host "Admin RBAC Tests Complete"
Write-Host "====================================="
