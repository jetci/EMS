# EMS WeCare — Role-Based Workflow Guide

เอกสารนี้เป็นคู่มือกระบวนการทำงานแบบ Step-by-Step สำหรับแต่ละบทบาทในระบบ EMS WeCare (ใช้สำหรับพัฒนา ทดสอบ และตรวจยืนยันเมื่อระบบออนไลน์)

โครงสร้างของแต่ละบทบาท:
- ภาพรวมหน้าที่
- ข้อมูลเตรียมการ (preconditions, test accounts)
- ขั้นตอนการทำงาน (UI / API) ทีละขั้นตอน
- Endpoint สำคัญที่ต้องตรวจสอบ
- การตรวจสอบด้านความปลอดภัยเฉพาะบทบาท
- ข้อมูลทดสอบตัวอย่าง
- ขั้นตอน Regression / Automation ที่แนะนำ

---

## บทบาท: DEVELOPER

### ภาพรวม
ผู้พัฒนาเข้าถึงเครื่องมือระบบ (ระบบ logs, system settings, audit rebuild) และฟังก์ชันสำหรับการดูแลระบบ

### Preconditions
- บัญชี: `dev@wecare.ems` (role: DEVELOPER) หรือบัญชีที่มี role `DEVELOPER`
- Token: ได้รับ JWT (ตรวจสอบ expiration)

### ขั้นตอนการทำงาน (UI)
1. เข้าสู่ระบบที่หน้า `/login` ด้วยบัญชี Developer
2. เปิดเมนู `Developer Dashboard` จาก `AuthenticatedLayout`
3. ตรวจสอบ `System Logs` และเรียก `Rebuild Audit Chain` ถ้าจำเป็น
4. เปิด `Test Map` หรือ `Test Unified Radio` สำหรับ debug

### ขั้นตอนการทำงาน (API)
1. GET `/auth/me` — ยืนยันข้อมูล user และ role
2. GET `/audit-logs` (ต้องเป็น `DEVELOPER` หรือ `ADMIN`) — ตรวจสอบ entries
3. POST `/audit-logs/rebuild-chain` หรือ endpoint `rebuild-chain` (เฉพาะ DEVELOPER)
4. POST `/system/reset-db` (เฉพาะ DEV/ADMIN) — ใช้ในสภาพแวดล้อม dev เท่านั้น

### Security checks
- ยืนยัน `requireRole(['DEVELOPER','admin'])` ถูกบังคับ server-side
- ยืนยัน `JWT_SECRET` ไม่ถูก hard-coded และ token blacklist ทำงาน

### Test data / ตัวอย่างคำสั่ง
- Login: curl POST `/auth/login` with sample dev credentials

### Regression / Automation
- Integration: Supertest for `/system/*` routes using mocked JWT (DEVELOPER vs COMMUNITY)
- Unit: test `requireRole` middleware behavior

---

## บทบาท: ADMIN

### ภาพรวม
จัดการผู้ใช้, การตั้งค่าระบบ, audit logs และดูรายงานระดับสูง

### Preconditions
- บัญชี: `admin@wecare.ems` (role: ADMIN)
- ตรวจสอบว่า audit logging และ settings endpoints ใช้งานได้

### ขั้นตอนการทำงาน (UI)
1. Login -> เปิด `Admin Dashboard`
2. ไปที่ `Manage Users` -> สร้างผู้ใช้ใหม่ (POST /users)
3. แก้ไข/รีเซ็ตรหัสผ่านผู้ใช้ (PUT /users/:id, POST /users/:id/reset-password)
4. ตรวจสอบ `System Settings` และ `Audit Logs`

### Endpoint สำคัญ
- GET/POST/PUT/DELETE `/users` (ต้องเป็น ADMIN/DEVELOPER)
- GET `/audit-logs` (ADMIN/DEVELOPER)
- GET/PUT `/settings` (ADMIN/DEVELOPER)

### Security checks
- Server must reject role escalation from non-admin payloads (e.g., OFFICER POST trying to set role=ADMIN)
- Ensure audit log entries recorded for create/update/delete user

### Test data / ตัวอย่าง
- สร้างผู้ใช้ตัวอย่าง: role=OFFICER, ตรวจสอบว่ไม่สามารถตั้ง role=ADMIN ได้จากบัญชี OFFICER

### Regression / Automation
- Integration tests: CRUD `/users` with tokens for ADMIN (expect 200) and OFFICER (expect 403)
- Add assertion that audit_logs contains corresponding action entries

---

## บทบาท: OFFICER

### ภาพรวม
บริหารจัดการการรับ-ส่งผู้ป่วย, มอบหมาย ride, ดูตารางงานและสรุปรายงาน

### Preconditions
- บัญชี: Officer (role: OFFICER)
- มีข้อมูล patients และ drivers ที่พร้อมทดสอบ

### ขั้นตอนการทำงาน (UI)
1. Login -> `Office Dashboard`
2. ไปที่ `Manage Rides` -> เปิดรายการ ride ที่สถานะ `PENDING`
3. เลือก ride -> Assign to driver (ตรวจสอบรายชื่อ driver ที่ `AVAILABLE`)
4. ยืนยันสถานะ ride เปลี่ยนเป็น `ASSIGNED` และตรวจสอบ event logs

### Endpoint สำคัญ
- GET `/rides` (authenticated)
- POST `/rides/:id/assign` (หรือ equivalent logic via PUT `/rides/:id`)
- POST `/ride-events` เพื่อสร้าง event (server-side logging)

### Security & Concurrency checks
- ตรวจสอบ transactionality: การมอบหมายต้องใช้ DB transaction เพื่อหลีกเลี่ยง double-assign
- ตรวจสอบ `requireRole` และว่าการกระทำนี้ไม่สามารถทำได้โดย `COMMUNITY`

### Test data
- สร้าง ride ตัวอย่าง (patient_id, appointment_time)
- สร้าง driver สองคน, ทดสอบ concurrent assign

### Regression / Automation
- E2E: Playwright flow สำหรับการ assign ride และยืนยันสถานะใน DB
- Load: simulate concurrent assign requests (k6)

---

## บทบาท: RADIO / RADIO_CENTER

### ภาพรวม
จัดการการสื่อสาร realtime, map command, รับ/ส่ง notification และติดตาม driver

### Preconditions
- Socket server ต้องเปิดและตรวจสอบ auth

### ขั้นตอนการทำงาน (UI)
1. Login -> `Radio Dashboard` หรือ `Radio Center`
2. เปิด `Map Command` -> ดูตำแหน่งรถ, ฟีลเตอร์ตามทีม/สถานะ
3. รับ notification realtime และตอบกลับหรือส่งคำสั่งมอบหมาย

### Endpoint / Socket events
- HTTP: GET `/driver-locations`, GET `/ride-events`
- Socket: emit `location:update`, on `location:updated`, `notification:new`, `driver:status:updated`

### Security checks
- ยืนยันว่า socket handshake ต้องการ JWT และ server ตรวจ role ก่อนอนุญาตเหตุการณ์ที่สำคัญ
- ตรวจสอบ role validation server-side สำหรับ privileged socket actions

### Test data
- Simulate driver socket connections (mock token), ส่ง `location:update`

### Regression / Automation
- Unit: socket auth middleware tests
- Integration: spin up backend + socket and run Playwright or node-based socket client tests

---

## บทบาท: DRIVER

### ภาพรวม
รับงานในแอป, แชร์ตำแหน่งแบบ realtime, ดูประวัติการวิ่งงาน

### Preconditions
- บัญชี: DRIVER ที่มี `driver_id` ใน token (มี mapping ใน DB)

### Workflow (UI)
1. Login -> `Today Jobs`
2. รับงาน (Accept) -> เปลี่ยน status เป็น `IN_PROGRESS`
3. ส่งตำแหน่งแบบ realtime (`location:update`) ขณะปฏิบัติงาน
4. ทำการ `Complete` เมื่อสิ้นสุด -> ตรวจสอบ `trip` ใน History

### Endpoint / Socket
- POST /rides/:id/accept (หรือ PUT update)
- Socket: emit `location:update` (ack now/then)

### Security checks
- Server must verify `req.user.driver_id` matches the driver performing actions on that driver resource
- Rate-limit location updates and sanitize lat/lng

### Test data
- Create ride assigned to driver; test accept/complete flows

### Regression / Automation
- Integration: driver client simulation (socket + API) accepting/completing ride
- Load: high-frequency location updates

---

## บทบาท: COMMUNITY

### ภาพรวม
สมาชิกชุมชนลงทะเบียนผู้ป่วย, ขอรับบริการ (request ride), ดูสถานะการนัด

### Preconditions
- บัญชี: COMMUNITY หรือ public registration

### Workflow (UI)
1. Register / Login
2. Register patient (form) -> POST `/patients`
3. Request ride -> POST `/rides` (patient_id, pickup, destination)
4. ตรวจสอบสถานะ ride ในหน้า `Manage Rides`
### Endpoint สำคัญ
- POST `/patients` (create)
- POST `/rides` (create)
- GET `/rides` (by creator)

### Security checks
- CSRF protection for form submissions
- Rate limiting for public registration and ride creation
- Input validation via Joi (confirm presence on routes)

### Test data
- Create patient with minimal required fields; attempt invalid submissions

### Regression / Automation
- Playwright user flow for register -> request ride -> verify notifications

---

## บทบาท: EXECUTIVE

### ภาพรวม
ดูรายงานสรุปองค์กร, export ข้อมูล

### Preconditions
- บัญชี: EXECUTIVE

### Workflow (UI)
1. Login -> `Executive Dashboard`
2. เปิด Reports -> Run filters -> Export `/reports/export`
3. ตรวจสอบไฟล์ export (CSV/PDF) ว่ามี column ที่ถูกต้องและข้อมูล PII ถูกจัดการตามนโยบาย

### Security checks
- Ensure `/reports/export` restricted to `EXECUTIVE, ADMIN, DEVELOPER`
- Ensure export pipeline masks/sanitizes sensitive fields when necessary

### Regression / Automation
- Integration test calling `/reports/export` and validating columns and sample rows

---

## ส่วนเพิ่มเติม: การใช้งานคู่มือนี้ในขั้นตอนออนไลน์ (DevOps / CI)
- เปิดบริการ backend และ frontend ใน staging (isolated environment)
- รัน seed database (สีเดียวกับ production dataset size samples)
- รันชุด Integration tests (Supertest) และ E2E (Playwright)
- ตรวจสอบ audit_logs chain integrity หลังการทดสอบที่มีการเปลี่ยนแปลงข้อมูล

---

ไฟล์นี้สร้างเป็นเริ่มต้นสำหรับทีม QA/Dev เพื่อขยายเป็น:
- Postman collection / OpenAPI examples
- ตัวอย่างสคริปต์ integration tests (Jest + Supertest)
- Playwright E2E scenarios per-role

ผมสร้างไฟล์นี้ที่: [wecare-qa/role-workflows.md](wecare-qa/role-workflows.md)

ถัดไปผมสามารถ:
- สร้าง Postman collection และตัวอย่าง `curl` สำหรับทุก flow
- หรือเริ่มเขียนชุด Integration tests สำหรับ 3 endpoint สำคัญที่ต้องการ (แจ้งชื่อ endpoints ที่ต้องการก่อน)

บอกผมเลยว่าต้องการให้ผมทำขั้นตอนถัดไปแบบไหน (สร้าง collection, เขียน tests, เพิ่ม payloads, หรือ commit เปลี่ยนแปลง) และผมจะดำเนินการต่อทันทีครับ।