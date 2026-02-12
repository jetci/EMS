# 🚀 Quick Start Guide - Manual Implementation

**วันที่**: 16 มกราคม 2569  
**เวลา**: 10:30 น.  
**เวลาที่ใช้**: 55 นาที  
**สถานะ**: ⏳ **รอดำเนินการ**

---

## 📋 Overview

งานที่ต้องทำ 3 งาน:
1. ✅ Apply Joi Validation (15 นาที)
2. ✅ Update Backend Socket.io (10 นาที)
3. ✅ Integrate Socket Service (20 นาที)
4. ✅ ทดสอบทั้งหมด (10 นาที)

---

## 🔧 งานที่ 1: Apply Joi Validation (15 นาที)

### Step 1.1: แก้ไข auth.ts (5 นาที)

**ไฟล์**: `d:\EMS\wecare-backend\src\routes\auth.ts`

**Line 33** - เพิ่ม validateRequest:
```typescript
// ค้นหา
router.post('/auth/login', async (req, res) => {

// แก้เป็น
router.post('/auth/login', validateRequest(loginSchema), async (req, res) => {
```

**Line 182** - เพิ่ม validateRequest:
```typescript
// ค้นหา
router.post('/auth/register', async (req, res) => {

// แก้เป็น
router.post('/auth/register', validateRequest(registerSchema), async (req, res) => {
```

✅ **Checkpoint**: Save file

---

### Step 1.2: แก้ไข patients.ts (5 นาที)

**ไฟล์**: `d:\EMS\wecare-backend\src\routes\patients.ts`

**Line 11** - เพิ่ม import:
```typescript
// หลังบรรทัด
import { transformResponse } from '../utils/caseConverter';

// เพิ่มบรรทัดนี้
import { validateRequest, patientCreateSchema, patientUpdateSchema } from '../middleware/joiValidation';
```

**Line 319** - เพิ่ม validateRequest:
```typescript
// ค้นหา
router.post('/', checkDuplicatePatient, upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'attachments', maxCount: 5 }]), async (req: AuthRequest, res) => {

// แก้เป็น (เพิ่ม validateRequest ก่อน async)
router.post('/', 
    checkDuplicatePatient, 
    upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'attachments', maxCount: 5 }]),
    validateRequest(patientCreateSchema),
    async (req: AuthRequest, res) => {
```

**Line 500** - เพิ่ม validateRequest:
```typescript
// ค้นหา
router.put('/:id', upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'attachments', maxCount: 5 }]), async (req: AuthRequest, res) => {

// แก้เป็น
router.put('/:id', 
    upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'attachments', maxCount: 5 }]),
    validateRequest(patientUpdateSchema),
    async (req: AuthRequest, res) => {
```

✅ **Checkpoint**: Save file

---

### Step 1.3: แก้ไข rides.ts (5 นาที)

**ไฟล์**: `d:\EMS\wecare-backend\src\routes\rides.ts`

**Line 8** - เพิ่ม import:
```typescript
// หลังบรรทัด
import { transformResponse } from '../utils/caseConverter';

// เพิ่มบรรทัดนี้
import { validateRequest, rideCreateSchema, rideUpdateSchema } from '../middleware/joiValidation';
```

**Line 178** - เพิ่ม validateRequest:
```typescript
// ค้นหา
router.post('/', checkDuplicateRide, async (req: AuthRequest, res) => {

// แก้เป็น
router.post('/', 
    checkDuplicateRide,
    validateRequest(rideCreateSchema),
    async (req: AuthRequest, res) => {
```

**Line 260** - เพิ่ม validateRequest:
```typescript
// ค้นหา
router.put('/:id', async (req: AuthRequest, res) => {

// แก้เป็น
router.put('/:id', 
    validateRequest(rideUpdateSchema),
    async (req: AuthRequest, res) => {
```

✅ **Checkpoint**: Save file

---

### Step 1.4: Restart Backend & Test (ทำหลังแก้ไขครบทั้ง 3 ไฟล์)

```powershell
# 1. Stop Backend (Ctrl+C ใน Terminal ที่รัน Backend)

# 2. Start Backend ใหม่
cd d:\EMS\wecare-backend
npm run dev

# 3. รอจนเห็น "Server is running on http://localhost:3001"

# 4. ทดสอบ Validation
# เปิด Terminal ใหม่
cd d:\EMS

# Test Invalid Login
$body = @{
    email = "invalid-email"
    password = "123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Expected: 400 Bad Request with Thai error messages
```

✅ **เกณฑ์ผ่าน**: ได้รับ 400 Bad Request พร้อม error messages เป็นภาษาไทย

---

## 🔧 งานที่ 2: Update Backend Socket.io (10 นาที)

### Step 2.1: แก้ไข index.ts - Ping/Pong Config (5 นาที)

**ไฟล์**: `d:\EMS\wecare-backend\src\index.ts`

**Line 484** - เพิ่ม Ping/Pong Configuration:
```typescript
// ค้นหา
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim())
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
  }
});

// แก้เป็น (เพิ่ม config หลัง credentials: true)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim())
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
  },
  // ✅ เพิ่ม Ping/Pong Configuration
  pingTimeout: 60000,      // 60 seconds
  pingInterval: 25000,     // 25 seconds
  upgradeTimeout: 10000,   // 10 seconds
  maxHttpBufferSize: 1e6,  // 1 MB
  transports: ['websocket', 'polling']
});
```

✅ **Checkpoint**: Save file

---

### Step 2.2: แก้ไข index.ts - ACK Callback (5 นาที)

**ไฟล์**: `d:\EMS\wecare-backend\src\index.ts`

**Line 531** - เพิ่ม callback parameter:
```typescript
// ค้นหา (Line 531)
socket.on('location:update', (data) => {

// แก้เป็น (เพิ่ม callback parameter)
socket.on('location:update', (data, callback) => {
```

**Line 535** - เพิ่ม error ACK (Unauthorized):
```typescript
// ค้นหา
if (user.role !== 'driver' && user.role !== 'DRIVER') {
  console.warn(`⚠️ Unauthorized location update attempt from ${user.email} (${user.role})`);
  socket.emit('error', { message: 'Only drivers can send location updates' });
  return;
}

// แก้เป็น (เพิ่ม callback ก่อน return)
if (user.role !== 'driver' && user.role !== 'DRIVER') {
  console.warn(`⚠️ Unauthorized location update attempt from ${user.email} (${user.role})`);
  socket.emit('error', { message: 'Only drivers can send location updates' });
  if (callback) callback({ status: 'error', message: 'Unauthorized' });
  return;
}
```

**Line 552** - เพิ่ม error ACK (Invalid coordinates):
```typescript
// ค้นหา
if (
  Number.isNaN(lat) ||
  Number.isNaN(lng) ||
  !Number.isFinite(lat) ||
  !Number.isFinite(lng) ||
  lat < -90 || lat > 90 ||
  lng < -180 || lng > 180
) {
  console.warn(`⚠️ Invalid coordinates from ${user.email}: lat=${data.lat}, lng=${data.lng}`);
  socket.emit('error', { message: 'Invalid coordinates' });
  return;
}

// แก้เป็น (เพิ่ม callback ก่อน return)
if (
  Number.isNaN(lat) ||
  Number.isNaN(lng) ||
  !Number.isFinite(lat) ||
  !Number.isFinite(lng) ||
  lat < -90 || lat > 90 ||
  lng < -180 || lng > 180
) {
  console.warn(`⚠️ Invalid coordinates from ${user.email}: lat=${data.lat}, lng=${data.lng}`);
  socket.emit('error', { message: 'Invalid coordinates' });
  if (callback) callback({ status: 'error', message: 'Invalid coordinates' });
  return;
}
```

**Line 572** - เพิ่ม success ACK (ก่อน closing brace ของ socket.on):
```typescript
// ค้นหา (หลัง locationNamespace.emit)
locationNamespace.emit('location:updated', {
  driverId: data.driverId || user.id,
  driverEmail: user.email,
  lat,
  lng,
  timestamp: new Date().toISOString(),
  status: data.status || 'AVAILABLE'
});
  });  // <-- closing brace ของ socket.on

// แก้เป็น (เพิ่ม success ACK ก่อน closing brace)
locationNamespace.emit('location:updated', {
  driverId: data.driverId || user.id,
  driverEmail: user.email,
  lat,
  lng,
  timestamp: new Date().toISOString(),
  status: data.status || 'AVAILABLE'
});

// ✅ Send success ACK
if (callback) {
  callback({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
}
  });  // <-- closing brace ของ socket.on
```

✅ **Checkpoint**: Save file → Restart Backend

```powershell
# Restart Backend
# Ctrl+C ใน Terminal
npm run dev
```

---

## 🔧 งานที่ 3: Integrate Socket Service (20 นาที)

### Step 3.1: ตรวจสอบ socketService.ts (5 นาที)

**ไฟล์**: `d:\EMS\src\services\socketService.ts`

✅ **ตรวจสอบว่าไฟล์มีอยู่แล้ว** (สร้างไว้แล้ว)

ถ้ายังไม่มี ให้ใช้ไฟล์ที่สร้างไว้:
- มี ACK, Retry, Queue, Auto-Reconnect, Fallback HTTP
- 400+ lines

---

### Step 3.2: แก้ไข DriverTodayJobsPage.tsx (15 นาที)

**ไฟล์**: `d:\EMS\src\pages\DriverTodayJobsPage.tsx`

**Step 3.2.1**: เพิ่ม import (ที่บรรทัดแรก):
```typescript
import socketService from '../services/socketService';
```

**Step 3.2.2**: ค้นหาการใช้ socket.io โดยตรง และแทนที่ด้วย socketService

**ตัวอย่าง**:
```typescript
// ❌ ก่อนแก้ไข (ถ้ามี)
import { io } from 'socket.io-client';
const socket = io('/locations', { auth: { token } });

// ✅ หลังแก้ไข
// ลบ import io
// ใช้ socketService แทน
```

**Step 3.2.3**: Initialize Socket (ใน useEffect):
```typescript
// เพิ่มใน useEffect
useEffect(() => {
    socketService.initializeSocket();
    
    return () => {
        socketService.disconnectSocket();
    };
}, []);
```

**Step 3.2.4**: Send Location (แทนที่ socket.emit):
```typescript
// ❌ ก่อนแก้ไข
socket.emit('location:update', { lat, lng });

// ✅ หลังแก้ไข
const data = { lat, lng, status: 'AVAILABLE' };
socketService.updateCurrentLocation(data);
socketService.sendLocationUpdate(data);
```

**Step 3.2.5**: Listen for Updates (แทนที่ socket.on):
```typescript
// ❌ ก่อนแก้ไข
socket.on('location:updated', (data) => {
    console.log('Location updated:', data);
});

// ✅ หลังแก้ไข
useEffect(() => {
    const handleLocationUpdate = (data: any) => {
        console.log('Location updated:', data);
        // Update map marker
    };
    
    socketService.onLocationUpdated(handleLocationUpdate);
    
    return () => {
        socketService.off('location:updated', handleLocationUpdate);
    };
}, []);
```

✅ **Checkpoint**: Save file

---

## 🧪 งานที่ 4: ทดสอบทั้งหมด (10 นาที)

### Test 1: Joi Validation (3 นาที)

```powershell
cd d:\EMS

# Test Invalid Login
$body = @{
    email = "invalid-email"
    password = "123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Expected: 400 Bad Request
# {
#   "error": "Validation failed",
#   "details": [...]
# }
```

✅ **ผ่าน**: ได้รับ 400 Bad Request

---

### Test 2: Socket.io ACK (3 นาที)

```powershell
# 1. Start Frontend
cd d:\EMS
npm run dev

# 2. เปิด Browser → http://localhost:5173
# 3. Login as Driver (driver1@wecare.dev / password)
# 4. เปิด Console (F12)
# 5. ส่ง Location Update
# 6. ตรวจสอบ Console:
#    ✅ Socket.io connected
#    ✅ Location sent successfully
#    ✅ ACK: { status: 'ok', timestamp: '...' }
```

✅ **ผ่าน**: เห็น ACK Response ใน Console

---

### Test 3: Auto-Reconnect (4 นาที)

```powershell
# 1. Login as Driver
# 2. เปิด Console (F12)
# 3. Restart Backend (Ctrl+C → npm run dev)
# 4. ตรวจสอบ Console:
#    ⚠️  Socket.io disconnected
#    🔄 Reconnection attempt 1...
#    ✅ Reconnected after X attempts
```

✅ **ผ่าน**: Auto Reconnect สำเร็จ

---

## 📊 Checklist สรุป

### งานที่ 1: Joi Validation
- [ ] แก้ไข auth.ts (Line 33, 182)
- [ ] แก้ไข patients.ts (Line 11, 319, 500)
- [ ] แก้ไข rides.ts (Line 8, 178, 260)
- [ ] Restart Backend
- [ ] ทดสอบ Invalid Input → 400 Bad Request

### งานที่ 2: Socket.io Backend
- [ ] แก้ไข index.ts Line 484 (Ping/Pong Config)
- [ ] แก้ไข index.ts Line 531 (callback parameter)
- [ ] แก้ไข index.ts Line 535 (error ACK Unauthorized)
- [ ] แก้ไข index.ts Line 552 (error ACK Invalid)
- [ ] แก้ไข index.ts Line 572 (success ACK)
- [ ] Restart Backend

### งานที่ 3: Socket Service Integration
- [ ] ตรวจสอบ socketService.ts มีอยู่
- [ ] แก้ไข DriverTodayJobsPage.tsx
- [ ] เพิ่ม import socketService
- [ ] Initialize Socket
- [ ] Replace socket.emit → socketService.sendLocationUpdate
- [ ] Replace socket.on → socketService.onLocationUpdated

### งานที่ 4: ทดสอบ
- [ ] Test Joi Validation
- [ ] Test Socket.io ACK
- [ ] Test Auto-Reconnect
- [ ] ทุก Test ผ่าน

---

## 🎯 เกณฑ์การผ่าน

### ✅ ทุกงานผ่าน
- ✅ Joi Validation: Invalid Input → 400 Bad Request
- ✅ Socket.io ACK: เห็น ACK Response
- ✅ Auto-Reconnect: Reconnect สำเร็จภายใน 5 attempts
- ✅ No Errors ใน Console

### ❌ ถ้าไม่ผ่าน
1. ตรวจสอบ Console Errors
2. ตรวจสอบ Backend Logs
3. ตรวจสอบ Code ตาม Guide
4. ทดสอบใหม่

---

**สถานะ**: ⏳ **พร้อมเริ่มงาน**  
**เวลาที่ใช้**: 55 นาที  
**ความยาก**: 🟡 Medium (ต้องระมัดระวัง)
