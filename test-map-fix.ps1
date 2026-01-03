# test-map-fix.ps1
$content = Get-Content "d:\EMS\components\SimpleMapTest.tsx" -Raw
if ($content -match "import.meta.env.VITE_GOOGLE_MAPS_API_KEY") {
    Write-Host "Map Fix: PASS" -ForegroundColor Green
}
else {
    Write-Host "Map Fix: FAIL" -ForegroundColor Red
}
