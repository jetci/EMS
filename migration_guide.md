# Database Migration Guide - Schema เดิม → Schema ใหม่

## 📋 ภาพรวม

Migration จาก Schema เดิม (wiangwec_wecare.sql) ไปเป็น Schema ใหม่ (database_schema.sql)

---

## ⚠️ ความแตกต่างสำคัญ

### Schema เดิม → Schema ใหม่

| Table เดิม | Table ใหม่ | การเปลี่ยนแปลง |
|------------|-----------|----------------|
| `users` (ไม่มี password) | `users` (มี password_hash) | เพิ่ม authentication |
| `drivers` (แยก table) | `driver_profiles` (link กับ users) | เปลี่ยนโครงสร้าง |
| `system_settings` | - | ลบออก |
| `teams` | - | ลบออก |

---

## 🚀 ขั้นตอนการ Migration

### ขั้นตอนที่ 1: Backup ข้อมูลเดิม ✅

```bash
# ทำแล้ว: wiangwec_wecare.sql
```

### ขั้นตอนที่ 2: สร้าง Schema ใหม่

```bash
mysql -u wiangwec_wecare -p wiangwec_wecare < database_schema.sql
```

### ขั้นตอนที่ 3: Rename Tables เดิม

```sql
-- Rename tables เดิมเพื่อเก็บไว้
RENAME TABLE users TO old_users;
RENAME TABLE drivers TO old_drivers;
RENAME TABLE patients TO old_patients;
RENAME TABLE vehicles TO old_vehicles;
RENAME TABLE rides TO old_rides;
RENAME TABLE news_articles TO old_news_articles;
RENAME TABLE audit_logs TO old_audit_logs;
```

### ขั้นตอนที่ 4: สร้าง Password Hash สำหรับ Users

```bash
python create_admin_user.py
# Copy password hash ที่ได้
```

### ขั้นตอนที่ 5: รัน Migration Script

```bash
mysql -u wiangwec_wecare -p wiangwec_wecare < migration_script.sql
```

### ขั้นตอนที่ 6: ตรวจสอบข้อมูล

```sql
-- ตรวจสอบจำนวน records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM driver_profiles;
SELECT COUNT(*) FROM patients;
SELECT COUNT(*) FROM vehicles;
SELECT COUNT(*) FROM rides;
SELECT COUNT(*) FROM news_articles;
SELECT COUNT(*) FROM audit_logs;
```

### ขั้นตอนที่ 7: ทดสอบระบบ

1. ทดสอบ Login
2. ทดสอบ API endpoints
3. ตรวจสอบ relationships

### ขั้นตอนที่ 8: ลบ Tables เดิม (ถ้าทุกอย่างถูกต้อง)

```sql
DROP TABLE old_users;
DROP TABLE old_drivers;
DROP TABLE old_patients;
DROP TABLE old_vehicles;
DROP TABLE old_rides;
DROP TABLE old_news_articles;
DROP TABLE old_audit_logs;
DROP TABLE system_settings;
DROP TABLE teams;
```

---

## 📝 สำคัญ

1. **Backup ก่อนเสมอ** - มีไฟล์ `wiangwec_wecare.sql` แล้ว
2. **ทดสอบบน Dev ก่อน** - อย่ารันบน Production ตรงๆ
3. **Password Hash** - ต้องสร้างให้ทุก user
4. **Foreign Keys** - ตรวจสอบ relationships

---

## 🔧 ไฟล์ที่เกี่ยวข้อง

- `wiangwec_wecare.sql` - Backup ข้อมูลเดิม
- `database_schema.sql` - Schema ใหม่
- `migration_script.sql` - Script แปลงข้อมูล
- `create_admin_user.py` - สร้าง password hash
- `migration_guide.md` - คู่มือนี้

---

## ✅ Checklist

- [x] Backup ข้อมูลเดิม
- [ ] สร้าง Schema ใหม่
- [ ] Rename tables เดิม
- [ ] สร้าง password hash
- [ ] รัน migration script
- [ ] ตรวจสอบข้อมูล
- [ ] ทดสอบระบบ
- [ ] ลบ tables เดิม
