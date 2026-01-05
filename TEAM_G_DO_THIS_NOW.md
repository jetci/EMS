# คำสั่งทีม G - ทำเลย!

## งานที่ 1: แก้ไข Login (2 ชั่วโมง)

**ปัญหา:** Login ไม่ได้

**ทำ:**

1. เปิดไฟล์ `wecare-backend/src/routes/auth.ts`
2. หาบรรทัดที่มี `bcrypt.compare`
3. เพิ่มบรรทัดนี้ก่อนหน้า:
```typescript
console.log('Checking:', { email, hash: user.password });
```
4. Save
5. Restart backend: `cd wecare-backend && npm start`
6. ลอง login: `admin@wecare.dev` / `password`
7. ดู console log
8. แจ้ง QA

**เสร็จเมื่อ:** Login ได้

---

## งานที่ 2: ทำ WebSocket (1 สัปดาห์)

**ปัญหา:** ไม่มี real-time tracking

**ทำ:**

### A. Install (5 นาที)
```bash
cd wecare-backend
npm install socket.io

cd ..
npm install socket.io-client
```

### B. Backend (1 วัน)

เปิด `wecare-backend/src/index.ts` เพิ่มท้ายไฟล์:

```typescript
import { Server } from 'socket.io';
import http from 'http';

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: 'http://localhost:5173' }
});

io.of('/locations').on('connection', (socket) => {
    socket.on('location:update', (data) => {
        io.of('/locations').emit('location:updated', data);
    });
});

server.listen(3001);
```

### C. Frontend (1 วัน)

สร้างไฟล์ `src/services/socketService.ts`:

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/locations');

export const socketService = {
    sendLocation(lat: number, lng: number) {
        socket.emit('location:update', { lat, lng });
    },
    onUpdate(callback: any) {
        socket.on('location:updated', callback);
    }
};
```

เปิด `src/pages/DriverDashboard.tsx` เพิ่ม:

```typescript
import { socketService } from '../services/socketService';

// ใน useEffect
navigator.geolocation.watchPosition((pos) => {
    socketService.sendLocation(pos.coords.latitude, pos.coords.longitude);
});
```

### D. Test
```powershell
cd d:\EMS
.\test-bug-009-websocket.ps1
```

**เสร็จเมื่อ:** Test ผ่าน 7/7

---

## เช็คลิสต์

**งานที่ 1 (วันนี้):**
- [ ] เพิ่ม console.log
- [ ] Restart backend
- [ ] Login ได้
- [ ] แจ้ง QA

**งานที่ 2 (สัปดาห์นี้):**
- [ ] npm install
- [ ] แก้ index.ts
- [ ] สร้าง socketService.ts
- [ ] แก้ DriverDashboard.tsx
- [ ] Test ผ่าน
- [ ] แจ้ง QA

---

เสร็จแต่ละงาน → แจ้ง QA ทันที
