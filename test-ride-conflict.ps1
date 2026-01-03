$baseUrl = "http://localhost:5000/api"
$headers = @{ Authorization = "Bearer $(Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{ email = "office1@wecare.dev"; password = "password" } | ConvertTo-Json) -ContentType "application/json").token" }

# 1. Create Ride A
$timeA = (Get-Date).ToString("yyyy-MM-ddTHH:00:00Z")
$rideA = Invoke-RestMethod -Uri "$baseUrl/rides" -Method Post -Body (@{ patient_name = "P1"; appointment_time = $timeA } | ConvertTo-Json) -Headers $headers -ContentType "application/json"
Write-Host "Created Ride A: $($rideA.id)"

# 2. Create Ride B (Same Time)
$rideB = Invoke-RestMethod -Uri "$baseUrl/rides" -Method Post -Body (@{ patient_name = "P2"; appointment_time = $timeA } | ConvertTo-Json) -Headers $headers -ContentType "application/json"
Write-Host "Created Ride B: $($rideB.id)"

# 3. Assign Driver to A
$driverId = "DRV-001" # Assuming exists or just string match
try {
    Invoke-RestMethod -Uri "$baseUrl/rides/$($rideA.id)" -Method Put -Body (@{ driver_id = $driverId; status = "IN_PROGRESS" } | ConvertTo-Json) -Headers $headers -ContentType "application/json"
    Write-Host "Assign Driver to A: Success" -ForegroundColor Green
}
catch {
    Write-Host "Assign Driver to A Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Assign Driver to B (Should Fail)
try {
    Invoke-RestMethod -Uri "$baseUrl/rides/$($rideB.id)" -Method Put -Body (@{ driver_id = $driverId; status = "IN_PROGRESS" } | ConvertTo-Json) -Headers $headers -ContentType "application/json"
    Write-Host "Assign Driver to B: Failed (Unexpected Success)" -ForegroundColor Red
}
catch {
    if ($_.Exception.Message -like "*409*") {
        Write-Host "Assign Driver to B: Success (Conflict Detected)" -ForegroundColor Green
    }
    else {
        Write-Host "Assign Driver to B: Failed with wrong error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Cleanup
Invoke-RestMethod -Uri "$baseUrl/rides/$($rideA.id)" -Method Delete -Headers $headers
Invoke-RestMethod -Uri "$baseUrl/rides/$($rideB.id)" -Method Delete -Headers $headers
