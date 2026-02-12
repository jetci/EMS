# ========================================
# Community Module - QA Test Plan
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Community Module - QA Test Plan" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "TEST ACCOUNT:" -ForegroundColor Yellow
Write-Host "  Email: community1@wecare.dev"
Write-Host "  Password: password"
Write-Host "  Role: COMMUNITY"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Scenarios (20 tests)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. LOGIN & AUTHENTICATION (3 tests)" -ForegroundColor Yellow
Write-Host "   [TC-001] Login with valid credentials"
Write-Host "   [TC-002] Login with invalid credentials"
Write-Host "   [TC-003] Logout successfully"
Write-Host ""

Write-Host "2. PATIENT REGISTRATION (7 tests)" -ForegroundColor Yellow
Write-Host "   [TC-004] Register new patient with valid data"
Write-Host "   [TC-005] Validate Thai National ID (13 digits)"
Write-Host "   [TC-006] Validate phone number format"
Write-Host "   [TC-007] Upload patient photo"
Write-Host "   [TC-008] Upload medical documents (PDF)"
Write-Host "   [TC-009] Select location on map"
Write-Host "   [TC-010] Add chronic diseases and allergies"
Write-Host ""

Write-Host "3. PATIENT MANAGEMENT (3 tests)" -ForegroundColor Yellow
Write-Host "   [TC-011] View patient list (only own patients)"
Write-Host "   [TC-012] Edit patient information"
Write-Host "   [TC-013] Delete patient"
Write-Host ""

Write-Host "4. RIDE REQUEST (5 tests)" -ForegroundColor Yellow
Write-Host "   [TC-014] Create ride request"
Write-Host "   [TC-015] Auto-populate patient data"
Write-Host "   [TC-016] Select destination"
Write-Host "   [TC-017] Set emergency level"
Write-Host "   [TC-018] View ride status"
Write-Host ""

Write-Host "5. DATA ISOLATION (2 tests)" -ForegroundColor Yellow
Write-Host "   [TC-019] Cannot see other users' patients"
Write-Host "   [TC-020] Cannot see other users' rides"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Expected Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "PASS CRITERIA:" -ForegroundColor Green
Write-Host "  - All 20 tests pass"
Write-Host "  - No console errors"
Write-Host "  - No data leakage"
Write-Host "  - Proper validation messages"
Write-Host "  - Smooth user experience"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Known Issues (Already Fixed)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[FIXED] BUG-COMM-001: Input Validation" -ForegroundColor Green
Write-Host "[FIXED] BUG-COMM-005: Hardcoded API URL" -ForegroundColor Green
Write-Host "[FIXED] BUG-COMM-009: Path Traversal" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Backend: http://localhost:3001"
Write-Host "Frontend: http://localhost:3000"
Write-Host "Database: D:\EMS\wecare-backend\db\wecare.db"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick Start Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Start Backend:"
Write-Host "   cd wecare-backend"
Write-Host "   npm run dev"
Write-Host ""

Write-Host "2. Start Frontend:"
Write-Host "   cd .."
Write-Host "   npm run dev"
Write-Host ""

Write-Host "3. Open Browser:"
Write-Host "   http://localhost:3000"
Write-Host ""

Write-Host "4. Login as Community User"
Write-Host "   Email: community1@wecare.dev"
Write-Host "   Password: password"
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "STATUS: READY FOR QA TESTING" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
