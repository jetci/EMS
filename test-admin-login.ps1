Write-Host "Testing ADMIN Login..." -ForegroundColor Cyan

$body = @{
    email = "admin@wecare.dev"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/login" -Method POST -ContentType "application/json" -Body $body
    Write-Host "[SUCCESS] Login successful!" -ForegroundColor Green
    Write-Host "User: $($response.user.full_name)" -ForegroundColor Green
    Write-Host "Role: $($response.user.role)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Backend may not be running. Please restart." -ForegroundColor Yellow
}
