# Check backend environment and configuration
Write-Host "=== BACKEND ENVIRONMENT CHECK ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
$envPath = "d:\EMS\wecare-backend\.env"
if (Test-Path $envPath) {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    
    # Read and check for JWT_SECRET (without showing the actual value)
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match "JWT_SECRET=(.+)") {
        $jwtSecret = $matches[1].Trim()
        if ($jwtSecret -and $jwtSecret -ne "your-super-secret-jwt-key-change-this-in-production") {
            Write-Host "✅ JWT_SECRET is set (length: $($jwtSecret.Length) chars)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  JWT_SECRET is using default value or empty" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ JWT_SECRET not found in .env" -ForegroundColor Red
    }
    
    # Check PORT
    if ($envContent -match "PORT=(\d+)") {
        $port = $matches[1]
        Write-Host "✅ PORT is set to: $port" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PORT not set (will default to 3001)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env file NOT FOUND!" -ForegroundColor Red
    Write-Host "   Expected at: $envPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== CHECKING BACKEND PROCESS ===" -ForegroundColor Cyan

# Find backend directory
$backendDir = "d:\EMS\wecare-backend"
if (Test-Path $backendDir) {
    Write-Host "✅ Backend directory exists" -ForegroundColor Green
    
    # Check if package.json exists
    if (Test-Path "$backendDir\package.json") {
        Write-Host "✅ package.json exists" -ForegroundColor Green
    }
    
    # Check if node_modules exists
    if (Test-Path "$backendDir\node_modules") {
        Write-Host "✅ node_modules exists" -ForegroundColor Green
        
        # Check for bcrypt
        if (Test-Path "$backendDir\node_modules\bcrypt") {
            Write-Host "✅ bcrypt module installed" -ForegroundColor Green
        } else {
            Write-Host "❌ bcrypt module NOT FOUND" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ node_modules NOT FOUND - run npm install" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Backend directory NOT FOUND!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== RECOMMENDATION ===" -ForegroundColor Cyan
Write-Host "The backend needs to be restarted on the correct port (3001)" -ForegroundColor Yellow
Write-Host "Current backend is on port 3000 and returning 500 errors" -ForegroundColor Yellow
Write-Host ""
Write-Host "To fix:" -ForegroundColor White
Write-Host "1. Stop all Node processes" -ForegroundColor White
Write-Host "2. cd wecare-backend" -ForegroundColor White
Write-Host "3. Ensure .env has JWT_SECRET set" -ForegroundColor White
Write-Host "4. npm run dev" -ForegroundColor White
Write-Host "5. Verify it starts on port 3001" -ForegroundColor White
