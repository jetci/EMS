# ========================================
# Test Script: Unified Patient Management
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 Unified Patient Management Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @()
$passCount = 0
$failCount = 0

# ============================================
# Test 1: ตรวจสอบไฟล์ที่สร้าง
# ============================================
Write-Host "Test 1: ตรวจสอบไฟล์ที่สร้าง" -ForegroundColor Yellow
Write-Host "-" * 60

$files = @(
    "d:\EMS\src\config\permissions.ts",
    "d:\EMS\src\hooks\usePermissions.ts",
    "d:\EMS\src\pages\unified\UnifiedPatientManagementPage.tsx",
    "d:\EMS\src\pages\wrappers\CommunityPatientWrapper.tsx",
    "d:\EMS\src\pages\wrappers\OfficePatientWrapper.tsx",
    "d:\EMS\src\components\patient\PatientListTable.tsx"
)

foreach ($file in $files) {
    $exists = Test-Path $file
    $fileName = Split-Path $file -Leaf
    
    if ($exists) {
        Write-Host "  ✅ $fileName - พบไฟล์" -ForegroundColor Green
        $passCount++
        $testResults += @{
            Test    = "File Exists: $fileName"
            Status  = "PASS"
            Message = "ไฟล์มีอยู่"
        }
    }
    else {
        Write-Host "  ❌ $fileName - ไม่พบไฟล์" -ForegroundColor Red
        $failCount++
        $testResults += @{
            Test    = "File Exists: $fileName"
            Status  = "FAIL"
            Message = "ไม่พบไฟล์"
        }
    }
}

Write-Host ""

# ============================================
# Test 2: ตรวจสอบ Import Statements
# ============================================
Write-Host "Test 2: ตรวจสอบ Import Statements" -ForegroundColor Yellow
Write-Host "-" * 60

$unifiedPagePath = "d:\EMS\src\pages\unified\UnifiedPatientManagementPage.tsx"

if (Test-Path $unifiedPagePath) {
    $content = Get-Content $unifiedPagePath -Raw
    
    # Check imports
    $imports = @(
        "useAuth",
        "usePermissions",
        "patientsAPI",
        "PatientListTable"
    )
    
    foreach ($import in $imports) {
        if ($content -match $import) {
            Write-Host "  ✅ Import $import - พบ" -ForegroundColor Green
            $passCount++
            $testResults += @{
                Test    = "Import: $import"
                Status  = "PASS"
                Message = "พบ import"
            }
        }
        else {
            Write-Host "  ❌ Import $import - ไม่พบ" -ForegroundColor Red
            $failCount++
            $testResults += @{
                Test    = "Import: $import"
                Status  = "FAIL"
                Message = "ไม่พบ import"
            }
        }
    }
}
else {
    Write-Host "  ❌ ไม่พบไฟล์ UnifiedPatientManagementPage.tsx" -ForegroundColor Red
    $failCount++
}

Write-Host ""

# ============================================
# Test 3: ตรวจสอบ RBAC Logic
# ============================================
Write-Host "Test 3: ตรวจสอบ RBAC Logic" -ForegroundColor Yellow
Write-Host "-" * 60

if (Test-Path $unifiedPagePath) {
    $content = Get-Content $unifiedPagePath -Raw
    
    # Check RBAC features
    $features = @(
        "permissions.getFilterParams",
        "permissions.canEdit",
        "permissions.canDelete",
        "permissions.create",
        "permissions.itemsPerPage"
    )
    
    foreach ($feature in $features) {
        if ($content -match [regex]::Escape($feature)) {
            Write-Host "  ✅ RBAC: $feature - พบ" -ForegroundColor Green
            $passCount++
            $testResults += @{
                Test    = "RBAC: $feature"
                Status  = "PASS"
                Message = "พบ RBAC logic"
            }
        }
        else {
            Write-Host "  ❌ RBAC: $feature - ไม่พบ" -ForegroundColor Red
            $failCount++
            $testResults += @{
                Test    = "RBAC: $feature"
                Status  = "FAIL"
                Message = "ไม่พบ RBAC logic"
            }
        }
    }
}

Write-Host ""

# ============================================
# Test 4: ตรวจสอบ TypeScript Syntax
# ============================================
Write-Host "Test 4: ตรวจสอบ TypeScript Syntax" -ForegroundColor Yellow
Write-Host "-" * 60

Write-Host "  ⏳ กำลังตรวจสอบ TypeScript syntax..." -ForegroundColor Gray

try {
    # Try to compile TypeScript
    $tscOutput = npx tsc --noEmit --skipLibCheck 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ TypeScript Syntax - ผ่าน" -ForegroundColor Green
        $passCount++
        $testResults += @{
            Test    = "TypeScript Syntax"
            Status  = "PASS"
            Message = "ไม่พบ syntax error"
        }
    }
    else {
        Write-Host "  ❌ TypeScript Syntax - มี Error" -ForegroundColor Red
        Write-Host "  Error: $tscOutput" -ForegroundColor Red
        $failCount++
        $testResults += @{
            Test    = "TypeScript Syntax"
            Status  = "FAIL"
            Message = "พบ syntax error"
        }
    }
}
catch {
    Write-Host "  ⚠️  ไม่สามารถตรวจสอบ TypeScript ได้" -ForegroundColor Yellow
    Write-Host "  Error: $_" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# Test 5: ตรวจสอบ Component Structure
# ============================================
Write-Host "Test 5: ตรวจสอบ Component Structure" -ForegroundColor Yellow
Write-Host "-" * 60

if (Test-Path $unifiedPagePath) {
    $content = Get-Content $unifiedPagePath -Raw
    
    # Check component structure
    $structures = @(
        "loadPatients",
        "handleEdit",
        "handleDelete",
        "handleViewDetails",
        "handleCreatePatient",
        "PatientListTable"
    )
    
    foreach ($structure in $structures) {
        if ($content -match $structure) {
            Write-Host "  ✅ Component: $structure - พบ" -ForegroundColor Green
            $passCount++
            $testResults += @{
                Test    = "Component: $structure"
                Status  = "PASS"
                Message = "พบ component/function"
            }
        }
        else {
            Write-Host "  ❌ Component: $structure - ไม่พบ" -ForegroundColor Red
            $failCount++
            $testResults += @{
                Test    = "Component: $structure"
                Status  = "FAIL"
                Message = "ไม่พบ component/function"
            }
        }
    }
}

Write-Host ""

# ============================================
# Test 6: ตรวจสอบ Wrapper Pages
# ============================================
Write-Host "Test 6: ตรวจสอบ Wrapper Pages" -ForegroundColor Yellow
Write-Host "-" * 60

$wrappers = @(
    @{
        Path = "d:\EMS\src\pages\wrappers\CommunityPatientWrapper.tsx"
        Name = "CommunityPatientWrapper"
    },
    @{
        Path = "d:\EMS\src\pages\wrappers\OfficePatientWrapper.tsx"
        Name = "OfficePatientWrapper"
    }
)

foreach ($wrapper in $wrappers) {
    if (Test-Path $wrapper.Path) {
        $content = Get-Content $wrapper.Path -Raw
        
        if ($content -match "UnifiedPatientManagementPage") {
            Write-Host "  ✅ $($wrapper.Name) - ใช้ Unified Page" -ForegroundColor Green
            $passCount++
            $testResults += @{
                Test    = "Wrapper: $($wrapper.Name)"
                Status  = "PASS"
                Message = "ใช้ UnifiedPatientManagementPage"
            }
        }
        else {
            Write-Host "  ❌ $($wrapper.Name) - ไม่ใช้ Unified Page" -ForegroundColor Red
            $failCount++
            $testResults += @{
                Test    = "Wrapper: $($wrapper.Name)"
                Status  = "FAIL"
                Message = "ไม่ใช้ UnifiedPatientManagementPage"
            }
        }
    }
    else {
        Write-Host "  ❌ $($wrapper.Name) - ไม่พบไฟล์" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""

# ============================================
# Test Summary
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$total = $passCount + $failCount
$passRate = if ($total -gt 0) { [math]::Round(($passCount / $total) * 100, 2) } else { 0 }

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })
Write-Host ""

if ($passRate -eq 100) {
    Write-Host "✅ All Tests Passed!" -ForegroundColor Green
    Write-Host "🎉 Unified Patient Management is ready!" -ForegroundColor Green
}
elseif ($passRate -ge 80) {
    Write-Host "⚠️  Most Tests Passed" -ForegroundColor Yellow
    Write-Host "📝 Please review failed tests" -ForegroundColor Yellow
}
else {
    Write-Host "❌ Many Tests Failed" -ForegroundColor Red
    Write-Host "🔧 Please fix the issues" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# ============================================
# Generate Test Report
# ============================================
$reportPath = "d:\EMS\TEST_REPORT_UNIFIED_PATIENT.md"

$report = @"
# 🧪 Test Report: Unified Patient Management

**วันที่**: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")  
**ผู้ทดสอบ**: Automated Test Script  
**สถานะ**: $(if ($passRate -eq 100) { "✅ PASS" } elseif ($passRate -ge 80) { "⚠️ WARNING" } else { "❌ FAIL" })

---

## 📊 สรุปผลการทดสอบ

- **Total Tests**: $total
- **Passed**: $passCount
- **Failed**: $failCount
- **Pass Rate**: $passRate%

---

## 📋 รายละเอียดการทดสอบ

"@

foreach ($result in $testResults) {
    $status = if ($result.Status -eq "PASS") { "✅" } else { "❌" }
    $report += "`n- $status **$($result.Test)**: $($result.Message)"
}

$report += @"


---

## 🎯 สรุป

$(if ($passRate -eq 100) {
    "✅ **ผ่านทุก Test** - Unified Patient Management พร้อมใช้งาน"
} elseif ($passRate -ge 80) {
    "⚠️ **ผ่านส่วนใหญ่** - มีบางส่วนที่ต้องแก้ไข"
} else {
    "❌ **ไม่ผ่าน** - ต้องแก้ไขปัญหาหลายจุด"
})

---

**Generated by**: Automated Test Script  
**Date**: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
"@

$report | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "📄 Test Report saved to: $reportPath" -ForegroundColor Cyan
Write-Host ""
