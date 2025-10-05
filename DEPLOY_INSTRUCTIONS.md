# EMS WeCare - Deploy Instructions

## 📁 โครงสร้างการ Deploy

### Frontend (Static Files)
- **Path บน Server**: `/domains/wiangwecare.com/public_html/ems_staging/`
- **URL**: https://wiangwecare.com/ems_staging/
- **ไฟล์ที่ต้อง Upload**: ทุกไฟล์จาก `/build` folder

### Backend (Python Flask)
- **API URL**: https://wiangwecare.com/api
- **Database**: MySQL (wiangwec_wecare)

---

## 🚀 ขั้นตอนการ Deploy Frontend

### 1. Build Frontend
```bash
npm run build -- --mode production
```

### 2. Upload ไฟล์ผ่าน FTP
Upload ทุกไฟล์จาก `/build` ไปที่:
```
/domains/wiangwecare.com/public_html/EMS/
```

**ไฟล์ที่ต้อง Upload**:
- `index.html`
- `assets/` (folder)
- `.htaccess` (จาก root project)
- ไฟล์อื่นๆ ใน `/build`

### 3. ตั้งค่า Permissions
```
Folders: 755
Files: 644
```

---

## 🔧 ขั้นตอนการ Deploy Backend

### ⚠️ สำคัญ: Shared Hosting ไม่รองรับ Python Flask

**แนะนำ**: Deploy Backend บน Railway (ฟรี)

### Option 1: Deploy Backend บน Railway (แนะนำ)

1. ไปที่ https://railway.app/
2. เชื่อมต่อ GitHub repository
3. Deploy โปรเจค
4. ตั้งค่า Environment Variables:
   ```
   FLASK_ENV=production
   DATABASE_TYPE=mysql
   DATABASE_HOST=your-mysql-host
   DATABASE_NAME=wiangwec_wecare
   DATABASE_USER=wiangwec_wecare
   DATABASE_PASSWORD=AtwAywxkvEptw65k5ky9
   SECRET_KEY=wiangwecare-secret-key-2024-production
   ```
5. อัพเดท Frontend `.env.production`:
   ```
   VITE_API_BASE_URL=https://your-railway-app.railway.app/api
   ```
6. Build Frontend อีกครั้ง

### Option 2: ใช้ Shared Hosting (ถ้ารองรับ Python)

ต้องตรวจสอบว่า Hosting รองรับ:
- Python 3.8+
- pip
- WSGI/CGI

---

## 📝 Checklist

### Frontend
- [ ] Build สำเร็จ (`npm run build`)
- [ ] Upload ไฟล์ไปที่ `/public_html/EMS/`
- [ ] Upload `.htaccess`
- [ ] ตั้งค่า Permissions
- [ ] ทดสอบ https://wiangwecare.com/EMS/

### Backend
- [ ] เลือกวิธี Deploy (Railway/Shared Hosting)
- [ ] ตั้งค่า Database Connection
- [ ] ตั้งค่า Environment Variables
- [ ] ทดสอบ API Endpoints
- [ ] อัพเดท CORS settings

### Database
- [ ] สร้าง Tables (run migrations)
- [ ] สร้าง User ตัวแรก (DEVELOPER)
- [ ] ทดสอบ Connection

---

## 🔗 URLs

- **Frontend**: https://wiangwecare.com/EMS/
- **API**: https://wiangwecare.com/api (หรือ Railway URL)
- **Database**: localhost:3306

---

## 📞 Support

Repository: https://github.com/jetci/EMS-WeCare.git
