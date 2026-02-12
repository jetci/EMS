# Implementation Checklist - Joi Validation

**วันที่**: 16 มกราคม 2569  
**เวลา**: 10:30 น.  
**สถานะ**: 🔄 **รอ Implementation**

---

## ✅ Checklist การ Apply Joi Validation

### ขั้นตอนที่ 1: Auth Routes
**ไฟล์**: `wecare-backend/src/routes/auth.ts`

- [ ] **Line 33**: เพิ่ม `validateRequest(loginSchema)`
  ```typescript
  // ก่อน
  router.post('/auth/login', async (req, res) => {
  
  // หลัง
  router.post('/auth/login', validateRequest(loginSchema), async (req, res) => {
  ```

- [ ] **Line 182**: เพิ่ม `validateRequest(registerSchema)`
  ```typescript
  // ก่อน
  router.post('/auth/register', async (req, res) => {
  
  // หลัง
  router.post('/auth/register', validateRequest(registerSchema), async (req, res) => {
  ```

- [ ] **ทดสอบ**: Login with invalid email
- [ ] **ทดสอบ**: Login with short password
- [ ] **ทดสอบ**: Register with invalid data

---

### ขั้นตอนที่ 2: Patient Routes
**ไฟล์**: `wecare-backend/src/routes/patients.ts`

- [ ] **Line 1**: เพิ่ม import
  ```typescript
  import { validateRequest, patientCreateSchema, patientUpdateSchema } from '../middleware/joiValidation';
  ```

- [ ] **Line 319**: เพิ่ม `validateRequest(patientCreateSchema)`
  ```typescript
  router.post('/', 
      checkDuplicatePatient, 
      upload.fields([...]),
      validateRequest(patientCreateSchema),  // เพิ่มบรรทัดนี้
      async (req: AuthRequest, res) => {
  ```

- [ ] **Line 500**: เพิ่ม `validateRequest(patientUpdateSchema)`
  ```typescript
  router.put('/:id', 
      upload.fields([...]),
      validateRequest(patientUpdateSchema),  // เพิ่มบรรทัดนี้
      async (req: AuthRequest, res) => {
  ```

- [ ] **ทดสอบ**: Create patient with invalid fullName
- [ ] **ทดสอบ**: Create patient with invalid nationalId
- [ ] **ทดสอบ**: Update patient with invalid data

---

### ขั้นตอนที่ 3: Ride Routes
**ไฟล์**: `wecare-backend/src/routes/rides.ts`

- [ ] **Line 1**: เพิ่ม import
  ```typescript
  import { validateRequest, rideCreateSchema, rideUpdateSchema } from '../middleware/joiValidation';
  ```

- [ ] **Line 178**: เพิ่ม `validateRequest(rideCreateSchema)`
  ```typescript
  router.post('/', 
      checkDuplicateRide,
      validateRequest(rideCreateSchema),  // เพิ่มบรรทัดนี้
      async (req: AuthRequest, res) => {
  ```

- [ ] **Line 260**: เพิ่ม `validateRequest(rideUpdateSchema)`
  ```typescript
  router.put('/:id', 
      validateRequest(rideUpdateSchema),  // เพิ่มบรรทัดนี้
      async (req: AuthRequest, res) => {
  ```

- [ ] **ทดสอบ**: Create ride with invalid patientId
- [ ] **ทดสอบ**: Create ride with invalid pickupLocation
- [ ] **ทดสอบ**: Update ride with invalid status

---

## 🧪 Test Cases

### Test 1: Login Validation
```powershell
# Invalid Email
$body = @{
    email = "invalid-email"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Expected: 400 Bad Request
# {
#   "error": "Validation failed",
#   "details": [
#     {
#       "field": "email",
#       "message": "รูปแบบอีเมลไม่ถูกต้อง"
#     }
#   ]
# }
```

### Test 2: Patient Validation
```powershell
# Invalid Data
$token = "YOUR_TOKEN_HERE"

$body = @{
    fullName = "A"
    nationalId = "123"
    contactPhone = "12345"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/patients" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" }

# Expected: 400 Bad Request
# {
#   "error": "Validation failed",
#   "details": [
#     {
#       "field": "fullName",
#       "message": "ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร"
#     },
#     {
#       "field": "nationalId",
#       "message": "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก"
#     },
#     {
#       "field": "contactPhone",
#       "message": "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0"
#     }
#   ]
# }
```

### Test 3: Ride Validation
```powershell
# Invalid Data
$token = "YOUR_TOKEN_HERE"

$body = @{
    patientId = "INVALID"
    patientName = "Test Patient"
    pickupLocation = "ABC"
    destination = "XYZ"
    appointmentTime = "2024-01-01T10:00:00Z"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/rides" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" }

# Expected: 400 Bad Request
# {
#   "error": "Validation failed",
#   "details": [
#     {
#       "field": "patientId",
#       "message": "รหัสผู้ป่วยไม่ถูกต้อง"
#     },
#     {
#       "field": "pickupLocation",
#       "message": "ที่อยู่จุดรับต้องมีอย่างน้อย 5 ตัวอักษร"
#     },
#     {
#       "field": "destination",
#       "message": "ปลายทางต้องมีอย่างน้อย 5 ตัวอักษร"
#     }
#   ]
# }
```

---

## 📊 Progress Tracker

| ขั้นตอน | สถานะ | เวลาที่ใช้ | หมายเหตุ |
|---------|-------|----------|---------|
| 1. Auth Routes | ⏳ รอ | - | 2 endpoints |
| 2. Patient Routes | ⏳ รอ | - | 2 endpoints |
| 3. Ride Routes | ⏳ รอ | - | 2 endpoints |
| 4. ทดสอบ | ⏳ รอ | - | 9 test cases |
| **รวม** | ⏳ **รอ** | **0/15 นาที** | **0%** |

---

## 🎯 เกณฑ์การผ่าน

- ✅ ทุก Route มี Validation Middleware
- ✅ Invalid Input ได้รับ 400 Bad Request
- ✅ Error Messages เป็นภาษาไทย
- ✅ Valid Input ทำงานได้ปกติ

---

**สถานะ**: ⏳ **รอ Manual Implementation**  
**เหตุผล**: ต้องแก้ไข Code ด้วยความระมัดระวัง  
**แนวทางแก้ไข**: ใช้ IDE (VS Code) แก้ไขตาม Checklist
