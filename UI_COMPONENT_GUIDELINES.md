# 📅 UI Component Guidelines - EMS WeCare Platform

**เอกสารแนวทางการพัฒนา UI Components สำหรับระบบ EMS WeCare**

---

## 🎨 Design Principles

ระบบ EMS WeCare ใช้หลักการออกแบบที่เน้น:
- **ความทันสมัย** (Modern & Clean)
- **ใช้งานง่าย** (User-Friendly)
- **เข้าถึงได้** (Accessible)
- **รองรับภาษาไทย** (Thai Language Support)

---

## 📅 Date Picker Component

### ✅ **Standard Component: ModernDatePicker**

**ที่อยู่:** `d:\EMS\components\ui\ModernDatePicker.tsx`

**คำอธิบาย:**  
นี่คือ Date Picker มาตรฐานที่ต้องใช้ในการพัฒนาแอปพลิเคชันนี้ทั้งหมด

### 🎯 **คุณสมบัติหลัก:**

1. **Visual Calendar Interface**
   - แสดงปฏิทินแบบ Grid ที่มองเห็นภาพรวมของเดือน
   - คลิกเลือกวันที่ได้โดยตรง (ไม่ต้อง scroll dropdown)

2. **Navigation**
   - ปุ่มลูกศรซ้าย/ขวา สำหรับเปลี่ยนเดือน
   - Dropdown เลือกปี (ย้อนหลัง 100 ปี)

3. **Visual Feedback**
   - **Selected Date**: พื้นหลังสีน้ำเงิน (#2563EB)
   - **Today**: กรอบสีน้ำเงิน
   - **Disabled Dates**: สีเทาอ่อน (ไม่สามารถเลือกได้)
   - **Hover Effect**: พื้นหลังสีน้ำเงินอ่อน

4. **Thai Language Support**
   - ชื่อเดือนภาษาไทย (มกราคม, กุมภาพันธ์, ...)
   - ชื่อวันภาษาไทย (อา, จ, อ, พ, พฤ, ศ, ส)
   - ปี พ.ศ. (Buddhist Era)

5. **Quick Actions**
   - ปุ่ม "วันนี้" สำหรับกลับไปวันปัจจุบันทันที

6. **Date Constraints**
   - รองรับ `min` และ `max` props
   - Disable วันที่ที่อยู่นอกช่วง

---

### 📝 **วิธีใช้งาน:**

```tsx
import ModernDatePicker from '../components/ui/ModernDatePicker';

// ตัวอย่างการใช้งาน
<ModernDatePicker
    name="birthDate"
    value={formData.birthDate}  // Format: YYYY-MM-DD
    onChange={handleChange}
    max={today}                 // จำกัดไม่ให้เลือกวันในอนาคต
    required
    placeholder="เลือกวันเกิด"
/>
```

### 🔧 **Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | `string` | ✅ | ชื่อ field สำหรับ form |
| `value` | `string` | ✅ | ค่าวันที่ในรูปแบบ YYYY-MM-DD |
| `onChange` | `function` | ✅ | Callback function เมื่อเลือกวันที่ |
| `min` | `string` | ❌ | วันที่ต่ำสุดที่เลือกได้ (YYYY-MM-DD) |
| `max` | `string` | ❌ | วันที่สูงสุดที่เลือกได้ (YYYY-MM-DD) |
| `required` | `boolean` | ❌ | บังคับกรอก |
| `placeholder` | `string` | ❌ | ข้อความแสดงเมื่อยังไม่ได้เลือก |

---

### 🎨 **ตัวอย่าง UI:**

```
┌─────────────────────────────────────┐
│  ◄  มกราคม 2569 ▼         ►       │
├─────────────────────────────────────┤
│  อา  จ   อ   พ   พฤ  ศ   ส        │
│              1   2   3   4   5      │
│  6   7   8  [9]  10  11  12        │  ← [9] = Selected
│  13  14  15  16  17  18  19        │
│  20  21  22  23  24  25  26        │
│  27  28  29  30  31                │
├─────────────────────────────────────┤
│           [ วันนี้ ]                │
└─────────────────────────────────────┘
```

---

### ✅ **หน้าที่ใช้งานแล้ว:**

1. ✅ `Step1Identity.tsx` (Patient Registration) - ช่อง "วันเกิด"
2. ✅ `CommunityRequestRidePage.tsx` - ช่อง "วันนัดหมาย"

---

### 📌 **หน้าที่ควรอัพเดท:**

หน้าต่อไปนี้ยังใช้ `ThaiDatePicker` แบบเก่า ควรอัพเดทเป็น `ModernDatePicker`:

- [ ] `OfficeReportsPage.tsx`
- [ ] `OfficeManageRidesPage.tsx`
- [ ] `OfficeManagePatientsPage.tsx`
- [ ] `DriverHistoryPage.tsx`
- [ ] `AdminAuditLogsPage.tsx`

---

### ⚠️ **Deprecated Component:**

**`ThaiDatePicker.tsx`** - ไม่แนะนำให้ใช้ในการพัฒนาใหม่

**เหตุผล:**
- ใช้ Dropdown 3 ช่อง (วัน/เดือน/ปี) ซึ่งใช้งานยาก
- ไม่มี Visual Calendar
- UX ไม่ดีเท่า ModernDatePicker

---

## 🕐 Time Picker Component

### ✅ **Standard Component: ThaiTimePicker**

**ที่อยู่:** `d:\EMS\components\ui\ThaiTimePicker.tsx`

**คำอธิบาย:**  
Component สำหรับเลือกเวลา (ชั่วโมง:นาที) ในรูปแบบ 24 ชั่วโมง

**คุณสมบัติ:**
- Dropdown 2 ช่อง (ชั่วโมง/นาที)
- รองรับ `minTime` สำหรับจำกัดเวลาที่เลือกได้
- รูปแบบ 24 ชั่วโมง (00:00 - 23:59)

---

## 🏷️ Tag Input Component

### ✅ **Standard Component: TagInput**

**ที่อยู่:** `d:\EMS\components\ui\TagInput.tsx`

**คำอธิบาย:**  
Component สำหรับกรอกข้อมูลแบบ Tags (เช่น โรคประจำตัว, อาการแพ้)

**คุณสมบัติ:**
- เพิ่ม/ลบ tags ได้
- กด Enter หรือคลิกปุ่ม + เพื่อเพิ่ม tag
- แสดง tags เป็น chips พร้อมปุ่มลบ

---

## 🔽 Multi-Select Autocomplete

### ✅ **Standard Component: MultiSelectAutocomplete**

**ที่อยู่:** `d:\EMS\components\ui\MultiSelectAutocomplete.tsx`

**คำอธิบาย:**  
Component สำหรับเลือกหลายรายการจากตัวเลือกที่กำหนด

**คุณสมบัติ:**
- เลือกได้หลายรายการ
- มี Autocomplete/Search
- แสดงรายการที่เลือกแล้วเป็น chips

---

## 🗺️ Map Picker Component

### ✅ **Standard Component: LeafletMapPicker**

**ที่อยู่:** `d:\EMS\components\LeafletMapPicker.tsx`

**คำอธิบาย:**  
Component แผนที่สำหรับเลือกตำแหน่ง (พิกัด lat/lng) โดยใช้ **OpenStreetMap ฟรี** ไม่ต้องใช้ Google Maps API Key  
**รูปแบบเดียวกันกับ Admin Map Editor** - มีฟีเจอร์ครบถ้วนสำหรับทั้งระบบ

### 🎯 **คุณสมบัติหลัก:**

1. **Free & Open Source**
   - ใช้ OpenStreetMap (ไม่มีค่าใช้จ่าย)
   - ไม่ต้องการ API Key

2. **Multiple Map Layers**
   - 🗺️ **แผนที่ถนน** (Street Map) - OpenStreetMap
   - 🛰️ **ภาพดาวเทียม** (Satellite) - Esri World Imagery
   - 🌍 **แผนที่ภูมิประเทศ** (Terrain) - Stamen Terrain
   - 🏷️ **ป้ายชื่อ** (Labels Overlay) - CARTO Labels

3. **Interactive Features**
   - คลิกบนแผนที่เพื่อวางหมุด
   - ลากหมุดเพื่อปรับตำแหน่ง
   - Auto-center เมื่อ position prop เปลี่ยน
   - Zoom controls (+/-)
   - Layer switcher (เปลี่ยนแผนที่)

4. **Information Display**
   - แสดงพิกัด Lat/Lng แบบ real-time
   - คำแนะนำการใช้งาน
   - Coordinate precision: 6 ทศนิยม

5. **Customizable**
   - ปรับความสูงได้
   - เปิด/ปิด Layer Control
   - เปิด/ปิดคำแนะนำ
   - เปิด/ปิดเครื่องมือวาด (Drawing Tools)

6. **Drawing Tools** (Optional)
   - 📍 **Marker** - ปักหมุด
   - 📏 **Polyline** - วาดเส้น
   - 🔷 **Polygon** - วาดรูปหลายเหลี่ยม
   - ▭ **Rectangle** - วาดสี่เหลี่ยม
   - ⭕ **Circle** - วาดวงกลม
   - ✏️ **Edit** - แก้ไขรูปร่าง
   - 🗑️ **Delete** - ลบรูปร่าง

7. **Marker Popup** (รายละเอียดหมุด)
   - แสดงชื่อและคำอธิบายของหมุด
   - แสดงพิกัด Lat/Lng
   - คำแนะนำการลากหมุด
   - เปิด/ปิดได้ตาม use case

### 📝 **วิธีใช้งาน:**

#### **แบบพื้นฐาน:**
```tsx
import LeafletMapPicker from '../components/LeafletMapPicker';

<LeafletMapPicker
    position={{ lat: 19.9213, lng: 99.2131 }}
    onLocationChange={(coords) => {
        console.log('New position:', coords);
        setFormData(prev => ({
            ...prev,
            latitude: coords.lat.toString(),
            longitude: coords.lng.toString()
        }));
    }}
/>
```

#### **แบบกำหนดค่า:**
```tsx
<LeafletMapPicker
    position={{ lat: 19.9213, lng: 99.2131 }}
    onLocationChange={handleLocationChange}
    height="600px"                    // ความสูงแผนที่
    showLayerControl={true}           // แสดง Layer Control
    showInstructions={true}           // แสดงคำแนะนำ
    showDrawingTools={false}          // แสดงเครื่องมือวาด
/>
```

#### **แบบมีเครื่องมือวาด (สำหรับ Admin/Advanced Users):**
```tsx
<LeafletMapPicker
    position={{ lat: 19.9213, lng: 99.2131 }}
    onLocationChange={handleLocationChange}
    height="600px"
    showDrawingTools={true}           // เปิดใช้งานเครื่องมือวาด
/>
```

#### **แบบกำหนดรายละเอียดหมุด:**
```tsx
<LeafletMapPicker
    position={{ lat: 19.9213, lng: 99.2131 }}
    onLocationChange={handleLocationChange}
    markerTitle="🏠 บ้านคุณสมชาย"
    markerDescription="หมู่ 5 บ้านต้นหนุน ต.เวียง อ.ฝาง จ.เชียงใหม่"
    showPopup={true}                  // แสดง Popup เมื่อคลิกหมุด
/>
```

### 🔧 **Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `position` | `{ lat: number; lng: number }` | ✅ | - | ตำแหน่งปัจจุบันของหมุด |
| `onLocationChange` | `(coords: { lat: number; lng: number }) => void` | ✅ | - | Callback เมื่อตำแหน่งเปลี่ยน |
| `height` | `string` | ❌ | `'400px'` | ความสูงของแผนที่ |
| `showLayerControl` | `boolean` | ❌ | `true` | แสดง/ซ่อน Layer Control |
| `showInstructions` | `boolean` | ❌ | `true` | แสดง/ซ่อนคำแนะนำ |
| `showDrawingTools` | `boolean` | ❌ | `false` | แสดง/ซ่อนเครื่องมือวาด |
| `markerTitle` | `string` | ❌ | `'📍 ตำแหน่งที่เลือก'` | ชื่อที่แสดงใน Popup |
| `markerDescription` | `string` | ❌ | `undefined` | คำอธิบายเพิ่มเติมใน Popup |
| `showPopup` | `boolean` | ❌ | `true` | แสดง/ซ่อน Popup เมื่อคลิกหมุด |

### ✅ **หน้าที่ใช้งานแล้ว:**

1. ✅ `CommunityRegisterPatientPage.tsx` - ปักหมุดตำแหน่งที่อยู่ผู้ป่วย
2. ✅ `EditPatientModal.tsx` - แก้ไขตำแหน่งที่อยู่ผู้ป่วย

### 🎨 **ตัวอย่าง UI:**

แผนที่จะมี:
- **Layer Control** (มุมขวาบน) - เลือกแผนที่ถนน/ดาวเทียม/ภูมิประเทศ
- **Coordinate Display** (มุมซ้ายบน) - แสดงพิกัด Lat/Lng
- **Instructions** (ล่างกลาง) - คำแนะนำการใช้งาน
- **Zoom Controls** (ซ้าย) - ปุ่ม +/- ซูม
- **Marker** (กลาง) - หมุดที่ลากได้

### ⚠️ **Deprecated Component:**

**`MapTest.tsx`** - ไม่แนะนำให้ใช้ในการพัฒนาใหม่

**เหตุผล:**
- ต้องการ Google Maps API Key (มีค่าใช้จ่าย)
- ไม่สามารถใช้งานได้หาก API Key หมดอายุ
- ไม่มี Layer Control และฟีเจอร์ขั้นสูง
- LeafletMapPicker ใช้งานได้ฟรีและมีฟีเจอร์ครบถ้วนกว่า

---

## 📐 Best Practices

### 1. **Consistency (ความสม่ำเสมอ)**
- ใช้ Component เดียวกันทั้งแอป
- ไม่ควรมี Date Picker หลายแบบในแอปเดียวกัน

### 2. **Accessibility (การเข้าถึง)**
- ใส่ `label` ทุก input field
- ใช้ `required` attribute เมื่อจำเป็น
- ใส่ `placeholder` ที่ชัดเจน

### 3. **User Experience**
- ใช้ Visual Components เมื่อเป็นไปได้
- ให้ Feedback ที่ชัดเจน (hover, selected, disabled states)
- รองรับ Keyboard Navigation

### 4. **Thai Language**
- ใช้ภาษาไทยในทุก UI Text
- แสดงวันที่/เวลาในรูปแบบไทย
- ใช้ปี พ.ศ. แทน ค.ศ.

---

## 🔄 Migration Guide

### จาก ThaiDatePicker → ModernDatePicker

**Before:**
```tsx
import ThaiDatePicker from '../components/ui/ThaiDatePicker';

<ThaiDatePicker
    name="dob"
    value={formData.dob}
    onChange={handleChange}
    max={today}
    required
/>
```

**After:**
```tsx
import ModernDatePicker from '../components/ui/ModernDatePicker';

<ModernDatePicker
    name="dob"
    value={formData.dob}
    onChange={handleChange}
    max={today}
    required
    placeholder="เลือกวันเกิด"  // เพิ่ม placeholder
/>
```

---

## 📞 Support

หากพบปัญหาหรือต้องการปรับปรุง Component:
1. สร้าง Issue ใน Project Repository
2. ติดต่อ Development Team
3. อ้างอิงเอกสารนี้ในการพัฒนา

---

**เอกสารนี้อัพเดทล่าสุด:** 2026-01-01  
**ผู้จัดทำ:** Antigravity AI Assistant  
**Version:** 1.0
