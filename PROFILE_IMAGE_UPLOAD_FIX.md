# 🖼️ แก้ไขปัญหา Profile Image Upload

**วันที่:** 29 มกราคม 2569  
**เวลา:** 18:00 น.

---

## ⚠️ ปัญหาที่พบ

**อาการ:**
- คลิก "เลือกรูป" ไม่ได้
- แต่มีการแจ้งเตือน "อัพรูปเรียบร้อยแล้ว"
- ไม่มีรูปภาพแสดงขึ้นมา

**สาเหตุ:**
1. ❌ ไม่มี UI สำหรับอัพโหลดรูปภาพ
2. ❌ ไม่มี API endpoint สำหรับอัพโหลด
3. ❌ ไม่มี file upload handler (multer)

---

## ✅ การแก้ไข

### 1️⃣ Frontend (ProfilePage.tsx)

#### เพิ่ม State Management
```typescript
const [profileImage, setProfileImage] = useState<string | null>(null);
const [imageFile, setImageFile] = useState<File | null>(null);
const [uploadingImage, setUploadingImage] = useState(false);
```

#### เพิ่ม Image Upload Functions
- ✅ `handleImageSelect()` - เลือกรูปจากเครื่อง
- ✅ `handleImageUpload()` - อัพโหลดไปยัง server
- ✅ `handleRemoveImage()` - ยกเลิกการเลือก

#### เพิ่ม UI Components
- ✅ Profile image preview (รูปกลม 96x96px)
- ✅ Hover overlay สำหรับเลือกรูป
- ✅ File input (hidden)
- ✅ ปุ่ม "บันทึกรูปภาพ" และ "ยกเลิก"
- ✅ Loading state

#### Features
- ✅ Validation: ไฟล์ต้องเป็น JPG, PNG, WEBP
- ✅ Validation: ขนาดไม่เกิน 5MB
- ✅ Preview รูปทันทีหลังเลือก
- ✅ แสดงปุ่มบันทึกเมื่อเลือกรูปแล้ว
- ✅ Loading spinner ขณะอัพโหลด

### 2️⃣ Backend (auth.ts)

#### ติดตั้ง Dependencies
```bash
npm install multer @types/multer
```

#### เพิ่ม Multer Configuration
```typescript
const uploadDir = path.join(__dirname, '../../uploads/profiles');
const storage = multer.diskStorage({...});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {...}
});
```

#### เพิ่ม API Endpoint
```
POST /api/auth/upload-profile-image
- Authentication: Bearer token required
- Content-Type: multipart/form-data
- Field name: profile_image
- Max size: 5MB
- Allowed types: JPEG, PNG, WEBP
```

#### Features
- ✅ JWT authentication
- ✅ File validation
- ✅ Auto-create upload directory
- ✅ Delete old image when uploading new one
- ✅ Audit logging
- ✅ Error handling & cleanup

### 3️⃣ Static File Serving

```typescript
// Already configured in index.ts
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

---

## 🎨 UI/UX Improvements

### Before
```
┌─────────────────────────┐
│ 👤 (Icon only)          │
│ John Doe                │
│ john@example.com        │
└─────────────────────────┘
```

### After
```
┌─────────────────────────────────┐
│ ┌───────┐                       │
│ │ 📷    │ (Hover to upload)     │
│ │ Photo │                       │
│ └───────┘                       │
│ John Doe                        │
│ john@example.com                │
│ [บันทึกรูปภาพ] [ยกเลิก]         │
└─────────────────────────────────┘
```

---

## 📝 วิธีใช้งาน

### สำหรับผู้ใช้

1. **เลือกรูปภาพ**
   - Hover เมาส์ไปที่รูปโปรไฟล์
   - คลิกที่ไอคอนกล้อง
   - เลือกไฟล์รูปภาพ (JPG, PNG, WEBP)

2. **ดู Preview**
   - รูปจะแสดงทันที
   - ปุ่ม "บันทึกรูปภาพ" และ "ยกเลิก" จะปรากฏ

3. **บันทึกรูปภาพ**
   - คลิก "บันทึกรูปภาพ"
   - รอสักครู่ (แสดง loading)
   - เห็นข้อความ "✅ อัพโหลดรูปภาพเรียบร้อยแล้ว"

4. **ยกเลิก**
   - คลิก "ยกเลิก" เพื่อยกเลิกการเลือก
   - รูปจะกลับไปเป็นรูปเดิม

---

## 🔒 Security Features

### Frontend Validation
- ✅ File type: JPEG, PNG, WEBP only
- ✅ File size: Max 5MB
- ✅ Client-side preview

### Backend Validation
- ✅ JWT authentication required
- ✅ File type validation (mimetype + extension)
- ✅ File size limit (5MB)
- ✅ Secure filename generation
- ✅ Old file cleanup
- ✅ Error handling

### Storage
- ✅ Files stored in `/uploads/profiles/`
- ✅ Unique filename: `profile-{timestamp}-{random}.{ext}`
- ✅ Served via static middleware
- ✅ Audit log for all uploads

---

## 🧪 Testing

### Manual Test Steps

1. **Test Upload Success**
   ```
   1. Login to profile page
   2. Hover on profile image
   3. Click camera icon
   4. Select valid image (< 5MB, JPG/PNG/WEBP)
   5. Click "บันทึกรูปภาพ"
   6. Verify success message
   7. Verify image displays correctly
   ```

2. **Test File Type Validation**
   ```
   1. Try to upload .pdf file
   2. Should show error: "กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WEBP)"
   ```

3. **Test File Size Validation**
   ```
   1. Try to upload image > 5MB
   2. Should show error: "ขนาดไฟล์ต้องไม่เกิน 5MB"
   ```

4. **Test Cancel**
   ```
   1. Select image
   2. Click "ยกเลิก"
   3. Image should revert to original
   ```

5. **Test Replace Image**
   ```
   1. Upload image A
   2. Upload image B
   3. Old image A should be deleted
   4. Only image B should display
   ```

---

## 📊 API Specification

### POST /api/auth/upload-profile-image

**Request:**
```http
POST /api/auth/upload-profile-image HTTP/1.1
Authorization: Bearer {token}
Content-Type: multipart/form-data

profile_image: {file}
```

**Response (Success):**
```json
{
  "message": "Profile image uploaded successfully",
  "imageUrl": "/uploads/profiles/profile-1738156800000-123456789.jpg"
}
```

**Response (Error):**
```json
{
  "error": "No file uploaded"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (no file, invalid file)
- `401` - Unauthorized (no token, invalid token)
- `404` - User not found
- `500` - Server error

---

## 📁 File Structure

```
wecare-backend/
├── src/
│   └── routes/
│       └── auth.ts (updated)
└── uploads/
    └── profiles/
        ├── profile-1738156800000-123456789.jpg
        └── profile-1738156900000-987654321.png

EMS/
└── src/
    └── pages/
        └── ProfilePage.tsx (updated)
```

---

## 🔄 Database Schema

### users table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  profile_image_url TEXT,  -- ← Stores image URL
  date_created TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**profile_image_url format:**
```
/uploads/profiles/profile-{timestamp}-{random}.{ext}
```

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. ⚠️ ไม่มี image cropping
2. ⚠️ ไม่มี image compression
3. ⚠️ ไม่มี multiple image formats optimization

### Future Improvements
1. 🔜 Image cropping tool
2. 🔜 Auto-resize to standard size (e.g., 200x200)
3. 🔜 WebP conversion for better performance
4. 🔜 CDN integration
5. 🔜 Image optimization (compression)

---

## 📚 Related Files

### Modified Files
1. ✅ `src/pages/ProfilePage.tsx` - Added upload UI
2. ✅ `wecare-backend/src/routes/auth.ts` - Added upload endpoint
3. ✅ `wecare-backend/package.json` - Added multer dependency

### New Directories
1. ✅ `wecare-backend/uploads/profiles/` - Upload storage

---

## ✅ Summary

### What Was Fixed
1. ✅ เพิ่ม UI สำหรับอัพโหลดรูปโปรไฟล์
2. ✅ เพิ่ม API endpoint สำหรับอัพโหลด
3. ✅ เพิ่ม file validation (type, size)
4. ✅ เพิ่ม preview รูปภาพ
5. ✅ เพิ่ม loading states
6. ✅ เพิ่ม error handling
7. ✅ เพิ่ม audit logging

### How It Works Now
1. ✅ User hovers on profile image
2. ✅ Click camera icon to select file
3. ✅ Preview shows immediately
4. ✅ Click "บันทึกรูปภาพ" to upload
5. ✅ Image uploads to server
6. ✅ Old image deleted automatically
7. ✅ New image URL saved to database
8. ✅ Success message displayed

### Next Steps
- ✅ Test upload functionality
- ✅ Verify file validation
- ✅ Check error handling
- 🔜 Add image cropping (optional)
- 🔜 Add image compression (optional)

---

**Status:** ✅ **FIXED & READY**

**Test:** ลองอัพโหลดรูปโปรไฟล์ได้เลย!

**Note:** อย่าลืมรีสตาร์ท backend server เพื่อให้ใช้ code ใหม่
