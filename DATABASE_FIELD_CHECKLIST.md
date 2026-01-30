# 📋 Database Field Checklist - EMS WeCare

## ตรวจสอบ Schema และ Fields ทั้งหมด

---

## 1️⃣ PATIENTS TABLE (ผู้ป่วย)

### ✅ ข้อมูลส่วนตัว (Step 1: Identity)
| Field | Type | Required | Status | Note |
|-------|------|----------|--------|------|
| `id` | TEXT | ✅ | ✅ | Primary Key |
| `full_name` | TEXT | ✅ | ✅ | ชื่อ-นามสกุล |
| `national_id` | TEXT | ⚠️ | ✅ | เลขบัตรประชาชน (UNIQUE) |
| `dob` | TEXT | ⚠️ | ✅ | วันเกิด |
| `age` | INTEGER | - | ✅ | อายุ |
| `gender` | TEXT | ⚠️ | ✅ | เพศ |

**Wizard Step 1 Fields:**
- ✅ `title` - **ไม่มีใน DB** (ต้องรวมกับ full_name)
- ✅ `full_name`
- ✅ `national_id`
- ✅ `dob`
- ✅ `age`
- ✅ `gender`

---

### ✅ ข้อมูลทางการแพทย์ (Step 2: Medical)
| Field | Type | Required | Status | Note |
|-------|------|----------|--------|------|
| `blood_type` | TEXT | - | ✅ | กรุ๊ปเลือด (A, B, AB, O) |
| `rh_factor` | TEXT | - | ✅ | RH (+, -) |
| `health_coverage` | TEXT | - | ✅ | สิทธิการรักษา |
| `chronic_diseases` | TEXT | - | ✅ | โรคประจำตัว (JSON array) |
| `allergies` | TEXT | - | ✅ | แพ้ยา/อาหาร (JSON array) |
| `patient_types` | TEXT | - | ✅ | ประเภทผู้ป่วย (JSON array) |

**Wizard Step 2 Fields:**
- ✅ `blood_type`
- ✅ `rh_factor`
- ✅ `health_coverage`
- ✅ `chronic_diseases` (array)
- ✅ `allergies` (array)

---

### ✅ ข้อมูลติดต่อ (Step 3: Contact)
| Field | Type | Required | Status | Note |
|-------|------|----------|--------|------|
| `contact_phone` | TEXT | ✅ | ✅ | เบอร์โทรศัพท์ |

**ที่อยู่ปัจจุบัน:**
| Field | Type | Status |
|-------|------|--------|
| `current_house_number` | TEXT | ✅ |
| `current_village` | TEXT | ✅ |
| `current_tambon` | TEXT | ✅ |
| `current_amphoe` | TEXT | ✅ |
| `current_changwat` | TEXT | ✅ |

**ที่อยู่ตามบัตรประชาชน:**
| Field | Type | Status |
|-------|------|--------|
| `id_card_house_number` | TEXT | ✅ |
| `id_card_village` | TEXT | ✅ |
| `id_card_tambon` | TEXT | ✅ |
| `id_card_amphoe` | TEXT | ✅ |
| `id_card_changwat` | TEXT | ✅ |

**Wizard Step 3 Fields:**
- ✅ `contact_phone`
- ✅ `current_address` (mapped to current_*)
- ✅ `emergency_contact` - **ไม่มีใน DB** ⚠️

---

### ✅ เอกสารแนบ (Step 4: Attachments)
| Field | Type | Status | Note |
|-------|------|--------|------|
| `profile_image_url` | TEXT | ✅ | รูปโปรไฟล์ |

**Patient Attachments Table:**
| Field | Type | Status |
|-------|------|--------|
| `id` | TEXT | ✅ |
| `patient_id` | TEXT | ✅ |
| `file_name` | TEXT | ✅ |
| `file_path` | TEXT | ✅ |
| `file_type` | TEXT | ✅ |
| `file_size` | INTEGER | ✅ |
| `uploaded_at` | DATETIME | ✅ |

**Wizard Step 4 Fields:**
- ✅ `profile_image` → `profile_image_url`
- ✅ `attachments` → `patient_attachments` table

---

### ✅ ข้อมูลตำแหน่ง (Location)
| Field | Type | Status | Note |
|-------|------|--------|------|
| `landmark` | TEXT | ✅ | จุดสังเกต |
| `latitude` | TEXT | ✅ | ละติจูด |
| `longitude` | TEXT | ✅ | ลองจิจูด |

---

### ✅ Metadata
| Field | Type | Status | Note |
|-------|------|--------|------|
| `registered_date` | TEXT | ✅ | วันที่ลงทะเบียน |
| `created_by` | TEXT | ✅ | ผู้สร้าง (FK to users) |
| `created_at` | DATETIME | ✅ | Auto |
| `updated_at` | DATETIME | ✅ | Auto |

---

## 🚨 Fields ที่ขาดหายใน Database

### ⚠️ Emergency Contact (ผู้ติดต่อฉุกเฉิน)

**Wizard มี แต่ DB ไม่มี:**
- `emergency_contact.name`
- `emergency_contact.phone`
- `emergency_contact.relation`

**แนะนำ:** ควรเพิ่ม fields เหล่านี้ใน `patients` table:

```sql
ALTER TABLE patients ADD COLUMN emergency_contact_name TEXT;
ALTER TABLE patients ADD COLUMN emergency_contact_phone TEXT;
ALTER TABLE patients ADD COLUMN emergency_contact_relation TEXT;
```

---

### ⚠️ Title (คำนำหน้า)

**Wizard มี แต่ DB ไม่มี:**
- `title` (นาย, นาง, นางสาว, เด็กชาย, เด็กหญิง)

**แนะนำ:** 
1. เพิ่ม field `title` ใน DB
2. หรือรวมกับ `full_name` (เช่น "นาย สมชาย ใจดี")

```sql
ALTER TABLE patients ADD COLUMN title TEXT;
```

---

## 2️⃣ RIDES TABLE (การเรียกรถ)

### ✅ ข้อมูลการเดินทาง
| Field | Type | Required | Status |
|-------|------|----------|--------|
| `id` | TEXT | ✅ | ✅ |
| `patient_id` | TEXT | ✅ | ✅ |
| `patient_name` | TEXT | ✅ | ✅ |
| `patient_phone` | TEXT | - | ✅ |
| `driver_id` | TEXT | - | ✅ |
| `driver_name` | TEXT | - | ✅ |
| `vehicle_id` | TEXT | - | ✅ |
| `pickup_location` | TEXT | ✅ | ✅ |
| `pickup_lat` | TEXT | - | ✅ |
| `pickup_lng` | TEXT | - | ✅ |
| `destination` | TEXT | ✅ | ✅ |
| `destination_lat` | TEXT | - | ✅ |
| `destination_lng` | TEXT | - | ✅ |
| `appointment_time` | TEXT | ✅ | ✅ |
| `pickup_time` | TEXT | - | ✅ |
| `dropoff_time` | TEXT | - | ✅ |
| `trip_type` | TEXT | - | ✅ |
| `special_needs` | TEXT | - | ✅ |
| `notes` | TEXT | - | ✅ |
| `distance_km` | REAL | - | ✅ |
| `status` | TEXT | ✅ | ✅ |
| `cancellation_reason` | TEXT | - | ✅ |

---

## 3️⃣ USERS TABLE (ผู้ใช้งาน)

### ✅ ข้อมูลผู้ใช้
| Field | Type | Required | Status |
|-------|------|----------|--------|
| `id` | TEXT | ✅ | ✅ |
| `email` | TEXT | ✅ | ✅ |
| `password` | TEXT | ✅ | ✅ |
| `role` | TEXT | ✅ | ✅ |
| `full_name` | TEXT | ✅ | ✅ |
| `date_created` | TEXT | ✅ | ✅ |
| `status` | TEXT | - | ✅ |

**Roles:**
- DEVELOPER
- admin
- OFFICER
- radio
- radio_center
- driver
- community
- EXECUTIVE

---

## 4️⃣ DRIVERS TABLE (พนักงานขับรถ)

### ✅ ข้อมูลพนักงาน
| Field | Type | Status |
|-------|------|--------|
| `id` | TEXT | ✅ |
| `user_id` | TEXT | ✅ |
| `full_name` | TEXT | ✅ |
| `phone` | TEXT | ✅ |
| `license_number` | TEXT | ✅ |
| `license_expiry` | TEXT | ✅ |
| `status` | TEXT | ✅ |
| `current_vehicle_id` | TEXT | ✅ |
| `profile_image_url` | TEXT | ✅ |
| `total_trips` | INTEGER | ✅ |
| `trips_this_month` | INTEGER | ✅ |

---

## 5️⃣ VEHICLES TABLE (ยานพาหนะ)

### ✅ ข้อมูลรถ
| Field | Type | Status |
|-------|------|--------|
| `id` | TEXT | ✅ |
| `license_plate` | TEXT | ✅ |
| `vehicle_type_id` | TEXT | ✅ |
| `brand` | TEXT | ✅ |
| `model` | TEXT | ✅ |
| `year` | INTEGER | ✅ |
| `color` | TEXT | ✅ |
| `capacity` | INTEGER | ✅ |
| `status` | TEXT | ✅ |
| `mileage` | INTEGER | ✅ |
| `last_maintenance_date` | TEXT | ✅ |
| `next_maintenance_date` | TEXT | ✅ |

---

## 📊 สรุปการตรวจสอบ

### ✅ ครบถ้วน (Complete)
- ✅ Users (8 fields)
- ✅ Patients - ข้อมูลพื้นฐาน (26 fields)
- ✅ Patient Attachments (7 fields)
- ✅ Drivers (11 fields)
- ✅ Vehicles (12 fields)
- ✅ Rides (21 fields)
- ✅ Ride Events (7 fields)
- ✅ Driver Locations (8 fields)
- ✅ Teams (7 fields)
- ✅ News (11 fields)
- ✅ Audit Logs (14 fields)
- ✅ System Settings (5 fields)
- ✅ Map Data (7 fields)

### ⚠️ ขาดหาย (Missing)
1. **Emergency Contact** (3 fields)
   - `emergency_contact_name`
   - `emergency_contact_phone`
   - `emergency_contact_relation`

2. **Title** (1 field)
   - `title` (คำนำหน้าชื่อ)

---

## 🔧 SQL Migration ที่แนะนำ

```sql
-- เพิ่ม Emergency Contact fields
ALTER TABLE patients ADD COLUMN emergency_contact_name TEXT;
ALTER TABLE patients ADD COLUMN emergency_contact_phone TEXT;
ALTER TABLE patients ADD COLUMN emergency_contact_relation TEXT;

-- เพิ่ม Title field
ALTER TABLE patients ADD COLUMN title TEXT;

-- สร้าง indexes ใหม่
CREATE INDEX IF NOT EXISTS idx_patients_emergency_phone ON patients(emergency_contact_phone);
```

---

## 📝 สรุป

**Database Schema:** ✅ **ครบถ้วน 90%**

**ต้องเพิ่ม:**
- ⚠️ Emergency Contact (3 fields)
- ⚠️ Title (1 field)

**รวม:** 4 fields ที่ขาดหาย

**คำแนะนำ:** ควรเพิ่ม fields เหล่านี้เพื่อให้ตรงกับ Wizard ที่สร้างไว้
