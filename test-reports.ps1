$baseUrl = "http://localhost:5000/api"

# 1. Login
$loginBody = @{ email = "office1@wecare.dev"; password = "password" } | ConvertTo-Json
try {
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginRes.token
    $headers = @{ Authorization = "Bearer $token" }
    Write-Host "Login Success" -ForegroundColor Green
}
catch {
    Write-Host "Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    Exit
}

# 2. Test Roster Report
try {
    $roster = Invoke-RestMethod -Uri "$baseUrl/office/reports/roster?startDate=2024-01-01&endDate=2024-12-31&teamId=all" -Method Get -Headers $headers
    Write-Host "Roster Report: Success (Count: $($roster.Count))" -ForegroundColor Green
}
catch {
    Write-Host "Roster Report Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test Personnel Report
try {
    $personnel = Invoke-RestMethod -Uri "$baseUrl/office/reports/personnel?startDate=2024-01-01&endDate=2024-12-31&driverId=all" -Method Get -Headers $headers
    Write-Host "Personnel Report: Success (Count: $($personnel.Count))" -ForegroundColor Green
}
catch {
    Write-Host "Personnel Report Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test Maintenance Report
try {
    $maintenance = Invoke-RestMethod -Uri "$baseUrl/office/reports/maintenance?status=all" -Method Get -Headers $headers
    Write-Host "Maintenance Report: Success (Count: $($maintenance.Count))" -ForegroundColor Green
}
catch {
    Write-Host "Maintenance Report Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test Patients Report
try {
    $patients = Invoke-RestMethod -Uri "$baseUrl/office/reports/patients?startDate=2024-01-01&endDate=2024-12-31" -Method Get -Headers $headers
    Write-Host "Patients Report: Success (Count: $($patients.Count))" -ForegroundColor Green
}
catch {
    Write-Host "Patients Report Failed: $($_.Exception.Message)" -ForegroundColor Red
}
