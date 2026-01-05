# ⚠️ คำสั่งด่วน - ทีม G
## จาก QA Engineer

**วันที่:** 4 มกราคม 2026 - 21:50

---

## 🔴 คำสั่งที่ 1: แก้ไข Authentication - ทำทันที!

**ปัญหา:** Login ไม่ได้ → ทดสอบไม่ได้

**แก้ไข:**

### File: `wecare-backend/src/routes/auth.ts`

**1. เพิ่ม logging (บรรทัด ~65)**
```typescript
// ใน login route
console.log('Login attempt:', { 
    email, 
    userFound: !!user,
    storedHash: user?.password 
});

const isValid = await bcrypt.compare(password, user.password);
console.log('Password check:', isValid);
```

**2. Fix ID generation (บรรทัด 121-127)**
```typescript
// เปลี่ยนจาก
const users = sqliteDB.all<{ id: string }>('SELECT id FROM users ORDER BY id DESC LIMIT 1');

// เป็น
const users = sqliteDB.all<{ id: string }>('SELECT id FROM users ORDER BY CAST(SUBSTR(id, 5) AS INTEGER) DESC LIMIT 1');
```

**3. ทดสอบ**
```powershell
cd wecare-backend
npm start

# Test login
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@wecare.dev\",\"password\":\"password\"}"
```

**Deadline:** วันนี้ - 2 ชั่วโมง

---

## 🟡 คำสั่งที่ 2: Implement WebSocket (BUG-009)

**ปัญหา:** ไม่มี real-time tracking

**ทำตามลำดับ:**

### Step 1: Install (5 นาที)
```bash
cd wecare-backend && npm install socket.io
cd .. && npm install socket.io-client
```

### Step 2: Backend (4 ชั่วโมง)

**File: `wecare-backend/src/index.ts`** - เพิ่มท้ายไฟล์

```typescript
import { Server } from 'socket.io';
import http from 'http';

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: 'http://localhost:5173', credentials: true }
});

io.of('/locations').on('connection', (socket) => {
    socket.on('location:update', (data) => {
        io.of('/locations').emit('location:updated', data);
    });
});

server.listen(PORT, () => console.log(`Server on ${PORT}`));
```

### Step 3: Frontend (4 ชั่วโมง)

**File: `src/services/socketService.ts`** - สร้างใหม่

```typescript
import { io } from 'socket.io-client';

class SocketService {
    private socket = io('http://localhost:3001/locations');
    
    sendLocation(lat: number, lng: number) {
        this.socket.emit('location:update', { lat, lng });
    }
    
    onLocationUpdate(callback: (data: any) => void) {
        this.socket.on('location:updated', callback);
    }
}

export const socketService = new SocketService();
```

**File: `src/pages/DriverDashboard.tsx`** - เพิ่มใน useEffect

```typescript
import { socketService } from '../services/socketService';

useEffect(() => {
    const watchId = navigator.geolocation.watchPosition((pos) => {
        socketService.sendLocation(pos.coords.latitude, pos.coords.longitude);
    });
    return () => navigator.geolocation.clearWatch(watchId);
}, []);
```

### Step 4: Test
```powershell
cd d:\EMS
.\test-bug-009-websocket.ps1
```

**Deadline:** สิ้นสุด Week 2

---

## ✅ Checklist

### Authentication (Today)
- [ ] เพิ่ม logging
- [ ] Fix ID generation  
- [ ] Restart backend
- [ ] Test login สำเร็จ
- [ ] แจ้ง QA

### WebSocket (This Week)
- [ ] Install dependencies
- [ ] Backend WebSocket server
- [ ] Frontend socket service
- [ ] Update DriverDashboard
- [ ] Test script ผ่าน
- [ ] แจ้ง QA

---

## 📞 รายงานผล

**เมื่อเสร็จแต่ละงาน:**
1. Commit code
2. Restart services
3. Test ให้แน่ใจว่าทำงาน
4. แจ้ง QA ทดสอบ

**ห้าม:**
- ❌ ส่งงานที่ยังไม่ได้ test
- ❌ ส่งงานที่ไม่ครบ
- ❌ ถามคำถามที่มีคำตอบในเอกสาร

---

**QA Engineer**  
4 มกราคม 2026 - 21:50
