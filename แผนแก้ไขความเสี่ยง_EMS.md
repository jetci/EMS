# แผนการแก้ไขความเสี่ยง EMS WeCare

**วันที่จัดทำ**: 16 มกราคม 2569  
**ผู้รับผิดชอบ**: Development Team  
**สถานะ**: 🔄 กำลังดำเนินการ

---

## 📋 ลำดับความสำคัญ (Priority Order)

### 🔴 CRITICAL - ต้องแก้ก่อน Deploy
1. **RISK-003**: SQL Injection Protection
2. **RISK-002**: Data Isolation Breach Prevention
3. **RISK-001**: Real-time Message Reliability
4. **RISK-004**: JWT Token Security Enhancement
5. **RISK-005**: File Upload Security

### 🟡 MEDIUM - แก้หลัง Deploy
6. **RISK-006**: Race Condition in Ride Assignment
7. **RISK-007**: Database Backup Automation

### 🟢 LOW - ไม่จำเป็นเร่งด่วน
8. **RISK-008**: AI Route Optimization Fallback

---

## 🎯 งานที่ 1: RISK-003 - SQL Injection Protection

### สถานะ: 🔄 **พร้อมเริ่มงาน**

### วัตถุประสงค์
ป้องกัน SQL Injection โดยตรวจสอบว่าทุก SQL Query ใช้ Parameterized Queries และมี Input Validation

### ขั้นตอนการแก้ไข

#### 1️⃣ Audit SQL Queries (30 นาที)
**ไฟล์ที่ต้องตรวจสอบ**:
- `wecare-backend/src/routes/*.ts` (21 ไฟล์)
- `wecare-backend/src/services/*.ts`
- `wecare-backend/src/db/queries.ts`

**วิธีตรวจสอบ**:
```bash
# ค้นหา String Concatenation ใน SQL
cd wecare-backend
grep -r "SELECT.*\+" src/
grep -r "INSERT.*\+" src/
grep -r "UPDATE.*\+" src/
grep -r "DELETE.*\+" src/
```

**ผลที่คาดหวัง**: ไม่พบ String Concatenation ใน SQL Queries

#### 2️⃣ แก้ไข SQL Queries (1 ชั่วโมง)
**ตัวอย่างที่ผิด**:
```typescript
// ❌ อันตราย - String Concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;
db.prepare(query).get();
```

**ตัวอย่างที่ถูก**:
```typescript
// ✅ ปลอดภัย - Parameterized Query
const query = `SELECT * FROM users WHERE email = ?`;
db.prepare(query).get(email);
```

**Action Items**:
- [ ] แก้ไขทุก Query ให้ใช้ Parameterized Queries
- [ ] ใช้ `db.prepare()` กับ Placeholder `?`
- [ ] ห้าม String Concatenation

#### 3️⃣ เพิ่ม Input Validation (30 นาที)
**ไฟล์**: `wecare-backend/src/middleware/validation.ts`

```typescript
import Joi from 'joi';

export const validatePatientInput = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    nationalId: Joi.string().pattern(/^\d{13}$/).required(),
    email: Joi.string().email().optional(),
    // Whitelist characters only
    address: Joi.string().pattern(/^[a-zA-Z0-9ก-๙\s,.-]+$/).max(500)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
```

**Action Items**:
- [ ] สร้าง Joi Schema สำหรับทุก API Endpoint
- [ ] Whitelist Characters (ห้าม Special Characters)
- [ ] Apply Middleware ใน Routes

#### 4️⃣ สร้าง Test Script (30 นาที)
**ไฟล์**: `d:\EMS\test-sql-injection.ps1`

```powershell
Write-Host "Testing SQL Injection Protection..." -ForegroundColor Cyan

# Test 1: Login with SQL Injection
$payload = @{
    email = "admin@wecare.dev' OR '1'='1"
    password = "anything"
}

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST -Body ($payload | ConvertTo-Json) -ContentType "application/json"

if ($response.error) {
    Write-Host "✅ PASS: SQL Injection blocked" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: SQL Injection successful" -ForegroundColor Red
}

# Test 2: Patient Registration with SQL Injection
$payload = @{
    fullName = "'; DROP TABLE patients; --"
    nationalId = "1234567890123"
}

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/patients" `
    -Method POST -Body ($payload | ConvertTo-Json) -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" }

if ($response.error -match "validation") {
    Write-Host "✅ PASS: Validation blocked malicious input" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: Malicious input accepted" -ForegroundColor Red
}
```

#### 5️⃣ Run Security Scan (15 นาที)
```bash
# ติดตั้ง OWASP ZAP (ถ้ายังไม่มี)
# Download: https://www.zaproxy.org/download/

# Run Quick Scan
zap-cli quick-scan http://localhost:3000

# หรือใช้ sqlmap
sqlmap -u "http://localhost:3001/api/auth/login" --data="email=test&password=test"
```

### เกณฑ์การผ่าน (Pass Criteria)
- ✅ ไม่พบ String Concatenation ใน SQL Queries
- ✅ ทุก Query ใช้ Parameterized Queries
- ✅ มี Input Validation ทุก Endpoint
- ✅ Test Script ผ่านทั้งหมด
- ✅ OWASP ZAP ไม่พบ SQL Injection Vulnerability

### เวลาที่ใช้โดยประมาณ: **2.5 ชั่วโมง**

---

## 📝 Template รายงานการแก้ไข

```markdown
# รายงานการแก้ไข RISK-003: SQL Injection Protection

**วันที่**: [วันที่แก้ไข]  
**ผู้แก้ไข**: [ชื่อ]  
**สถานะ**: ✅ เสร็จสมบูรณ์ / ⚠️ มีปัญหา / ❌ ไม่ผ่าน

## สรุปการแก้ไข
- [x] Audit SQL Queries: พบ X ไฟล์ที่ต้องแก้ไข
- [x] แก้ไข SQL Queries: แก้ไขแล้ว X ไฟล์
- [x] เพิ่ม Input Validation: เพิ่มแล้ว X Schemas
- [x] สร้าง Test Script: สร้างแล้ว
- [x] Run Security Scan: ผลลัพธ์...

## ไฟล์ที่แก้ไข
1. `wecare-backend/src/routes/auth.ts` - แก้ไข Login Query
2. `wecare-backend/src/routes/patients.ts` - แก้ไข CRUD Queries
3. ...

## ผลการทดสอบ
- Test 1: Login SQL Injection → ✅ PASS
- Test 2: Patient Registration → ✅ PASS
- OWASP ZAP Scan → ✅ No vulnerabilities found

## ปัญหาที่พบ (ถ้ามี)
- [ระบุปัญหา]

## ข้อเสนอแนะ
- [ข้อเสนอแนะ]
```

---

## 🔄 Workflow การแก้ไขแต่ละงาน

```
1. เริ่มงาน
   ↓
2. ทำการแก้ไข (ตามขั้นตอน)
   ↓
3. ทดสอบ
   ↓
4. ผ่าน? 
   ├─ ❌ ไม่ผ่าน → กลับไปข้อ 2
   └─ ✅ ผ่าน → ต่อไป
   ↓
5. ส่งรายงานการแก้ไข
   ↓
6. Commit & Push
   ↓
7. เริ่มงานใหม่ (งานถัดไป)
```

---

## 📊 Progress Tracker

| งาน | ความเสี่ยง | สถานะ | ผู้รับผิดชอบ | เวลาที่ใช้ | วันที่เสร็จ |
|-----|-----------|-------|-------------|----------|-----------|
| 1 | RISK-003 | 🔄 กำลังทำ | - | - | - |
| 2 | RISK-002 | ⏳ รอ | - | - | - |
| 3 | RISK-001 | ⏳ รอ | - | - | - |
| 4 | RISK-004 | ⏳ รอ | - | - | - |
| 5 | RISK-005 | ⏳ รอ | - | - | - |
| 6 | RISK-006 | ⏳ รอ | - | - | - |
| 7 | RISK-007 | ⏳ รอ | - | - | - |
| 8 | RISK-008 | ⏳ รอ | - | - | - |

---

## 📌 หมายเหตุ

- แต่ละงานต้องผ่านการทดสอบก่อนถึงจะถือว่าเสร็จสมบูรณ์
- ต้องส่งรายงานการแก้ไขทุกงาน
- ถ้าไม่ผ่านการทดสอบ ต้องกลับไปแก้ไขจนกว่าจะผ่าน
- Commit Code หลังจากแต่ละงานเสร็จ
