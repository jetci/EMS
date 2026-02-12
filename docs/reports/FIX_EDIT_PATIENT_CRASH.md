# Fix: EditPatientModal Crash

## ปัญหา

```
EditPatientModal.tsx:311 Uncaught TypeError: Cannot read properties of undefined (reading 'houseNumber')
```

## สาเหตุ

`formData.idCardAddress` และ `formData.currentAddress` เป็น `undefined`

### Root Cause
```typescript
// Line 38 - เดิม
const [formData, setFormData] = useState(patient);
```

ถ้า `patient` object ไม่มี `idCardAddress` หรือ `currentAddress` properties จะเกิด error เมื่อพยายามเข้าถึง:
```typescript
// Line 311
value={formData.idCardAddress.houseNumber}  // ❌ Cannot read 'houseNumber' of undefined
```

## การแก้ไข

เพิ่ม default values สำหรับ address objects:

```typescript
// Line 38-42 - ใหม่
const [formData, setFormData] = useState({
    ...patient,
    idCardAddress: patient.idCardAddress || { 
        houseNumber: '', 
        village: '', 
        tambon: '', 
        amphoe: '', 
        changwat: '' 
    },
    currentAddress: patient.currentAddress || { 
        houseNumber: '', 
        village: '', 
        tambon: '', 
        amphoe: '', 
        changwat: '' 
    }
});
```

## ผลลัพธ์

### ✅ Before Fix
```
❌ Error: Cannot read properties of undefined (reading 'houseNumber')
❌ Modal crashes
❌ Cannot edit patient
```

### ✅ After Fix
```
✅ Modal opens successfully
✅ Address fields show empty values if undefined
✅ Can edit patient data
```

## ไฟล์ที่แก้ไข

- `components/modals/EditPatientModal.tsx` (lines 38-42)

## สรุป

### ปัญหา
❌ EditPatientModal crash เมื่อ patient ไม่มี address data

### สาเหตุ
`idCardAddress` และ `currentAddress` เป็น `undefined`

### การแก้ไข
✅ เพิ่ม default empty objects สำหรับ address fields

### ผลลัพธ์
✅ **Modal ทำงานได้แล้ว** - ไม่ crash แม้ patient ไม่มี address data
