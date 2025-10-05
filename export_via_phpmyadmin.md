# วิธี Export ข้อมูลผ่าน phpMyAdmin

## ⚠️ สำคัญ
ไฟล์ `.sql` ที่สร้างให้ไม่ได้ออกแบบให้รันใน phpMyAdmin SQL tab
ใช้สำหรับรันใน Command Line เท่านั้น

---

## ✅ วิธีที่ถูกต้องสำหรับ phpMyAdmin

### วิธีที่ 1: Export ผ่าน Tab Export (แนะนำ)

1. **เข้า phpMyAdmin**
2. **เลือก Database**: `wiangwec_wecare` (ซ้ายมือ)
3. **คลิก Tab "Export"** (บนสุด)
4. **เลือก Export method**:
   - **Quick**: Export ทั้งหมดแบบง่าย
   - **Custom**: เลือก Tables และ Options
5. **Format**: SQL
6. **คลิก "Go"**
7. **Download ไฟล์** `.sql`

### วิธีที่ 2: Export แต่ละ Table

1. เข้า phpMyAdmin
2. เลือก Database: `wiangwec_wecare`
3. **Check ✓** Tables ที่ต้องการ (หรือ Check all)
4. **Dropdown "With selected:"** → เลือก **"Export"**
5. Format: SQL → Go
6. Download ไฟล์

### วิธีที่ 3: Export ทีละ Table

1. เข้า phpMyAdmin
2. คลิกที่ Table (เช่น `users`)
3. คลิก Tab "Export"
4. Format: SQL → Go
5. ทำซ้ำกับ Table อื่นๆ

---

## 📋 Tables ที่ต้อง Export

จากภาพที่เห็น มี 9 Tables:
- ✓ audit_logs
- ✓ drivers
- ✓ news_articles
- ✓ patients
- ✓ rides (มีข้อมูล 1 row)
- ✓ system_settings (มีข้อมูล 1 row)
- ✓ teams
- ✓ users
- ✓ vehicles

---

## 🔧 ถ้าต้องการใช้ Command Line

### Windows PowerShell:
```powershell
# ใช้ Script ที่สร้างให้
.\quick_export.ps1
```

### Command Prompt:
```cmd
mysqldump -u wiangwec_wecare -p wiangwec_wecare > backup.sql
```

### หรือระบุ path เต็ม:
```cmd
"C:\xampp\mysql\bin\mysqldump" -u wiangwec_wecare -p wiangwec_wecare > backup.sql
```

---

## ❌ อย่าทำ

- ❌ อย่า Copy SQL จากไฟล์ไปรันใน phpMyAdmin SQL tab
- ❌ อย่าใช้ `INTO OUTFILE` ใน phpMyAdmin (ไม่มีสิทธิ์)
- ❌ อย่ารัน mysqldump command ใน SQL tab

## ✅ ทำ

- ✅ ใช้ Tab "Export" ใน phpMyAdmin
- ✅ หรือใช้ PowerShell Script: `quick_export.ps1`
- ✅ หรือใช้ mysqldump ใน Command Line

---

## 📝 สรุป

**สำหรับ phpMyAdmin**: ใช้ Tab "Export" เท่านั้น
**สำหรับ Command Line**: ใช้ `quick_export.ps1` หรือ `mysqldump`
