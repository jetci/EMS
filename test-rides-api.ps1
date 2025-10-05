Write-Host "Testing /api/rides endpoint..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/rides" -Method GET
    Write-Host "[SUCCESS] API responded" -ForegroundColor Green
    Write-Host "Data count: $($response.Count)" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}
