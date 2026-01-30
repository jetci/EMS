# คู่มือการใช้งาน Joi Validation Middleware

**วันที่**: 16 มกราคม 2569  
**สำหรับ**: Development Team

---

## 📋 วิธีการ Apply Validation

### 1. Import Middleware
```typescript
import { validateRequest, patientCreateSchema, patientUpdateSchema } from '../middleware/joiValidation';
```

### 2. Apply ใน Route
```typescript
// ก่อน Apply
router.post('/', async (req, res) => {
    // ...
});

// หลัง Apply
router.post('/', validateRequest(patientCreateSchema), async (req, res) => {
    // req.body ถูก Validate แล้ว
    // ข้อมูลที่ไม่อยู่ใน Schema จะถูกลบออก
});
```

---

## 🎯 Routes ที่ต้อง Apply

### Auth Routes (`wecare-backend/src/routes/auth.ts`)
```typescript
import { validateRequest, loginSchema, registerSchema } from '../middleware/joiValidation';

// Login
router.post('/auth/login', validateRequest(loginSchema), async (req, res) => {
    // ไม่ต้องตรวจสอบ email/password อีก
    const { email, password } = req.body;
    // ...
});

// Register
router.post('/auth/register', validateRequest(registerSchema), async (req, res) => {
    const { email, password, fullName, role } = req.body;
    // ...
});
```

### Patient Routes (`wecare-backend/src/routes/patients.ts`)
```typescript
import { validateRequest, patientCreateSchema, patientUpdateSchema } from '../middleware/joiValidation';

// Create Patient
router.post('/', 
    checkDuplicatePatient, 
    upload.fields([...]), 
    validateRequest(patientCreateSchema), 
    async (req, res) => {
        // req.body ผ่าน Validation แล้ว
    }
);

// Update Patient
router.put('/:id', 
    upload.fields([...]), 
    validateRequest(patientUpdateSchema), 
    async (req, res) => {
        // req.body ผ่าน Validation แล้ว
    }
);
```

### Ride Routes (`wecare-backend/src/routes/rides.ts`)
```typescript
import { validateRequest, rideCreateSchema, rideUpdateSchema } from '../middleware/joiValidation';

// Create Ride
router.post('/', validateRequest(rideCreateSchema), async (req, res) => {
    // req.body ผ่าน Validation แล้ว
});

// Update Ride
router.put('/:id', validateRequest(rideUpdateSchema), async (req, res) => {
    // req.body ผ่าน Validation แล้ว
});
```

---

## ✅ ประโยชน์ของ Joi Validation

### 1. ความปลอดภัย
- ✅ ป้องกัน SQL Injection
- ✅ ป้องกัน XSS
- ✅ Whitelist Characters
- ✅ Validate Data Types

### 2. คุณภาพข้อมูล
- ✅ ตรวจสอบ Format (Email, Phone, National ID)
- ✅ ตรวจสอบ Range (Latitude, Longitude, Age)
- ✅ ตรวจสอบ Length (min/max)
- ✅ ลบ Unknown Fields

### 3. User Experience
- ✅ Error Messages เป็นภาษาไทย
- ✅ แสดง Error ทุกฟิลด์พร้อมกัน (abortEarly: false)
- ✅ ระบุฟิลด์ที่ผิดชัดเจน

---

## 📝 ตัวอย่าง Error Response

### Request (ผิด)
```json
{
    "fullName": "A",
    "nationalId": "123",
    "contactPhone": "12345"
}
```

### Response
```json
{
    "error": "Validation failed",
    "details": [
        {
            "field": "fullName",
            "message": "ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร"
        },
        {
            "field": "nationalId",
            "message": "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก"
        },
        {
            "field": "contactPhone",
            "message": "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0"
        }
    ]
}
```

---

## 🚀 การทดสอบ

### 1. ทดสอบ Validation
```powershell
# Test Invalid Input
$body = @{
    fullName = "A"
    nationalId = "123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/patients" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" }

# Expected: 400 Bad Request with validation errors
```

### 2. ทดสอบ SQL Injection
```powershell
# Test SQL Injection
$body = @{
    fullName = "'; DROP TABLE patients; --"
    nationalId = "1234567890123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/patients" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" }

# Expected: 400 Bad Request (Whitelist blocked)
```

---

## ⚠️ หมายเหตุสำคัญ

1. **Middleware Order**
   ```typescript
   // ✅ ถูกต้อง
   router.post('/', 
       upload.fields([...]),      // 1. Upload files first
       validateRequest(schema),   // 2. Then validate
       async (req, res) => {}     // 3. Then handle
   );
   
   // ❌ ผิด
   router.post('/', 
       validateRequest(schema),   // ❌ Validate ก่อน Upload
       upload.fields([...]),      // ❌ Upload หลัง Validate
       async (req, res) => {}
   );
   ```

2. **FormData vs JSON**
   - Joi Validation ทำงานกับ `req.body`
   - ถ้าใช้ `multipart/form-data` (File Upload) ต้องแปลง JSON strings ก่อน

3. **Optional Fields**
   - ใช้ `.optional().allow(null)` สำหรับฟิลด์ที่ไม่บังคับ
   - ใช้ `.required()` สำหรับฟิลด์ที่บังคับ

---

**สถานะ**: ✅ พร้อมใช้งาน  
**ผู้จัดทำ**: Development Team
