# ขั้นตอนต่อไป - Debug PUT /auth/profile

## สถานะปัจจุบัน

✅ เพิ่ม logging ครบทุก middleware แล้ว
✅ Token verification ทำงานได้ (จาก logs ที่ SA ส่งมา)
❌ Test script ยังได้ 401

## ปัญหาที่เป็นไปได้

### 1. Token ไม่ตรงกัน
- Logs ที่ SA ส่งมาอาจเป็นจาก request ก่อนหน้า
- Test script ใช้ token ใหม่จาก login
- ต้องดู logs **หลังจากรัน test script ล่าสุด**

### 2. Response ไม่ถูกส่งกลับ
- Handler ทำงานสำเร็จแต่ response หายไป
- อาจมี middleware ที่ intercept response

## ขั้นตอนการทดสอบ

### ทดสอบที่ 1: รัน Test Script และดู Logs
```powershell
cd d:\EMS
.\auto-test-profile-update.ps1
```

จากนั้น **ทันที**:
1. ไปที่ backend terminal
2. Scroll ไปท้ายสุด
3. หา logs ที่ขึ้นหลังจากรัน script
4. Copy logs ทั้งหมดที่เกี่ยวข้องกับ PUT /api/auth/profile

### Logs ที่ต้องการ (ตัวอย่าง):
```
[timestamp] PUT /api/auth/profile - Origin: http://localhost:5173
🛡️ [SQL Injection] PUT /api/auth/profile
✅ [SQL Injection] PASSED
🔐 [CSRF Token] PUT /api/auth/profile
✅ [CSRF Token] Token exists
⏱️ [Rate Limiter] PUT /auth/profile
🔓 [Auth Routes] PUT /auth/profile
🔵 PUT /auth/profile called - UPDATED VERSION
📋 Request method: PUT
📋 Request path: /auth/profile
📋 Request URL: /auth/profile
🔑 Token received: eyJhbGci...
🔐 JWT_SECRET: 77a7bec4...
🔄 Verifying token...
✅ Token verified! User ID: USR-001
📦 Updates: { name: 'Test User Updated', phone: '0812345678', profileImageUrl: '...' }
💾 Update data: [ 'full_name', 'phone', 'profile_image_url' ]
✅ Database updated
✅ User retrieved from DB
✅ Sending response: { id: 'USR-001', name: 'Test User Updated', hasImage: true }
```

### ทดสอบที่ 2: ถ้า Logs แสดงว่าสำเร็จแต่ Test ยังได้ 401

แสดงว่าปัญหาอยู่ที่:
1. **Response ไม่ถูกส่งกลับ** - มี middleware intercept
2. **Test script มีปัญหา** - ไม่ได้รับ response ที่ถูกต้อง
3. **Multiple requests** - มีหลาย request และ test script ดู response ผิดตัว

### ทดสอบที่ 3: ทดสอบด้วย Browser

1. เปิด http://localhost:5173
2. Login
3. เปิด Console (F12)
4. รัน script:
```javascript
(async function() {
    const token = localStorage.getItem('wecare_token');
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: 'Test User',
            phone: '0812345678',
            profileImageUrl: testImage
        })
    });
    
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
    
    // ดู backend terminal ทันที
})();
```

5. ดู Console output
6. ดู Backend terminal logs **ทันที**
7. ส่งทั้ง Console output และ Backend logs มาให้ฉัน

## สิ่งที่ต้องการจาก SA

กรุณาทำ **ทดสอบที่ 3** (ทดสอบด้วย Browser) แล้วส่ง:
1. **Console output** (Status และ Response)
2. **Backend logs** ที่เกิดขึ้นหลังจากรัน script (ทันที)

จะช่วยให้ฉันวิเคราะห์ได้ว่าปัญหาอยู่ที่ไหนแน่ๆ
