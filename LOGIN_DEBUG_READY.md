# ✅ Login Debug - พร้อมทดสอบ

## สิ่งที่ทำไปแล้ว

### 1. ✅ Backend & Frontend กำลังทำงาน
- **Backend**: `http://localhost:3001` ✅
- **Frontend**: `http://localhost:3000` ✅
- **API Test**: Login สำเร็จผ่าน PowerShell ✅

### 2. ✅ เพิ่ม Debug Logging
เพิ่ม console.log ใน 3 จุดสำคัญ:

#### A. `App.tsx` - handleLogin function
```typescript
console.log('🔐 handleLogin called with:', { email, password: '***' });
console.log('📡 Calling authAPI.login...');
console.log('✅ Login API success:', { user, role });
console.log('💾 Token saved to localStorage');
console.log('✅ User state updated, login successful');
```

#### B. `src/services/api.ts` - authAPI.login
```typescript
console.log('🔑 authAPI.login called:', { email, endpoint: '/auth/login' });
```

#### C. `src/services/api.ts` - apiRequest
```typescript
console.log(`📤 API Request: ${method} ${fullUrl}`);
console.log(`📥 API Response: ${res.status} ${res.statusText}`);
```

## 🧪 ขั้นตอนทดสอบ

### 1. เปิด Browser
```
http://localhost:3000/login
```

### 2. เปิด Developer Console
กด `F12` → tab **Console**

### 3. ทดสอบ Login
- Email: `admin@wecare.ems`
- Password: `Admin@123`
- กด "เข้าสู่ระบบ"

### 4. ดู Console Logs
คุณจะเห็น logs ตามลำดับ:

**กรณีสำเร็จ:**
```
🔐 handleLogin called with: { email: "admin@wecare.ems", password: "***" }
📡 Calling authAPI.login...
🔑 authAPI.login called: { email: "admin@wecare.ems", endpoint: "/auth/login" }
📤 API Request: POST /api/auth/login
📥 API Response: 200 OK
✅ Login API success: { user: "admin@wecare.ems", role: "admin" }
💾 Token saved to localStorage
✅ User state updated, login successful
```

**กรณีล้มเหลว - จะเห็น:**
```
🔐 handleLogin called with: { email: "...", password: "***" }
📡 Calling authAPI.login...
🔑 authAPI.login called: { email: "...", endpoint: "/auth/login" }
📤 API Request: POST /api/auth/login
📥 API Response: 401 Unauthorized  (หรือ 500, 403, etc.)
❌ Login error: Error: ...
```

## 📋 ข้อมูลที่ต้องการจาก SA

หลังจากทดสอบ กรุณาแจ้ง:

1. **Console Logs ที่เห็น** (copy/paste)
2. **Error message บน UI** (ถ้ามี)
3. **Network tab** (F12 → Network → คลิกที่ login request)
   - Request URL
   - Status Code
   - Response

## 🎯 Possible Issues & Solutions

### Issue 1: ไม่เห็น logs เลย
**สาเหตุ**: หน้าเว็บยังใช้ code เก่า  
**แก้**: Hard reload → `Ctrl + Shift + R`

### Issue 2: เห็น logs แต่ 401 Unauthorized
**สาเหตุ**: Password ผิด  
**แก้**: ลอง credentials อื่น:
- `admin@wecare.ems` / `password123`
- `dev@wecare.ems` / `password123`

### Issue 3: เห็น logs แต่ 500 Internal Server Error
**สาเหตุ**: Backend crash  
**แก้**: ดู backend console มี error อะไร

### Issue 4: Network Error / CORS Error
**สาเหตุ**: Backend ไม่ตอบสนอง หรือ CORS block  
**แก้**: ตรวจสอบ backend ยังทำงานอยู่หรือไม่

### Issue 5: Login สำเร็จแต่ไม่ redirect
**สาเหตุ**: User state update แต่ UI ไม่ re-render  
**แก้**: ตรวจสอบ React state management

## 🔧 Quick Tests

### Test 1: ตรวจสอบ Backend
```powershell
$body = '{"email":"admin@wecare.ems","password":"Admin@123"}'
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```
**Expected**: JSON response with user & token

### Test 2: ตรวจสอบ Frontend Proxy
```powershell
$body = '{"email":"admin@wecare.ems","password":"Admin@123"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```
**Expected**: JSON response with user & token

### Test 3: ตรวจสอบ localStorage
```javascript
// ใน Browser Console (F12)
localStorage.getItem('wecare_token')
localStorage.getItem('wecare_user')
```
**Expected**: หลัง login สำเร็จจะมีค่า

## 📞 Next Steps

1. ✅ เปิด `http://localhost:3000/login`
2. ✅ เปิด Console (F12)
3. ✅ ทดสอบ login
4. ✅ Copy logs ทั้งหมด
5. ✅ แจ้ง SA

---

**Status**: 🟢 Ready for Testing  
**Logs**: ✅ Enabled  
**Backend**: ✅ Running  
**Frontend**: ✅ Running
