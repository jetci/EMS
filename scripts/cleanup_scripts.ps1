
# 1. Remove old pages directory if empty
if (Test-Path "d:\EMS\pages") {
    Remove-Item "d:\EMS\pages" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Removed old pages directory."
}

# 2. Create Archive Directory
$archiveDir = "d:\EMS\dev-tools\scripts\archive"
if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
}

# 3. Define Keep List
$keepList = @(
    "QA-COMMUNITY-TEST-PLAN.ps1",
    "run-all-tests.ps1",
    "start-all.ps1",
    "reset-db.ps1",
    "check-backend-status.ps1",
    "check-login.ps1",
    "fix-login-now.ps1",
    "run-system.ps1",
    "move_pages.ps1",
    "cleanup_scripts.ps1"
)

# 4. Move Scripts
$scripts = Get-ChildItem -Path "d:\EMS" -Filter "*.ps1"

foreach ($script in $scripts) {
    if ($script.Name -notin $keepList) {
        Move-Item -Path $script.FullName -Destination $archiveDir -Force
        Write-Host "Archived: $($script.Name)"
    }
}

Write-Host "Script cleanup complete."
