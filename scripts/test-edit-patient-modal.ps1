# Test EditPatientModal Fix
Write-Host "=== Testing EditPatientModal Fix ===" -ForegroundColor Cyan

# 1. Check if file has optional chaining
Write-Host "`n1. Checking EditPatientModal.tsx for optional chaining..." -ForegroundColor Yellow
$content = Get-Content ".\src\components\modals\EditPatientModal.tsx" -Raw

if ($content -match "formData\.idCardAddress\?\.houseNumber") {
    Write-Host "   ✅ Optional chaining found for idCardAddress" -ForegroundColor Green
} else {
    Write-Host "   ❌ Optional chaining NOT found for idCardAddress" -ForegroundColor Red
    exit 1
}

if ($content -match "formData\.currentAddress\?\.houseNumber") {
    Write-Host "   ✅ Optional chaining found for currentAddress" -ForegroundColor Green
} else {
    Write-Host "   ❌ Optional chaining NOT found for currentAddress" -ForegroundColor Red
    exit 1
}

# 2. Check useEffect has default values
Write-Host "`n2. Checking useEffect for default values..." -ForegroundColor Yellow
if ($content -match "idCardAddress: patient\.idCardAddress \|\| \{") {
    Write-Host "   ✅ useEffect has default values for idCardAddress" -ForegroundColor Green
} else {
    Write-Host "   ❌ useEffect missing default values for idCardAddress" -ForegroundColor Red
    exit 1
}

if ($content -match "currentAddress: patient\.currentAddress \|\| \{") {
    Write-Host "   ✅ useEffect has default values for currentAddress" -ForegroundColor Green
} else {
    Write-Host "   ❌ useEffect missing default values for currentAddress" -ForegroundColor Red
    exit 1
}

# 3. Check useState has default values
Write-Host "`n3. Checking useState for default values..." -ForegroundColor Yellow
if ($content -match "const \[formData, setFormData\] = useState\(\{") {
    Write-Host "   ✅ useState initialization found" -ForegroundColor Green
} else {
    Write-Host "   ❌ useState initialization NOT found" -ForegroundColor Red
    exit 1
}

# 4. Count optional chaining usage
$optionalChainingCount = ([regex]::Matches($content, "formData\.(idCardAddress|currentAddress)\?\.")).Count
Write-Host "`n4. Optional chaining usage count: $optionalChainingCount" -ForegroundColor Yellow
if ($optionalChainingCount -ge 10) {
    Write-Host "   ✅ Sufficient optional chaining usage ($optionalChainingCount occurrences)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Low optional chaining usage ($optionalChainingCount occurrences)" -ForegroundColor Yellow
}

Write-Host "`n=== All Checks Passed! ===" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Refresh browser (F5 or Ctrl+Shift+R)" -ForegroundColor White
Write-Host "2. Go to Patients page" -ForegroundColor White
Write-Host "3. Click on a patient" -ForegroundColor White
Write-Host "4. Click Edit button" -ForegroundColor White
Write-Host "5. Modal should open without crash" -ForegroundColor White
