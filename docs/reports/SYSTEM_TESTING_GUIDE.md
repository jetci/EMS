# 🧪 EMS WeCare System Testing Guide

**วันที่**: 16 มกราคม 2569  
**เวลา**: 10:45 น.  
**สถานะ**: ✅ **Ready for Testing**

---

## 🚀 Quick Start - เปิดระบบทดสอบ

### ขั้นตอนที่ 1: Start Backend Server

```powershell
# เปิด Terminal 1
cd d:\EMS\wecare-backend
npm run dev

# รอจนเห็น
# 🚀 Server is running on http://localhost:3001
# 🔌 WebSocket server ready for real-time location tracking
```

✅ **Checkpoint**: เห็น "Server is running on http://localhost:3001"

---

### ขั้นตอนที่ 2: Start Frontend Server

```powershell
# เปิด Terminal 2 (ใหม่)
cd d:\EMS
npm run dev

# รอจนเห็น
# VITE v5.x.x ready in xxx ms
# ➜ Local: http://localhost:5173/
```

✅ **Checkpoint**: เห็น "Local: http://localhost:5173/"

---

### ขั้นตอนที่ 3: เปิด Browser

```
1. เปิด Browser (Chrome/Edge)
2. ไปที่ http://localhost:5173
3. ควรเห็นหน้า Login
```

✅ **Checkpoint**: เห็นหน้า Login พร้อม Quick Login Buttons

---

## 🧪 Test Scenarios

### Test 1: Login & Dashboard (5 นาที)

**Objective**: ทดสอบการ Login และ Dashboard

**Steps**:
1. เปิด http://localhost:5173
2. คลิก Quick Login "Community User"
3. ตรวจสอบ Dashboard

**Expected Results**:
- ✅ Login สำเร็จ
- ✅ เห็น Community Dashboard
- ✅ เห็น Menu: Dashboard, Patient Management, Manage Rides, Create Ride Request

**Test Accounts**:
```
Community User:
- Email: community1@wecare.dev
- Password: password

Officer User:
- Email: officer1@wecare.dev
- Password: password

Driver User:
- Email: driver1@wecare.dev
- Password: password
```

---

### Test 2: Patient Registration (10 นาที)

**Objective**: ทดสอบการลงทะเบียนผู้ป่วย

**Steps**:
1. Login as Community User
2. คลิก "Patient Management"
3. คลิก "Register New Patient"
4. กรอกข้อมูล:
   - ชื่อ-นามสกุล: ทดสอบ ระบบ
   - เลขบัตรประชาชน: 1234567890123
   - เบอร์โทร: 0812345678
   - วันเกิด: 01/01/1990
5. คลิก "บันทึก"

**Expected Results**:
- ✅ บันทึกสำเร็จ
- ✅ เห็นข้อความ "บันทึกข้อมูลผู้ป่วยสำเร็จ"
- ✅ กลับไปหน้า Patient List
- ✅ เห็นผู้ป่วยที่สร้างใหม่

**Test Invalid Data** (ถ้า Apply Joi Validation แล้ว):
- ชื่อสั้นเกินไป (1 ตัวอักษร) → ❌ Error
- เลขบัตรไม่ครบ 13 หลัก → ❌ Error
- เบอร์โทรไม่ถูกต้อง → ❌ Error

---

### Test 3: Create Ride Request (10 นาที)

**Objective**: ทดสอบการสร้างคำขอเดินทาง

**Steps**:
1. Login as Community User
2. คลิก "Create Ride Request"
3. เลือกผู้ป่วย (จาก Test 2)
4. กรอกข้อมูล:
   - ที่อยู่จุดรับ: (auto-fill จากข้อมูลผู้ป่วย)
   - ปลายทาง: โรงพยาบาลทดสอบ
   - วันที่นัดหมาย: วันนี้ + 1 วัน
   - เวลา: 10:00
5. คลิก "ส่งคำขอ"

**Expected Results**:
- ✅ สร้างสำเร็จ
- ✅ เห็นข้อความ "ส่งคำขอเดินทางสำเร็จ"
- ✅ ได้รับ Ride ID (เช่น RIDE-001)
- ✅ สถานะ: PENDING

---

### Test 4: Manage Rides (5 นาที)

**Objective**: ทดสอบการจัดการคำขอเดินทาง

**Steps**:
1. Login as Community User
2. คลิก "Manage Rides"
3. ตรวจสอบรายการ Rides

**Expected Results**:
- ✅ เห็น Ride ที่สร้างจาก Test 3
- ✅ แสดงข้อมูลครบถ้วน:
  - Ride ID
  - ชื่อผู้ป่วย
  - จุดรับ
  - ปลายทาง
  - วันที่-เวลา
  - สถานะ

**Test Data Isolation**:
1. Login as Community User 2 (community2@wecare.dev)
2. คลิก "Manage Rides"
3. ตรวจสอบว่า **ไม่เห็น** Ride ของ Community User 1

✅ **Expected**: ไม่เห็น Ride ของคนอื่น (Data Isolation)

---

### Test 5: Officer - Assign Driver (10 นาที)

**Objective**: ทดสอบการมอบหมายคนขับ

**Steps**:
1. Login as Officer (officer1@wecare.dev)
2. คลิก "Manage Rides"
3. เลือก Ride ที่ต้องการมอบหมาย
4. คลิก "Assign Driver"
5. เลือกคนขับ
6. คลิก "Confirm"

**Expected Results**:
- ✅ มอบหมายสำเร็จ
- ✅ สถานะเปลี่ยนเป็น "ASSIGNED"
- ✅ แสดงชื่อคนขับ
- ✅ คนขับได้รับแจ้งเตือน (ถ้ามี Real-time)

---

### Test 6: Driver - Accept Job (10 นาที)

**Objective**: ทดสอบการรับงานของคนขับ

**Steps**:
1. Login as Driver (driver1@wecare.dev)
2. คลิก "Today's Jobs"
3. ตรวจสอบงานที่ได้รับมอบหมาย
4. คลิก "Accept Job"
5. อัปเดตสถานะ:
   - En Route to Pickup
   - Arrived at Pickup
   - In Progress
   - Completed

**Expected Results**:
- ✅ เห็นงานที่ได้รับมอบหมาย
- ✅ สามารถอัปเดตสถานะได้
- ✅ แสดงข้อมูลผู้ป่วยและจุดหมาย
- ✅ สถานะอัปเดตใน Real-time (ถ้า Socket.io ทำงาน)

---

### Test 7: Real-time Location Update (15 นาที)

**Objective**: ทดสอบ Socket.io Real-time

**Prerequisites**: 
- ✅ Apply Socket.io Backend Changes
- ✅ Integrate Socket Service

**Steps**:
1. Login as Driver
2. เปิด Console (F12)
3. ตรวจสอบ Console Messages:
   - "✅ Socket.io connected"
4. ส่ง Location Update (ถ้ามี UI)
5. ตรวจสอบ Console:
   - "✅ Location sent successfully"
   - "ACK: { status: 'ok', timestamp: '...' }"

**Expected Results**:
- ✅ Socket.io Connected
- ✅ Location Update ส่งสำเร็จ
- ✅ ได้รับ ACK Response
- ✅ Officer เห็น Location Update (Real-time)

**Test Auto-Reconnect**:
1. Restart Backend Server
2. ตรวจสอบ Console:
   - "⚠️ Socket.io disconnected"
   - "🔄 Reconnection attempt 1..."
   - "✅ Reconnected after X attempts"

✅ **Expected**: Auto Reconnect สำเร็จ

---

### Test 8: Validation Testing (10 นาที)

**Objective**: ทดสอบ Joi Validation (ถ้า Apply แล้ว)

**Test Invalid Login**:
```powershell
$body = @{
    email = "invalid-email"
    password = "123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Expected**:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "รูปแบบอีเมลไม่ถูกต้อง"
    },
    {
      "field": "password",
      "message": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
    }
  ]
}
```

✅ **Expected**: 400 Bad Request พร้อม Thai Error Messages

---

## 📊 Test Results Checklist

### Basic Functionality
- [ ] Login สำเร็จทุก Role
- [ ] Dashboard แสดงผลถูกต้อง
- [ ] Patient Registration ทำงานได้
- [ ] Create Ride Request ทำงานได้
- [ ] Manage Rides แสดงข้อมูลถูกต้อง

### Security & Data Isolation
- [ ] Data Isolation ทำงานถูกต้อง (Community ไม่เห็นข้อมูลคนอื่น)
- [ ] Validation ทำงานถูกต้อง (ถ้า Apply แล้ว)
- [ ] Authentication ทำงานถูกต้อง

### Real-time Features
- [ ] Socket.io Connected
- [ ] Location Update ทำงานได้
- [ ] ACK Response ถูกต้อง
- [ ] Auto-Reconnect ทำงานได้

### User Experience
- [ ] UI แสดงผลถูกต้อง
- [ ] Loading States ทำงานได้
- [ ] Error Messages ชัดเจน
- [ ] Navigation ทำงานได้

---

## 🐛 Common Issues & Solutions

### Issue 1: Backend ไม่ Start
**Error**: `Port 3001 is already in use`

**Solution**:
```powershell
# หา Process ที่ใช้ Port 3001
netstat -ano | findstr :3001

# Kill Process
taskkill /PID <PID> /F

# Start ใหม่
npm run dev
```

---

### Issue 2: Frontend ไม่ Start
**Error**: `Port 5173 is already in use`

**Solution**:
```powershell
# หา Process ที่ใช้ Port 5173
netstat -ano | findstr :5173

# Kill Process
taskkill /PID <PID> /F

# Start ใหม่
npm run dev
```

---

### Issue 3: Cannot Connect to Backend
**Error**: `Failed to fetch` หรือ `Network Error`

**Solution**:
1. ตรวจสอบ Backend กำลังรันอยู่
2. ตรวจสอบ URL: `http://localhost:3001`
3. ตรวจสอบ CORS Settings
4. Clear Browser Cache

---

### Issue 4: Socket.io Not Connected
**Error**: `Socket.io connection failed`

**Solution**:
1. ตรวจสอบ Backend กำลังรันอยู่
2. ตรวจสอบ Token ถูกต้อง
3. ตรวจสอบ Console Errors
4. Refresh Page

---

## 📝 Test Report Template

```markdown
# Test Report - EMS WeCare

**วันที่**: 16 มกราคม 2569
**ผู้ทดสอบ**: [ชื่อ]
**เวลา**: [เวลาเริ่ม] - [เวลาสิ้นสุด]

## Test Results

### Test 1: Login & Dashboard
- สถานะ: ✅ PASS / ❌ FAIL
- หมายเหตุ: [รายละเอียด]

### Test 2: Patient Registration
- สถานะ: ✅ PASS / ❌ FAIL
- หมายเหตุ: [รายละเอียด]

### Test 3: Create Ride Request
- สถานะ: ✅ PASS / ❌ FAIL
- หมายเหตุ: [รายละเอียด]

... (ต่อไปตาม Test Scenarios)

## Bugs Found
1. [Bug Description]
   - Severity: Critical / Major / Minor
   - Steps to Reproduce: [...]
   - Expected: [...]
   - Actual: [...]

## Overall Status
- Total Tests: X
- Passed: Y
- Failed: Z
- Pass Rate: Y/X %

## Recommendation
- ✅ Ready for Production / ⏳ Need Fixes
```

---

**สถานะ**: ✅ **Ready for Testing**  
**เวลาที่ใช้**: 1-2 ชั่วโมง (ทดสอบครบทุก Scenario)  
**ผู้จัดทำ**: QA Team
