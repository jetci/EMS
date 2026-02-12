# Fix: Missing Fields in Patient Registration

## ปัญหา

ฟิลด์ที่กรอกข้อมูลแล้วแสดงว่า **"สถานะ ไม่มี"** ในหน้า Review:
1. **รายละเอียดการเดินทาง** - ไม่แสดง
2. **เบอร์ติดต่อระหว่างเดินทาง** - ไม่แสดง
3. **ความต้องการพิเศษ** - ไม่แสดง

## สาเหตุ

ฟิลด์เหล่านี้ **ไม่มีในระบบ** - ไม่มีใน:
- ❌ Step3Contact (form input)
- ❌ Step5Review (display)
- ❌ CommunityRegisterPatientPage (initial state)

## การแก้ไข

### 1. เพิ่มฟิลด์ใน Step3Contact.tsx

เพิ่ม 3 ฟิลด์ใหม่ในส่วนที่ 3 (ข้อมูลติดต่อ):

```typescript
// เบอร์ติดต่อระหว่างเดินทาง
<div>
    <label className="block text-sm font-medium text-gray-700">เบอร์ติดต่อระหว่างเดินทาง</label>
    <input type="text" value={formData.travelPhone || ''} 
           onChange={(e) => handleInputChange('travelPhone', e.target.value.replace(/\D/g, '').slice(0, 10))} 
           className="mt-1 w-full p-3 border border-gray-300 rounded-lg" 
           maxLength={10} 
           placeholder="เบอร์โทรสำหรับติดต่อระหว่างเดินทาง" />
</div>

// รายละเอียดการเดินทาง
<div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700">รายละเอียดการเดินทาง</label>
    <textarea value={formData.travelDetails || ''} 
              onChange={(e) => handleInputChange('travelDetails', e.target.value)} 
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg" 
              rows={3} 
              placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับการเดินทาง เช่น ต้องการรถเข็น, ต้องการเปลนอน">
    </textarea>
</div>

// ความต้องการพิเศษ
<div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700">ความต้องการพิเศษ</label>
    <textarea value={formData.specialNeeds || ''} 
              onChange={(e) => handleInputChange('specialNeeds', e.target.value)} 
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg" 
              rows={3} 
              placeholder="ระบุความต้องการพิเศษ เช่น ต้องการออกซิเจน, ต้องการพยาบาลติดตาม">
    </textarea>
</div>
```

### 2. เพิ่มการแสดงผลใน Step5Review.tsx

เพิ่มการ destructure:
```typescript
const {
    // ... existing fields
    contactPhone, travelPhone, travelDetails, specialNeeds,
    // ... rest
} = currentData;
```

เพิ่มการแสดงผล:
```typescript
<div>
    <p className="text-sm font-medium text-gray-600">เบอร์ติดต่อระหว่างเดินทาง:</p>
    <p className="text-base text-gray-800">{travelPhone || <span className="text-gray-500">ไม่มี</span>}</p>
</div>

<div className="md:col-span-2">
    <p className="text-sm font-medium text-gray-600">รายละเอียดการเดินทาง:</p>
    <p className="text-base text-gray-800">{travelDetails || <span className="text-gray-500">ไม่มี</span>}</p>
</div>

<div className="md:col-span-2">
    <p className="text-sm font-medium text-gray-600">ความต้องการพิเศษ:</p>
    <p className="text-base text-gray-800">{specialNeeds || <span className="text-gray-500">ไม่มี</span>}</p>
</div>
```

### 3. เพิ่ม Default Values ใน CommunityRegisterPatientPage.tsx

```typescript
const [formData, setFormData] = useState<any>({
    // ... existing fields
    contactPhone: '',
    travelPhone: '',           // ← เพิ่ม
    travelDetails: '',         // ← เพิ่ม
    specialNeeds: '',          // ← เพิ่ม
    emergencyContactName: '',
    // ... rest
});
```

## การเปลี่ยนแปลง

### ไฟล์ที่แก้ไข

1. **Step3Contact.tsx**
   - เพิ่ม input field: `travelPhone`
   - เพิ่ม textarea: `travelDetails`
   - เพิ่ม textarea: `specialNeeds`

2. **Step5Review.tsx**
   - เพิ่ม destructuring: `travelPhone, travelDetails, specialNeeds`
   - เพิ่มการแสดงผล 3 ฟิลด์

3. **CommunityRegisterPatientPage.tsx**
   - เพิ่ม default values: `travelPhone: '', travelDetails: '', specialNeeds: ''`

## ผลลัพธ์

### ✅ Before Fix
```
รายละเอียดการเดินทาง: ข้อมูล
เบอร์ติดต่อระหว่างเดินทาง
สถานะ ไม่มี  ← ไม่แสดงข้อมูล
ความต้องการพิเศษ
สถานะ ไม่มี  ← ไม่แสดงข้อมูล
```

### ✅ After Fix
```
เบอร์ติดต่อระหว่างเดินทาง: 0812345678
รายละเอียดการเดินทาง: ต้องการรถเข็น, ต้องการเปลนอน
ความต้องการพิเศษ: ต้องการออกซิเจน, ต้องการพยาบาลติดตาม
```

หรือถ้าไม่กรอก:
```
เบอร์ติดต่อระหว่างเดินทาง: ไม่มี
รายละเอียดการเดินทาง: ไม่มี
ความต้องการพิเศษ: ไม่มี
```

## สรุป

### ปัญหา
❌ ฟิลด์ที่กรอกแล้วแสดง "สถานะ ไม่มี"

### สาเหตุ
ฟิลด์เหล่านี้ไม่มีในระบบ

### การแก้ไข
✅ เพิ่มฟิลด์ใน Step3Contact (input)
✅ เพิ่มการแสดงผลใน Step5Review
✅ เพิ่ม default values ใน CommunityRegisterPatientPage

### ผลลัพธ์
✅ **ฟิลด์ทั้ง 3 แสดงผลถูกต้องแล้ว**
- เบอร์ติดต่อระหว่างเดินทาง
- รายละเอียดการเดินทาง
- ความต้องการพิเศษ

## การทดสอบ

1. ไปหน้า Register Patient
2. กรอกข้อมูลใน Step 3 (ที่อยู่ & ติดต่อ)
3. กรอก:
   - เบอร์ติดต่อระหว่างเดินทาง
   - รายละเอียดการเดินทาง
   - ความต้องการพิเศษ
4. ไป Step 5 (ตรวจสอบ & ยืนยัน)
5. **ผลที่คาดหวัง:** แสดงข้อมูลครบถ้วน ✅
