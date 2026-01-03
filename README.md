# EMS WeCare - README

**โครงการ:** Emergency Medical Services - We Care  
**วันที่อัพเดท:** 2026-01-01  
**สถานะ:** 🔄 Active Development

---

## 🗄️ ฐานข้อมูล

**ระบบใช้:** **SQLite Database** 

- **ไฟล์:** `wecare-backend/db/wecare.db`
- **Schema:** `wecare-backend/db/schema.sql`
- **Library:** `better-sqlite3`
- **ตาราง:** 13 ตาราง
- **สถานะ:** ✅ ใช้งานอยู่ (Migrated จาก JSON)

**เอกสารเพิ่มเติม:** ดูที่ `DATABASE_INFO.md`

---

## 📚 เอกสารที่เกี่ยวข้อง

### **Database:**
- `DATABASE_INFO.md` - ข้อมูลฐานข้อมูลโดยละเอียด ⭐
- `wecare-backend/db/schema.sql` - Database schema
- `wecare-backend/MIGRATION_SUMMARY.md` - สรุปการ migrate
- `wecare-backend/MIGRATION_PROGRESS.md` - ความคืบหน้า
- `wecare-backend/SQLITE_IMPLEMENTATION_PLAN.md` - แผนการทำงาน

### **UI Components:**
- `UI_COMPONENT_GUIDELINES.md` - คู่มือ UI components

### **Other:**
- `README.md` - เอกสารหลัก (ไฟล์นี้)

---

## 🚀 การติดตั้งและรัน

### **Backend:**
```bash
cd wecare-backend
npm install
npm run dev  # Port 3001
```

### **Frontend:**
```bash
npm install
npm run dev  # Port 3000
```

---

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Developer | jetci.jm@gmail.com | g0KEk,^],k;yo |
| Admin | admin@wecare.dev | password |
| Officer | officer1@wecare.dev | password |
| Radio Center | office1@wecare.dev | password |
| Driver | driver1@wecare.dev | password |
| Community | community1@wecare.dev | password |
| Executive | executive1@wecare.dev | password |

---

## 📊 Tech Stack

### **Frontend:**
- React + TypeScript
- Vite
- Leaflet (Maps)
- Tailwind CSS

### **Backend:**
- Node.js + Express
- TypeScript
- **SQLite** (better-sqlite3) 🗄️
- JWT Authentication

---

**สร้างโดย:** EMS WeCare Team  
**ปีที่พัฒนา:** 2024-2026
