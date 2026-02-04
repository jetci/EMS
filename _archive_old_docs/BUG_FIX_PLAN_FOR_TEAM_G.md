# 🔧 แผนการแก้ไขข้อผิดพลาดระบบ EMS WeCare
## สำหรับทีม G (Development Team)

**วันที่จัดทำ:** 4 มกราคม 2026  
**จัดทำโดย:** QA Engineer  
**อ้างอิงจาก:** QA_DEEP_AUTOMATED_TEST_REPORT_PROFESSIONAL.md

---

## 📋 สารบัญ

1. [ภาพรวมแผนการแก้ไข](#ภาพรวมแผนการแก้ไข)
2. [Sprint 1: Critical Bugs (Week 1-2)](#sprint-1-critical-bugs)
3. [Sprint 2: High Priority Bugs (Week 3-4)](#sprint-2-high-priority-bugs)
4. [Sprint 3: Medium Priority Bugs (Week 5-6)](#sprint-3-medium-priority-bugs)
5. [แผนการทดสอบ (Testing Plan)](#แผนการทดสอบ)
6. [Checklist สำหรับทีม G](#checklist-สำหรับทีม-g)

---

## 🎯 ภาพรวมแผนการแก้ไข

### สถิติข้อผิดพลาด

```
Total Bugs: 45
├── 🔴 Critical:  3 bugs  (แก้ไขทันที - Sprint 1)
├── 🟠 High:     12 bugs  (แก้ไขเร็ว - Sprint 2)
├── 🟡 Medium:   18 bugs  (แก้ไขตามลำดับ - Sprint 3)
└── 🟢 Low:      12 bugs  (แก้ไขเมื่อมีเวลา - Backlog)
```

### Timeline

```
Week 1-2:  Sprint 1 (Critical)      → 3 bugs
Week 3-4:  Sprint 2 (High)          → 12 bugs
Week 5-6:  Sprint 3 (Medium)        → 18 bugs
Week 7+:   Sprint 4 (Low + Polish) → 12 bugs
```

### Expected Quality Score

```
Current:  72/100 (GOOD)
After Sprint 1:  78/100 (GOOD+)
After Sprint 2:  85/100 (VERY GOOD)
After Sprint 3:  90/100 (EXCELLENT)
```

---

## 🔴 Sprint 1: Critical Bugs (Week 1-2)

### Priority 1.1: BUG-001 - Privilege Escalation

**ความรุนแรง:** 🔴 CRITICAL  
**ผลกระทบ:** ผู้ใช้สามารถเปลี่ยน role ของตัวเองเป็น DEVELOPER และเข้าถึงระบบทั้งหมดได้

#### 📍 ไฟล์ที่ต้องแก้ไข

**File:** `wecare-backend/src/routes/users.ts`

#### 🔧 การแก้ไข

```typescript
// ❌ โค้ดเดิม (มีช่องโหว่)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req: any, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    // ไม่มีการตรวจสอบ
    sqliteDB.update('users', id, updateData);
    res.json({ message: 'User updated' });
});
```

```typescript
// ✅ โค้ดใหม่ (แก้ไขแล้ว)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req: any, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    try {
        // ✅ ป้องกันการเปลี่ยน role ของตัวเอง
        if (req.user.id === id && updateData.role && updateData.role !== req.user.role) {
            return res.status(403).json({ 
                success: false,
                error: {
                    code: 'SELF_ROLE_CHANGE_FORBIDDEN',
                    message: 'Cannot change your own role. Please contact another administrator.',
                    details: {
                        currentRole: req.user.role,
                        attemptedRole: updateData.role
                    }
                }
            });
        }
        
        // ✅ ป้องกันการเปลี่ยน role เป็น DEVELOPER (ถ้าไม่ใช่ DEVELOPER)
        if (updateData.role === 'DEVELOPER' && req.user.role !== 'DEVELOPER') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'DEVELOPER_ROLE_RESTRICTED',
                    message: 'Only DEVELOPER can assign DEVELOPER role'
                }
            });
        }
        
        // ✅ ตรวจสอบว่า user ที่จะแก้ไขมีอยู่จริง
        const existingUser = sqliteDB.get('SELECT * FROM users WHERE id = ?', [id]);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                error: { code: 'USER_NOT_FOUND', message: 'User not found' }
            });
        }
        
        // ✅ บันทึก audit log ก่อนแก้ไข
        const changes = {
            before: existingUser,
            after: { ...existingUser, ...updateData }
        };
        
        auditService.log(
            req.user.email,
            req.user.role,
            'UPDATE_USER',
            'users',
            id,
            changes
        );
        
        // ✅ Update user
        sqliteDB.update('users', id, updateData);
        
        res.json({ 
            success: true,
            message: 'User updated successfully',
            data: { id }
        });
        
    } catch (error: any) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'UPDATE_FAILED', message: error.message }
        });
    }
});
```

#### ✅ Test Cases

```powershell
# Test 1: Admin พยายามเปลี่ยน role ของตัวเอง (ควร FAIL)
$token = (Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST -Body (@{email="admin@wecare.com";password="Admin@123"} | ConvertTo-Json) `
    -ContentType "application/json").token

Invoke-RestMethod -Uri "http://localhost:3001/api/users/USR-001" `
    -Method PUT -Headers @{Authorization="Bearer $token"} `
    -Body (@{role="DEVELOPER"} | ConvertTo-Json) `
    -ContentType "application/json"

# Expected: 403 Forbidden - "Cannot change your own role"

# Test 2: Admin เปลี่ยน role ของ user อื่น (ควร PASS)
Invoke-RestMethod -Uri "http://localhost:3001/api/users/USR-002" `
    -Method PUT -Headers @{Authorization="Bearer $token"} `
    -Body (@{role="OFFICER"} | ConvertTo-Json) `
    -ContentType "application/json"

# Expected: 200 OK - "User updated successfully"

# Test 3: Admin พยายามเปลี่ยน user อื่นเป็น DEVELOPER (ควร FAIL ถ้าไม่ใช่ DEVELOPER)
Invoke-RestMethod -Uri "http://localhost:3001/api/users/USR-002" `
    -Method PUT -Headers @{Authorization="Bearer $token"} `
    -Body (@{role="DEVELOPER"} | ConvertTo-Json) `
    -ContentType "application/json"

# Expected: 403 Forbidden - "Only DEVELOPER can assign DEVELOPER role"
```

#### 📝 Acceptance Criteria

- [ ] Admin ไม่สามารถเปลี่ยน role ของตัวเองได้
- [ ] Admin สามารถเปลี่ยน role ของ user อื่นได้ (ยกเว้น DEVELOPER)
- [ ] เฉพาะ DEVELOPER เท่านั้นที่สามารถ assign role DEVELOPER ได้
- [ ] มี audit log บันทึกการเปลี่ยนแปลง role
- [ ] Error messages ชัดเจนและเป็นมิตรกับผู้ใช้

---

### Priority 1.2: BUG-006 - Race Condition in Driver Assignment

**ความรุนแรง:** 🔴 CRITICAL  
**ผลกระทบ:** Driver 1 คนอาจถูก assign ให้ 2 rides พร้อมกัน

#### 📍 ไฟล์ที่ต้องแก้ไข

**File:** `wecare-backend/src/routes/rides.ts`

#### 🔧 การแก้ไข

```typescript
// ❌ โค้ดเดิม (มี race condition)
router.patch('/:id/assign', authenticateToken, requireRole(['admin', 'OFFICER', 'radio']), async (req: any, res) => {
    const { id } = req.params;
    const { driver_id } = req.body;
    
    // ⚠️ ไม่มี transaction lock
    const driver = sqliteDB.get('SELECT * FROM drivers WHERE id = ?', [driver_id]);
    
    if (driver.status !== 'AVAILABLE') {
        return res.status(400).json({ error: 'Driver not available' });
    }
    
    // ⚠️ ช่วงนี้ request อื่นอาจเข้ามาได้
    sqliteDB.update('rides', id, { driver_id, status: 'ASSIGNED' });
    sqliteDB.update('drivers', driver_id, { status: 'ON_DUTY' });
    
    res.json({ message: 'Driver assigned' });
});
```

```typescript
// ✅ โค้ดใหม่ (ใช้ transaction)
router.patch('/:id/assign', authenticateToken, requireRole(['admin', 'OFFICER', 'radio']), async (req: any, res) => {
    const { id } = req.params;
    const { driver_id } = req.body;
    
    try {
        // ✅ ใช้ transaction เพื่อป้องกัน race condition
        const result = sqliteDB.transaction(() => {
            // 1. ตรวจสอบ ride
            const ride = sqliteDB.get('SELECT * FROM rides WHERE id = ?', [id]);
            if (!ride) {
                throw new Error('Ride not found');
            }
            
            if (ride.status !== 'PENDING') {
                throw new Error(`Ride is already ${ride.status}`);
            }
            
            if (ride.driver_id) {
                throw new Error('Ride already has a driver assigned');
            }
            
            // 2. ตรวจสอบ driver availability (with lock)
            const driver = sqliteDB.get(
                'SELECT * FROM drivers WHERE id = ? AND status = "AVAILABLE"',
                [driver_id]
            );
            
            if (!driver) {
                throw new Error('Driver not available');
            }
            
            // 3. ตรวจสอบว่า driver ไม่มี active ride อยู่
            const activeRide = sqliteDB.get(
                `SELECT * FROM rides 
                 WHERE driver_id = ? 
                 AND status IN ('ASSIGNED', 'IN_PROGRESS')`,
                [driver_id]
            );
            
            if (activeRide) {
                throw new Error(`Driver already has an active ride (${activeRide.id})`);
            }
            
            // 4. Update ride (atomically)
            const updateTime = new Date().toISOString();
            sqliteDB.run(
                `UPDATE rides 
                 SET driver_id = ?, 
                     driver_name = ?, 
                     status = 'ASSIGNED',
                     assigned_at = ?,
                     updated_at = ?
                 WHERE id = ?`,
                [driver_id, driver.full_name, updateTime, updateTime, id]
            );
            
            // 5. Update driver status
            sqliteDB.run(
                `UPDATE drivers 
                 SET status = 'ON_DUTY',
                     current_ride_id = ?,
                     updated_at = ?
                 WHERE id = ?`,
                [id, updateTime, driver_id]
            );
            
            // 6. Create ride event
            sqliteDB.insert('ride_events', {
                ride_id: id,
                event_type: 'ASSIGNED',
                description: `Driver ${driver.full_name} assigned to ride`,
                latitude: ride.pickup_lat,
                longitude: ride.pickup_lng,
                timestamp: updateTime,
                created_by: req.user.id
            });
            
            return {
                ride_id: id,
                driver_id: driver_id,
                driver_name: driver.full_name,
                assigned_at: updateTime
            };
        })();
        
        // ✅ Audit log
        auditService.log(
            req.user.email,
            req.user.role,
            'ASSIGN_DRIVER',
            'rides',
            id,
            { driver_id, driver_name: result.driver_name }
        );
        
        res.json({
            success: true,
            message: 'Driver assigned successfully',
            data: result
        });
        
    } catch (error: any) {
        console.error('Assign driver error:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'ASSIGNMENT_FAILED',
                message: error.message
            }
        });
    }
});
```

#### ✅ Test Cases

```powershell
# Test 1: Concurrent assignment (ควรมีเพียง 1 request สำเร็จ)
$token = (Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
    -Method POST -Body (@{email="admin@wecare.com";password="Admin@123"} | ConvertTo-Json) `
    -ContentType "application/json").token

# สร้าง 2 rides
$ride1 = (Invoke-RestMethod -Uri "http://localhost:3001/api/rides" `
    -Method POST -Headers @{Authorization="Bearer $token"} `
    -Body (@{patient_id="PAT-001";pickup_location="Location A"} | ConvertTo-Json) `
    -ContentType "application/json").id

$ride2 = (Invoke-RestMethod -Uri "http://localhost:3001/api/rides" `
    -Method POST -Headers @{Authorization="Bearer $token"} `
    -Body (@{patient_id="PAT-002";pickup_location="Location B"} | ConvertTo-Json) `
    -ContentType "application/json").id

# Assign driver คนเดียวกันพร้อมกัน
$job1 = Start-Job -ScriptBlock {
    param($url, $token, $rideId)
    Invoke-RestMethod -Uri "$url/api/rides/$rideId/assign" `
        -Method PATCH -Headers @{Authorization="Bearer $token"} `
        -Body (@{driver_id="DRV-001"} | ConvertTo-Json) `
        -ContentType "application/json"
} -ArgumentList "http://localhost:3001", $token, $ride1

$job2 = Start-Job -ScriptBlock {
    param($url, $token, $rideId)
    Invoke-RestMethod -Uri "$url/api/rides/$rideId/assign" `
        -Method PATCH -Headers @{Authorization="Bearer $token"} `
        -Body (@{driver_id="DRV-001"} | ConvertTo-Json) `
        -ContentType "application/json"
} -ArgumentList "http://localhost:3001", $token, $ride2

Wait-Job $job1, $job2
$result1 = Receive-Job $job1
$result2 = Receive-Job $job2

# Expected: 1 success, 1 failure ("Driver not available" or "Driver already has an active ride")

# Test 2: Assign driver ที่ไม่ available (ควร FAIL)
Invoke-RestMethod -Uri "http://localhost:3001/api/rides/$ride2/assign" `
    -Method PATCH -Headers @{Authorization="Bearer $token"} `
    -Body (@{driver_id="DRV-001"} | ConvertTo-Json) `
    -ContentType "application/json"

# Expected: 400 Bad Request - "Driver not available"

# Test 3: Assign driver ที่ available (ควร PASS)
Invoke-RestMethod -Uri "http://localhost:3001/api/rides/$ride2/assign" `
    -Method PATCH -Headers @{Authorization="Bearer $token"} `
    -Body (@{driver_id="DRV-002"} | ConvertTo-Json) `
    -ContentType "application/json"

# Expected: 200 OK - "Driver assigned successfully"
```

#### 📝 Acceptance Criteria

- [ ] ไม่มี race condition (driver 1 คนถูก assign ได้เพียง 1 ride)
- [ ] ตรวจสอบ driver availability ก่อน assign
- [ ] ตรวจสอบว่า driver ไม่มี active ride อยู่
- [ ] ใช้ database transaction เพื่อความ atomic
- [ ] มี ride event บันทึกการ assign
- [ ] มี audit log

---

### Priority 1.3: BUG-009 - No Real-time Location Tracking

**ความรุนแรง:** 🔴 CRITICAL  
**ผลกระทบ:** ไม่มี real-time tracking ทำให้ระบบ EMS ไม่มีประสิทธิภาพ

#### 📍 ไฟล์ที่ต้องสร้าง/แก้ไข

**Files:**
1. `wecare-backend/package.json` - เพิ่ม socket.io
2. `wecare-backend/src/index.ts` - Setup Socket.IO server
3. `wecare-backend/src/services/locationService.ts` - Location service
4. `src/services/socketService.ts` - Frontend socket client

#### 🔧 การแก้ไข

**Step 1: Install Socket.IO**

```bash
cd wecare-backend
npm install socket.io
npm install --save-dev @types/socket.io

cd ..
npm install socket.io-client
```

**Step 2: Backend Setup**

```typescript
// wecare-backend/src/index.ts
import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';

// เปลี่ยนจาก app.listen เป็น http server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Authentication middleware for Socket.IO
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
        return next(new Error('Authentication token required'));
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        socket.data.user = decoded;
        next();
    } catch (error) {
        next(new Error('Invalid authentication token'));
    }
});

// Location tracking namespace
const locationNamespace = io.of('/locations');

locationNamespace.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`[Socket] User connected: ${user.email} (${user.role})`);
    
    // Join appropriate rooms based on role
    if (user.role === 'driver') {
        socket.join(`driver:${user.id}`);
        console.log(`[Socket] Driver ${user.id} joined tracking`);
    } else if (['OFFICER', 'admin', 'radio', 'radio_center'].includes(user.role)) {
        socket.join('tracking:all');
        console.log(`[Socket] ${user.role} joined tracking:all`);
    }
    
    // Driver sends location update
    socket.on('location:update', async (data) => {
        if (user.role !== 'driver') {
            socket.emit('error', { message: 'Only drivers can send location updates' });
            return;
        }
        
        try {
            const locationData = {
                driver_id: user.id,
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
                accuracy: data.accuracy || null,
                heading: data.heading || null,
                speed: data.speed || null,
                timestamp: new Date().toISOString()
            };
            
            // Validate coordinates
            if (isNaN(locationData.latitude) || isNaN(locationData.longitude)) {
                throw new Error('Invalid coordinates');
            }
            
            if (locationData.latitude < -90 || locationData.latitude > 90) {
                throw new Error('Invalid latitude');
            }
            
            if (locationData.longitude < -180 || locationData.longitude > 180) {
                throw new Error('Invalid longitude');
            }
            
            // Save to database
            sqliteDB.insert('driver_locations', locationData);
            
            // Update driver's last known location
            sqliteDB.run(
                `UPDATE drivers 
                 SET last_latitude = ?, 
                     last_longitude = ?,
                     last_location_update = ?
                 WHERE id = ?`,
                [locationData.latitude, locationData.longitude, locationData.timestamp, user.id]
            );
            
            // Broadcast to tracking room
            locationNamespace.to('tracking:all').emit('location:updated', {
                driver_id: user.id,
                driver_name: user.full_name,
                ...locationData
            });
            
            // Acknowledge to sender
            socket.emit('location:ack', { 
                success: true, 
                timestamp: locationData.timestamp 
            });
            
        } catch (error: any) {
            console.error('[Socket] Location update error:', error);
            socket.emit('error', { message: error.message });
        }
    });
    
    // Request current locations of all drivers
    socket.on('location:request-all', async () => {
        if (!['OFFICER', 'admin', 'radio', 'radio_center'].includes(user.role)) {
            socket.emit('error', { message: 'Unauthorized' });
            return;
        }
        
        try {
            const drivers = sqliteDB.all(`
                SELECT d.id, d.full_name, d.status, 
                       d.last_latitude, d.last_longitude, d.last_location_update,
                       r.id as current_ride_id, r.status as ride_status
                FROM drivers d
                LEFT JOIN rides r ON d.current_ride_id = r.id
                WHERE d.status IN ('AVAILABLE', 'ON_DUTY')
            `);
            
            socket.emit('location:all', { drivers });
        } catch (error: any) {
            socket.emit('error', { message: error.message });
        }
    });
    
    // Disconnect
    socket.on('disconnect', () => {
        console.log(`[Socket] User disconnected: ${user.email}`);
    });
});

// Start server with Socket.IO
server.listen(PORT, () => {
    console.log(`🚀 Server with WebSocket running on http://localhost:${PORT}`);
});

// Export io for use in other modules
export { io, locationNamespace };
```

**Step 3: Frontend Socket Service**

```typescript
// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private locationSocket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    
    connect(token: string) {
        if (this.locationSocket?.connected) {
            console.log('[Socket] Already connected');
            return;
        }
        
        this.locationSocket = io('http://localhost:3001/locations', {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts
        });
        
        this.locationSocket.on('connect', () => {
            console.log('[Socket] Connected to location tracking');
            this.reconnectAttempts = 0;
        });
        
        this.locationSocket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
        });
        
        this.locationSocket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error);
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('[Socket] Max reconnection attempts reached');
                this.disconnect();
            }
        });
        
        this.locationSocket.on('error', (error) => {
            console.error('[Socket] Error:', error);
        });
    }
    
    // Driver: Send location update
    sendLocation(location: GeolocationPosition) {
        if (!this.locationSocket?.connected) {
            console.warn('[Socket] Not connected, cannot send location');
            return;
        }
        
        this.locationSocket.emit('location:update', {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            heading: location.coords.heading,
            speed: location.coords.speed
        });
    }
    
    // Officer/Admin: Subscribe to location updates
    onLocationUpdate(callback: (data: any) => void) {
        if (!this.locationSocket) return;
        
        this.locationSocket.on('location:updated', callback);
    }
    
    // Officer/Admin: Request all driver locations
    requestAllLocations() {
        if (!this.locationSocket?.connected) return;
        
        this.locationSocket.emit('location:request-all');
    }
    
    // Officer/Admin: Receive all locations
    onAllLocations(callback: (data: any) => void) {
        if (!this.locationSocket) return;
        
        this.locationSocket.on('location:all', callback);
    }
    
    // Disconnect
    disconnect() {
        if (this.locationSocket) {
            this.locationSocket.disconnect();
            this.locationSocket = null;
        }
    }
}

export const socketService = new SocketService();
```

**Step 4: Frontend Integration (Driver)**

```typescript
// src/pages/DriverDashboard.tsx
import { useEffect, useState } from 'react';
import { socketService } from '../services/socketService';

export default function DriverDashboard() {
    const [isTracking, setIsTracking] = useState(false);
    const [watchId, setWatchId] = useState<number | null>(null);
    
    useEffect(() => {
        // Connect to socket
        const token = localStorage.getItem('token');
        if (token) {
            socketService.connect(token);
        }
        
        // Start location tracking
        startTracking();
        
        return () => {
            stopTracking();
            socketService.disconnect();
        };
    }, []);
    
    const startTracking = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        
        const id = navigator.geolocation.watchPosition(
            (position) => {
                // Send location via socket
                socketService.sendLocation(position);
                setIsTracking(true);
            },
            (error) => {
                console.error('Geolocation error:', error);
                setIsTracking(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
        
        setWatchId(id);
    };
    
    const stopTracking = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
            setIsTracking(false);
        }
    };
    
    return (
        <div>
            <h1>Driver Dashboard</h1>
            <div>
                Location Tracking: {isTracking ? '🟢 Active' : '🔴 Inactive'}
            </div>
        </div>
    );
}
```

**Step 5: Frontend Integration (Officer/Admin Map)**

```typescript
// src/pages/TrackingMap.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { socketService } from '../services/socketService';

export default function TrackingMap() {
    const [drivers, setDrivers] = useState<any[]>([]);
    
    useEffect(() => {
        // Connect to socket
        const token = localStorage.getItem('token');
        if (token) {
            socketService.connect(token);
        }
        
        // Request initial locations
        socketService.requestAllLocations();
        
        // Listen for all locations
        socketService.onAllLocations((data) => {
            setDrivers(data.drivers);
        });
        
        // Listen for real-time updates
        socketService.onLocationUpdate((data) => {
            setDrivers(prev => {
                const index = prev.findIndex(d => d.id === data.driver_id);
                if (index >= 0) {
                    const updated = [...prev];
                    updated[index] = {
                        ...updated[index],
                        last_latitude: data.latitude,
                        last_longitude: data.longitude,
                        last_location_update: data.timestamp
                    };
                    return updated;
                } else {
                    return [...prev, data];
                }
            });
        });
        
        return () => {
            socketService.disconnect();
        };
    }, []);
    
    return (
        <MapContainer center={[13.7563, 100.5018]} zoom={13} style={{ height: '100vh' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {drivers.map(driver => (
                driver.last_latitude && driver.last_longitude && (
                    <Marker 
                        key={driver.id}
                        position={[driver.last_latitude, driver.last_longitude]}
                    >
                        <Popup>
                            <strong>{driver.full_name}</strong><br/>
                            Status: {driver.status}<br/>
                            Updated: {new Date(driver.last_location_update).toLocaleTimeString()}
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    );
}
```

#### ✅ Test Cases

```powershell
# Test 1: Driver connection
# 1. Login as driver
# 2. Open driver dashboard
# 3. Check browser console: "[Socket] Connected to location tracking"
# 4. Check server console: "[Socket] Driver DRV-001 joined tracking"

# Test 2: Location updates
# 1. Allow browser location permission
# 2. Check browser console: Location updates being sent every few seconds
# 3. Check database: SELECT * FROM driver_locations ORDER BY timestamp DESC LIMIT 10

# Test 3: Real-time tracking (Officer/Admin)
# 1. Login as OFFICER in another browser/tab
# 2. Open tracking map
# 3. Should see driver markers on map
# 4. Markers should update in real-time as driver moves

# Test 4: Multiple drivers
# 1. Login as 2-3 drivers in different browsers
# 2. All should send location updates
# 3. Officer should see all drivers on map updating in real-time
```

#### 📝 Acceptance Criteria

- [ ] Socket.IO server ทำงานได้
- [ ] Driver สามารถส่ง location updates ผ่าน WebSocket
- [ ] Officer/Admin เห็น driver locations แบบ real-time
- [ ] Map markers update ทันทีที่มีข้อมูลใหม่
- [ ] ไม่มี polling (ใช้ WebSocket เท่านั้น)
- [ ] Handle reconnection อัตโนมัติ
- [ ] Validate coordinates ก่อนบันทึก

---

## 🟠 Sprint 2: High Priority Bugs (Week 3-4)

### Priority 2.1: BUG-007 - No Driver Availability Check

**รวมอยู่ใน BUG-006 แล้ว** (transaction-based assignment with availability check)

---

### Priority 2.2: BUG-008 - Invalid Status Transitions

**ความรุนแรง:** 🟠 HIGH  
**ผลกระทบ:** Ride status สามารถข้าม state ได้ (เช่น PENDING → COMPLETED)

#### 📍 ไฟล์ที่ต้องแก้ไข

**File:** `wecare-backend/src/routes/rides.ts`

#### 🔧 การแก้ไข

```typescript
// Define valid state transitions (State Machine)
const VALID_RIDE_TRANSITIONS: Record<string, string[]> = {
    'PENDING': ['ASSIGNED', 'CANCELLED'],
    'ASSIGNED': ['IN_PROGRESS', 'CANCELLED'],
    'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [],  // Terminal state
    'CANCELLED': []   // Terminal state
};

// Validate transition
function isValidTransition(fromStatus: string, toStatus: string): boolean {
    const validNextStates = VALID_RIDE_TRANSITIONS[fromStatus] || [];
    return validNextStates.includes(toStatus);
}

router.patch('/:id/status', authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const { status: newStatus, notes } = req.body;
    
    try {
        const ride = sqliteDB.get('SELECT * FROM rides WHERE id = ?', [id]);
        
        if (!ride) {
            return res.status(404).json({
                success: false,
                error: { code: 'RIDE_NOT_FOUND', message: 'Ride not found' }
            });
        }
        
        // ✅ Validate state transition
        if (!isValidTransition(ride.status, newStatus)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS_TRANSITION',
                    message: `Cannot transition from ${ride.status} to ${newStatus}`,
                    currentStatus: ride.status,
                    requestedStatus: newStatus,
                    validTransitions: VALID_RIDE_TRANSITIONS[ride.status]
                }
            });
        }
        
        // ✅ Role-based validation
        if (newStatus === 'IN_PROGRESS' && req.user.role !== 'driver') {
            return res.status(403).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Only driver can start ride' }
            });
        }
        
        if (newStatus === 'COMPLETED' && req.user.role !== 'driver') {
            return res.status(403).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Only driver can complete ride' }
            });
        }
        
        // ✅ Update status
        const updateTime = new Date().toISOString();
        sqliteDB.update('rides', id, {
            status: newStatus,
            updated_at: updateTime,
            ...(newStatus === 'IN_PROGRESS' && { started_at: updateTime }),
            ...(newStatus === 'COMPLETED' && { completed_at: updateTime })
        });
        
        // ✅ Update driver status if needed
        if (ride.driver_id) {
            if (newStatus === 'COMPLETED' || newStatus === 'CANCELLED') {
                sqliteDB.update('drivers', ride.driver_id, {
                    status: 'AVAILABLE',
                    current_ride_id: null
                });
            }
        }
        
        // ✅ Create ride event
        sqliteDB.insert('ride_events', {
            ride_id: id,
            event_type: `STATUS_CHANGED_TO_${newStatus}`,
            description: notes || `Ride status changed to ${newStatus}`,
            timestamp: updateTime,
            created_by: req.user.id
        });
        
        // ✅ Audit log
        auditService.log(
            req.user.email,
            req.user.role,
            'UPDATE_RIDE_STATUS',
            'rides',
            id,
            { from: ride.status, to: newStatus }
        );
        
        res.json({
            success: true,
            message: 'Ride status updated successfully',
            data: { id, status: newStatus }
        });
        
    } catch (error: any) {
        console.error('Update ride status error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'UPDATE_FAILED', message: error.message }
        });
    }
});
```

#### ✅ Test Cases

```powershell
# Test 1: Valid transitions (ควร PASS)
# PENDING → ASSIGNED
Invoke-RestMethod -Uri "http://localhost:3001/api/rides/RIDE-001/status" `
    -Method PATCH -Headers @{Authorization="Bearer $officerToken"} `
    -Body (@{status="ASSIGNED"} | ConvertTo-Json) `
    -ContentType "application/json"

# ASSIGNED → IN_PROGRESS
Invoke-RestMethod -Uri "http://localhost:3001/api/rides/RIDE-001/status" `
    -Method PATCH -Headers @{Authorization="Bearer $driverToken"} `
    -Body (@{status="IN_PROGRESS"} | ConvertTo-Json) `
    -ContentType "application/json"

# IN_PROGRESS → COMPLETED
Invoke-RestMethod -Uri "http://localhost:3001/api/rides/RIDE-001/status" `
    -Method PATCH -Headers @{Authorization="Bearer $driverToken"} `
    -Body (@{status="COMPLETED"} | ConvertTo-Json) `
    -ContentType "application/json"

# Test 2: Invalid transitions (ควร FAIL)
# PENDING → COMPLETED (skip states)
Invoke-RestMethod -Uri "http://localhost:3001/api/rides/RIDE-002/status" `
    -Method PATCH -Headers @{Authorization="Bearer $officerToken"} `
    -Body (@{status="COMPLETED"} | ConvertTo-Json) `
    -ContentType "application/json"

# Expected: 400 Bad Request - "Cannot transition from PENDING to COMPLETED"

# Test 3: Terminal state (ควร FAIL)
# COMPLETED → PENDING
Invoke-RestMethod -Uri "http://localhost:3001/api/rides/RIDE-001/status" `
    -Method PATCH -Headers @{Authorization="Bearer $officerToken"} `
    -Body (@{status="PENDING"} | ConvertTo-Json) `
    -ContentType "application/json"

# Expected: 400 Bad Request - "Cannot transition from COMPLETED"
```

#### 📝 Acceptance Criteria

- [ ] State machine ทำงานถูกต้อง
- [ ] ไม่สามารถข้าม state ได้
- [ ] Terminal states (COMPLETED, CANCELLED) ไม่สามารถเปลี่ยนได้
- [ ] Role-based validation (เฉพาะ driver เริ่ม/จบ ride)
- [ ] มี ride event บันทึกการเปลี่ยน status
- [ ] Error messages ระบุ valid transitions

---

### Priority 2.3-2.12: Additional High Priority Bugs

**รายการ:**
- BUG-011: Email validation
- BUG-014: EXECUTIVE read-only
- BUG-016: CSRF enforcement
- BUG-002: FK dependency check
- BUG-015: Horizontal privilege escalation

**คำแนะนำ:** ดูรายละเอียดการแก้ไขใน `QA_DEEP_AUTOMATED_TEST_REPORT_PROFESSIONAL.md` หน้า "การวิเคราะห์เชิงลึก"

---

## 🟡 Sprint 3: Medium Priority Bugs (Week 5-6)

### รายการ Medium Priority Bugs

1. **BUG-003:** Weak password validation
2. **BUG-004:** File upload size limit
3. **BUG-005:** File type validation
4. **BUG-010:** Location history pagination
5. **BUG-012:** National ID validation
6. **BUG-013:** License expiry date validation
7. **BUG-017:** Password strength
8. **BUG-019:** Map component issues
9. **BUG-020:** Form validation

**คำแนะนำ:** แก้ไขตามลำดับความสำคัญ ดูรายละเอียดใน QA Report

---

## ✅ แผนการทดสอบ (Testing Plan)

### 1. Unit Testing

```bash
# สร้าง test files
wecare-backend/src/__tests__/
├── routes/
│   ├── users.test.ts
│   ├── rides.test.ts
│   └── auth.test.ts
├── middleware/
│   ├── auth.test.ts
│   └── roleProtection.test.ts
└── services/
    └── auditService.test.ts
```

### 2. Integration Testing

```powershell
# Test scripts ที่ต้องรัน
.\test-admin-comprehensive.ps1
.\test-driver-comprehensive.ps1
.\test-community-complete.ps1
.\test-e2e-full-workflow.ps1
```

### 3. Security Testing

```powershell
# Security test suite
.\test-admin-privilege-escalation.ps1
.\test-admin-csrf-protection.ps1
.\test-admin-input-validation.ps1
.\test-driver-security.ps1
```

### 4. Performance Testing

```powershell
# Load testing
.\test-driver-performance.ps1
# Concurrent requests
.\test-ride-conflict.ps1
```

---

## 📋 Checklist สำหรับทีม G

### Sprint 1 Checklist (Week 1-2)

#### BUG-001: Privilege Escalation
- [ ] แก้ไข `users.ts` - เพิ่มการตรวจสอบ self-role-change
- [ ] เพิ่ม audit log
- [ ] เขียน unit tests
- [ ] รัน `test-admin-privilege-escalation.ps1`
- [ ] Verify: Admin ไม่สามารถเปลี่ยน role ของตัวเองได้
- [ ] Code review
- [ ] Merge to main branch

#### BUG-006: Race Condition
- [ ] แก้ไข `rides.ts` - ใช้ transaction
- [ ] เพิ่มการตรวจสอบ driver availability
- [ ] เพิ่ม ride events
- [ ] เขียน unit tests
- [ ] รัน `test-ride-conflict.ps1` (concurrent assignment)
- [ ] Verify: ไม่มี race condition
- [ ] Code review
- [ ] Merge to main branch

#### BUG-009: WebSocket Implementation
- [ ] Install socket.io dependencies
- [ ] แก้ไข `index.ts` - Setup Socket.IO server
- [ ] สร้าง `locationService.ts` (backend)
- [ ] สร้าง `socketService.ts` (frontend)
- [ ] แก้ไข `DriverDashboard.tsx` - เพิ่ม location tracking
- [ ] แก้ไข `TrackingMap.tsx` - เพิ่ม real-time updates
- [ ] Test: Driver location updates
- [ ] Test: Officer sees real-time tracking
- [ ] Test: Multiple drivers simultaneously
- [ ] Code review
- [ ] Merge to main branch

#### Sprint 1 Final Testing
- [ ] รัน test suite ทั้งหมด
- [ ] ตรวจสอบ regression (ไม่มี bug ใหม่)
- [ ] Performance testing
- [ ] Deploy to staging
- [ ] QA approval

---

### Sprint 2 Checklist (Week 3-4)

#### BUG-008: Status Transitions
- [ ] แก้ไข `rides.ts` - เพิ่ม state machine
- [ ] เพิ่ม validation function
- [ ] เพิ่ม role-based checks
- [ ] เขียน unit tests
- [ ] Test: Valid transitions
- [ ] Test: Invalid transitions blocked
- [ ] Code review
- [ ] Merge to main branch

#### BUG-011: Email Validation
- [ ] สร้าง `validators.ts` - เพิ่ม Joi schemas
- [ ] แก้ไข `auth.ts` - ใช้ email validation
- [ ] แก้ไข `users.ts` - ใช้ email validation
- [ ] Test: Valid emails accepted
- [ ] Test: Invalid emails rejected
- [ ] Code review
- [ ] Merge to main branch

#### BUG-014: EXECUTIVE Read-Only
- [ ] แก้ไข `roleProtection.ts` - เพิ่ม enforceReadOnly
- [ ] Apply middleware to routes
- [ ] Test: EXECUTIVE can read
- [ ] Test: EXECUTIVE cannot write
- [ ] Code review
- [ ] Merge to main branch

#### BUG-016: CSRF Enforcement
- [ ] แก้ไข `csrfProtection.ts` - enforce validation
- [ ] Apply to all state-changing routes
- [ ] Test: Requests without CSRF token blocked
- [ ] Test: Requests with valid token pass
- [ ] Code review
- [ ] Merge to main branch

#### Sprint 2 Final Testing
- [ ] รัน test suite ทั้งหมด
- [ ] Security audit
- [ ] Deploy to staging
- [ ] QA approval

---

### Sprint 3 Checklist (Week 5-6)

#### Password & Validation
- [ ] BUG-003, BUG-017: Password strength
- [ ] BUG-012: National ID validation
- [ ] BUG-013: Date validation
- [ ] Test all validation rules

#### File Upload
- [ ] BUG-004: File size limit
- [ ] BUG-005: File type validation
- [ ] Test: Large files rejected
- [ ] Test: Invalid file types rejected

#### Frontend
- [ ] BUG-019: Map component
- [ ] BUG-020: Form validation
- [ ] Test: All forms validate correctly

#### Sprint 3 Final Testing
- [ ] รัน test suite ทั้งหมด
- [ ] User acceptance testing
- [ ] Deploy to staging
- [ ] QA approval

---

## 🎯 Definition of Done (DoD)

### สำหรับแต่ละ Bug Fix:

- [ ] โค้ดแก้ไขเสร็จสมบูรณ์
- [ ] Unit tests เขียนและผ่านทั้งหมด
- [ ] Integration tests ผ่าน
- [ ] ไม่มี regression bugs
- [ ] Code review approved
- [ ] Documentation updated
- [ ] QA testing passed
- [ ] Merged to main branch

### สำหรับแต่ละ Sprint:

- [ ] ทุก bugs ใน sprint แก้ไขเสร็จ
- [ ] Test suite ทั้งหมดผ่าน (>95%)
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Deployed to staging
- [ ] QA sign-off
- [ ] Stakeholder demo completed

---

## 📞 Communication Plan

### Daily Standup (15 นาที)
- ทำอะไรไปแล้วเมื่อวาน
- จะทำอะไรวันนี้
- มี blocker อะไรบ้าง

### Weekly Review (1 ชั่วโมง)
- Demo bug fixes
- Review test results
- Plan next week

### Sprint Review (2 ชั่วโมง)
- Demo ให้ stakeholders
- รับ feedback
- Plan next sprint

---

## 🚀 Deployment Strategy

### Staging Deployment (ทุกสัปดาห์)
```bash
# Deploy to staging
git checkout main
git pull origin main
npm run build
npm run deploy:staging
```

### Production Deployment (ทุก Sprint)
```bash
# Deploy to production (after QA approval)
git checkout main
git tag -a v4.1.0 -m "Sprint 1 release"
git push origin v4.1.0
npm run deploy:production
```

---

## 📊 Success Metrics

### Sprint 1 Target
- ✅ 3 critical bugs fixed
- ✅ Test pass rate: >90%
- ✅ Quality score: 78/100

### Sprint 2 Target
- ✅ 12 high priority bugs fixed
- ✅ Test pass rate: >95%
- ✅ Quality score: 85/100

### Sprint 3 Target
- ✅ 18 medium priority bugs fixed
- ✅ Test pass rate: >98%
- ✅ Quality score: 90/100

---

**หมายเหตุสำหรับทีม G:**

1. **อ่านเอกสารให้ครบ** - ทั้ง Bug Fix Plan และ QA Report
2. **ทำทีละ bug** - อย่ารีบ แก้ให้ถูกต้องและครบถ้วน
3. **เขียน tests** - ทุก bug fix ต้องมี tests
4. **Code review** - ให้เพื่อนร่วมทีม review ก่อน merge
5. **Test ก่อน merge** - รัน test suite ทั้งหมดก่อน merge ทุกครั้ง
6. **สื่อสาร** - มี blocker แจ้งทันที อย่าปล่อยทิ้งไว้

**ติดต่อ QA Team:**
- หากมีคำถามเกี่ยวกับ bug
- หากต้องการ test cases เพิ่มเติม
- หากพบ bug ใหม่ระหว่างแก้ไข

---

**จัดทำโดย:** QA Engineer  
**วันที่:** 4 มกราคม 2026  
**เวอร์ชัน:** 1.0
