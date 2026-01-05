# 🔍 Debug Login Issue - Step by Step

## ✅ ที่ทำงานแล้ว
1. **Backend API**: ทำงานปกติบน port 3001
2. **Frontend Server**: ทำงานปกติบน port 3000
3. **Direct API Call**: Login สำเร็จ (ทดสอบด้วย PowerShell)

## ❓ ที่ต้องตรวจสอบ

### 1. เปิด Browser Console
1. กด `F12` ใน browser
2. ไปที่ tab **Console**
3. ดู error messages (ถ้ามี)

### 2. ตรวจสอบ Network Tab
1. กด `F12` → tab **Network**
2. พยายาม login
3. ดูว่า request ไปที่ไหน:
   - ✅ ถูก: `http://localhost:3001/api/auth/login` หรือ `/api/auth/login`
   - ❌ ผิด: ไปที่ URL อื่น

### 3. ตรวจสอบ Error Message
เมื่อกด Login แล้ว error message ที่ขึ้นคืออะไร?
- "อีเมลหรือรหัสผ่านไม่ถูกต้อง" → ลอง credentials อื่น
- "Network Error" → ปัญหา CORS หรือ connection
- "500 Internal Server Error" → Backend crash
- ไม่มี error แต่ไม่เกิดอะไร → JavaScript error

## 🧪 ทดสอบทีละขั้น

### Test 1: Direct API (ผ่านแล้ว ✅)
```powershell
$body = '{"email":"admin@wecare.ems","password":"Admin@123"}'
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```
**Result**: ✅ SUCCESS

### Test 2: Via Proxy (ผ่านแล้ว ✅)
```powershell
$body = '{"email":"admin@wecare.ems","password":"Admin@123"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```
**Result**: ✅ SUCCESS

### Test 3: Test Page
เปิดไฟล์: `d:\EMS\test-login-from-browser.html`
- กรอก: admin@wecare.ems / Admin@123
- กด "เข้าสู่ระบบ"
- ดูผลลัพธ์

### Test 4: Main App
เปิด: `http://localhost:3000`
- คลิก "เข้าสู่ระบบ"
- กรอก credentials
- ดู Console (F12)

## 🎯 Possible Issues

### Issue 1: Wrong Credentials
ลองทั้ง 2 แบบ:
- ✅ `admin@wecare.ems` / `Admin@123` (ถูกต้องตาม database)
- ❌ `admin@wecare.dev` / `password` (ตามเอกสาร TEAM_G แต่ไม่มีใน DB)

### Issue 2: CORS Error
ถ้าเห็น error: "CORS policy"
- Backend ต้อง allow origin `http://localhost:3000`
- ตรวจสอบ `wecare-backend/src/index.ts`

### Issue 3: Frontend Code Error
ตรวจสอบ:
- `src/services/api.ts` - API base URL
- `App.tsx` - handleLogin function
- `components/LoginScreen.tsx` - form submission

### Issue 4: Token Storage
หลัง login สำเร็จ:
- Token ต้องถูกเก็บใน `localStorage`
- Key: `wecare_token`
- ตรวจสอบ: F12 → Application → Local Storage

## 📝 ข้อมูลที่ต้องการ

กรุณาแจ้ง:
1. **Error message** ที่เห็นบน UI (ถ้ามี)
2. **Console errors** (F12 → Console)
3. **Network request** (F12 → Network → คลิกที่ login request)
4. **ขั้นตอนที่ทำ** เมื่อพยายาม login

## 🔧 Quick Fixes

### Fix 1: Clear Cache
```
Ctrl + Shift + Delete
→ Clear cache and cookies
→ Reload page
```

### Fix 2: Hard Reload
```
Ctrl + Shift + R
หรือ
Ctrl + F5
```

### Fix 3: Check localStorage
```javascript
// ใน Console (F12)
localStorage.clear()
location.reload()
```

## 📞 Next Steps

1. เปิด `http://localhost:3000`
2. กด F12
3. พยายาม login
4. Screenshot error (ถ้ามี)
5. แจ้งผลลัพธ์

---

**Current Status**:
- ✅ Backend: Running on port 3001
- ✅ Frontend: Running on port 3000
- ✅ API: Working (tested via PowerShell)
- ❓ UI Login: Need to investigate
