# Password Migration Script (PowerShell)
# Migrates existing plain-text passwords to bcrypt hashed passwords
# 
# IMPORTANT: Run this ONCE after deploying password security updates
# 
# Usage: .\migrate-passwords.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Password Migration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location -Path ".\wecare-backend"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if bcrypt is installed
if (-not (Test-Path "node_modules\bcrypt")) {
    Write-Host "Installing bcrypt..." -ForegroundColor Yellow
    npm install bcrypt @types/bcrypt
}

Write-Host ""
Write-Host "⚠️  WARNING: This will hash all plain-text passwords in the database" -ForegroundColor Yellow
Write-Host "⚠️  Make sure you have a backup before proceeding!" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Do you want to continue? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "Migration cancelled." -ForegroundColor Red
    Set-Location -Path ".."
    exit 0
}

Write-Host ""
Write-Host "Starting migration..." -ForegroundColor Green
Write-Host ""

# Run the migration script
try {
    node migrate-passwords.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
    }
    else {
        Write-Host ""
        Write-Host "❌ Migration failed. Please check the errors above." -ForegroundColor Red
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Error running migration: $_" -ForegroundColor Red
}

# Return to original directory
Set-Location -Path ".."
