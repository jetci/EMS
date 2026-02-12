# Patient Detail - Data Availability Report

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Patient Detail - Data Availability Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Backend mapping
Write-Host "BACKEND MAPPING CHECK:" -ForegroundColor Yellow
Write-Host ""

$patientsFile = "D:\EMS\wecare-backend\src\routes\patients.ts"
$content = Get-Content $patientsFile -Raw

Write-Host "Checking mapPatientToResponse function..." -ForegroundColor White
Write-Host ""

# Check each field
$fields = @{
    "title"             = "Title/Prefix"
    "firstName"         = "First Name"
    "lastName"          = "Last Name"
    "gender"            = "Gender"
    "nationalId"        = "National ID"
    "dob"               = "Birth Date"
    "age"               = "Age"
    "bloodType"         = "Blood Type"
    "rhFactor"          = "Rh Factor"
    "healthCoverage"    = "Health Coverage"
    "registeredAddress" = "Registered Address"
    "currentAddress"    = "Current Address"
    "contactPhone"      = "Contact Phone"
    "latitude"          = "Latitude"
    "longitude"         = "Longitude"
    "patientTypes"      = "Patient Types"
    "chronicDiseases"   = "Chronic Diseases"
    "allergies"         = "Allergies"
    "profileImageUrl"   = "Profile Image"
    "attachments"       = "Attachments"
}

$found = 0
$missing = 0

foreach ($field in $fields.Keys) {
    if ($content -match "$field\s*:") {
        Write-Host "[PASS] $($fields[$field]) - mapped in backend" -ForegroundColor Green
        $found++
    }
    else {
        Write-Host "[FAIL] $($fields[$field]) - NOT mapped in backend" -ForegroundColor Red
        $missing++
    }
}

Write-Host ""
Write-Host "Backend Mapping: $found/20 fields found" -ForegroundColor $(if ($found -eq 20) { "Green" } else { "Yellow" })
Write-Host ""

# Check Frontend display
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FRONTEND DISPLAY CHECK:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$detailPage = "D:\EMS\pages\PatientDetailPage.tsx"
$frontendContent = Get-Content $detailPage -Raw

Write-Host "Checking PatientDetailPage.tsx..." -ForegroundColor White
Write-Host ""

$displayFields = @{
    "patient.title"           = "Title/Prefix"
    "patient.firstName"       = "First Name"
    "patient.lastName"        = "Last Name"
    "patient.gender"          = "Gender"
    "patient.nationalId"      = "National ID"
    "patient.dob"             = "Birth Date"
    "patient.age"             = "Age"
    "patient.bloodType"       = "Blood Type"
    "patient.rhFactor"        = "Rh Factor"
    "patient.healthCoverage"  = "Health Coverage"
    "registeredAddress"       = "Registered Address"
    "currentAddress"          = "Current Address"
    "patient.contactPhone"    = "Contact Phone"
    "patient.latitude"        = "Latitude"
    "patient.longitude"       = "Longitude"
    "patient.patientTypes"    = "Patient Types"
    "patient.chronicDiseases" = "Chronic Diseases"
    "patient.allergies"       = "Allergies"
    "profileImageUrl"         = "Profile Image"
    "attachments"             = "Attachments"
}

$displayFound = 0
$displayMissing = 0

foreach ($field in $displayFields.Keys) {
    if ($frontendContent -match [regex]::Escape($field)) {
        Write-Host "[PASS] $($displayFields[$field]) - displayed in frontend" -ForegroundColor Green
        $displayFound++
    }
    else {
        Write-Host "[FAIL] $($displayFields[$field]) - NOT displayed in frontend" -ForegroundColor Red
        $displayMissing++
    }
}

Write-Host ""
Write-Host "Frontend Display: $displayFound/20 fields found" -ForegroundColor $(if ($displayFound -eq 20) { "Green" } else { "Yellow" })
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Backend Mapping: $found/20 ($([math]::Round($found/20*100))%)" -ForegroundColor $(if ($found -eq 20) { "Green" } else { "Yellow" })
Write-Host "Frontend Display: $displayFound/20 ($([math]::Round($displayFound/20*100))%)" -ForegroundColor $(if ($displayFound -eq 20) { "Green" } else { "Yellow" })
Write-Host ""

if ($missing -gt 0) {
    Write-Host "ACTION REQUIRED:" -ForegroundColor Red
    Write-Host "- $missing fields missing in backend mapping" -ForegroundColor Red
}

if ($displayMissing -gt 0) {
    Write-Host "ACTION REQUIRED:" -ForegroundColor Red
    Write-Host "- $displayMissing fields missing in frontend display" -ForegroundColor Red
}

if ($found -eq 20 -and $displayFound -eq 20) {
    Write-Host "STATUS: ALL FIELDS COMPLETE!" -ForegroundColor Green
}
else {
    Write-Host "STATUS: INCOMPLETE - needs fixes" -ForegroundColor Yellow
}

Write-Host ""
