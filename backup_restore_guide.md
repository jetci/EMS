# Database Backup & Restore Guide

## 📤 Export ข้อมูลจาก Database เดิม

### วิธีที่ 1: ใช้ mysqldump (แนะนำ)

```bash
# Export ทั้ง Database
mysqldump -u wiangwec_wecare -p wiangwec_wecare > wiangwec_backup.sql

# Export เฉพาะ Schema (ไม่มีข้อมูล)
mysqldump -u wiangwec_wecare -p --no-data wiangwec_wecare > schema_only.sql

# Export เฉพาะข้อมูล (ไม่มี Schema)
mysqldump -u wiangwec_wecare -p --no-create-info wiangwec_wecare > data_only.sql
```

### วิธีที่ 2: ใช้ phpMyAdmin

1. เข้า phpMyAdmin
2. เลือก Database: `wiangwec_wecare`
3. คลิก Tab "Export"
4. เลือก "Quick" หรือ "Custom"
5. Format: SQL
6. คลิก "Go" เพื่อ Download

### วิธีที่ 3: Export เป็น CSV

```sql
-- Export Users
SELECT * FROM users 
INTO OUTFILE '/var/lib/mysql-files/users.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

---

## 📥 Import ข้อมูลเข้า Database ใหม่

### วิธีที่ 1: ใช้ mysql command

```bash
# Import ทั้ง Database
mysql -u wiangwec_wecare -p wiangwec_wecare < wiangwec_backup.sql

# Import Schema ก่อน
mysql -u wiangwec_wecare -p wiangwec_wecare < database_schema.sql

# Import ข้อมูล
mysql -u wiangwec_wecare -p wiangwec_wecare < data_only.sql
```

### วิธีที่ 2: ใช้ phpMyAdmin

1. เข้า phpMyAdmin
2. เลือก Database: `wiangwec_wecare`
3. คลิก Tab "Import"
4. เลือกไฟล์ .sql
5. คลิก "Go"

---

## 🔄 Migration Steps

### 1. Backup Database เดิม

```bash
mysqldump -u wiangwec_wecare -p wiangwec_wecare > backup_$(date +%Y%m%d).sql
```

### 2. สร้าง Schema ใหม่

```bash
mysql -u wiangwec_wecare -p wiangwec_wecare < database_schema.sql
```

### 3. Import ข้อมูลเดิม

```bash
mysql -u wiangwec_wecare -p wiangwec_wecare < backup_$(date +%Y%m%d).sql
```

### 4. สร้าง User แรก (ถ้ายังไม่มี)

```bash
python create_admin_user.py
# Copy SQL output และรันใน MySQL
```

---

## ⚠️ สำคัญ

1. **Backup ก่อนเสมอ** - สำรองข้อมูลก่อนทำการ migrate
2. **ตรวจสอบ Schema** - ให้แน่ใจว่า schema ตรงกับ models
3. **ทดสอบก่อน** - ทดสอบบน development ก่อน production
4. **Check Encoding** - ใช้ UTF-8 (utf8mb4_unicode_ci)

---

## 📋 Checklist

- [ ] Backup database เดิม
- [ ] สร้าง schema ใหม่
- [ ] Import ข้อมูล
- [ ] ทดสอบ Login
- [ ] ตรวจสอบ relationships
- [ ] ทดสอบ API endpoints

---

## 🔗 ไฟล์ที่เกี่ยวข้อง

- `database_schema.sql` - Schema สำหรับสร้าง tables
- `export_database.sql` - คำสั่ง export
- `create_admin_user.py` - สร้าง user แรก
- `DATABASE_SETUP.md` - คู่มือ setup
