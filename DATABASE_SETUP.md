# EMS WeCare - Database Setup Guide

## 📋 ข้อมูล Database Production

- **Database Name**: `wiangwec_wecare`
- **Host**: `localhost`
- **Username**: `wiangwec_wecare`
- **Password**: `AtwAywxkvEptw65k5ky9`
- **Port**: `3306`

---

## 🚀 ขั้นตอนการติดตั้ง Database

### 1. เข้าสู่ MySQL

```bash
mysql -u wiangwec_wecare -p
# Enter password: AtwAywxkvEptw65k5ky9
```

### 2. เลือก Database

```sql
USE wiangwec_wecare;
```

### 3. สร้าง Tables

```bash
# Run schema file
mysql -u wiangwec_wecare -p wiangwec_wecare < database_schema.sql
```

หรือ Copy SQL จากไฟล์ `database_schema.sql` และรันใน MySQL

### 4. สร้าง User แรก (DEVELOPER)

```bash
# Generate password hash
python create_admin_user.py
```

จะได้ SQL INSERT statement พร้อม password hash

**Copy SQL และรันใน MySQL**

---

## 📊 Database Schema

### Tables

1. **users** - ผู้ใช้งานระบบ (DEVELOPER, ADMIN, RADIO, OFFICER, DRIVER, COMMUNITY, EXECUTIVE)
2. **driver_profiles** - ข้อมูลคนขับ
3. **patients** - ข้อมูลผู้ป่วย
4. **vehicles** - ข้อมูลรถ
5. **rides** - ข้อมูลการเดินทาง
6. **news_articles** - ข้อมูลข่าวสาร
7. **audit_logs** - Log การใช้งาน

### Relationships

- `users` → `driver_profiles` (1:1)
- `users` → `patients` (1:N) - registered_by
- `users` → `rides` (1:N) - requester, driver
- `patients` → `rides` (1:N)
- `vehicles` → `rides` (1:N)
- `vehicles` → `driver_profiles` (1:N)

---

## 🔑 Default User

**Email**: `jetci.jm@gmail.com`  
**Password**: `dev123`  
**Role**: `DEVELOPER`

---

## 📝 ไฟล์ที่เกี่ยวข้อง

- `database_schema.sql` - SQL Schema สำหรับสร้าง Tables
- `initial_data.sql` - SQL สำหรับข้อมูลเริ่มต้น (template)
- `create_admin_user.py` - Script สร้าง password hash สำหรับ user แรก
- `DATABASE_SETUP.md` - คู่มือนี้

---

## ✅ Checklist

- [ ] เข้า MySQL ด้วย credentials ที่ถูกต้อง
- [ ] รัน `database_schema.sql` สร้าง tables
- [ ] รัน `python create_admin_user.py` สร้าง password hash
- [ ] Copy SQL INSERT และรันใน MySQL
- [ ] ทดสอบ Login ด้วย `jetci.jm@gmail.com` / `dev123`
- [ ] ตรวจสอบว่า Backend เชื่อมต่อ Database ได้

---

## 🔧 Backend Configuration

ไฟล์ `src/.env.production` มี config แล้ว:

```env
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_NAME=wiangwec_wecare
DATABASE_USER=wiangwec_wecare
DATABASE_PASSWORD=AtwAywxkvEptw65k5ky9
DATABASE_PORT=3306
```

---

## 📞 Support

Repository: https://github.com/jetci/EMS-WeCare.git
