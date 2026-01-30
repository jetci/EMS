# Create Test Rides for Radio Dashboard
# สร้างข้อมูลทดสอบสำหรับศูนย์วิทยุ

Write-Host "Creating test rides..." -ForegroundColor Cyan

# Test data
$testRides = @(
    @{
        patient_name = "นายสมชาย ใจดี"
        village = "หมู่ 1"
        appointment_time = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss")
        trip_type = "นัดหมอตามปกติ"
        special_needs = @("ต้องการวีลแชร์")
        status = "PENDING"
    },
    @{
        patient_name = "นางสมหญิง รักษ์ดี"
        village = "หมู่ 2"
        appointment_time = (Get-Date).AddHours(3).ToString("yyyy-MM-ddTHH:mm:ss")
        trip_type = "รับยา"
        special_needs = @()
        status = "PENDING"
    },
    @{
        patient_name = "นายประยุทธ์ สุขใจ"
        village = "หมู่ 3"
        appointment_time = (Get-Date).AddHours(1).ToString("yyyy-MM-ddTHH:mm:ss")
        trip_type = "ฉุกเฉิน"
        special_needs = @("ต้องการวีลแชร์", "ต้องการเปล")
        status = "PENDING"
    }
)

$created = 0
$failed = 0

foreach ($ride in $testRides) {
    try {
        $body = $ride | ConvertTo-Json -Depth 3
        Write-Host "Creating ride for: $($ride.patient_name)..." -ForegroundColor Yellow
        
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/office/rides" `
            -Method Post `
            -ContentType "application/json" `
            -Body $body `
            -Headers @{
                "Authorization" = "Bearer YOUR_TOKEN_HERE"
            } `
            -ErrorAction Stop
        
        Write-Host "  Success: $($ride.patient_name)" -ForegroundColor Green
        $created++
    }
    catch {
        Write-Host "  Failed: $($ride.patient_name) - $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Created: $created" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($created -gt 0) {
    Write-Host "Test rides created successfully!" -ForegroundColor Green
    Write-Host "Refresh Radio Dashboard to see the data" -ForegroundColor Yellow
} else {
    Write-Host "No rides created. Please check:" -ForegroundColor Red
    Write-Host "1. Backend is running" -ForegroundColor White
    Write-Host "2. You are logged in (have valid token)" -ForegroundColor White
    Write-Host "3. Database is accessible" -ForegroundColor White
}
