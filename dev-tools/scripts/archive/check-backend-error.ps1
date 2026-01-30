# Check backend detailed error
$uri = "http://localhost:3000/api/auth/login"
$body = '{"email":"admin@wecare.ems","password":"Admin@123"}'

Write-Host "Sending request to: $uri" -ForegroundColor Cyan
Write-Host "Body: $body" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    # Try to read error response
    if ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error Response:" -ForegroundColor Yellow
            Write-Host $errorBody -ForegroundColor Red
        } catch {
            Write-Host "Could not read error response" -ForegroundColor Red
        }
    }
}
