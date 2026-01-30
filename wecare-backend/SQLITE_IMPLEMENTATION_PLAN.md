# 📋 SQLite Migration - Implementation Plan

**สถานะ:** 🔄 In Progress  
**วันที่:** 2026-01-01

---

## ✅ Phase 1: Schema & Migration (เสร็จแล้ว)

- ✅ สร้าง `schema.sql` (13 tables + indexes)
- ✅ สร้าง `sqliteDB.ts` (database helper)
- ✅ สร้าง `migrate.ts` (migration script)
- ✅ รัน migration (15/20 records migrated)
- ✅ สร้าง `wecare.db` database file

---

## 🔄 Phase 2: Update Backend APIs (กำลังดำเนินการ)

### **สถานะการอัพเดท:**

| ไฟล์ | สถานะ | หมายเหตุ |
|------|-------|----------|
| ✅ `src/routes/users.ts` | เสร็จแล้ว | อัพเดทเป็น SQLite แล้ว |
| ⏳ `src/routes/auth.ts` | รอดำเนินการ | ต้องอัพเดท login/register |
| ⏳ `src/routes/patients.ts` | รอดำเนินการ | CRUD operations |
| ⏳ `src/routes/drivers.ts` | รอดำเนินการ | CRUD operations |
| ⏳ `src/routes/rides.ts` | รอดำเนินการ | CRUD + status updates |
| ⏳ `src/routes/vehicles.ts` | รอดำเนินการ | CRUD operations |
| ⏳ `src/routes/vehicle-types.ts` | รอดำเนินการ | CRUD operations |
| ⏳ `src/routes/teams.ts` | รอดำเนินการ | CRUD operations |
| ⏳ `src/routes/news.ts` | รอดำเนินการ | CRUD operations |
| ⏳ `src/routes/dashboard.ts` | รอดำเนินการ | Aggregation queries |

---

## 📝 แนวทางการอัพเดทแต่ละไฟล์

### **ขั้นตอนทั่วไป:**

1. **เปลี่ยน Import:**
```typescript
// เดิม
import { jsonDB } from '../db/jsonDB';

// ใหม่
import { sqliteDB } from '../db/sqliteDB';
```

2. **อัพเดท CRUD Operations:**

#### **GET All:**
```typescript
// เดิม
const items = jsonDB.read<T>('table_name');

// ใหม่
const items = sqliteDB.all<T>('SELECT * FROM table_name');
```

#### **GET by ID:**
```typescript
// เดิม
const item = jsonDB.findById<T>('table_name', id);

// ใหม่
const item = sqliteDB.get<T>('SELECT * FROM table_name WHERE id = ?', [id]);
```

#### **CREATE:**
```typescript
// เดิม
const newItem = { id: newId, ...data };
jsonDB.create('table_name', newItem);

// ใหม่
sqliteDB.insert('table_name', { id: newId, ...data });
const created = sqliteDB.get<T>('SELECT * FROM table_name WHERE id = ?', [newId]);
```

#### **UPDATE:**
```typescript
// เดิม
const updated = jsonDB.update<T>('table_name', id, updates);

// ใหม่
sqliteDB.update('table_name', id, updates);
const updated = sqliteDB.get<T>('SELECT * FROM table_name WHERE id = ?', [id]);
```

#### **DELETE:**
```typescript
// เดิม
const deleted = jsonDB.delete<T>('table_name', id);

// ใหม่
const result = sqliteDB.delete('table_name', id);
if (result.changes === 0) {
  return res.status(404).json({ error: 'Not found' });
}
```

3. **Generate ID:**
```typescript
// เดิม
const newId = jsonDB.generateId('table_name', 'PREFIX');

// ใหม่
const generateId = (): string => {
  const items = sqliteDB.all<{id: string}>('SELECT id FROM table_name ORDER BY id DESC LIMIT 1');
  if (items.length === 0) return 'PREFIX-001';
  const lastId = items[0].id;
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `PREFIX-${String(num).padStart(3, '0')}`;
};
```

---

## 🎯 ไฟล์ที่ต้องอัพเดทต่อไป

### **1. auth.ts (สำคัญมาก!)**

**การเปลี่ยนแปลง:**
- Login: ค้นหา user จาก SQLite
- Register: Insert user ใหม่

```typescript
// Login
const user = sqliteDB.get<User>(
  'SELECT * FROM users WHERE email = ?', 
  [email]
);

// Register
sqliteDB.insert('users', {
  id: newId,
  email,
  password: hashedPassword,
  role,
  full_name: fullName,
  date_created: new Date().toISOString(),
  status: 'Active'
});
```

### **2. patients.ts**

**การเปลี่ยนแปลง:**
- GET /api/patients - ต้องรองรับ filter by created_by
- POST /api/patients - Insert ข้อมูลผู้ป่วย
- PUT /api/patients/:id - Update ข้อมูล
- DELETE /api/patients/:id - ลบผู้ป่วย

**ตัวอย่าง Query:**
```typescript
// Get patients by community user
const patients = sqliteDB.all<Patient>(
  'SELECT * FROM patients WHERE created_by = ? ORDER BY registered_date DESC',
  [userId]
);

// Insert patient
sqliteDB.insert('patients', {
  id: newId,
  full_name: data.fullName,
  contact_phone: data.contactPhone,
  patient_types: JSON.stringify(data.patientTypes),
  chronic_diseases: JSON.stringify(data.chronicDiseases),
  allergies: JSON.stringify(data.allergies),
  latitude: data.latitude,
  longitude: data.longitude,
  registered_date: new Date().toISOString().split('T')[0],
  created_by: userId
});
```

### **3. rides.ts**

**การเปลี่ยนแปลง:**
- GET /api/rides - รองรับ filter หลายแบบ
- POST /api/rides - สร้างการเดินทางใหม่
- PUT /api/rides/:id/assign - มอบหมายคนขับ
- PUT /api/rides/:id/status - อัพเดทสถานะ

**ตัวอย่าง Query:**
```typescript
// Get rides with filters
let sql = 'SELECT * FROM rides WHERE 1=1';
const params: any[] = [];

if (status) {
  sql += ' AND status = ?';
  params.push(status);
}

if (driverId) {
  sql += ' AND driver_id = ?';
  params.push(driverId);
}

sql += ' ORDER BY appointment_time DESC';
const rides = sqliteDB.all<Ride>(sql, params);
```

### **4. dashboard.ts**

**การเปลี่ยนแปลง:**
- Aggregation queries สำหรับ statistics
- JOIN queries สำหรับข้อมูลที่เกี่ยวข้อง

**ตัวอย่าง Query:**
```typescript
// Count rides by status
const stats = sqliteDB.get<any>(`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
  FROM rides
  WHERE DATE(appointment_time) = DATE('now')
`);

// Get urgent rides with patient info
const urgentRides = sqliteDB.all<any>(`
  SELECT r.*, p.contact_phone, p.current_village
  FROM rides r
  LEFT JOIN patients p ON r.patient_id = p.id
  WHERE r.status = 'PENDING'
  ORDER BY r.appointment_time ASC
`);
```

---

## ⚠️ สิ่งที่ต้องระวัง

### **1. Field Names**
- JSON ใช้ camelCase: `fullName`, `patientId`
- SQLite ใช้ snake_case: `full_name`, `patient_id`
- ต้อง map ให้ถูกต้อง!

### **2. JSON Fields**
- `patient_types`, `chronic_diseases`, `allergies` เก็บเป็น JSON string
- ต้อง `JSON.stringify()` ก่อน insert
- ต้อง `JSON.parse()` หลัง select

### **3. Transactions**
- ใช้ transaction สำหรับ operations ที่เกี่ยวข้องกันหลายตาราง

```typescript
sqliteDB.transaction(() => {
  sqliteDB.insert('rides', rideData);
  sqliteDB.insert('ride_events', eventData);
});
```

### **4. Error Handling**
- SQLite จะ throw error ถ้า constraint violation
- ต้อง catch และ return error message ที่เหมาะสม

---

## 🧪 Phase 3: Testing (ยังไม่เริ่ม)

### **ต้องทดสอบ:**

1. ✅ Login/Register
2. ✅ CRUD operations ทุกตาราง
3. ✅ Data isolation (community users)
4. ✅ Concurrent access
5. ✅ Performance
6. ✅ Error handling

---

## 📦 Phase 4: Cleanup (ยังไม่เริ่ม)

1. Backup JSON files
2. ลบ `jsonDB.ts` (หรือเก็บไว้สำหรับ backup)
3. ลบ JSON files ใน `db/data/`
4. อัพเดทเอกสาร

---

## 🎯 Next Steps

### **ลำดับความสำคัญ:**

1. **สูงสุด:** `auth.ts` - ต้องทำงานก่อนถึงจะ login ได้
2. **สูง:** `patients.ts`, `rides.ts` - ฟีเจอร์หลักของระบบ
3. **ปานกลาง:** `drivers.ts`, `vehicles.ts` - จัดการทรัพยากร
4. **ต่ำ:** `news.ts`, `teams.ts` - ฟีเจอร์เสริม

---

## 📝 Template สำหรับอัพเดทไฟล์

```typescript
import express from 'express';
import { sqliteDB } from '../db/sqliteDB';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

interface YourType {
  id: string;
  // ... fields
}

// Helper: Generate ID
const generateId = (): string => {
  const items = sqliteDB.all<{id: string}>('SELECT id FROM table_name ORDER BY id DESC LIMIT 1');
  if (items.length === 0) return 'PREFIX-001';
  const lastId = items[0].id;
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `PREFIX-${String(num).padStart(3, '0')}`;
};

// GET /api/resource
router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = sqliteDB.all<YourType>('SELECT * FROM table_name');
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/resource/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = sqliteDB.get<YourType>('SELECT * FROM table_name WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/resource
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newId = generateId();
    sqliteDB.insert('table_name', { id: newId, ...req.body });
    const created = sqliteDB.get<YourType>('SELECT * FROM table_name WHERE id = ?', [newId]);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/resource/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    sqliteDB.update('table_name', req.params.id, req.body);
    const updated = sqliteDB.get<YourType>('SELECT * FROM table_name WHERE id = ?', [req.params.id]);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/resource/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = sqliteDB.delete('table_name', req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

---

**สถานะปัจจุบัน:** 1/10 ไฟล์เสร็จแล้ว (10%)  
**เวลาโดยประมาณ:** 2-3 ชั่วโมงสำหรับไฟล์ที่เหลือ

**ต้องการให้ดำเนินการต่อไหมคะ?** 🚀
