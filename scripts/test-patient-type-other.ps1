# Test Patient Type Other Logic (Integration Test)

$baseUrl = "http://localhost:3001/api"
$email = "community1@wecare.dev"
$password = "password"

# 1. Login
Write-Host "Logging in as $email..." -ForegroundColor Yellow
$loginBody = @{ email = $email; password = $password } | ConvertTo-Json
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Token received." -ForegroundColor Green
}
catch {
    Write-Host "Login Failed: $_" -ForegroundColor Red
    exit
}

# 2. Create Patient Data with "Other" Type
Write-Host "Creating new patient with 'Other' type..." -ForegroundColor Yellow

$boundary = "------------------------" + [Guid]::NewGuid().ToString()
$LF = "`r`n"
$bodyLines = @()

function Add-Field ($name, $value) {
    $script:bodyLines += "--$boundary"
    $script:bodyLines += "Content-Disposition: form-data; name=`"$name`""
    $script:bodyLines += ""
    $script:bodyLines += $value
}

# Basic Info
Add-Field "title" "Mr."
Add-Field "fullName" "Other Type Test"
Add-Field "gender" "Male"
$randomId = -join ((1..13) | ForEach-Object { Get-Random -Minimum 0 -Maximum 9 })
Add-Field "nationalId" $randomId
Add-Field "dob" "1990-01-01"
Add-Field "age" "34"
Add-Field "contactPhone" "0812345678"

# Address
$addr = '{"houseNumber":"1","village":"V1","tambon":"T1","amphoe":"A1","changwat":"C1"}'
Add-Field "idCardAddress" $addr
Add-Field "currentAddress" $addr

# Arrays - Simulate Frontend Logic
# Frontend sends:
# patientTypes: ["Bedridden", "ผู้ป่วยอื่นๆ"]
# patientTypeOther: "Cancer Stage 4"
# BUT my fix was in Frontend Code (CommunityRegisterPatientPage.tsx).
# Since I cannot run Frontend logic in PowerShell, I must simulate the PAYLOAD that Frontend sends AFTER my fix.
# My fix was: typesToSend = ["Bedridden", "ผู้ป่วยอื่นๆ (Cancer Stage 4)"]

# So, to test if Backend accepts this, I will send the merged array.
# Wait! If I test Backend, I am just testing if Backend saves string array. That's trivial.
# The real logic is in Frontend.
# But I can verify that IF Frontend sends the merged string, Backend saves it correctly and returns it correctly.

$typesToSend = '["Bedridden", "ผู้ป่วยอื่นๆ (Cancer Stage 4)"]'
Add-Field "patientTypes" $typesToSend
Add-Field "chronicDiseases" '[]'
Add-Field "allergies" '[]'

$bodyLines += "--$boundary--"
$body = $bodyLines -join $LF

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/patients" -Method Post -Headers @{ "Authorization" = "Bearer $token" } -ContentType "multipart/form-data; boundary=$boundary" -Body $body
    $json = $response.Content | ConvertFrom-Json
    
    Write-Host "Patient Created: $($json.id)" -ForegroundColor Green
    
    # 3. Verify Data
    Write-Host "Verifying Patient Types..." -ForegroundColor Yellow
    $patient = Invoke-RestMethod -Uri "$baseUrl/patients/$($json.id)" -Method Get -Headers @{ "Authorization" = "Bearer $token" }
    
    $types = $patient.patientTypes
    Write-Host "Patient Types: $($types -join ', ')" -ForegroundColor Cyan
    
    if ($types -contains "ผู้ป่วยอื่นๆ (Cancer Stage 4)") {
        Write-Host "[PASS] Patient Type Other is correctly saved!" -ForegroundColor Green
    }
    else {
        Write-Host "[FAIL] Patient Type Other mismatch!" -ForegroundColor Red
    }
    
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())" -ForegroundColor Red
    }
}
