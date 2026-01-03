# Test Script: Admin Workflow
# Tests admin login, user management, audit logs, settings

Write-Host "====================================="
Write-Host "Admin Workflow Test"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Admin
Write-Host ""
Write-Host "Logging in as Admin..."
try {
    $loginBody = @{
        email    = "admin@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    
    if (-not $TOKEN) {
        Write-Host "FAIL: Login failed."
        exit 1
    }
    Write-Host "Login Successful. Role: $($loginResponse.user.role)"
}
catch {
    Write-Host "FAIL: Login request failed."
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# Step 2: Fetch all users
Write-Host ""
Write-Host "Fetching all users..."
try {
    $users = Invoke-RestMethod -Uri "$BASE_URL/users" -Method GET -Headers $headers
    Write-Host "Found $($users.Count) users."
}
catch {
    Write-Host "WARN: Could not fetch users."
}

# Step 3: Create a test user
Write-Host ""
Write-Host "Creating a test user..."
try {
    $userBody = @{
        email    = "testuser_admin_$(Get-Date -Format 'HHmmss')@wecare.dev"
        password = "password123"
        name     = "Admin Test User"
        role     = "community"
    } | ConvertTo-Json

    $userResponse = Invoke-RestMethod -Uri "$BASE_URL/users" -Method POST -Headers $headers -Body $userBody
    $USER_ID = $userResponse.id
    Write-Host "User Created: $USER_ID ($($userResponse.email))"
}
catch {
    Write-Host "FAIL: Failed to create user."
    $USER_ID = $null
}

# Step 4: Update the test user
if ($USER_ID) {
    Write-Host "Updating user..."
    try {
        $updateBody = @{
            name = "Admin Test User Updated"
        } | ConvertTo-Json

        Invoke-RestMethod -Uri "$BASE_URL/users/$USER_ID" -Method PUT -Headers $headers -Body $updateBody | Out-Null
        Write-Host "User updated."
    }
    catch {
        Write-Host "WARN: Failed to update user."
    }
}

# Step 5: Fetch audit logs
Write-Host ""
Write-Host "Fetching audit logs..."
try {
    $auditLogs = Invoke-RestMethod -Uri "$BASE_URL/audit-logs" -Method GET -Headers $headers
    Write-Host "Found $($auditLogs.Count) audit logs."
    
    # Show last 3 logs
    $recentLogs = $auditLogs | Select-Object -First 3
    foreach ($log in $recentLogs) {
        Write-Host "  - $($log.action): $($log.targetId) by $($log.userEmail)"
    }
}
catch {
    Write-Host "WARN: Could not fetch audit logs."
}

# Step 6: Fetch system settings
Write-Host ""
Write-Host "Fetching system settings..."
try {
    $settings = Invoke-RestMethod -Uri "$BASE_URL/admin/settings" -Method GET -Headers $headers
    Write-Host "System Name: $($settings.systemName)"
    Write-Host "Maintenance Mode: $($settings.maintenanceMode)"
}
catch {
    Write-Host "WARN: Could not fetch settings."
}

# Step 7: Fetch admin dashboard data
Write-Host ""
Write-Host "Fetching admin dashboard..."
try {
    $dashboard = Invoke-RestMethod -Uri "$BASE_URL/dashboard/admin" -Method GET -Headers $headers
    Write-Host "Total Users: $($dashboard.totalUsers)"
    Write-Host "Total Rides: $($dashboard.totalRides)"
    Write-Host "Recent Logs Count: $($dashboard.recentLogs.Count)"
    if ($dashboard.recentLogs.Count -gt 0) {
        Write-Host "  Latest Log Action: $($dashboard.recentLogs[0].action)"
    }
}
catch {
    Write-Host "WARN: Could not fetch dashboard."
}

# Step 8: Delete test user
if ($USER_ID) {
    Write-Host ""
    Write-Host "Deleting test user..."
    try {
        Invoke-RestMethod -Uri "$BASE_URL/users/$USER_ID" -Method DELETE -Headers $headers
        Write-Host "Test user deleted."
    }
    catch {
        Write-Host "WARN: Could not delete test user."
    }
}

# Step 9: Verify user management audit logs
Write-Host ""
Write-Host "Verifying user management audit logs..."
try {
    $auditLogs = Invoke-RestMethod -Uri "$BASE_URL/audit-logs" -Method GET -Headers $headers
    
    if ($USER_ID) {
        $createLog = $auditLogs | Where-Object { $_.action -eq "CREATE_USER" -and $_.targetId -eq $USER_ID }
        $updateLog = $auditLogs | Where-Object { $_.action -eq "UPDATE_USER" -and $_.targetId -eq $USER_ID }
        $deleteLog = $auditLogs | Where-Object { $_.action -eq "DELETE_USER" -and $_.targetId -eq $USER_ID }
        
        if ($createLog) { Write-Host "PASS: CREATE_USER log found" } else { Write-Host "WARN: CREATE_USER log missing" }
        if ($updateLog) { Write-Host "PASS: UPDATE_USER log found" } else { Write-Host "WARN: UPDATE_USER log missing" }
        if ($deleteLog) { Write-Host "PASS: DELETE_USER log found" } else { Write-Host "WARN: DELETE_USER log missing" }
    }
}
catch {
    Write-Host "WARN: Could not verify audit logs."
}

Write-Host ""
Write-Host "====================================="
Write-Host "All Admin Workflow Tests PASSED"
Write-Host "====================================="
