# Prep data for Office E2E
$baseUrl = "http://localhost:5000/api"

# Login Community
$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body (@{ email = "community1@wecare.dev"; password = "password" } | ConvertTo-Json) -ContentType "application/json"
$token = $login.token

# Create Pending Ride
$rideData = @{
    patient_id       = "PAT-001"
    pickup_location  = "E2E Office Pickup"
    destination      = "E2E Office Dest"
    appointment_time = (Get-Date).AddHours(4).ToString("yyyy-MM-ddTHH:mm:ss")
    trip_type        = "one_way"
    patient_name     = "E2E Office Patient"
    status           = "PENDING"
}

$ride = Invoke-RestMethod -Uri "$baseUrl/community/rides" -Method POST -Body ($rideData | ConvertTo-Json) -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json"
Write-Host "Created Pending Ride: $($ride.id)" -ForegroundColor Green
