# รายงานจากทีม M → ส่งให้ทีม W

วันที่/เวลา: 2026-01-04T03:52:22Z

รายงานจาก: ทีม M

เรียน ทีม W,

ด้านล่างเป็นรายการข้อบกพร่องและความเสี่ยงที่ทีม M ตรวจพบจากการวิเคราะห์โค้ดและสคริปต์ audit (ไฟล์อ้างอิง: `wecare-backend/db_audit_report.json`). โปรดดำเนินการแก้ไขตามคำแนะนำ แล้วแจ้งทีม M เมื่องานเสร็จ เพื่อที่ทีม M จะส่งต่อให้ทีม G ทดสอบต่อ

| Module / Endpoint / Component | Issue Summary | Steps to Reproduce | Severity | Suggested Fix |
|---|---|---|---:|---|
| `system` / POST `/api/admin/system/reset-db` | ใช้ dynamic interpolation เพื่อ `DROP TABLE IF EXISTS ${table.name}` — หากชื่อ table มาจากข้อมูลที่ไม่ได้ validate อาจถูกนำไปใช้ทำลายฐานข้อมูล | (1) เป็น `admin` หรือ `DEVELOPER` (2) POST ไปยัง `/api/admin/system/reset-db` → จะ drop ตารางทั้งหมด | Critical / High | ห้ามใช้ template interpolation โดยตรง. ใช้ whitelist ของชื่อตารางเท่านั้น เช่น loop ผ่านรายการที่อนุญาตแล้วเรียก `DROP TABLE IF EXISTS 'tableName'` ด้วย quoting. เพิ่ม double-confirmation/feature-flag (เฉพาะ dev) และจำกัด endpoint ด้วย 2FA + audit trail. |
| `db/sqliteDB.findAll` (helper) | ฟังก์ชัน `findAll(table, where?)` รับ WHERE เป็น string — caller อาจส่ง string ที่ประกอบด้วย input ของผู้ใช้ → SQL injection risk | เรียก `sqliteDB.findAll('patients', "name = '" + userInput + "'")` (ตัวอย่าง) | High | เปลี่ยน API ให้รับ parameterized where clause: `findAll(table, whereClause, params[])` และบังคับใช้ prepared statements. เพิ่ม validation/whitelist ของ column names and tables. |
| Multiple routes (e.g., `patients.ts`, `rides.ts`, `reports.ts`, `dashboard.ts`, `news.ts`) | พบการใช้ template strings / multi-line template ที่มี `${...}` ภายใน SQL-like strings — static-audit flagged as high-risk (บางกรณีเป็น false-positive แต่ต้องตรวจสอบ) | ตรวจสอบโค้ดในแต่ละไฟล์ที่มี `` `...${...}...` `` และหาแหล่งที่มาของตัวแปรที่ถูกแทรก | High / Medium | ตรวจโค้ดแบบแมนนวล: แทนการประกอบ SQL เป็น string ให้ใช้ `db.prepare(sql).get(params)` หรือ `?` placeholders. หากต้อง dynamic column/building เงื่อนไข ให้ sanitize column names และใช้ params array. เพิ่ม linter rule (no-sql-template-interpolation). |
| Query performance (index heuristics) | static-audit พบคอลัมน์หลายตัวที่ใช้ใน WHERE/ORDER BY แต่ไม่พบ index ใน schema parse — อาจทำให้ query ช้าบนข้อมูลใหญ่ | เรียก endpoint ที่เกี่ยวข้องกับ dataset ขนาดใหญ่ (เช่น GET `/api/rides` กับหลายพันแถว) และรัน `EXPLAIN QUERY PLAN` | Medium | รัน `EXPLAIN QUERY PLAN` สำหรับ query จริง เพิ่ม indexes บนคอลัมน์ที่ใช้บ่อย เช่น `created_by`, `appointment_time`, `driver_id`. Monitor slow queries and add metrics. |
| Authorization checks (Role-based pages/API) | จำเป็นต้องยืนยันว่าแต่ละ API/page ถูกป้องกันตามสิทธิ์ทั้ง 8 roles — มีความเสี่ยงด้าน authorization gaps | สร้าง user สำหรับแต่ละ role → พยายามเข้าถึง endpoint/page ที่ไม่ควรเข้าถึง | High | เพิ่ม automated E2E tests (Playwright) สำหรับทุก role ครอบคลุม: view/edit/delete rides, manage patients, assign drivers. เพิ่ม unit tests สำหรับ middleware `requireRole`/`authenticateToken`. |
| UI components: `LeafletMapPicker` / drawing tools | ไม่มี automated tests ครอบคลุม interactive features (marker placement, drag, drawing, popup) — ความเสี่ยง: regression และ UX bugs | Manual: เปิดหน้า edit patient → ปักหมุด/ลาก/วาด polyline → ตรวจ callback | Medium | เพิ่ม Playwright scenarios: marker placement, drag, edit shapes, onLocationChange assertions. เพิ่ม unit tests for prop handling and accessibility checks. |

Security flags (ต้องรีบแก้ไข):

- `system.reset-db` — Critical: สามารถลบตารางได้ถ้า bypassed/misused. ต้องแก้ก่อน deploy to production.
- `findAll`/raw WHERE strings — High: เปิดความเสี่ยง SQL Injection หากมีการส่งเงื่อนไขจาก UI โดยตรง.

ขั้นตอนที่ทีม M คาดหวังจากทีม W:
1. แก้ไขโค้ดตาม Suggested Fix ข้างต้น (รายการที่ **Critical/High** เป็นลำดับความสำคัญ) รายละเอียดการแก้ไขโปรด commit เป็น PR ที่อ้างอิง issue ID นี้
2. แจ้งทีม M เมื่อ PR พร้อมสำหรับ verification (include branch nameและ short summary ของการเปลี่ยนแปลง)
3. ทีม M จะทำ static re-scan และรัน test scaffold แล้วส่งต่อให้ทีม G สำหรับ E2E verification

ไฟล์อ้างอิงที่ทีม M ใช้ในการวิเคราะห์:
- `wecare-backend/db/schema.sql`
- `wecare-backend/src/db/sqliteDB.ts`
- `wecare-backend/src/routes/system.ts`
- `wecare-backend/db_audit_report.json`

ขอให้ทีม W ระบุ ETA สำหรับแต่ละรายการ major fix (critical/high) แล้วส่งมาที่ทีม M

ด้วยความเคารพ,

ทีม M
