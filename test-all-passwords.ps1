# Test all possible passwords

$passwords = @(
    "Admin@123",
    "admin@123", 
    "Admin123",
    "password",
    "Password@123",
    "admin"
)

$email = "admin@wecare.ems"

Write-Host "Testing passwords for: $email" -ForegroundColor Cyan
Write-Host ""

foreach ($pwd in $passwords) {
    try {
        $body = @{email=$email;password=$pwd} | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -ContentType "application/json"
        Write-Host "[SUCCESS] Password: $pwd" -ForegroundColor Green
        Write-Host "  Token: $($result.token.Substring(0,20))..." -ForegroundColor Gray
        break
    } catch {
        Write-Host "[FAIL] Password: $pwd" -ForegroundColor Red
    }
}
