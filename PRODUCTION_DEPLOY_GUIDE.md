# EMS WeCare - Production Deployment Guide

## 🎯 ภาพรวม

Deploy ระบบขึ้น Production Server:
- **Domain**: https://wiangwecare.com
- **Frontend Path**: `/domains/wiangwecare.com/public_html/ems_staging/`
- **Database**: MySQL (wiangwec_wecare)

---

## 📋 ขั้นตอนการติดตั้ง

### ขั้นตอนที่ 1: เตรียม Database (ทำก่อน)

#### 1.1 เข้า phpMyAdmin
- URL: https://wiangwecare.com/phpmyadmin (หรือ cPanel → phpMyAdmin)
- Login ด้วย credentials ที่มี

#### 1.2 เลือก Database
- คลิกที่ Database: `wiangwec_wecare`

#### 1.3 Import Schema
1. คลิก Tab "Import"
2. เลือกไฟล์: `database_schema.sql`
3. Format: SQL
4. คลิก "Go"
5. รอจนเสร็จ → จะมี 7 tables

#### 1.4 สร้าง User แรก (DEVELOPER)
1. คลิก Tab "SQL"
2. รัน Python script ก่อน:
   ```bash
   python create_admin_user.py
   ```
3. Copy SQL INSERT ที่ได้
4. Paste ใน SQL tab → Go

#### 1.5 ตรวจสอบ
- คลิก Tab "Structure"
- ต้องมี 7 tables:
  - users ✓
  - driver_profiles ✓
  - patients ✓
  - vehicles ✓
  - rides ✓
  - news_articles ✓
  - audit_logs ✓

---

### ขั้นตอนที่ 2: Upload Frontend ผ่าน FTP

#### 2.1 เตรียมไฟล์
ไฟล์ที่ต้อง Upload:
```
d:\EMS\build\          → ทุกไฟล์ในนี้
d:\EMS\.htaccess       → ไฟล์นี้ด้วย
```

#### 2.2 เชื่อมต่อ FTP

**ใช้ FileZilla หรือ FTP Client อื่นๆ**:
- **Host**: ftp.wiangwecare.com (หรือ IP ที่ได้รับ)
- **Username**: (FTP username ที่ได้รับ)
- **Password**: (FTP password ที่ได้รับ)
- **Port**: 21

**หรือใช้ cPanel File Manager**:
1. Login cPanel
2. คลิก "File Manager"
3. ไปที่ `/domains/wiangwecare.com/public_html/`

#### 2.3 สร้าง Folder ems_staging
1. ใน `/public_html/` คลิกขวา → New Folder
2. ชื่อ: `ems_staging`
3. Enter

#### 2.4 Upload ไฟล์

**ทาง FileZilla**:
1. Local (ซ้าย): ไปที่ `d:\EMS\build\`
2. Remote (ขวา): ไปที่ `/public_html/ems_staging/`
3. เลือกทุกไฟล์ใน `build/` → Drag & Drop ไปขวา
4. Upload `.htaccess` ไปที่ `/public_html/ems_staging/` ด้วย

**ทาง cPanel File Manager**:
1. เข้า `/public_html/ems_staging/`
2. คลิก "Upload"
3. เลือกทุกไฟล์จาก `d:\EMS\build\`
4. Upload `.htaccess` ด้วย
5. รอจน Upload เสร็จ

#### 2.5 ตั้งค่า Permissions
```
Folders: 755
Files: 644
```

**ทาง FileZilla**:
- คลิกขวาที่ folder → File permissions → 755
- คลิกขวาที่ไฟล์ → File permissions → 644

**ทาง cPanel**:
- เลือกไฟล์/folder → Permissions → ตั้งค่า

---

### ขั้นตอนที่ 3: ตรวจสอบการทำงาน

#### 3.1 ทดสอบ Frontend
เปิด Browser:
```
https://wiangwecare.com/ems_staging/
```

ต้องเห็น:
- ✓ หน้า Landing Page
- ✓ ปุ่ม "เข้าสู่ระบบ" และ "สมัครสมาชิก"
- ✓ ไม่มี Error 404 หรือ White Screen

#### 3.2 ทดสอบ Login
1. คลิก "เข้าสู่ระบบ"
2. Login ด้วย:
   - Email: `jetci.jm@gmail.com`
   - Password: `dev123`
3. ถ้า Login ไม่ได้ → Backend ยังไม่ทำงาน

---

### ขั้นตอนที่ 4: Deploy Backend (สำคัญ!)

**⚠️ Shared Hosting ไม่รองรับ Python Flask**

#### ทางเลือก 1: Deploy บน Railway (แนะนำ, ฟรี)

1. **ไปที่**: https://railway.app/
2. **Sign up** ด้วย GitHub
3. **New Project** → Deploy from GitHub
4. **เลือก Repository**: jetci/EMS-WeCare
5. **Add Variables**:
   ```
   FLASK_ENV=production
   DATABASE_TYPE=mysql
   DATABASE_HOST=localhost
   DATABASE_NAME=wiangwec_wecare
   DATABASE_USER=wiangwec_wecare
   DATABASE_PASSWORD=AtwAywxkvEptw65k5ky9
   SECRET_KEY=wiangwecare-secret-key-2024-production
   ```
6. **Deploy** → รอจน Deploy สำเร็จ
7. **Copy URL** ที่ได้ (เช่น https://your-app.railway.app)

8. **อัพเดท Frontend**:
   - แก้ไข `d:\EMS\.env.production`:
     ```
     VITE_API_BASE_URL=https://your-app.railway.app/api
     ```
   - Build ใหม่: `npm run build -- --mode production`
   - Upload ไฟล์ใหม่ขึ้น FTP

#### ทางเลือก 2: ใช้ Shared Hosting (ถ้ารองรับ Python)

ต้องตรวจสอบว่า Hosting รองรับ:
- Python 3.8+
- pip
- WSGI/CGI

(ไม่แนะนำ เพราะ Shared Hosting ส่วนใหญ่ไม่รองรับ)

---

## 📁 โครงสร้างไฟล์บน Server

```
/domains/wiangwecare.com/public_html/
├── ems_staging/
│   ├── index.html
│   ├── assets/
│   │   └── index-3R5xO6KV.js
│   └── .htaccess
└── (ระบบเดิมอยู่ที่นี่)
```

---

## ✅ Checklist

### Database
- [ ] Import `database_schema.sql`
- [ ] สร้าง User แรก (DEVELOPER)
- [ ] ตรวจสอบ 7 tables ครบ

### Frontend
- [ ] สร้าง folder `ems_staging`
- [ ] Upload ไฟล์จาก `build/`
- [ ] Upload `.htaccess`
- [ ] ตั้งค่า Permissions (755/644)
- [ ] ทดสอบ https://wiangwecare.com/ems_staging/

### Backend
- [ ] Deploy บน Railway
- [ ] ตั้งค่า Environment Variables
- [ ] Copy API URL
- [ ] อัพเดท Frontend `.env.production`
- [ ] Build และ Upload ใหม่
- [ ] ทดสอบ Login

---

## 🔗 URLs

- **Frontend**: https://wiangwecare.com/ems_staging/
- **Backend**: https://your-app.railway.app (หลัง Deploy)
- **Database**: localhost:3306 (wiangwec_wecare)

---

## 📞 Support

- Repository: https://github.com/jetci/EMS-WeCare.git
- Railway: https://railway.app/
- Default Login: jetci.jm@gmail.com / dev123
