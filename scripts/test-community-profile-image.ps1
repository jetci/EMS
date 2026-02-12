# Test Community Profile Image Upload Fix
Write-Host "=== Testing Community Profile Image Upload Fix ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Target Page: Community Profile & Settings" -ForegroundColor Yellow
Write-Host "URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

Write-Host "=== Test Scenarios ===" -ForegroundColor Yellow
Write-Host ""

Write-Host "Scenario 1: Cancel file selection" -ForegroundColor Cyan
Write-Host "  Steps:" -ForegroundColor White
Write-Host "    1. Login as community user"
Write-Host "    2. Go to 'Profile & Settings' page"
Write-Host "    3. Click 'Edit Profile' button"
Write-Host "    4. Click 'Change Picture' button"
Write-Host "    5. Select 'Choose from Gallery'"
Write-Host "    6. Click Cancel (don't select any file)"
Write-Host ""
Write-Host "  Expected Result:" -ForegroundColor Green
Write-Host "    - No toast message appears"
Write-Host "    - Profile picture remains unchanged"
Write-Host ""

Write-Host "Scenario 2: Invalid file type" -ForegroundColor Cyan
Write-Host "  Steps:" -ForegroundColor White
Write-Host "    1-5. Same as Scenario 1"
Write-Host "    6. Select a .txt or .pdf file"
Write-Host ""
Write-Host "  Expected Result:" -ForegroundColor Green
Write-Host "    - Toast: 'Please select image file (PNG, JPG, GIF) only'"
Write-Host "    - Profile picture remains unchanged"
Write-Host ""

Write-Host "Scenario 3: File too large" -ForegroundColor Cyan
Write-Host "  Steps:" -ForegroundColor White
Write-Host "    1-5. Same as Scenario 1"
Write-Host "    6. Select an image file > 1MB"
Write-Host ""
Write-Host "  Expected Result:" -ForegroundColor Green
Write-Host "    - Toast: 'File size must not exceed 1MB'"
Write-Host "    - Profile picture remains unchanged"
Write-Host ""

Write-Host "Scenario 4: Valid image file" -ForegroundColor Cyan
Write-Host "  Steps:" -ForegroundColor White
Write-Host "    1-5. Same as Scenario 1"
Write-Host "    6. Select a valid PNG/JPG file < 1MB"
Write-Host ""
Write-Host "  Expected Result:" -ForegroundColor Green
Write-Host "    - Image preview appears immediately"
Write-Host "    - Toast: 'Upload successful!'"
Write-Host ""

Write-Host "Scenario 5: Take new photo" -ForegroundColor Cyan
Write-Host "  Steps:" -ForegroundColor White
Write-Host "    1-4. Same as Scenario 1"
Write-Host "    5. Select 'Take New Photo'"
Write-Host "    6. Allow camera access"
Write-Host "    7. Take a photo"
Write-Host ""
Write-Host "  Expected Result:" -ForegroundColor Green
Write-Host "    - Camera modal opens"
Write-Host "    - Photo captured successfully"
Write-Host "    - Toast: 'Profile picture updated!'"
Write-Host ""

Write-Host "=== Code Changes Summary ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "File: src/pages/CommunityProfilePage.tsx" -ForegroundColor White
Write-Host ""
Write-Host "Changes:" -ForegroundColor Green
Write-Host "  1. Added handleImageSelect function with validation"
Write-Host "  2. Modified actionSheetOptions to trigger file input"
Write-Host "  3. Added hidden file input element"
Write-Host "  4. Fixed API parameter (fullName -> name)"
Write-Host ""

Write-Host "Validations Added:" -ForegroundColor Green
Write-Host "  - Check if file is selected (handle Cancel)"
Write-Host "  - Validate file type (PNG, JPG, GIF only)"
Write-Host "  - Validate file size (max 1MB)"
Write-Host "  - Handle FileReader errors"
Write-Host ""

Write-Host "=== Server Status ===" -ForegroundColor Yellow
$frontendRunning = netstat -ano | findstr :5173
$backendRunning = netstat -ano | findstr :3001

if ($frontendRunning) {
    Write-Host "  Frontend: Running on http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "  Frontend: Not running" -ForegroundColor Red
    Write-Host "  Run: npm run dev" -ForegroundColor Yellow
}

if ($backendRunning) {
    Write-Host "  Backend: Running on http://localhost:3001" -ForegroundColor Green
} else {
    Write-Host "  Backend: Not running" -ForegroundColor Red
    Write-Host "  Run: cd wecare-backend && npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Ready for Testing! ===" -ForegroundColor Green
Write-Host "Open: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Accounts:" -ForegroundColor Yellow
Write-Host "  Admin: admin@wecare.ems / Admin@123"
Write-Host "  (Use any community user account for testing)"
Write-Host ""
