$baseUrl = "http://localhost:5000/api"

Function Try-Login ($email, $pass) {
    $body = @{ email = $email; password = $pass } | ConvertTo-Json
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
        return $true
    }
    catch {
        return $false
    }
}

# Test Admin
if (Try-Login "admin@wecare.dev" "password") {
    Write-Host "Admin (password): PASS" -ForegroundColor Green
}
else {
    Write-Host "Admin (password): FAIL" -ForegroundColor Red
    if (Try-Login "admin@wecare.dev" "admin123") {
        Write-Host "Admin (admin123): PASS" -ForegroundColor Yellow
    }
    else {
        Write-Host "Admin (admin123): FAIL" -ForegroundColor Red
    }
}
