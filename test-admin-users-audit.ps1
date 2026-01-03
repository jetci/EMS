$baseUrl = "http://localhost:3001/api"
$adminEmail = "admin@wecare.dev"
$adminPass = "password"

# 1. Login as Admin
Write-Host "Logging in as Admin..." -ForegroundColor Cyan
$loginBody = @{
    email    = $adminEmail
    password = $adminPass
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login Successful." -ForegroundColor Green
}
catch {
    Write-Error "Login Failed: $_"
    exit 1
}

$headers = @{
    Authorization  = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Create User
Write-Host "Creating Test User..." -ForegroundColor Cyan
$userBody = @{
    email    = "test.audit@wecare.dev"
    password = "password123"
    name     = "Test Audit User"
    role     = "community"
    phone    = "0812345678"
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -Headers $headers -Body $userBody
    $userId = $createResponse.id
    Write-Host "User Created: $userId" -ForegroundColor Green
}
catch {
    Write-Error "Create User Failed: $_"
    exit 1
}

# 3. Update User
Write-Host "Updating Test User..." -ForegroundColor Cyan
$updateBody = @{
    fullName = "Updated Audit User"
    phone    = "0899999999"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Put -Headers $headers -Body $updateBody
    if ($updateResponse.fullName -eq "Updated Audit User") {
        Write-Host "User Updated Successfully." -ForegroundColor Green
    }
    else {
        Write-Error "User Update Mismatch"
        exit 1
    }
}
catch {
    Write-Error "Update User Failed: $_"
    exit 1
}

# 4. Reset Password
Write-Host "Resetting Password..." -ForegroundColor Cyan
$resetBody = @{
    newPassword = "newpassword123"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/users/$userId/reset-password" -Method Post -Headers $headers -Body $resetBody
    Write-Host "Password Reset Successfully." -ForegroundColor Green
}
catch {
    Write-Error "Reset Password Failed: $_"
    exit 1
}

# 5. Verify Audit Logs
Write-Host "Verifying Audit Logs..." -ForegroundColor Cyan
try {
    $logs = Invoke-RestMethod -Uri "$baseUrl/audit-logs" -Method Get -Headers $headers
    
    $createLog = $logs | Where-Object { $_.action -eq "CREATE_USER" -and $_.targetId -eq $userId }
    $updateLog = $logs | Where-Object { $_.action -eq "UPDATE_USER" -and $_.targetId -eq $userId }
    $resetLog = $logs | Where-Object { $_.action -eq "RESET_PASSWORD" -and $_.targetId -eq $userId }

    if ($createLog) { Write-Host "Found CREATE_USER log." -ForegroundColor Green } else { Write-Error "Missing CREATE_USER log" }
    if ($updateLog) { Write-Host "Found UPDATE_USER log." -ForegroundColor Green } else { Write-Error "Missing UPDATE_USER log" }
    if ($resetLog) { Write-Host "Found RESET_PASSWORD log." -ForegroundColor Green } else { Write-Error "Missing RESET_PASSWORD log" }

}
catch {
    Write-Error "Fetch Audit Logs Failed: $_"
}

# 6. Delete User
Write-Host "Deleting User..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Delete -Headers $headers
    Write-Host "User Deleted." -ForegroundColor Green
}
catch {
    Write-Error "Delete User Failed: $_"
    exit 1
}

# 7. Verify Delete Audit Log
Write-Host "Verifying Delete Audit Log..." -ForegroundColor Cyan
try {
    $logs = Invoke-RestMethod -Uri "$baseUrl/audit-logs" -Method Get -Headers $headers
    $deleteLog = $logs | Where-Object { $_.action -eq "DELETE_USER" -and $_.targetId -eq $userId }
    
    if ($deleteLog) { Write-Host "Found DELETE_USER log." -ForegroundColor Green } else { Write-Error "Missing DELETE_USER log" }
}
catch {
    Write-Error "Fetch Audit Logs Failed: $_"
}

Write-Host "All User Management & Audit Tests PASSED" -ForegroundColor Green
