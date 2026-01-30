$baseUrl = "http://localhost:5000/api"

function Test-Login {
    param ($email, $password, $role)
    Write-Host "Testing Login for $role ($email)..." -NoNewline
    try {
        $body = @{ email = $email; password = $password } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host " [OK]" -ForegroundColor Green
    }
    catch {
        Write-Host " [FAILED]" -ForegroundColor Red
        Write-Host $_.Exception.Message
        if ($_.Exception.Response) {
            # Try to read response body
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                Write-Host "Response: $($reader.ReadToEnd())"
            }
            catch {}
        }
    }
}

Test-Login "admin@wecare.dev" "admin123" "ADMIN"
Test-Login "office1@wecare.dev" "password" "RADIO"
Test-Login "officer1@wecare.dev" "password" "OFFICER"
Test-Login "driver1@wecare.dev" "password" "DRIVER"
Test-Login "community1@wecare.dev" "password" "COMMUNITY"
Test-Login "executive1@wecare.dev" "password" "EXECUTIVE"
