# แก้ไขปัญหา Token Invalid

## ปัญหา
PUT /auth/profile ได้ 401 Invalid Token เพราะ token ใน localStorage ไม่ตรงกับ JWT_SECRET ที่ backend ใช้อยู่

## สาเหตุ
- Backend restart หลายครั้ง
- Token เก่าใน localStorage ถูก sign ด้วย JWT_SECRET ตัวเก่า (หรือ session เก่า)
- GET /auth/me ใช้งานได้เพราะอาจมี fallback หรือ cache

## วิธีแก้ไข (สำหรับ SA)

### วิธีที่ 1: Clear localStorage และ Login ใหม่

1. เปิด Console (F12)
2. รันคำสั่ง:
```javascript
localStorage.clear();
location.reload();
```
3. Login ใหม่
4. ทดสอบอัพโหลดรูปภาพ

### วิธีที่ 2: Logout และ Login ใหม่

1. คลิก Logout
2. Login ใหม่ทันที
3. ทดสอบอัพโหลดรูปภาพ

## การทดสอบหลัง Login ใหม่

รัน script นี้ใน Console:
```javascript
(async function() {
    const token = localStorage.getItem('wecare_token');
    console.log('Token:', token.substring(0, 30) + '...');
    
    // Test GET /auth/me
    const meRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('GET /auth/me:', meRes.status);
    
    // Test PUT /auth/profile
    const profileRes = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: 'Test User',
            phone: '0812345678',
            profileImageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        })
    });
    console.log('PUT /auth/profile:', profileRes.status);
    
    if (profileRes.ok) {
        console.log('✅ SUCCESS! Token is valid');
    } else {
        console.log('❌ FAILED! Token still invalid');
        console.log('Response:', await profileRes.text());
    }
})();
```

## ถ้ายังไม่ได้หลัง Login ใหม่

แสดงว่าปัญหาไม่ได้อยู่ที่ token แต่อยู่ที่:
1. Middleware block request
2. Route configuration ผิด
3. JWT verification logic มีปัญหา

## สรุป

**ขั้นตอนแก้ไข:**
1. Clear localStorage หรือ Logout
2. Login ใหม่
3. ทดสอบทันที
4. ถ้าได้ → ปัญหาคือ token เก่า
5. ถ้ายังไม่ได้ → ต้อง debug middleware ต่อ
