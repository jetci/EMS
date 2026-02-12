# test-reset-db.ps1
powershell -ExecutionPolicy Bypass -File ./reset-db.ps1

$users = Get-Content "d:\EMS\wecare-backend\db\data\users.json" | ConvertFrom-Json
if ($users.Count -ge 7) {
    Write-Host "Users Reset: PASS" -ForegroundColor Green
}
else {
    Write-Host "Users Reset: FAIL" -ForegroundColor Red
}

$patients = Get-Content "d:\EMS\wecare-backend\db\data\patients.json" | ConvertFrom-Json
if ($patients[0].id -eq "PAT-001") {
    Write-Host "Patients Reset: PASS" -ForegroundColor Green
}
else {
    Write-Host "Patients Reset: FAIL" -ForegroundColor Red
}
