# 📋 คำสั่งงานสำหรับทีม G
## จาก QA Engineer - Sprint 1

**วันที่:** 4 มกราคม 2026 - 21:47  
**ผู้มอบหมาย:** QA Engineer  
**ผู้รับมอบหมาย:** ทีม G (Development Team)

---

## 🎯 งานที่ต้องทำ (3 งาน)

### ✅ งานที่ 1: BUG-001 - **เสร็จสมบูรณ์**

**สถานะ:** ✅ **APPROVED BY QA**  
**Action:** ✅ **NONE** - ไม่ต้องทำอะไร

---

### 🔴 งานที่ 2: แก้ไข Authentication System - **URGENT**

**Priority:** 🔴 **CRITICAL - ทำทันที!**  
**Timeline:** 1-2 ชั่วโมง  
**Deadline:** วันนี้ (4 มกราคม 2026)

#### ปัญหาที่พบ

**1. Login ไม่สำเร็จ**
```
Error: Invalid credentials
File: wecare-backend/src/routes/auth.ts
```

**2. Register ไม่สำเร็จ**
```
Error: UNIQUE constraint failed: users.id
File: wecare-backend/src/routes/auth.ts (line 120-127)
```

#### สิ่งที่ต้องแก้ไข

**Task 2.1: Debug Password Comparison**

```typescript
// File: wecare-backend/src/routes/auth.ts (around line 60-70)

// ตรวจสอบว่า bcrypt.compare() ทำงานถูกต้อง
const isValid = await bcrypt.compare(password, user.password);

// เพิ่ม logging เพื่อ debug
console.log('Login attempt:', {
    email,
    providedPassword: password,
    storedHash: user.password,
    isValid
});
```

**Task 2.2: Fix ID Generation**

```typescript
// File: wecare-backend/src/routes/auth.ts (line 120-127)

// ปัญหา: ID generation ซ้ำ
// แก้ไข:
const users = sqliteDB.all<{ id: string }>(
    'SELECT id FROM users ORDER BY CAST(SUBSTR(id, 5) AS INTEGER) DESC LIMIT 1'
);

let newId = 'USR-001';
if (users.length > 0) {
    const lastId = users[0].id;
    const num = parseInt(lastId.split('-')[1]) + 1;
    newId = `USR-${String(num).padStart(3, '0')}`;
}

// เพิ่มการตรวจสอบ ID ซ้ำ
const existingId = sqliteDB.get<User>('SELECT id FROM users WHERE id = ?', [newId]);
if (existingId) {
    // Generate new ID
    const timestamp = Date.now();
    newId = `USR-${timestamp}`;
}
```

**Task 2.3: ทดสอบ**

```powershell
# 1. Restart backend
cd d:\EMS\wecare-backend
npm start

# 2. Test login
$body = @{email="admin@wecare.dev";password="password"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -ContentType "application/json"

# 3. Test register
$body = @{email="test@test.com";password="Test@12345";full_name="Test User"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

#### Acceptance Criteria

- [ ] Login สำเร็จด้วย credentials ที่ถูกต้อง
- [ ] Register สร้าง user ใหม่ได้
- [ ] ไม่มี UNIQUE constraint error
- [ ] Password hashing ทำงานถูกต้อง

#### ส่งมอบ

เมื่อแก้ไขเสร็จ:
1. Commit code
2. Restart backend
3. แจ้ง QA ทดสอบ
4. QA จะทดสอบ BUG-006 ต่อทันที

---

### ❌ งานที่ 3: BUG-009 - WebSocket Implementation

**Priority:** 🟡 **HIGH**  
**Timeline:** 14-20 ชั่วโมง  
**Deadline:** สิ้นสุด Week 2 (10 มกราคม 2026)

#### QA Test Result

**Status:** ❌ **FAILED** (0/7 tests passed)

```
[FAIL] Socket.IO not installed
[FAIL] WebSocket endpoint not accessible
[FAIL] Backend location service missing
[FAIL] Socket.IO server not configured
[FAIL] Frontend socket service missing
[FAIL] socket.io-client not installed
[WARNING] Database schema needs location fields
```

#### สิ่งที่ต้องทำ

**Phase 1: Install Dependencies (30 นาที)**

```bash
# Backend
cd wecare-backend
npm install socket.io

# Frontend
cd ..
npm install socket.io-client
```

**Phase 2: Backend Implementation (6-8 ชั่วโมง)**

**File 1: `wecare-backend/src/index.ts`**

```typescript
import { Server } from 'socket.io';
import http from 'http';

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
        credentials: true
    }
});

// Location tracking namespace
const locationNamespace = io.of('/locations');

locationNamespace.use((socket, next) => {
    // Authentication middleware
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication required'));
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.data.user = decoded;
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
});

locationNamespace.on('connection', (socket) => {
    console.log('Client connected:', socket.data.user.email);
    
    // Driver sends location update
    socket.on('location:update', async (data) => {
        const { latitude, longitude } = data;
        const userId = socket.data.user.id;
        
        // Save to database
        sqliteDB.run(`
            UPDATE drivers 
            SET last_latitude = ?, last_longitude = ?, last_location_update = ?
            WHERE user_id = ?
        `, [latitude, longitude, new Date().toISOString(), userId]);
        
        // Broadcast to tracking room
        locationNamespace.emit('location:updated', {
            driverId: userId,
            latitude,
            longitude,
            timestamp: new Date().toISOString()
        });
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.data.user.email);
    });
});

// Use server instead of app.listen
server.listen(PORT, () => {
    console.log(`🚀 Server with WebSocket running on http://localhost:${PORT}`);
});
```

**File 2: `wecare-backend/src/services/locationService.ts`** (สร้างใหม่)

```typescript
import { Server as SocketIOServer } from 'socket.io';

export class LocationService {
    private io: SocketIOServer;
    
    constructor(io: SocketIOServer) {
        this.io = io;
    }
    
    broadcastDriverLocation(driverId: string, latitude: number, longitude: number) {
        this.io.of('/locations').emit('location:updated', {
            driverId,
            latitude,
            longitude,
            timestamp: new Date().toISOString()
        });
    }
    
    getActiveDrivers() {
        // Get all connected drivers
        const namespace = this.io.of('/locations');
        return Array.from(namespace.sockets.values())
            .filter(socket => socket.data.user?.role === 'driver')
            .map(socket => socket.data.user);
    }
}
```

**Phase 3: Frontend Implementation (6-8 ชั่วโมง)**

**File 1: `src/services/socketService.ts`** (สร้างใหม่)

```typescript
import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private locationSocket: Socket | null = null;
    
    connect(token: string) {
        if (this.locationSocket?.connected) {
            return;
        }
        
        this.locationSocket = io('http://localhost:3001/locations', {
            auth: { token },
            transports: ['websocket', 'polling']
        });
        
        this.locationSocket.on('connect', () => {
            console.log('[Socket] Connected to location tracking');
        });
        
        this.locationSocket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
        });
        
        this.locationSocket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error);
        });
    }
    
    sendLocation(latitude: number, longitude: number) {
        if (!this.locationSocket?.connected) {
            console.warn('[Socket] Not connected');
            return;
        }
        
        this.locationSocket.emit('location:update', {
            latitude,
            longitude,
            timestamp: new Date().toISOString()
        });
    }
    
    onLocationUpdate(callback: (data: any) => void) {
        this.locationSocket?.on('location:updated', callback);
    }
    
    disconnect() {
        this.locationSocket?.disconnect();
        this.locationSocket = null;
    }
}

export const socketService = new SocketService();
```

**File 2: Update `src/pages/DriverDashboard.tsx`**

```typescript
import { socketService } from '../services/socketService';

// Inside component
useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        socketService.connect(token);
    }
    
    // Start location tracking
    if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                socketService.sendLocation(latitude, longitude);
            },
            (error) => console.error('Location error:', error),
            { enableHighAccuracy: true, maximumAge: 5000 }
        );
        
        return () => {
            navigator.geolocation.clearWatch(watchId);
            socketService.disconnect();
        };
    }
}, []);
```

**File 3: Update `src/components/TrackingMap.tsx`**

```typescript
import { socketService } from '../services/socketService';

// Inside component
useEffect(() => {
    socketService.onLocationUpdate((data) => {
        const { driverId, latitude, longitude } = data;
        
        // Update marker on map
        setDriverLocations(prev => ({
            ...prev,
            [driverId]: { latitude, longitude }
        }));
    });
}, []);
```

**Phase 4: Database Schema (30 นาที)**

```sql
-- Add location fields to drivers table if not exists
ALTER TABLE drivers ADD COLUMN last_latitude REAL;
ALTER TABLE drivers ADD COLUMN last_longitude REAL;
ALTER TABLE drivers ADD COLUMN last_location_update TEXT;
```

**Phase 5: Testing (2-4 ชั่วโมง)**

```powershell
# Run QA test
cd d:\EMS
.\test-bug-009-websocket.ps1

# Expected: 7/7 tests pass
```

#### Acceptance Criteria

- [ ] Socket.IO installed (backend & frontend)
- [ ] WebSocket server running on `/locations` namespace
- [ ] Driver can send location updates
- [ ] Officer can see real-time location updates
- [ ] Map markers update automatically
- [ ] Authentication working for WebSocket
- [ ] All 7 tests pass

#### Reference

**เอกสารอ้างอิง:**
- `BUG_FIX_PLAN_FOR_TEAM_G.md` (Priority 1.3)
- `QA_DEEP_AUTOMATED_TEST_REPORT_PROFESSIONAL.md` (BUG-009)

#### ส่งมอบ

เมื่อ implement เสร็จ:
1. Commit code
2. Restart backend & frontend
3. รัน `test-bug-009-websocket.ps1`
4. แจ้ง QA ทดสอบ
5. QA จะ verify และ approve/reject

---

## 📊 Timeline Summary

```
Today (4 Jan):
├── งานที่ 2: Fix Authentication (1-2 hours) 🔴 URGENT
└── QA test BUG-006 (10 minutes after auth fixed)

Tomorrow - Week 2 (5-10 Jan):
├── งานที่ 3: Implement BUG-009 (14-20 hours)
└── QA verification & approval

End of Week 2:
└── Sprint 1 complete ✅
```

---

## ✅ Checklist สำหรับทีม G

### งานที่ 2: Authentication (Today)

- [ ] Debug password comparison
- [ ] Fix ID generation
- [ ] Test login
- [ ] Test register
- [ ] Restart backend
- [ ] แจ้ง QA

### งานที่ 3: WebSocket (This Week)

- [ ] Install Socket.IO
- [ ] Implement backend server
- [ ] Create location service
- [ ] Implement frontend service
- [ ] Update DriverDashboard
- [ ] Update TrackingMap
- [ ] Update database schema
- [ ] Run test script
- [ ] แจ้ง QA

---

## 📞 การติดต่อ

**หากมีปัญหา:**
1. อ่าน error message ให้ละเอียด
2. ตรวจสอบ logs
3. ลอง debug ด้วยตัวเอง
4. ถ้าแก้ไม่ได้ → แจ้ง QA

**หากเสร็จก่อนกำหนด:**
1. รัน test scripts ทั้งหมด
2. ตรวจสอบไม่มี regression
3. แจ้ง QA ทดสอบทันที

---

**มอบหมายโดย:** QA Engineer  
**วันที่:** 4 มกราคม 2026 - 21:47  
**Priority:** งานที่ 2 (🔴 URGENT) → งานที่ 3 (🟡 HIGH)
