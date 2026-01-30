# Socket.io Backend Update Guide

**วันที่**: 16 มกราคม 2569  
**ไฟล์**: `wecare-backend/src/index.ts`

---

## 🔧 การเปลี่ยนแปลงที่ต้องทำ

### 1. เพิ่ม Ping/Pong Configuration (Line 484)

**ก่อนแก้ไข**:
```typescript
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim())
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
  }
});
```

**หลังแก้ไข**:
```typescript
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

---

### 2. เพิ่ม ACK ใน location:update Event (Line 531)

**ก่อนแก้ไข**:
```typescript
socket.on('location:update', (data) => {
    // Only allow drivers to send location updates
    if (user.role !== 'driver' && user.role !== 'DRIVER') {
      console.warn(`⚠️ Unauthorized location update attempt from ${user.email} (${user.role})`);
      socket.emit('error', { message: 'Only drivers can send location updates' });
      return;
    }

    // Validate location data
    const lat = Number(data.lat);
    const lng = Number(data.lng);

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

    console.log('📍 Location update received:', {
      driverId: data.driverId || user.id,
      email: user.email,
      lat,
      lng
    });

    // Broadcast to all connected clients (office, executives, etc.)
    locationNamespace.emit('location:updated', {
      driverId: data.driverId || user.id,
      driverEmail: user.email,
      lat,
      lng,
      timestamp: new Date().toISOString(),
      status: data.status || 'AVAILABLE'
    });
  });
```

**หลังแก้ไข** (เพิ่ม callback parameter):
```typescript
socket.on('location:update', (data, callback) => {  // ✅ เพิ่ม callback
    // Only allow drivers to send location updates
    if (user.role !== 'driver' && user.role !== 'DRIVER') {
      console.warn(`⚠️ Unauthorized location update attempt from ${user.email} (${user.role})`);
      socket.emit('error', { message: 'Only drivers can send location updates' });
      // ✅ Send error ACK
      if (callback) callback({ status: 'error', message: 'Unauthorized' });
      return;
    }

    // Validate location data
    const lat = Number(data.lat);
    const lng = Number(data.lng);

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
      // ✅ Send error ACK
      if (callback) callback({ status: 'error', message: 'Invalid coordinates' });
      return;
    }

    console.log('📍 Location update received:', {
      driverId: data.driverId || user.id,
      email: user.email,
      lat,
      lng
    });

    // Broadcast to all connected clients (office, executives, etc.)
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
  });
```

---

## 📋 Checklist

- [ ] Line 484: เพิ่ม Ping/Pong Configuration
- [ ] Line 531: เพิ่ม callback parameter
- [ ] Line 535: เพิ่ม error ACK (Unauthorized)
- [ ] Line 552: เพิ่ม error ACK (Invalid coordinates)
- [ ] Line 572: เพิ่ม success ACK
- [ ] Restart Backend Server
- [ ] ทดสอบ ACK Response

---

## 🧪 Test Cases

### Test 1: ACK Success
```javascript
// Frontend
socket.emit('location:update', { lat: 13.7563, lng: 100.5018 }, (ack) => {
    console.log('ACK:', ack);
    // Expected: { status: 'ok', timestamp: '2024-01-16T10:30:00.000Z' }
});
```

### Test 2: ACK Error (Invalid Coordinates)
```javascript
// Frontend
socket.emit('location:update', { lat: 999, lng: 999 }, (ack) => {
    console.log('ACK:', ack);
    // Expected: { status: 'error', message: 'Invalid coordinates' }
});
```

---

**สถานะ**: ⏳ **รอ Manual Implementation**  
**เวลาที่ใช้**: 10 นาที
