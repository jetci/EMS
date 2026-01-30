# Test Patient Registration Payload (Integration Test)

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
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())" -ForegroundColor Red
    }
    exit
}

# 2. Create Patient Data (Multipart/Form-Data simulation)
Write-Host "Creating new patient with comprehensive data..." -ForegroundColor Yellow

$boundary = "------------------------" + [Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = @()

# Helper to add field
function Add-Field ($name, $value) {
    $script:bodyLines += "--$boundary"
    $script:bodyLines += "Content-Disposition: form-data; name=`"$name`""
    $script:bodyLines += ""
    $script:bodyLines += $value
}

Add-Field "title" "Ms."
Add-Field "fullName" "Test System"
Add-Field "gender" "Female"

# Generate random National ID (13 digits)
$randomId = -join ((1..13) | ForEach-Object { Get-Random -Minimum 0 -Maximum 9 })
Add-Field "nationalId" $randomId

Add-Field "dob" "1990-01-01"
Add-Field "age" "34"
Add-Field "contactPhone" "0812345678"

# Address JSONs (Hardcoded strings)
$idCardAddress = '{"houseNumber":"99/9","village":"Village 1","tambon":"Tambon 1","amphoe":"Amphoe 1","changwat":"Changwat 1"}'
$currentAddress = '{"houseNumber":"88/8","village":"Village 2","tambon":"Tambon 2","amphoe":"Amphoe 2","changwat":"Changwat 2"}'

Add-Field "idCardAddress" $idCardAddress
Add-Field "currentAddress" $currentAddress

# Arrays
Add-Field "patientTypes" '["Bedridden"]'
Add-Field "chronicDiseases" '["Diabetes"]'
Add-Field "allergies" '["Paracetamol"]'

# Close boundary
$bodyLines += "--$boundary--"
$body = $bodyLines -join $LF

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/patients" -Method Post -Headers @{ "Authorization" = "Bearer $token" } -ContentType "multipart/form-data; boundary=$boundary" -Body $body
    $json = $response.Content | ConvertFrom-Json
    
    Write-Host "Patient Created: $($json.id)" -ForegroundColor Green
    
    # 3. Verify Data
    Write-Host "Verifying data..." -ForegroundColor Yellow
    $patient = Invoke-RestMethod -Uri "$baseUrl/patients/$($json.id)" -Method Get -Headers @{ "Authorization" = "Bearer $token" }
    
    # Check Title
    if ($patient.title -eq "Ms.") {
        Write-Host "[PASS] Title is correct: $($patient.title)" -ForegroundColor Green
    }
    else {
        Write-Host "[FAIL] Title is incorrect: $($patient.title) (Expected: Ms.)" -ForegroundColor Red
    }
    
    # Check Registered Address
    if ($patient.registeredAddress.houseNumber -eq "99/9") {
        Write-Host "[PASS] Registered Address is correct" -ForegroundColor Green
    }
    else {
        Write-Host "[FAIL] Registered Address is incorrect: $($patient.registeredAddress | ConvertTo-Json -Depth 2)" -ForegroundColor Red
    }
    
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())" -ForegroundColor Red
    }
}
