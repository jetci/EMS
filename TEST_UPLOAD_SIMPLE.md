# 🧪 ทดสอบ Upload ง่ายๆ

## ขั้นตอน:

1. **เปิด DevTools (F12)**
2. **ไปที่ Console tab**
3. **Copy code นี้วางใน Console:**

```javascript
// Test upload function
async function testUpload() {
    // Get token
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'Found' : 'Not found');
    
    if (!token) {
        console.error('❌ No token found. Please login first.');
        return;
    }
    
    // Create a test file (1x1 pixel PNG)
    const blob = await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')
        .then(r => r.blob());
    
    const file = new File([blob], 'test.png', { type: 'image/png' });
    console.log('File created:', file.name, file.size, 'bytes');
    
    // Create FormData
    const formData = new FormData();
    formData.append('profile_image', file);
    
    console.log('Uploading to: /api/auth/upload-profile-image');
    
    try {
        const response = await fetch('/api/auth/upload-profile-image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            console.log('✅ Upload successful!');
        } else {
            console.error('❌ Upload failed:', data);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run test
testUpload();
```

4. **กด Enter**
5. **ดูผลลัพธ์ใน Console**

---

## ผลลัพธ์ที่คาดหวัง:

### ✅ ถ้าสำเร็จ:
```
Token: Found
File created: test.png 68 bytes
Uploading to: /api/auth/upload-profile-image
Response status: 200
Response data: {message: "Profile image uploaded successfully", imageUrl: "/uploads/profiles/profile-..."}
✅ Upload successful!
```

### ❌ ถ้าล้มเหลว:
```
Token: Found
File created: test.png 68 bytes
Uploading to: /api/auth/upload-profile-image
Response status: 401/500
Response data: {error: "..."}
❌ Upload failed: ...
```

---

## บอกผลลัพธ์ที่ได้มา!
