# 🗄️ EMS WeCare - Database Information

**โครงการ:** EMS WeCare (Emergency Medical Services - We Care)  
**วันที่อัพเดท:** 2026-01-01  
**สถานะ:** 🔄 กำลัง Migrate จาก JSON → SQLite

---

## 📊 ฐานข้อมูลที่ใช้

### **ปัจจุบัน (Current):**
**SQLite Database** 🗄️

- **ไฟล์:** `d:\EMS\wecare-backend\db\wecare.db`
- **ขนาด:** ~50 KB (ขึ้นอยู่กับข้อมูล)
- **Schema:** `d:\EMS\wecare-backend\db\schema.sql`
- **Library:** `better-sqlite3` (Node.js)
- **Mode:** WAL (Write-Ahead Logging)
- **Foreign Keys:** Enabled
- **สถานะ:** ✅ ใช้งานอยู่ (30% migration complete)

### **เดิม (Legacy):**
**JSON Files** 📁

- **ที่เก็บ:** `d:\EMS\wecare-backend\db\data/*.json`
- **จำนวนไฟล์:** 13 ไฟล์
- **สถานะ:** ⚠️ กำลัง Migrate ออก (จะลบหลังจาก migration เสร็จ)

---

## 🗂️ โครงสร้างฐานข้อมูล SQLite

### **ตารางทั้งหมด (13 ตาราง):**

| # | ตาราง | จำนวน Records | สถานะ | หมายเหตุ |
|---|--------|---------------|-------|----------|
| 1 | `users` | 8 | ✅ Migrated | ผู้ใช้งานระบบ |
| 2 | `patients` | 1 | ✅ Migrated | ข้อมูลผู้ป่วย |
| 3 | `drivers` | 2 | ✅ Migrated | ข้อมูลคนขับ |
| 4 | `vehicles` | 0 | ⏳ Empty | ข้อมูลรถ |
| 5 | `vehicle_types` | 0 | ⏳ Empty | ประเภทรถ |
| 6 | `rides` | 2 | ✅ Migrated | การเดินทาง |
| 7 | `ride_events` | 0 | ⏳ Empty | เหตุการณ์การเดินทาง |
| 8 | `driver_locations` | 0 | ⏳ Empty | ตำแหน่งคนขับ |
| 9 | `teams` | 2 | ✅ Migrated | ทีมงาน |
| 10 | `news` | 0 | ⏳ Empty | ข่าวสาร |
| 11 | `audit_logs` | 0 | ⏳ Empty | บันทึกการตรวจสอบ |
| 12 | `system_settings` | 0 | ⏳ Empty | การตั้งค่าระบบ |
| 13 | `map_data` | 0 | ⏳ Empty | ข้อมูลแผนที่ |

**รวม:** 15 records ใน 5 ตาราง

---

## 🔧 การเชื่อมต่อฐานข้อมูล

### **Backend (Node.js/Express):**

```typescript
// File: wecare-backend/src/db/sqliteDB.ts
import Database from 'better-sqlite3';

const DB_PATH = 'd:/EMS/wecare-backend/db/wecare.db';
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode
db.pragma('journal_mode = WAL');
```

### **การใช้งาน:**

```typescript
import { sqliteDB } from '../db/sqliteDB';

// SELECT
const users = sqliteDB.all<User>('SELECT * FROM users');
const user = sqliteDB.get<User>('SELECT * FROM users WHERE id = ?', [id]);

// INSERT
sqliteDB.insert('users', { id: 'USR-001', email: 'test@example.com', ... });

// UPDATE
sqliteDB.update('users', 'USR-001', { full_name: 'New Name' });

// DELETE
sqliteDB.delete('users', 'USR-001');

// TRANSACTION
sqliteDB.transaction(() => {
  sqliteDB.insert('patients', patientData);
  sqliteDB.insert('rides', rideData);
});
```

---

## 📋 Schema Details

### **ตัวอย่าง Schema (users table):**

```sql
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('DEVELOPER', 'admin', 'OFFICER', 'radio', 'radio_center', 'driver', 'community', 'EXECUTIVE')),
    full_name TEXT NOT NULL,
    date_created TEXT NOT NULL,
    status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

### **ตัวอย่าง Schema (patients table):**

```sql
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    national_id TEXT UNIQUE,
    contact_phone TEXT,
    
    -- Address
    current_village TEXT,
    current_tambon TEXT,
    current_amphoe TEXT,
    current_changwat TEXT,
    
    -- Location
    latitude TEXT,
    longitude TEXT,
    
    -- Medical Info (JSON)
    patient_types TEXT,
    chronic_diseases TEXT,
    allergies TEXT,
    
    -- Metadata
    registered_date TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_patients_created_by ON patients(created_by);
CREATE INDEX IF NOT EXISTS idx_patients_village ON patients(current_village);
```

---

## 🔐 ความปลอดภัย

### **ฟีเจอร์ความปลอดภัย:**

1. ✅ **ACID Transactions** - ข้อมูลสมบูรณ์
2. ✅ **Foreign Key Constraints** - ความสัมพันธ์ถูกต้อง
3. ✅ **Check Constraints** - ข้อมูลถูกต้อง
4. ✅ **Unique Constraints** - ไม่ซ้ำกัน
5. ✅ **Prepared Statements** - ป้องกัน SQL Injection
6. ✅ **WAL Mode** - Concurrent access
7. ✅ **Automatic Locking** - ป้องกัน race conditions

### **Data Isolation:**

```sql
-- Community users เห็นเฉพาะผู้ป่วยของตนเอง
SELECT * FROM patients WHERE created_by = ?
```

---

## 📈 Performance

### **Indexes:**

- ✅ Primary Keys (auto-indexed)
- ✅ Foreign Keys (indexed)
- ✅ Email (users)
- ✅ Role (users)
- ✅ Created By (patients, rides)
- ✅ Status (rides, drivers)
- ✅ Appointment Time (rides)
- ✅ Timestamp (audit_logs, driver_locations)

### **Query Optimization:**

```sql
-- ใช้ index
SELECT * FROM patients WHERE created_by = 'USR-004'; -- FAST

-- ใช้ JOIN
SELECT r.*, p.full_name, d.full_name as driver_name
FROM rides r
LEFT JOIN patients p ON r.patient_id = p.id
LEFT JOIN drivers d ON r.driver_id = d.id
WHERE r.status = 'PENDING';
```

---

## 🔄 Migration Status

### **จาก JSON → SQLite:**

**วันที่ Migrate:** 2026-01-01  
**ผลลัพธ์:**
- ✅ 15 records migrated successfully
- ❌ 5 records failed (constraint violations)
- 📊 Success rate: 75%

**ไฟล์ที่อัพเดทแล้ว:**
- ✅ `src/routes/users.ts`
- ✅ `src/routes/auth.ts`
- ✅ `src/routes/patients.ts`

**ไฟล์ที่ยังต้องอัพเดท:**
- ⏳ `src/routes/rides.ts`
- ⏳ `src/routes/drivers.ts`
- ⏳ `src/routes/dashboard.ts`
- ⏳ และอื่นๆ อีก 4 ไฟล์

---

## 🛠️ Tools & Libraries

### **Backend:**
- `better-sqlite3` v9.x - SQLite driver
- `@types/better-sqlite3` - TypeScript types

### **Installation:**
```bash
npm install better-sqlite3 @types/better-sqlite3 --save
```

### **Database Browser:**
- **SQLite Browser** - GUI tool
- **VS Code Extension:** SQLite Viewer
- **Command Line:** `sqlite3 wecare.db`

---

## 📝 Backup & Maintenance

### **Backup:**

```bash
# Backup database
cp wecare.db wecare.db.backup

# Export to SQL
sqlite3 wecare.db .dump > backup.sql
```

### **Restore:**

```bash
# Restore from backup
cp wecare.db.backup wecare.db

# Import from SQL
sqlite3 wecare.db < backup.sql
```

### **Maintenance:**

```sql
-- Vacuum (optimize)
VACUUM;

-- Analyze (update statistics)
ANALYZE;

-- Check integrity
PRAGMA integrity_check;
```

---

## 📚 เอกสารอ้างอิง

### **ไฟล์เอกสาร:**
- `MIGRATION_SUMMARY.md` - สรุปการ migrate
- `SQLITE_IMPLEMENTATION_PLAN.md` - แผนการทำงาน
- `MIGRATION_PROGRESS.md` - ความคืบหน้า
- `schema.sql` - Database schema

### **External Links:**
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)

---

## 🎯 สรุป

**ฐานข้อมูลที่ใช้:** **SQLite** 🗄️

**ข้อดี:**
- ✅ ไม่ต้องติดตั้ง database server
- ✅ ไฟล์เดียว (portable)
- ✅ ACID transactions
- ✅ ปลอดภัยกว่า JSON
- ✅ เร็วกว่า JSON
- ✅ รองรับ concurrent access

**ข้อจำกัด:**
- ⚠️ ไม่เหมาะกับ high-concurrency (แต่พอสำหรับ EMS WeCare)
- ⚠️ ไม่มี network access (แต่ใช้ REST API)

**เหมาะสำหรับ:**
- ✅ Small to medium applications
- ✅ Embedded systems
- ✅ Desktop applications
- ✅ Mobile backends
- ✅ **EMS WeCare System** ✨

---

**ฐานข้อมูล EMS WeCare ใช้ SQLite แล้วค่ะ!** 🎉
