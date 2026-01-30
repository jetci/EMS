# 🚀 Quick Start Guide - EMS WeCare

## ⚡ เริ่มต้นใช้งานเร็ว (5 นาที)

### Step 1: Install Dependencies

```powershell
# ติดตั้ง dependencies สำหรับ Frontend
cd D:\EMS
npm install

# ติดตั้ง dependencies สำหรับ Backend
cd wecare-backend
npm install
```

### Step 2: Setup Environment Variables

สร้างไฟล์ `.env` ใน `D:\EMS`:

```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3001/api
```

สร้างไฟล์ `.env` ใน `D:\EMS\wecare-backend`:

```bash
# Backend (.env)
NODE_ENV=development
PORT=3001

# Database
DB_PATH=./db/wecare.db

# JWT
JWT_SECRET=your_jwt_secret_here_change_in_production

# Encryption (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
DB_ENCRYPTION_KEY=fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Logging
LOG_DIR=./logs
LOG_LEVEL=info
```

### Step 3: Start Backend

```powershell
# Terminal 1 - Backend
cd D:\EMS\wecare-backend
npm run dev
```

คุณจะเห็น:
```
🚀 Server running on port 3001
✅ Database connected
✅ Security headers configured
✅ CORS configured
✅ Rate limiters configured
```

### Step 4: Start Frontend

```powershell
# Terminal 2 - Frontend (เปิด terminal ใหม่)
cd D:\EMS
npm run dev
```

คุณจะเห็น:
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 5: เปิดเบราว์เซอร์

เปิด: http://localhost:5173

---

## 🔑 Default Login Credentials

```
Email: admin@wecare.com
Password: admin123

หรือ

Email: community@wecare.com
Password: password123
```

---

## 🚨 Troubleshooting

### ปัญหา 1: 'vite' is not recognized

**สาเหตุ:** ยังไม่ได้ install dependencies

**แก้ไข:**
```powershell
cd D:\EMS
npm install
```

### ปัญหา 2: Port 3001 already in use

**แก้ไข:**
```powershell
# หา process ที่ใช้ port
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F

# หรือเปลี่ยน port ใน .env
PORT=3002
```

### ปัญหา 3: Database error

**แก้ไข:**
```powershell
cd D:\EMS\wecare-backend

# สร้าง database directory
mkdir db

# Run migration (ถ้ามี)
npm run migrate
```

### ปัญหา 4: CORS error

**แก้ไข:**
ตรวจสอบ `ALLOWED_ORIGINS` ใน `wecare-backend/.env`:
```bash
ALLOWED_ORIGINS=http://localhost:5173
```

---

## 📦 Package.json Scripts

### Frontend (D:\EMS\package.json)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Backend (D:\EMS\wecare-backend\package.json)

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint . --ext .ts"
  }
}
```

---

## 🎯 Next Steps

หลังจากระบบทำงานแล้ว:

1. **ทดสอบ Features:**
   - สร้างผู้ป่วย
   - สร้างการเรียกรถ
   - ทดสอบ real-time updates

2. **ทดสอบ Security:**
   - ทดสอบ login/logout
   - ทดสอบ permissions
   - ทดสอบ rate limiting

3. **ทดสอบ Performance:**
   - เปิดหลาย tabs
   - สร้างข้อมูลจำนวนมาก
   - ตรวจสอบ response time

4. **Deploy:**
   - ดู `SPRINT_5_6_COMPLETE_GUIDE.md`
   - Setup PM2
   - Deploy to server

---

## 📞 ต้องการความช่วยเหลือ?

ดูเอกสารเพิ่มเติม:
- `SPRINT_1_COMPLETE_GUIDE.md` - Security
- `SPRINT_2_COMPLETE_GUIDE.md` - Error Handling
- `SPRINT_3_COMPLETE_GUIDE.md` - Performance
- `SPRINT_4_COMPLETE_GUIDE.md` - Accessibility
- `SPRINT_5_6_COMPLETE_GUIDE.md` - Production

---

**Happy Coding! 🚀**
