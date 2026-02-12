# โครงสร้างแอปพลิเคชัน EMS WeCare

**วันที่จัดทำ**: 16 มกราคม 2569  
**เวอร์ชัน**: 4.0  
**สถานะ**: ใช้งานจริง (Production Ready)

---

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [สถาปัตยกรรมระบบ](#สถาปัตยกรรมระบบ)
3. [โครงสร้างโฟลเดอร์](#โครงสร้างโฟลเดอร์)
4. [โมดูลหลัก](#โมดูลหลัก)
5. [ฐานข้อมูล](#ฐานข้อมูล)
6. [API Endpoints](#api-endpoints)
7. [การไหลของข้อมูล](#การไหลของข้อมูล)

---

## 🎯 ภาพรวมระบบ

### วัตถุประสงค์
ระบบบริหารจัดการรถพยาบาลฉุกเฉิน (Emergency Medical Services) สำหรับการจัดการ:
- การเรียกรถพยาบาล
- การจัดส่งคนขับ
- การติดตามสถานะ Real-time
- การจัดการข้อมูลผู้ป่วย

### ผู้ใช้งานหลัก (User Roles)
1. **Community (ประชาชน/อาสา)** - ลงทะเบียนผู้ป่วย, เรียกรถ
2. **Officer/Radio Center (ศูนย์วิทยุ)** - รับแจ้งเหตุ, จ่ายงาน
3. **Driver (คนขับรถ)** - รับงาน, อัปเดตสถานะ
4. **Admin (ผู้ดูแลระบบ)** - จัดการผู้ใช้, ตั้งค่า
5. **Executive (ผู้บริหาร)** - ดูรายงาน, วิเคราะห์ข้อมูล
6. **Developer (นักพัฒนา)** - ดู Logs, Debug

---

## 🏗️ สถาปัตยกรรมระบบ

### แบบจำลอง (Architecture Pattern)
```
┌─────────────────────────────────────────────────┐
│              Frontend (React SPA)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Pages   │  │Components│  │ Services │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
                      ↕ HTTP/REST + Socket.io
┌─────────────────────────────────────────────────┐
│           Backend (Node.js + Express)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Routes  │  │Middleware│  │ Services │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
                      ↕ SQL Queries
┌─────────────────────────────────────────────────┐
│            Database (SQLite)                    │
│  13 Tables + Indexes + Foreign Keys            │
└─────────────────────────────────────────────────┘
```

### เทคโนโลยีที่ใช้

#### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router DOM v7
- **Maps**: Leaflet + React-Leaflet
- **Styling**: Tailwind CSS + Vanilla CSS
- **Real-time**: Socket.io-client
- **Date/Time**: Dayjs

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js + TypeScript
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT + Bcrypt
- **Security**: Helmet, CORS, CSURF
- **Validation**: Express-validator, Joi
- **Real-time**: Socket.io

---

## 📁 โครงสร้างโฟลเดอร์

### Frontend (`d:\EMS`)
```
EMS/
├── src/
│   ├── pages/              # หน้าจอหลักทั้งหมด (34 ไฟล์)
│   │   ├── CommunityDashboard.tsx
│   │   ├── CommunityRegisterPatientPage.tsx
│   │   ├── CommunityRequestRidePage.tsx
│   │   ├── ManagePatientsPage.tsx
│   │   ├── ManageRidesPage.tsx
│   │   ├── DriverTodayJobsPage.tsx
│   │   ├── OfficeDashboard.tsx
│   │   ├── AdminDashboardPage.tsx
│   │   └── ... (26 ไฟล์อื่นๆ)
│   │
│   ├── services/           # API Services
│   │   ├── api.ts          # Centralized API client
│   │   ├── geminiService.ts # AI Route Optimization
│   │   ├── socketService.ts # Real-time updates
│   │   └── dashboardService.ts
│   │
│   ├── utils/              # Utility Functions
│   │   ├── mappers.ts      # DB ↔ Domain mapping
│   │   ├── dateUtils.ts    # Date formatting
│   │   └── validation.ts   # Input validation
│   │
│   └── static/             # Legacy/Static files
│
├── components/             # Reusable Components (167 ไฟล์)
│   ├── layout/
│   │   ├── AuthenticatedLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopHeader.tsx
│   ├── modals/
│   ├── ui/
│   ├── icons/
│   └── driver/
│
├── types.ts                # TypeScript Interfaces
├── App.tsx                 # Root Component
├── index.html              # HTML Entry
└── vite.config.ts          # Vite Configuration
```

### Backend (`d:\EMS\wecare-backend`)
```
wecare-backend/
├── src/
│   ├── index.ts            # Server Entry Point
│   │
│   ├── routes/             # API Routes (21 ไฟล์)
│   │   ├── auth.ts         # Login, Register
│   │   ├── patients.ts     # Patient CRUD
│   │   ├── rides.ts        # Ride Management
│   │   ├── drivers.ts      # Driver Management
│   │   └── ...
│   │
│   ├── middleware/         # Middleware (10 ไฟล์)
│   │   ├── auth.ts         # JWT Verification
│   │   ├── rbac.ts         # Role-Based Access Control
│   │   ├── validation.ts   # Input Validation
│   │   └── errorHandler.ts
│   │
│   ├── services/           # Business Logic
│   │   ├── patientService.ts
│   │   ├── rideService.ts
│   │   └── ...
│   │
│   ├── db/                 # Database Layer
│   │   ├── connection.ts   # SQLite Connection
│   │   ├── queries.ts      # SQL Queries
│   │   └── migrations/     # Schema Migrations
│   │
│   └── utils/              # Utilities
│       ├── logger.ts
│       └── helpers.ts
│
├── db/
│   ├── wecare.db           # SQLite Database File
│   ├── schema.sql          # Database Schema
│   └── data/               # Seed Data (JSON)
│
└── scripts/                # Utility Scripts
    ├── check-schema.js
    └── verify-patient-type.js
```

---

## 🧩 โมดูลหลัก (Core Modules)

### 1. Community Module (โมดูลประชาชน)
**หน้าจอ**:
- `CommunityDashboard.tsx` - แดชบอร์ดหลัก
- `CommunityRegisterPatientPage.tsx` - ลงทะเบียนผู้ป่วย (5 ขั้นตอน)
- `CommunityRequestRidePage.tsx` - เรียกรถพยาบาล
- `ManagePatientsPage.tsx` - จัดการข้อมูลผู้ป่วย
- `ManageRidesPage.tsx` - ดูสถานะการเดินทาง
- `PatientDetailPage.tsx` - รายละเอียดผู้ป่วย

**ฟีเจอร์หลัก**:
- ✅ ลงทะเบียนผู้ป่วยแบบ Wizard 5 ขั้นตอน
- ✅ อัปโหลดรูปภาพและเอกสาร
- ✅ เลือกตำแหน่งบนแผนที่
- ✅ Auto-populate ข้อมูลผู้ป่วยเมื่อเรียกรถ
- ✅ Data Isolation (เห็นเฉพาะข้อมูลของตัวเอง)

### 2. Officer/Radio Center Module (โมดูลศูนย์วิทยุ)
**หน้าจอ**:
- `OfficeDashboard.tsx` - แดชบอร์ดศูนย์ควบคุม
- `OfficeManageRidesPage.tsx` - จัดการคำขอทั้งหมด
- `OfficeManagePatientsPage.tsx` - จัดการผู้ป่วย
- `OfficeManageDriversPage.tsx` - จัดการคนขับ
- `MapCommandPage.tsx` - แผนที่ควบคุม Real-time

**ฟีเจอร์หลัก**:
- ✅ รับแจ้งเหตุ Real-time (Socket.io)
- ✅ จ่ายงานให้คนขับ (Dispatch)
- ✅ ติดตามตำแหน่งรถ Real-time
- ✅ จัดการข้อมูลผู้ป่วยและคนขับ

### 3. Driver Module (โมดูลคนขับ)
**หน้าจอ**:
- `DriverTodayJobsPage.tsx` - งานวันนี้
- `DriverHistoryPage.tsx` - ประวัติการทำงาน
- `DriverProfilePage.tsx` - โปรไฟล์

**ฟีเจอร์หลัก**:
- ✅ รับงานและอัปเดตสถานะ
- ✅ AI Route Optimization (Gemini)
- ✅ ส่งตำแหน่ง Real-time
- ✅ ดูปฏิทินงาน

### 4. Admin Module (โมดูลผู้ดูแลระบบ)
**หน้าจอ**:
- `AdminDashboardPage.tsx` - แดชบอร์ดผู้ดูแล
- `AdminUserManagementPage.tsx` - จัดการผู้ใช้
- `AdminAuditLogsPage.tsx` - ดู Audit Logs
- `AdminSystemSettingsPage.tsx` - ตั้งค่าระบบ

**ฟีเจอร์หลัก**:
- ✅ CRUD ผู้ใช้ทุก Role
- ✅ ดู Audit Logs พร้อม Hash Chain
- ✅ ตั้งค่า Google Maps API Key
- ✅ จัดการข่าวสาร

### 5. Executive Module (โมดูลผู้บริหาร)
**หน้าจอ**:
- `ExecutiveDashboardPage.tsx` - Dashboard สำหรับผู้บริหาร

**ฟีเจอร์หลัก**:
- ✅ รายงานสถิติ
- ✅ กราฟวิเคราะห์
- ✅ Export ข้อมูล

---

## 🗄️ ฐานข้อมูล

### ระบบฐานข้อมูล
- **Engine**: SQLite
- **Library**: better-sqlite3
- **ไฟล์**: `wecare-backend/db/wecare.db`
- **Schema**: `wecare-backend/db/schema.sql`

### ตารางหลัก (13 ตาราง)

#### 1. users
```sql
- id (TEXT, PK)
- email (TEXT, UNIQUE)
- password (TEXT, hashed)
- role (TEXT: DEVELOPER, admin, OFFICER, driver, community, EXECUTIVE)
- full_name (TEXT)
- status (TEXT: Active, Inactive)
```

#### 2. patients
```sql
- id (TEXT, PK)
- full_name (TEXT)
- national_id (TEXT, UNIQUE)
- dob (TEXT)
- age (INTEGER)
- gender (TEXT)
- blood_type, rh_factor, health_coverage
- contact_phone (TEXT)
- id_card_* (ที่อยู่ตามบัตรประชาชน)
- current_* (ที่อยู่ปัจจุบัน)
- latitude, longitude (TEXT)
- patient_types (JSON)
- chronic_diseases (JSON)
- allergies (JSON)
- profile_image_url (TEXT)
- created_by (FK → users.id)
```

#### 3. rides
```sql
- id (TEXT, PK)
- patient_id (FK → patients.id)
- patient_name, patient_phone
- driver_id (FK → drivers.id)
- driver_name
- pickup_location, destination
- pickup_lat, pickup_lng
- appointment_time
- status (PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED)
- trip_type, special_needs (JSON)
- created_by (FK → users.id)
```

#### 4. drivers
```sql
- id (TEXT, PK)
- user_id (FK → users.id)
- full_name, phone
- license_number, license_expiry
- status (AVAILABLE, ON_DUTY, OFF_DUTY)
- total_trips, trips_this_month
```

#### 5. vehicles
```sql
- id (TEXT, PK)
- license_plate (UNIQUE)
- vehicle_type_id (FK)
- brand, model, year, color
- status (AVAILABLE, IN_USE, MAINTENANCE)
```

#### 6. audit_logs (พร้อม Hash Chain)
```sql
- id (INTEGER, PK, AUTOINCREMENT)
- user_id, user_email, user_role
- action (TEXT)
- resource_type, resource_id
- details (JSON)
- timestamp (TEXT)
- hash (TEXT) - SHA-256 ของ log นี้
- previous_hash (TEXT) - Hash ของ log ก่อนหน้า
- sequence_number (INTEGER)
```

**ตารางอื่นๆ**: teams, news, vehicle_types, ride_events, driver_locations, map_data, system_settings

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login          - เข้าสู่ระบบ
POST   /api/auth/register       - ลงทะเบียน
GET    /api/auth/me             - ดูโปรไฟล์
PUT    /api/auth/profile        - แก้ไขโปรไฟล์
POST   /api/auth/change-password - เปลี่ยนรหัสผ่าน
```

### Patients
```
GET    /api/patients            - ดูรายการผู้ป่วย (พร้อม Pagination)
GET    /api/patients/:id        - ดูรายละเอียดผู้ป่วย
POST   /api/patients            - สร้างผู้ป่วยใหม่
PUT    /api/patients/:id        - แก้ไขข้อมูลผู้ป่วย
DELETE /api/patients/:id        - ลบผู้ป่วย
```

### Rides
```
GET    /api/rides               - ดูรายการ Rides (พร้อม Pagination)
GET    /api/rides/:id           - ดูรายละเอียด Ride
POST   /api/rides               - สร้าง Ride ใหม่
PUT    /api/rides/:id           - อัปเดตสถานะ Ride
DELETE /api/rides/:id           - ยกเลิก Ride
```

### Drivers
```
GET    /api/drivers             - ดูรายการคนขับ
GET    /api/drivers/available   - ดูคนขับที่ว่าง
GET    /api/drivers/my-rides    - ดูงานของฉัน (Driver)
GET    /api/drivers/my-profile  - ดูโปรไฟล์ (Driver)
PUT    /api/drivers/my-profile  - แก้ไขโปรไฟล์ (Driver)
PUT    /api/driver-locations/:id - อัปเดตตำแหน่ง
```

---

## 🔄 การไหลของข้อมูล (Data Flow)

### 1. การลงทะเบียนผู้ป่วย
```
User (Community) 
  → CommunityRegisterPatientPage.tsx
  → Wizard 5 ขั้นตอน (Step1-5)
  → handleWizardComplete()
  → patientsAPI.createPatient()
  → POST /api/patients
  → Backend: routes/patients.ts
  → Validation (Joi)
  → INSERT INTO patients
  → Return patient_id
  → Frontend: แสดงผลสำเร็จ
```

### 2. การเรียกรถพยาบาล
```
User (Community)
  → CommunityRequestRidePage.tsx
  → เลือกผู้ป่วย (Auto-populate ข้อมูล)
  → กรอกปลายทาง
  → handleSubmit()
  → ridesAPI.createRide()
  → POST /api/rides
  → Backend: routes/rides.ts
  → Generate RIDE-XXX ID
  → INSERT INTO rides
  → Socket.io Emit 'new_ride'
  → Officer Dashboard รับแจ้งเตือน
```

### 3. การจ่ายงาน (Dispatch)
```
Officer
  → OfficeManageRidesPage.tsx
  → เลือก Ride + เลือก Driver
  → handleDispatch()
  → ridesAPI.updateRideStatus(id, 'ASSIGNED', driver_id)
  → PUT /api/rides/:id
  → Backend: UPDATE rides SET status='ASSIGNED', driver_id=?
  → Socket.io Emit 'ride_assigned'
  → Driver Dashboard รับงานใหม่
```

### 4. Real-time Tracking
```
Driver
  → DriverLocationTracker Component
  → navigator.geolocation.watchPosition()
  → driversAPI.updateLocation(lat, lng)
  → PUT /api/driver-locations/:id
  → Backend: INSERT INTO driver_locations
  → Socket.io Emit 'driver_location_update'
  → Officer MapCommandPage อัปเดตตำแหน่งบนแผนที่
```

---

## 🔐 ความปลอดภัย (Security)

### Frontend
- ✅ JWT Token ใน localStorage
- ✅ CSRF Token สำหรับ POST/PUT/DELETE
- ✅ Input Validation (Client-side)
- ✅ Role-Based UI Rendering

### Backend
- ✅ JWT Authentication
- ✅ Bcrypt Password Hashing
- ✅ RBAC (Role-Based Access Control)
- ✅ Input Validation (Joi + Express-validator)
- ✅ CSRF Protection
- ✅ Helmet (Security Headers)
- ✅ CORS Configuration
- ✅ Audit Logs พร้อม Hash Chain

---

## 📊 สถิติโครงการ

- **Frontend Pages**: 34 ไฟล์
- **Components**: 167 ไฟล์
- **Backend Routes**: 21 ไฟล์
- **Database Tables**: 13 ตาราง
- **API Endpoints**: 50+ endpoints
- **User Roles**: 6 roles
- **Test Scripts**: 149 ไฟล์ (archived)

---

## 📝 หมายเหตุ

เอกสารนี้จัดทำขึ้นเพื่อให้ฝ่ายทดสอบ (QA Team) และทีมพัฒนาเข้าใจโครงสร้างของระบบ EMS WeCare อย่างชัดเจน

สำหรับข้อมูลเพิ่มเติม:
- **Database Schema**: `wecare-backend/db/schema.sql`
- **API Documentation**: `api_requirements.md`
- **UI Guidelines**: `UI_COMPONENT_GUIDELINES.md`
- **Test Plan**: `QA-COMMUNITY-TEST-PLAN.ps1`
