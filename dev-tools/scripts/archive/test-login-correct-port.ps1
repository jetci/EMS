# Test login endpoint on correct port
$uri = "http://localhost:3000/api/auth/login"
$body = @{
    email = "admin@wecare.ems"
    password = "Admin@123"
} | ConvertTo-Json

Write-Host "Testing login endpoint: $uri" -ForegroundColor Cyan
Write-Host "Body: $body" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $body -ContentType "application/json"
    Write-Host "`nLogin SUCCESS!" -ForegroundColor Green
    Write-Host "User: $($response.user | ConvertTo-Json)" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "`nLogin FAILED!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
