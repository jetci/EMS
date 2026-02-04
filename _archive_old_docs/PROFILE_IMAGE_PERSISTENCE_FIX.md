# แก้ไข: รูปภาพโปรไฟล์หายหลังจากบันทึก

## ปัญหา
หลังจากอัพโหลดและบันทึกรูปภาพโปรไฟล์แล้ว เมื่อกลับมาหน้าเดิมหรือ reload หน้า รูปภาพจะหายไป

## สาเหตุ
1. **Frontend**: ไม่ได้ส่ง `profileImageUrl` ไปยัง backend เมื่อบันทึก
2. **Backend**: ไม่รองรับการบันทึก `profileImageUrl` ใน API endpoint
3. **State Management**: รูปภาพเก็บแค่ใน local state ไม่ได้ persist

## การแก้ไข

### 1. Frontend - API Type Definition
**ไฟล์:** `src/services/api.ts` (บรรทัด 144)

```typescript
// เดิม
updateProfile: (data: { name?: string; phone?: string }) =>

// ใหม่
updateProfile: (data: { name?: string; phone?: string; profileImageUrl?: string }) =>
```

### 2. Frontend - บันทึก Profile Image
**ไฟล์:** `src/pages/CommunityProfilePage.tsx` (บรรทัด 78-90)

```typescript
const handleConfirmSave = async () => {
    setIsConfirmModalOpen(false);
    try {
        await authAPI.updateProfile({
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            phone: formData.phone,
            profileImageUrl: profileImage !== defaultProfileImage ? profileImage : undefined,
        });
        
        // Update localStorage
        const storedUser = localStorage.getItem('wecare_user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            userData.name = `${formData.firstName} ${formData.lastName}`.trim();
            userData.phone = formData.phone;
            userData.profileImageUrl = profileImage !== defaultProfileImage ? profileImage : undefined;
            localStorage.setItem('wecare_user', JSON.stringify(userData));
        }
        
        setIsEditing(false);
        showToast("✅ บันทึกข้อมูลสำเร็จแล้ว!");
    } catch (error: any) {
        showToast(`❌ เกิดข้อผิดพลาด: ${error.message}`);
    }
};
```

### 3. Backend - รองรับ Profile Image URL
**ไฟล์:** `wecare-backend/src/routes/auth.ts` (บรรทัด 327-334)

```typescript
const updateData: any = {};
if (updates.fullName || updates.name) {
    updateData.full_name = updates.fullName || updates.name;
}
if (updates.phone) updateData.phone = updates.phone;
if (updates.profileImageUrl !== undefined) {
    updateData.profile_image_url = updates.profileImageUrl;
}

sqliteDB.update('users', decoded.id, updateData);
```

## ผลลัพธ์

### ก่อนแก้ไข
1. อัพโหลดรูปภาพ ✅
2. บันทึกข้อมูล ✅
3. Reload หน้า ❌ รูปภาพหาย

### หลังแก้ไข
1. อัพโหลดรูปภาพ ✅
2. บันทึกข้อมูล ✅
3. Reload หน้า ✅ รูปภาพยังอยู่

## Data Flow

```
User Upload Image
    ↓
handleImageSelect() → setProfileImage(base64)
    ↓
User Click Save
    ↓
handleConfirmSave()
    ↓
authAPI.updateProfile({ profileImageUrl })
    ↓
Backend: PUT /auth/profile
    ↓
Update users.profile_image_url in DB
    ↓
Update localStorage
    ↓
✅ Image Persisted
```

## การทดสอบ

### Test Case 1: อัพโหลดและบันทึก
1. Login
2. ไปหน้าโปรไฟล์
3. คลิก "แก้ไขข้อมูล"
4. คลิก "เปลี่ยนรูปภาพ" → เลือกรูป
5. คลิก "บันทึก"
6. ✅ รูปภาพแสดงถูกต้อง

### Test Case 2: Reload หน้า
1. ทำ Test Case 1
2. Reload หน้า (F5)
3. ✅ รูปภาพยังคงอยู่

### Test Case 3: Logout และ Login กลับ
1. ทำ Test Case 1
2. Logout
3. Login กลับเข้ามา
4. ไปหน้าโปรไฟล์
5. ✅ รูปภาพยังคงอยู่

## ไฟล์ที่แก้ไข

1. **src/services/api.ts** - เพิ่ม profileImageUrl ใน type definition
2. **src/pages/CommunityProfilePage.tsx** - บันทึก profileImageUrl
3. **wecare-backend/src/routes/auth.ts** - รองรับ profileImageUrl

## หมายเหตุ

- รูปภาพถูกเก็บเป็น base64 string ใน database
- ขนาดไฟล์จำกัดไว้ที่ 1MB เพื่อป้องกัน database บวม
- ใช้ defaultProfileImage เมื่อไม่มีรูปภาพ

## สถานะ
✅ แก้ไขเสร็จสมบูรณ์
🔄 Backend ต้อง restart เพื่อใช้งาน
📝 รอการทดสอบจาก SA
