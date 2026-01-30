# Test Emergency Contact Persistence (Integration Test)

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

# 2. Create Patient Data
Write-Host "Creating new patient with Emergency Contact..." -ForegroundColor Yellow

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
Add-Field "fullName" "Emergency Test"
Add-Field "gender" "Male"
$randomId = -join ((1..13) | ForEach-Object { Get-Random -Minimum 0 -Maximum 9 })
Add-Field "nationalId" $randomId
Add-Field "dob" "1980-01-01"
Add-Field "age" "44"
Add-Field "contactPhone" "0812345678"

# Emergency Contact (The fields we just added)
Add-Field "emergencyContactName" "Mom Test"
Add-Field "emergencyContactPhone" "0899999999"
Add-Field "emergencyContactRelation" "Mother"

# Address
$addr = '{"houseNumber":"1","village":"V1","tambon":"T1","amphoe":"A1","changwat":"C1"}'
Add-Field "idCardAddress" $addr
Add-Field "currentAddress" $addr

# Arrays
Add-Field "patientTypes" '["Bedridden"]'
Add-Field "chronicDiseases" '[]'
Add-Field "allergies" '[]'

$bodyLines += "--$boundary--"
$body = $bodyLines -join $LF

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/patients" -Method Post -Headers @{ "Authorization" = "Bearer $token" } -ContentType "multipart/form-data; boundary=$boundary" -Body $body
    $json = $response.Content | ConvertFrom-Json
    
    Write-Host "Patient Created: $($json.id)" -ForegroundColor Green
    
    # 3. Verify Data
    Write-Host "Verifying Emergency Contact data..." -ForegroundColor Yellow
    $patient = Invoke-RestMethod -Uri "$baseUrl/patients/$($json.id)" -Method Get -Headers @{ "Authorization" = "Bearer $token" }
    
    $ec = $patient.emergencyContact
    if ($ec) {
        Write-Host "Emergency Contact Found:" -ForegroundColor Cyan
        Write-Host "  Name: $($ec.name)"
        Write-Host "  Phone: $($ec.phone)"
        Write-Host "  Relation: $($ec.relation)"
        
        if ($ec.name -eq "Mom Test" -and $ec.phone -eq "0899999999" -and $ec.relation -eq "Mother") {
            Write-Host "[PASS] Emergency Contact data is correct!" -ForegroundColor Green
        }
        else {
            Write-Host "[FAIL] Data mismatch!" -ForegroundColor Red
        }
    }
    else {
        Write-Host "[FAIL] Emergency Contact object is missing!" -ForegroundColor Red
    }
    
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())" -ForegroundColor Red
    }
}
