# Clear Edge Browser Cache
Write-Host "Clearing Microsoft Edge cache..." -ForegroundColor Yellow
$edgeCachePath = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache"
if (Test-Path $edgeCachePath) {
    Remove-Item -Path "$edgeCachePath\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Edge cache cleared" -ForegroundColor Green
} else {
    Write-Host "Edge cache path not found" -ForegroundColor Red
}

# Clear Chrome Browser Cache
Write-Host "`nClearing Google Chrome cache..." -ForegroundColor Yellow
$chromeCachePath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache"
if (Test-Path $chromeCachePath) {
    Remove-Item -Path "$chromeCachePath\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Chrome cache cleared" -ForegroundColor Green
} else {
    Write-Host "Chrome cache path not found" -ForegroundColor Red
}

Write-Host "`n✅ Done! Please restart your browser and try again." -ForegroundColor Green
Write-Host "URL: http://localhost:5174" -ForegroundColor Cyan
