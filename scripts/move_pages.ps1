
$sourceDir = "d:\EMS\pages"
$destDir = "d:\EMS\src\pages"

# Ensure destination exists
if (-not (Test-Path -Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
}

# Get all files in source
$files = Get-ChildItem -Path $sourceDir -File

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Update imports
    # 1. Imports pointing to src/ (e.g. ../src/services) -> ../services
    $content = $content -replace "from '\.\./src/", "from '../"
    $content = $content -replace 'from "\.\./src/', 'from "../'
    
    # 2. Imports pointing to root folders (components, types, assets, utils) -> ../../folder
    $content = $content -replace "from '\.\./components", "from '../../components"
    $content = $content -replace 'from "\.\./components', 'from "../../components'
    
    $content = $content -replace "from '\.\./types", "from '../../types"
    $content = $content -replace 'from "\.\./types', 'from "../../types'
    
    $content = $content -replace "from '\.\./assets", "from '../../assets"
    $content = $content -replace 'from "\.\./assets', 'from "../../assets'
    
    $content = $content -replace "from '\.\./utils", "from '../../utils"
    $content = $content -replace 'from "\.\./utils', 'from "../../utils'
    
    # Write to new location
    $destPath = Join-Path -Path $destDir -ChildPath $file.Name
    Set-Content -Path $destPath -Value $content
    
    Write-Host "Moved and updated: $($file.Name)"
}

# Update App.tsx
$appPath = "d:\EMS\App.tsx"
$appContent = Get-Content -Path $appPath -Raw
$appContent = $appContent -replace "from '\./pages/", "from './src/pages/"
$appContent = $appContent -replace 'from "\./pages/', 'from "./src/pages/'
Set-Content -Path $appPath -Value $appContent
Write-Host "Updated App.tsx"

# Update AuthenticatedLayout.tsx
$layoutPath = "d:\EMS\components\layout\AuthenticatedLayout.tsx"
if (Test-Path $layoutPath) {
    $layoutContent = Get-Content -Path $layoutPath -Raw
    $layoutContent = $layoutContent -replace "from '\.\./\.\./pages/", "from '../../src/pages/"
    $layoutContent = $layoutContent -replace 'from "\.\./\.\./pages/', 'from "../../src/pages/'
    Set-Content -Path $layoutPath -Value $layoutContent
    Write-Host "Updated AuthenticatedLayout.tsx"
}

# Verify and Remove old pages dir if empty (or just warn)
Write-Host "Please verify the move. Old 'pages' directory still exists."
