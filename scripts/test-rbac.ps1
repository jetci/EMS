# RBAC Configuration Test Script

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 RBAC Configuration Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 Testing RBAC Configuration..." -ForegroundColor Yellow
Write-Host ""

# Run TypeScript test file
Write-Host "Running tests..." -ForegroundColor Gray
Write-Host ""

# Note: This requires ts-node to be installed
# npm install -D ts-node @types/node

try {
    # Try to run with ts-node
    npx ts-node src/tests/rbac.test.ts
}
catch {
    Write-Host "❌ Error: ts-node not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing ts-node..." -ForegroundColor Yellow
    npm install -D ts-node @types/node
    
    Write-Host ""
    Write-Host "Running tests again..." -ForegroundColor Yellow
    npx ts-node src/tests/rbac.test.ts
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
