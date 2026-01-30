$ErrorActionPreference = "Stop"

function Test-FileContent {
    param (
        [string]$FilePath,
        [string]$SearchString,
        [bool]$ShouldExist
    )

    if (-not (Test-Path $FilePath)) {
        Write-Host "❌ File not found: $FilePath" -ForegroundColor Red
        return $false
    }

    $content = Get-Content $FilePath -Raw
    $found = $content.Contains($SearchString)

    if ($ShouldExist -and $found) {
        Write-Host "✅ Found '$SearchString' in $FilePath (Expected)" -ForegroundColor Green
        return $true
    }
    elseif ($ShouldExist -and -not $found) {
        Write-Host "❌ Did NOT find '$SearchString' in $FilePath (Expected to exist)" -ForegroundColor Red
        return $false
    }
    elseif (-not $ShouldExist -and -not $found) {
        Write-Host "✅ Did NOT find '$SearchString' in $FilePath (Expected)" -ForegroundColor Green
        return $true
    }
    elseif (-not $ShouldExist -and $found) {
        Write-Host "❌ Found '$SearchString' in $FilePath (Expected NOT to exist)" -ForegroundColor Red
        return $false
    }
}

Write-Host "Starting verification for Community Dispatch Removal..." -ForegroundColor Cyan

# 1. Verify ManageRidesPage.tsx (Community) does NOT have Assign functionality
$communityPage = "d:\EMS\pages\ManageRidesPage.tsx"
$test1 = Test-FileContent -FilePath $communityPage -SearchString "AssignDriverModal" -ShouldExist $false
$test2 = Test-FileContent -FilePath $communityPage -SearchString "openAssignModal" -ShouldExist $false
$test3 = Test-FileContent -FilePath $communityPage -SearchString "จ่ายงาน" -ShouldExist $false

# 2. Verify OfficeManageRidesPage.tsx (Officer) DOES have Assign functionality
$officerPage = "d:\EMS\pages\OfficeManageRidesPage.tsx"
$test4 = Test-FileContent -FilePath $officerPage -SearchString "AssignDriverModal" -ShouldExist $true
$test5 = Test-FileContent -FilePath $officerPage -SearchString "handleOpenAssignModal" -ShouldExist $true
$test6 = Test-FileContent -FilePath $officerPage -SearchString "จ่ายงาน" -ShouldExist $true

if ($test1 -and $test2 -and $test3 -and $test4 -and $test5 -and $test6) {
    Write-Host "🎉 All verification checks passed!" -ForegroundColor Green
}
else {
    Write-Host "⚠️ Some verification checks failed." -ForegroundColor Yellow
    exit 1
}
