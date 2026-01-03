# Install Security Dependencies
# Run this script to install required security packages

Write-Host "Installing security dependencies..." -ForegroundColor Yellow

cd wecare-backend

# Install helmet for security headers
npm install helmet

# Install express-rate-limit for rate limiting
npm install express-rate-limit

# Install express-validator for additional validation
npm install express-validator

# Install better-sqlite3 if not already installed (for migration)
npm install better-sqlite3

Write-Host "✅ Security dependencies installed successfully!" -ForegroundColor Green
