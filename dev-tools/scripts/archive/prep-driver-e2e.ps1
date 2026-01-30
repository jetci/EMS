# Script to prepare data for Driver E2E Test
# Creates a ride for TODAY assigned to DRV-001

$baseUrl = "http://localhost:5000/api"

function Test-API {
    param($Name, $Method, $Url, $Body, $Token)
    try {
        $params = @{
            Uri         = $Url
            Method      = $Method
            ContentType = "application/json; charset=utf-8"
            ErrorAction = "Stop"
        }
        if ($Body) { $params.Body = $Body | ConvertTo-Json -Depth 3 }
        if ($Token) { $params.Headers = @{ Authorization = "Bearer $Token" } }
        return Invoke-RestMethod @params
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Login Admin
$adminLogin = Test-API "Login Admin" "POST" "$baseUrl/auth/login" @{
    email    = "admin@wecare.dev"
    password = "admin123"
}
$token = $adminLogin.token

# Create Ride for TODAY (Now + 1 hour)
# Ensure date format is ISO8601
$today = (Get-Date).AddHours(1).ToString("yyyy-MM-ddTHH:mm:ss") 

$rideData = @{
    patient_id       = "PAT-001"
    pickup_location  = "E2E Pickup Point"
    destination      = "E2E Hospital"
    appointment_time = $today
    trip_type        = "one_way"
    patient_name     = "E2E Patient"
    contact_phone    = "0899999999"
    status           = "ASSIGNED"
    driver_id        = "DRV-001"
}

# Create directly via rides endpoint (assuming admin can create/assign directly or we use community then update)
# Let's try creating as community first to be safe, then update
$commLogin = Test-API "Login Comm" "POST" "$baseUrl/auth/login" @{ email = "community1@wecare.dev"; password = "password" }
$commToken = $commLogin.token

$ride = Test-API "Create Ride" "POST" "$baseUrl/community/rides" $rideData $commToken
Write-Host "Created Ride: $($ride.id) for $today" -ForegroundColor Green

# Assign (if not assigned by create)
if ($ride.driver_id -ne "DRV-001") {
    $update = Test-API "Assign" "PUT" "$baseUrl/community/rides/$($ride.id)" @{ driver_id = "DRV-001"; status = "ASSIGNED" } $token
    Write-Host "Assigned to DRV-001" -ForegroundColor Green
}
