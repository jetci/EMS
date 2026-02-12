# แผนปรับปรุงโครงสร้างโปรเจกต์ (Project Structure Improvement Plan)

เอกสารนี้เสนอแผนการจัดระเบียบโครงสร้างโปรเจกต์ EMS เพื่อลดความซ้ำซ้อนและเพิ่มความเป็นระเบียบ โดยยึดหลัก **"ไม่กระทบโครงสร้างหลักที่ใช้งานอยู่" (Non-destructive Refactoring)**

## 1. สถานะปัจจุบันและปัญหาที่พบ (Current State & Issues)

จากการตรวจสอบโครงสร้างไฟล์ พบประเด็นที่ควรปรับปรุงดังนี้:

1.  **Root Directory แออัด**: มีไฟล์ Report (`.md`) เก่าจำนวนมาก และ Script (`.ps1`, `.py`, `.js`) ปะปนกับ Source Code
2.  **ความซ้ำซ้อนของ Components**: มีโฟลเดอร์ `components` ที่ Root (หลัก) และ `src/components` (ย่อย) ซึ่งอาจทำให้สับสน
3.  **Alias Path ไม่ตรงกัน**: 
    - `tsconfig.json` กำหนด `@` -> Root (`./`)
    - `vite.config.ts` กำหนด `@` -> `src` (`./src`)
    - ความเสี่ยง: อาจเกิด Import Error หากมีการย้ายไฟล์หรือใช้งาน Alias นี้จริงจัง
4.  **ไฟล์แปลกปลอมใน Source**: พบไฟล์ Python (`main.py`, `seed_data.py`) ในโฟลเดอร์ `src` ของ Frontend ซึ่งควรเป็นที่อยู่ของ React Code เท่านั้น

---

## 2. แผนการดำเนินงาน (Action Plan)

### ระยะที่ 1: จัดระเบียบ (Housekeeping) - *ทำได้ทันที ไม่กระทบ Code*
การจัดหมวดหมู่ไฟล์ที่ Root ให้เป้นระเบียบ

*   [ ] **ย้ายเอกสาร**: สร้างโฟลเดอร์ `docs/reports` และย้ายไฟล์ `.md` ที่เป็นบันทึกการทำงานเก่าๆ เข้าไป (เก็บ `README.md` และเอกสารสำคัญล่าสุดไว้ที่เดิม)
*   [ ] **ย้าย Scripts**: สร้างโฟลเดอร์ `scripts` หรือ `dev-tools/scripts` เพื่อรวบรวมไฟล์ `.ps1`, `.py`, `.js` ที่ใช้สำหรับ Maintenance/Test

### ระยะที่ 2: แก้ไขและป้องกันข้อผิดพลาด (Configuration Fixes)
ปรับปรุงการตั้งค่าเพื่อลดความเสี่ยงในอนาคต

*   [ ] **ปรับ Alias Path**: แก้ไข `vite.config.ts` และ `tsconfig.json` ให้สอดคล้องกัน
    *   *ข้อเสนอ*: ให้ `@` ชี้ไปที่ `src` (Standard) และเพิ่ม Alias `@root` หรือ `@components` หากจำเป็นต้องอ้างอิงไฟล์นอก src
*   [ ] **ลบไฟล์ส่วนเกิน**: ย้ายไฟล์ Python ใน `d:\EMS\src` ไปยัง `scripts` หรือโฟลเดอร์ Backend

### ระยะที่ 3: รวมศูนย์ Components (Consolidation) - *Optional*
เนื่องจาก `src/components` มีไฟล์จำนวนน้อยและถูกใช้น้อย การรวมเข้ากับ `components` หลักจะช่วยลดความสับสน

*   [ ] **ย้ายไฟล์**: ย้าย `LoadingSpinner.tsx`, `Pagination.tsx`, `EmptyState.tsx` จาก `src/components` ไปยัง `components/ui` หรือ `components/common`
*   [ ] **อัปเดต Import**: แก้ไขไฟล์ที่เรียกใช้ (เช่น `MapTest.tsx`) ให้ชี้ไปที่ตำแหน่งใหม่
*   [ ] **ลบโฟลเดอร์**: ลบ `src/components` ทิ้ง

---

## 3. โครงสร้างเป้าหมาย (Target Structure)

```text
d:\EMS\
├── .agent/             # Agent Workflows
├── .github/            # GitHub Actions
├── components/         # [MAIN] UI Components (รวมจาก src/components แล้ว)
├── docs/               # [NEW] Documentation & Reports
│   └── reports/        #      - Archived MD files
├── scripts/            # [NEW] Utility Scripts (.ps1, .py, .js)
├── src/                # Frontend Source Logic
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   └── (No python files)
├── wecare-backend/     # Backend Node.js
├── App.tsx             # Entry Component
├── index.tsx           # Entry Point
├── vite.config.ts
└── tsconfig.json
```

## 4. ข้อดีของแผนนี้
1.  **ปลอดภัย**: ไม่มีการย้ายไฟล์หลักอย่าง `App.tsx` หรือ `components` ใหญ่ๆ ซึ่งลดความเสี่ยง App พัง
2.  **สะอาด**: Root Directory จะดูแลง่ายขึ้นมาทันที
3.  **ชัดเจน**: ทีมพัฒนาจะไม่งงว่าต้องสร้าง Component ใหม่ที่ไหน (ที่ `components` ที่เดียว)
