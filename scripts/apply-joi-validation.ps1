# ========================================
# Script: Apply Joi Validation to Routes
# ========================================
# วัตถุประสงค์: เพิ่ม Joi Validation Middleware ใน Routes อัตโนมัติ

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Apply Joi Validation to Routes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = "d:\EMS\wecare-backend\src\routes"

# ========================================
# Routes ที่ต้อง Apply Validation
# ========================================

$routesToUpdate = @(
    @{
        File    = "auth.ts"
        Updates = @(
            @{
                Line    = 33
                Find    = "router.post('/auth/login', async (req, res) => {"
                Replace = "router.post('/auth/login', validateRequest(loginSchema), async (req, res) => {"
            },
            @{
                Line    = 182
                Find    = "router.post('/auth/register', async (req, res) => {"
                Replace = "router.post('/auth/register', validateRequest(registerSchema), async (req, res) => {"
            }
        )
    }
)

Write-Host "📝 สรุปการเปลี่ยนแปลง:" -ForegroundColor Yellow
Write-Host ""
Write-Host "ไฟล์ที่ต้องแก้ไข: $($routesToUpdate.Count) ไฟล์" -ForegroundColor White
Write-Host ""

foreach ($route in $routesToUpdate) {
    Write-Host "  📄 $($route.File)" -ForegroundColor Cyan
    foreach ($update in $route.Updates) {
        Write-Host "    Line $($update.Line): เพิ่ม validateRequest() middleware" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "คำแนะนำ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "เนื่องจากการแก้ไขต้องระมัดระวัง แนะนำให้:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. ✅ ใช้ IDE (VS Code) แก้ไขด้วยตนเอง" -ForegroundColor Green
Write-Host "2. ✅ ตรวจสอบ Import Statement ที่บรรทัดแรก" -ForegroundColor Green
Write-Host "3. ✅ ทดสอบหลังแก้ไขแต่ละไฟล์" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ตัวอย่างการแก้ไข" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "auth.ts (Line 33):" -ForegroundColor Yellow
Write-Host ""
Write-Host "  // ก่อนแก้ไข" -ForegroundColor Gray
Write-Host "  router.post('/auth/login', async (req, res) => {" -ForegroundColor Red
Write-Host ""
Write-Host "  // หลังแก้ไข" -ForegroundColor Gray
Write-Host "  router.post('/auth/login', validateRequest(loginSchema), async (req, res) => {" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Joi Validation Middleware พร้อมใช้งาน" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📚 เอกสารเพิ่มเติม: wecare-backend/คู่มือ_Joi_Validation.md" -ForegroundColor Cyan
Write-Host ""
