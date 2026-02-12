$dataDir = "d:\EMS\wecare-backend\db\data"

# 1. Define Initial Data
$users = @(
    @{ id = "USR-000"; email = "jetci.jm@gmail.com"; password = "g0KEk,^],k;yo"; role = "DEVELOPER"; fullName = "System Developer"; status = "Active" },
    @{ id = "USR-001"; email = "admin@wecare.dev"; password = "password123"; role = "admin"; fullName = "Admin User"; status = "Active" },
    @{ id = "USR-002"; email = "office1@wecare.dev"; password = "password123"; role = "radio_center"; fullName = "Radio Center Staff"; status = "Active" },
    @{ id = "USR-003"; email = "driver1@wecare.dev"; password = "password123"; role = "driver"; fullName = "Driver One"; status = "Active" },
    @{ id = "USR-004"; email = "community1@wecare.dev"; password = "password123"; role = "community"; fullName = "Community Test"; status = "Active"; phone = "0888888888" },
    @{ id = "USR-005"; email = "officer1@wecare.dev"; password = "password123"; role = "OFFICER"; fullName = "Officer Staff"; status = "Active" },
    @{ id = "USR-006"; email = "executive1@wecare.dev"; password = "password123"; role = "EXECUTIVE"; fullName = "Executive Manager"; status = "Active" }
)

$patients = @(
    @{ id = "PAT-001"; full_name = "Somchai Jaidee"; age = 72; gender = "Male"; address = "123 Moo 1"; created_by = "USR-004"; patient_types = @("Elderly") }
)

$drivers = @(
    @{ id = "DRV-001"; user_id = "USR-003"; full_name = "Driver One"; status = "AVAILABLE"; license_plate = "BK-1234"; vehicle_model = "Toyota Commuter"; phone = "081-234-5678" }
)

$rides = @(
    @{ id = "RIDE-001"; patient_id = "PAT-001"; driver_id = "USR-003"; status = "COMPLETED"; appointment_time = (Get-Date).AddDays(-1).ToString("yyyy-MM-ddTHH:mm:ss"); destination = "Fang Hospital"; pickup_location = "Patient Home" }
)

$settings = @(
    @{ schedulingModel = "hybrid"; autoAssign = $true }
)

# 2. Write Files
Function Write-JsonDB ($filename, $data) {
    $path = Join-Path $dataDir $filename
    $json = $data | ConvertTo-Json -Depth 10
    Set-Content -Path $path -Value $json -Encoding UTF8
    Write-Host "Reset $filename" -ForegroundColor Green
}

# Ensure Dir Exists
if (!(Test-Path $dataDir)) { New-Item -ItemType Directory -Path $dataDir | Out-Null }

Write-JsonDB "users.json" $users
Write-JsonDB "patients.json" $patients
Write-JsonDB "drivers.json" $drivers
Write-JsonDB "rides.json" $rides
Write-JsonDB "system_settings.json" $settings
Write-JsonDB "news.json" @()
Write-JsonDB "teams.json" @()
Write-JsonDB "vehicle_types.json" @()

Write-Host "Database Reset Complete!" -ForegroundColor Cyan
