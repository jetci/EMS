# 🐛 BUG REPORT: Patient Detail - Missing Data Fields

**Bug ID:** BUG-COMM-011  
**Reported:** 2026-01-10 21:50 ICT  
**Severity:** 🔴 CRITICAL  
**Status:** ⏳ IN PROGRESS

---

## 🔍 Root Cause Analysis

### **Problem:**
เอกสารดึงข้อมูลมาไม่ครบจำนวนมาก

### **Root Cause:**
1. ❌ **Database Schema ไม่ตรงกับ Frontend Requirements**
   - Database มี: `full_name` (single field)
   - Frontend ต้องการ: `title`, `firstName`, `lastName` (separate fields)

2. ❌ **Missing Fields in Database:**
   - `title` / `prefix` (คำนำหน้าชื่อ)
   - `first_name` (ชื่อ)
   - `last_name` (นามสกุล)

3. ❌ **ID Card Address Not Mapped:**
   - Database มี: `id_card_house_number`, `id_card_village`, etc.
   - Backend ไม่ได้ map ไปยัง `registeredAddress`

4. ❌ **Missing Test Before Delivery:**
   - ไม่ได้ทดสอบกับข้อมูลจริง
   - ไม่ได้ตรวจสอบ API response
   - ไม่ได้ verify database schema

---

## ✅ Solution

### **Option 1: Update Database Schema (Recommended)**
เพิ่มฟิลด์ที่ขาดหายในตาราง `patients`:

```sql
ALTER TABLE patients ADD COLUMN title TEXT;
ALTER TABLE patients ADD COLUMN first_name TEXT;
ALTER TABLE patients ADD COLUMN last_name TEXT;
```

### **Option 2: Parse from full_name (Quick Fix)**
แยก `full_name` เป็น `firstName` และ `lastName` ใน Backend:

```typescript
// In mapPatientToResponse()
const nameParts = p.full_name.split(' ');
const firstName = nameParts[0] || '';
const lastName = nameParts.slice(1).join(' ') || '';
```

### **Option 3: Update Backend Mapping**
Map `id_card_*` fields to `registeredAddress`:

```typescript
registeredAddress: {
  houseNumber: p.id_card_house_number,
  village: p.id_card_village,
  tambon: p.id_card_tambon,
  amphoe: p.id_card_amphoe,
  changwat: p.id_card_changwat
}
```

---

## 🛠 Immediate Fix (Next 10 minutes)

ผมจะทำ:
1. ✅ Update Backend mapping สำหรับ `registeredAddress`
2. ✅ Parse `full_name` เป็น `firstName` / `lastName`
3. ✅ เพิ่ม fallback values สำหรับ fields ที่ไม่มี
4. ✅ Test กับข้อมูลจริง
5. ✅ Verify ทุก 19 fields

---

## 📝 Lesson Learned

### **What Went Wrong:**
1. ❌ ไม่ได้ตรวจสอบ Database Schema ก่อนเขียน Code
2. ❌ ไม่ได้ทดสอบกับข้อมูลจริง
3. ❌ Assume ว่า API มีข้อมูลครบ
4. ❌ ไม่ได้ verify response structure

### **What Should Have Been Done:**
1. ✅ ตรวจสอบ Database Schema ก่อน
2. ✅ ทดสอบกับข้อมูลจริงจาก API
3. ✅ Verify API response structure
4. ✅ Test ทุก field ก่อนส่งมอบ

---

## 🎯 Action Plan

### **Now (10 minutes):**
1. Fix Backend mapping
2. Test with real data
3. Verify all 19 fields

### **Later (1 hour):**
1. Update database schema
2. Add migration script
3. Update documentation

---

**ขอโทษจริงๆ ครับ!**  
**ผมจะแก้ไขให้ถูกต้องภายใน 10 นาทีครับ!**

---

**Created:** 2026-01-10 21:52 ICT  
**ETA for Fix:** 2026-01-10 22:02 ICT
