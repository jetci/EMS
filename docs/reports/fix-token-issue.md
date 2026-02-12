# แก้ไข: Token Invalid Issue

## ปัญหาที่พบ
```
Response Status: 401 Unauthorized
{"error":"Invalid token"}
```

## สาเหตุที่เป็นไปได้

### 1. Token Format ไม่ถูกต้อง
- Backend คาดหวัง JWT format
- Token ที่ส่งไปอาจไม่ใช่ JWT

### 2. JWT Secret ไม่ตรงกัน
- Backend ใช้ JWT_SECRET ตัวหนึ่ง
- Token ถูก sign ด้วย secret อื่น

### 3. Token หมดอายุ
- JWT มี expiration time
- Default: 7 วัน

### 4. Token ถูก blacklist
- Logout แล้วแต่ยังใช้ token เดิม

## การตรวจสอบ

### ตรวจสอบ Token ใน localStorage
```javascript
// Run in Console
const token = localStorage.getItem('wecare_token');
console.log('Token:', token);

// Decode JWT (without verification)
const parts = token.split('.');
if (parts.length === 3) {
    const payload = JSON.parse(atob(parts[1]));
    console.log('Token Payload:', payload);
    console.log('Issued At:', new Date(payload.iat * 1000));
    console.log('Expires At:', new Date(payload.exp * 1000));
    console.log('Is Expired:', Date.now() > payload.exp * 1000);
}
```

### ตรวจสอบ Backend JWT_SECRET
```bash
# Check .env file
cd d:\EMS\wecare-backend
cat .env | findstr JWT_SECRET
```

## การแก้ไข

### วิธีที่ 1: Logout และ Login ใหม่
1. Logout จากระบบ
2. Clear localStorage
3. Login ใหม่
4. ทดสอบอีกครั้ง

### วิธีที่ 2: ตรวจสอบ Backend
ปัญหาอาจอยู่ที่ backend ไม่สามารถ verify token ได้

## ขั้นตอนการแก้ไข

1. **Clear localStorage และ Login ใหม่**
2. **ทดสอบทันทีหลัง Login**
3. **ถ้ายังไม่ได้ → ตรวจสอบ backend**
