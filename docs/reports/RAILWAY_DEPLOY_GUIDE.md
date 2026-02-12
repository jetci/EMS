# Deploy Backend บน Railway - คู่มือละเอียด

## 🚂 Railway คืออะไร?

Railway เป็น Platform สำหรับ Deploy แอพพลิเคชัน รองรับ Python, Node.js, และอื่นๆ
- ✅ ฟรี (มี Free tier)
- ✅ Deploy ง่าย จาก GitHub
- ✅ รองรับ Python Flask
- ✅ มี Database ให้ใช้ (PostgreSQL, MySQL)

---

## 📋 ขั้นตอนการ Deploy

### ขั้นตอนที่ 1: เตรียม Railway Account

1. **ไปที่**: https://railway.app/
2. **คลิก "Start a New Project"** หรือ "Login"
3. **Sign up ด้วย GitHub**:
   - คลิก "Login with GitHub"
   - Authorize Railway
   - เสร็จแล้วจะเข้าสู่ Dashboard

---

### ขั้นตอนที่ 2: Push Code ไป GitHub (ถ้ายังไม่ได้ทำ)

```bash
# ใน d:\EMS
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

---

### ขั้นตอนที่ 3: สร้าง Project ใน Railway

1. **ใน Railway Dashboard**:
   - คลิก "+ New Project"
   
2. **เลือก "Deploy from GitHub repo"**:
   - คลิก "Deploy from GitHub repo"
   - เลือก Repository: `jetci/EMS` (หรือชื่อ repo ของคุณ)
   - คลิก "Deploy Now"

3. **รอ Deploy**:
   - Railway จะ detect Python project อัตโนมัติ
   - จะอ่าน `requirements.txt` และติดตั้ง dependencies
   - รอ 2-5 นาที

---

### ขั้นตอนที่ 4: ตั้งค่า Environment Variables

1. **คลิกที่ Project** ที่สร้าง
2. **คลิก Tab "Variables"** (ด้านบน)
3. **คลิก "+ New Variable"**
4. **เพิ่ม Variables ทั้งหมด**:

```
FLASK_ENV=production
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_NAME=wiangwec_wecare
DATABASE_USER=wiangwec_wecare
DATABASE_PASSWORD=AtwAywxkvEptw65k5ky9
DATABASE_PORT=3306
SECRET_KEY=wiangwecare-secret-key-2024-production
JWT_SECRET_KEY=wiangwecare-jwt-secret-2024-production
CORS_ORIGINS=https://wiangwecare.com
```

5. **คลิก "Add"** ทีละตัว
6. **Deploy ใหม่**: คลิก "Deploy" → "Redeploy"

---

### ขั้นตอนที่ 5: ตั้งค่า Start Command

1. **คลิก Tab "Settings"**
2. **หา "Start Command"**
3. **ใส่คำสั่ง**:
   ```
   cd src && python main.py
   ```
4. **Save**
5. **Redeploy**

---

### ขั้นตอนที่ 6: รับ URL ของ Backend

1. **คลิก Tab "Settings"**
2. **หา "Domains"**
3. **คลิก "Generate Domain"**
4. **จะได้ URL** เช่น:
   ```
   https://ems-wecare-production.up.railway.app
   ```
5. **Copy URL นี้**

---

### ขั้นตอนที่ 7: อัพเดท Frontend API URL

1. **แก้ไข `.env.production`**:
   ```bash
   # d:\EMS\.env.production
   VITE_API_BASE_URL=https://ems-wecare-production.up.railway.app/api
   VITE_BASE=/ems_staging/
   ```

2. **Build Frontend ใหม่**:
   ```bash
   cd d:\EMS
   npm run build -- --mode production
   ```

3. **Upload ไฟล์ใหม่ผ่าน FTP**:
   - Upload ทุกไฟล์จาก `d:\EMS\build\` → `/public_html/ems_staging/`
   - Overwrite ไฟล์เดิม

---

### ขั้นตอนที่ 8: ทดสอบระบบ

1. **ทดสอบ Backend API**:
   ```
   https://ems-wecare-production.up.railway.app/api/auth/login
   ```
   ต้องได้ response (ไม่ใช่ 404)

2. **ทดสอบ Frontend**:
   ```
   https://wiangwecare.com/ems_staging/
   ```

3. **ทดสอบ Login**:
   - Email: `jetci.jm@gmail.com`
   - Password: `dev123`
   - ต้อง Login ได้

---

## 🔧 Troubleshooting

### ปัญหา: Deploy Failed

**ตรวจสอบ**:
1. **Logs**: คลิก Tab "Deployments" → ดู Error
2. **requirements.txt**: ตรวจสอบว่ามีครบ
3. **Start Command**: ตรวจสอบว่าถูกต้อง

**แก้ไข**:
- แก้ไขปัญหาตาม Error
- Push code ใหม่
- Railway จะ auto-deploy

### ปัญหา: Database Connection Failed

**สาเหตุ**: Railway ไม่สามารถเชื่อมต่อ MySQL ที่ Shared Hosting

**วิธีแก้**:

**Option 1: ใช้ Railway PostgreSQL (แนะนำ)**
1. ใน Railway Project → คลิก "+ New"
2. เลือก "Database" → "PostgreSQL"
3. Copy Connection String
4. อัพเดท Environment Variables:
   ```
   DATABASE_TYPE=postgresql
   DATABASE_URL=postgresql://...
   ```
5. แก้ไข `main.py` ให้รองรับ PostgreSQL

**Option 2: ใช้ PlanetScale MySQL (ฟรี)**
1. ไปที่ https://planetscale.com/
2. สร้าง Database
3. Copy Connection String
4. อัพเดท Environment Variables

### ปัญหา: CORS Error

**แก้ไข**:
1. ตรวจสอบ `CORS_ORIGINS` ใน Variables
2. ต้องเป็น: `https://wiangwecare.com`
3. Redeploy

---

## 📝 Checklist

- [ ] สร้าง Railway Account
- [ ] Push code ไป GitHub
- [ ] สร้าง Project ใน Railway
- [ ] ตั้งค่า Environment Variables
- [ ] ตั้งค่า Start Command
- [ ] Generate Domain URL
- [ ] Copy Backend URL
- [ ] อัพเดท `.env.production`
- [ ] Build Frontend ใหม่
- [ ] Upload ผ่าน FTP
- [ ] ทดสอบ API
- [ ] ทดสอบ Login

---

## 🔗 Links

- **Railway**: https://railway.app/
- **Docs**: https://docs.railway.app/
- **GitHub**: https://github.com/jetci/EMS-WeCare

---

## 💡 Tips

1. **Free Tier**: Railway ให้ $5 credit/เดือน (ฟรี)
2. **Auto Deploy**: Push code → Auto deploy
3. **Logs**: ดู Logs real-time ได้
4. **Scale**: สามารถ scale up ได้ภายหลัง
