# 📘 คู่มือโครงสร้างแอป EMS WeCare
## ส่วนที่ 3: Backend และ Database

**โครงการ:** EMS WeCare (Emergency Medical Services - We Care)  
**วันที่จัดทำ:** 29 มกราคม 2569  
**เวอร์ชัน:** 4.0

---

## 📋 สารบัญ

1. [ภาพรวม Backend](#ภาพรวม-backend)
2. [โครงสร้างโฟลเดอร์ Backend](#โครงสร้างโฟลเดอร์-backend)
3. [API Endpoints](#api-endpoints)
4. [Middleware Stack](#middleware-stack)
5. [Database Structure](#database-structure)
6. [Security Features](#security-features)
7. [Real-time Communication](#real-time-communication)

---

## ⚙️ ภาพรวม Backend

### เทคโนโลยีหลัก
- **Runtime:** Node.js v18+
- **Framework:** Express.js 4.x
- **Language:** TypeScript 5.x
- **Database:** SQLite 3 (better-sqlite3)
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi + Express-validator
- **Security:** Helmet, CORS, CSRF Protection
- **Real-time:** Socket.io

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST FLOW                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Client Request (HTTP/HTTPS)                             │
│     ↓                                                        │
│  2. Helmet (Security Headers)                               │
│     ↓                                                        │
│  3. CORS (Cross-Origin Resource Sharing)                    │
│     ↓                                                        │
│  4. Body Parser (JSON/URL-encoded)                          │
│     ↓                                                        │
│  5. Cookie Parser                                            │
│     ↓                                                        │
│  6. SQL Injection Prevention                                │
│     ↓                                                        │
│  7. Rate Limiter (Prevent DDoS)                             │
│     ↓                                                        │
│  8. JWT Authentication (verify token)                       │
│     ↓                                                        │
│  9. RBAC (Role-Based Access Control)                        │
│     ↓                                                        │
│  10. CSRF Token Validation                                   │
│     ↓                                                        │
│  11. Input Validation (Joi/Express-validator)                │
│     ↓                                                        │
│  12. Route Handler (Business Logic)                         │
│     ↓                                                        │
│  13. Database Query (SQLite)                                 │
│     ↓                                                        │
│  14. Response (JSON)                                         │
│     ↓                                                        │
│  15. Error Handler (if error occurs)                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 โครงสร้างโฟลเดอร์ Backend

### ภาพรวมโครงสร้าง

```
d:\EMS\wecare-backend\
├── src/                                 # Source code (53 files)
│   ├── index.ts                         # Express server entry point
│   │
│   ├── routes/                          # API routes (21 files)
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── patients.ts
│   │   ├── drivers.ts
│   │   ├── rides.ts
│   │   ├── vehicles.ts
│   │   ├── teams.ts
│   │   ├── news.ts
│   │   ├── audit-logs.ts
│   │   ├── dashboard.ts
│   │   ├── reports.ts
│   │   └── ... (10 more)
│   │
│   ├── middleware/                      # Middleware (10 files)
│   │   ├── auth.ts
│   │   ├── roleProtection.ts
│   │   ├── csrfProtection.ts
│   │   ├── rateLimiter.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   └── ... (4 more)
│   │
│   ├── services/                        # Business logic
│   │   └── notificationService.ts
│   │
│   ├── db/                              # Database layer
│   │   ├── sqliteDB.ts
│   │   ├── queries.ts
│   │   └── migrations.ts
│   │
│   └── utils/                           # Utilities (4 files)
│       ├── logger.ts
│       ├── validators.ts
│       └── helpers.ts
│
├── db/                                  # Database directory
│   ├── wecare.db                        # SQLite database (237 KB)
│   ├── wecare.db-shm                    # Shared memory
│   ├── wecare.db-wal                    # Write-ahead log
│   └── schema.sql                       # Schema definition
│
├── uploads/                             # File uploads
│   └── patients/                        # Patient attachments
│
├── scripts/                             # Utility scripts (13 files)
│   ├── seed-data.ts
│   └── check-schema.js
│
├── package.json                         # Dependencies
├── tsconfig.json                        # TypeScript config
├── .env                                 # Environment variables
└── start.js                             # Startup script
```

---

## 🔌 API Endpoints

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | เข้าสู่ระบบ | ❌ |
| POST | `/api/auth/register` | ลงทะเบียน | ❌ |
| GET | `/api/auth/me` | ดูโปรไฟล์ตัวเอง | ✅ |
| PUT | `/api/auth/profile` | แก้ไขโปรไฟล์ | ✅ |
| POST | `/api/auth/change-password` | เปลี่ยนรหัสผ่าน | ✅ |
| GET | `/api/auth/csrf-token` | ดึง CSRF Token | ❌ |
| POST | `/api/auth/logout` | ออกจากระบบ | ✅ |

**ตัวอย่าง Login:**
```typescript
// Request
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "USR-001",
    "email": "admin@example.com",
    "role": "admin",
    "full_name": "Admin User"
  }
}
```

---

### 2. Users (`/api/users`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/users` | รายการผู้ใช้ทั้งหมด | DEVELOPER, admin |
| GET | `/api/users/:id` | ดูผู้ใช้ตาม ID | DEVELOPER, admin |
| POST | `/api/users` | สร้างผู้ใช้ใหม่ | DEVELOPER, admin |
| PUT | `/api/users/:id` | แก้ไขผู้ใช้ | DEVELOPER, admin |
| DELETE | `/api/users/:id` | ลบผู้ใช้ | DEVELOPER, admin |
| PATCH | `/api/users/:id/status` | เปลี่ยนสถานะ | DEVELOPER, admin |

**ตัวอย่าง Create User:**
```typescript
// Request
POST /api/users
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "role": "community",
  "full_name": "New User"
}

// Response
{
  "success": true,
  "user": {
    "id": "USR-123",
    "email": "newuser@example.com",
    "role": "community",
    "full_name": "New User",
    "status": "Active"
  }
}
```

---

### 3. Patients (`/api/patients`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/patients` | รายการผู้ป่วย (พร้อม Pagination) | All authenticated |
| GET | `/api/patients/:id` | ดูรายละเอียดผู้ป่วย | All authenticated |
| POST | `/api/patients` | สร้างผู้ป่วยใหม่ | community, OFFICER |
| PUT | `/api/patients/:id` | แก้ไขข้อมูลผู้ป่วย | community, OFFICER |
| DELETE | `/api/patients/:id` | ลบผู้ป่วย | community, OFFICER |

**Query Parameters (GET /api/patients):**
```typescript
{
  page: 1,              // หน้าที่ต้องการ
  limit: 10,            // จำนวนต่อหน้า
  search: "ชื่อ",       // ค้นหา
  village: "หมู่ 1",    // กรองตามหมู่บ้าน
  patient_type: "ติดเตียง" // กรองตามประเภท
}
```

**Data Isolation:**
- **community:** เห็นเฉพาะผู้ป่วยที่ตนสร้าง (`created_by = user.id`)
- **OFFICER/admin:** เห็นผู้ป่วยทั้งหมด

---

### 4. Rides (`/api/rides`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/rides` | รายการการเดินทาง | All authenticated |
| GET | `/api/rides/:id` | ดูรายละเอียดการเดินทาง | All authenticated |
| POST | `/api/rides` | สร้างคำขอใหม่ | community, OFFICER |
| PUT | `/api/rides/:id` | อัปเดตสถานะ | OFFICER, driver |
| DELETE | `/api/rides/:id` | ยกเลิกการเดินทาง | community, OFFICER |
| PATCH | `/api/rides/:id/assign` | มอบหมายคนขับ | OFFICER |

**Ride Status:**
```typescript
enum RideStatus {
  PENDING = 'PENDING',           // รอดำเนินการ
  ASSIGNED = 'ASSIGNED',         // มอบหมายคนขับแล้ว
  IN_PROGRESS = 'IN_PROGRESS',   // กำลังเดินทาง
  COMPLETED = 'COMPLETED',       // เสร็จสิ้น
  CANCELLED = 'CANCELLED'        // ยกเลิก
}
```

---

### 5. Drivers (`/api/drivers`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/drivers` | รายการคนขับทั้งหมด | OFFICER, admin |
| GET | `/api/drivers/available` | คนขับที่ว่าง | OFFICER |
| GET | `/api/drivers/my-rides` | งานของฉัน | driver |
| GET | `/api/drivers/my-profile` | โปรไฟล์ของฉัน | driver |
| PUT | `/api/drivers/my-profile` | แก้ไขโปรไฟล์ | driver |
| PUT | `/api/driver-locations/:id` | อัปเดตตำแหน่ง | driver |

---

### 6. Vehicles (`/api/vehicles`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/vehicles` | รายการรถพยาบาล | OFFICER, admin |
| GET | `/api/vehicles/:id` | ดูรายละเอียดรถ | OFFICER, admin |
| POST | `/api/vehicles` | เพิ่มรถใหม่ | admin |
| PUT | `/api/vehicles/:id` | แก้ไขข้อมูลรถ | admin |
| DELETE | `/api/vehicles/:id` | ลบรถ | admin |

---

### 7. Teams (`/api/teams`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/teams` | รายการทีม | All authenticated |
| GET | `/api/teams/:id` | ดูรายละเอียดทีม | All authenticated |
| POST | `/api/teams` | สร้างทีมใหม่ | admin |
| PUT | `/api/teams/:id` | แก้ไขทีม | admin |
| DELETE | `/api/teams/:id` | ลบทีม | admin |

---

### 8. News (`/api/news`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/news` | รายการข่าว | Public |
| GET | `/api/news/:id` | อ่านข่าว | Public |
| POST | `/api/news` | สร้างข่าว | admin |
| PUT | `/api/news/:id` | แก้ไขข่าว | admin |
| DELETE | `/api/news/:id` | ลบข่าว | admin |
| PATCH | `/api/news/:id/publish` | เผยแพร่/ยกเลิก | admin |

---

### 9. Audit Logs (`/api/audit-logs`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/audit-logs` | รายการ Audit Logs | DEVELOPER, admin |
| GET | `/api/audit-logs/:id` | ดูรายละเอียด Log | DEVELOPER, admin |

**Audit Log Structure:**
```typescript
{
  id: 1,
  user_id: "USR-001",
  user_email: "admin@example.com",
  user_role: "admin",
  action: "CREATE_PATIENT",
  resource_type: "patients",
  resource_id: "PAT-123",
  details: { ... },
  ip_address: "192.168.1.1",
  user_agent: "Mozilla/5.0...",
  timestamp: "2026-01-29T13:30:00Z",
  hash: "abc123...",           // SHA-256 hash
  previous_hash: "def456...",  // Hash ของ log ก่อนหน้า
  sequence_number: 1
}
```

---

### 10. Dashboard (`/api/dashboard`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/dashboard/stats` | สถิติ Dashboard | All authenticated |
| GET | `/api/dashboard/recent-activities` | กิจกรรมล่าสุด | All authenticated |

---

### 11. Reports (`/api/reports`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/reports/rides` | รายงานการเดินทาง | OFFICER, EXECUTIVE |
| GET | `/api/reports/drivers` | รายงานคนขับ | OFFICER, EXECUTIVE |
| GET | `/api/reports/patients` | รายงานผู้ป่วย | OFFICER, EXECUTIVE |
| POST | `/api/reports/export` | Export รายงาน | OFFICER, EXECUTIVE |

---

## 🛡️ Middleware Stack

### 1. auth.ts - JWT Authentication

```typescript
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
```

---

### 2. roleProtection.ts - RBAC

```typescript
export const roleProtection = (allowedRoles: string[]) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden: Insufficient permissions' 
      });
    }

    next();
  };
};

// Usage
router.get('/users', 
  authenticateToken, 
  roleProtection(['DEVELOPER', 'admin']), 
  getUsersHandler
);
```

---

### 3. csrfProtection.ts - CSRF Token

```typescript
import csurf from 'csurf';

export const csrfProtection = csurf({ 
  cookie: true 
});

// Generate token
router.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Validate token (automatic)
router.post('/patients', csrfProtection, createPatientHandler);
```

---

### 4. rateLimiter.ts - Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later'
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per window
  message: 'Too many requests, please slow down'
});

// Usage
router.post('/auth/login', loginLimiter, loginHandler);
router.use('/api', apiLimiter);
```

---

### 5. validation.ts - Input Validation

```typescript
import Joi from 'joi';

export const validatePatient = (req, res, next) => {
  const schema = Joi.object({
    full_name: Joi.string().required().min(3).max(100),
    national_id: Joi.string().required().length(13).pattern(/^[0-9]+$/),
    dob: Joi.date().required().max('now'),
    gender: Joi.string().valid('ชาย', 'หญิง', 'อื่นๆ').required(),
    blood_type: Joi.string().valid('A', 'B', 'AB', 'O').required(),
    contact_phone: Joi.string().required().pattern(/^[0-9]{10}$/),
    // ... more fields
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details 
    });
  }

  next();
};

// Usage
router.post('/patients', validatePatient, createPatientHandler);
```

---

### 6. errorHandler.ts - Error Handling

```typescript
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Joi validation error
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Database error
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }

  // Default error
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
```

---

## 🗄️ Database Structure

### SQLite Database

**ไฟล์:** `d:\EMS\wecare-backend\db\wecare.db`  
**ขนาด:** ~237 KB  
**Mode:** WAL (Write-Ahead Logging)  
**ตาราง:** 13 ตาราง

### ER Diagram (Relationships)

```
users (8 records)
├── patients.created_by → users.id
├── drivers.user_id → users.id
├── rides.created_by → users.id
├── teams.leader_id → users.id
├── news.author_id → users.id
└── audit_logs.user_id → users.id

patients (1 record)
├── rides.patient_id → patients.id
└── patient_attachments.patient_id → patients.id

drivers (2 records)
├── rides.driver_id → drivers.id
├── driver_locations.driver_id → drivers.id
└── drivers.current_vehicle_id → vehicles.id

vehicles (0 records)
├── rides.vehicle_id → vehicles.id
└── vehicles.vehicle_type_id → vehicle_types.id

rides (2 records)
└── ride_events.ride_id → rides.id
```

---

### ตารางหลัก (13 ตาราง)

#### 1. users (ผู้ใช้งาน)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- bcrypt hashed
  role TEXT NOT NULL,      -- DEVELOPER, admin, OFFICER, driver, community, EXECUTIVE
  full_name TEXT NOT NULL,
  date_created TEXT,
  status TEXT DEFAULT 'Active',  -- Active, Inactive
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Roles:**
- `DEVELOPER` - นักพัฒนา (Full access)
- `admin` - ผู้ดูแลระบบ
- `OFFICER` - เจ้าหน้าที่
- `radio` / `radio_center` - ศูนย์วิทยุ
- `driver` - คนขับ
- `community` - ประชาชน
- `EXECUTIVE` - ผู้บริหาร

---

#### 2. patients (ผู้ป่วย)

```sql
CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  national_id TEXT UNIQUE NOT NULL,
  dob TEXT,                    -- Date of birth
  age INTEGER,
  gender TEXT,                 -- ชาย, หญิง, อื่นๆ
  blood_type TEXT,             -- A, B, AB, O
  rh_factor TEXT,              -- +, -
  health_coverage TEXT,        -- ประกันสุขภาพ
  contact_phone TEXT,
  
  -- ที่อยู่ตามบัตรประชาชน
  id_card_house_number TEXT,
  id_card_village TEXT,
  id_card_subdistrict TEXT,
  id_card_district TEXT,
  id_card_province TEXT,
  id_card_postal_code TEXT,
  
  -- ที่อยู่ปัจจุบัน
  current_house_number TEXT,
  current_village TEXT,
  current_subdistrict TEXT,
  current_district TEXT,
  current_province TEXT,
  current_postal_code TEXT,
  
  -- ตำแหน่งบนแผนที่
  latitude TEXT,
  longitude TEXT,
  landmark TEXT,
  
  -- ข้อมูลสุขภาพ (JSON)
  patient_types TEXT,          -- ["ติดเตียง", "ผู้สูงอายุ"]
  chronic_diseases TEXT,       -- ["เบาหวาน", "ความดันโลหิตสูง"]
  allergies TEXT,              -- ["ยาปฏิชีวนะ"]
  
  -- Metadata
  profile_image_url TEXT,
  registered_date TEXT,
  created_by TEXT,             -- FK → users.id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_patients_created_by ON patients(created_by);
CREATE INDEX idx_patients_registered_date ON patients(registered_date);
CREATE INDEX idx_patients_village ON patients(current_village);
```

---

#### 3. patient_attachments (ไฟล์แนบผู้ป่วย)

```sql
CREATE TABLE patient_attachments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,              -- image/jpeg, application/pdf
  file_size INTEGER,           -- bytes
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX idx_patient_attachments_patient_id ON patient_attachments(patient_id);
```

---

#### 4. drivers (คนขับ)

```sql
CREATE TABLE drivers (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE,         -- FK → users.id
  full_name TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  license_expiry TEXT,
  status TEXT DEFAULT 'AVAILABLE',  -- AVAILABLE, ON_DUTY, OFF_DUTY, UNAVAILABLE
  current_vehicle_id TEXT,     -- FK → vehicles.id
  profile_image_url TEXT,
  total_trips INTEGER DEFAULT 0,
  trips_this_month INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (current_vehicle_id) REFERENCES vehicles(id)
);

CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_user_id ON drivers(user_id);
```

---

#### 5. vehicles (รถพยาบาล)

```sql
CREATE TABLE vehicles (
  id TEXT PRIMARY KEY,
  license_plate TEXT UNIQUE NOT NULL,
  vehicle_type_id TEXT,        -- FK → vehicle_types.id
  brand TEXT,
  model TEXT,
  year INTEGER,
  color TEXT,
  capacity INTEGER,
  status TEXT DEFAULT 'AVAILABLE',  -- AVAILABLE, IN_USE, MAINTENANCE, RETIRED
  mileage INTEGER DEFAULT 0,
  last_maintenance_date TEXT,
  next_maintenance_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
);
```

---

#### 6. rides (การเดินทาง)

```sql
CREATE TABLE rides (
  id TEXT PRIMARY KEY,
  patient_id TEXT,             -- FK → patients.id
  patient_name TEXT,
  patient_phone TEXT,
  driver_id TEXT,              -- FK → drivers.id
  driver_name TEXT,
  vehicle_id TEXT,             -- FK → vehicles.id
  
  -- ตำแหน่ง
  pickup_location TEXT,
  pickup_lat TEXT,
  pickup_lng TEXT,
  destination TEXT,
  destination_lat TEXT,
  destination_lng TEXT,
  
  -- เวลา
  appointment_time TEXT,
  pickup_time TEXT,
  dropoff_time TEXT,
  
  -- รายละเอียด
  trip_type TEXT,              -- emergency, scheduled, transfer
  special_needs TEXT,          -- JSON array
  notes TEXT,
  distance_km REAL,
  
  -- สถานะ
  status TEXT DEFAULT 'PENDING',  -- PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
  cancellation_reason TEXT,
  
  -- Metadata
  created_by TEXT,             -- FK → users.id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_rides_patient_id ON rides(patient_id);
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_appointment_time ON rides(appointment_time);
CREATE INDEX idx_rides_created_by ON rides(created_by);
```

---

#### 7. ride_events (เหตุการณ์การเดินทาง)

```sql
CREATE TABLE ride_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ride_id TEXT NOT NULL,       -- FK → rides.id
  event_type TEXT NOT NULL,    -- CREATED, ASSIGNED, STARTED, ARRIVED, COMPLETED, CANCELLED
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  latitude TEXT,
  longitude TEXT,
  notes TEXT,
  created_by TEXT,
  
  FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE
);

CREATE INDEX idx_ride_events_ride_id ON ride_events(ride_id);
CREATE INDEX idx_ride_events_timestamp ON ride_events(timestamp);
```

---

#### 8. driver_locations (ตำแหน่ง GPS)

```sql
CREATE TABLE driver_locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  driver_id TEXT NOT NULL,     -- FK → drivers.id
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  accuracy REAL,
  heading REAL,
  speed REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

CREATE INDEX idx_driver_locations_driver_id ON driver_locations(driver_id);
CREATE INDEX idx_driver_locations_timestamp ON driver_locations(timestamp);
```

---

#### 9. audit_logs (บันทึกการตรวจสอบ)

```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,                -- FK → users.id
  user_email TEXT,
  user_role TEXT,
  action TEXT NOT NULL,        -- CREATE_PATIENT, UPDATE_RIDE, DELETE_USER, etc.
  resource_type TEXT,          -- patients, rides, users, etc.
  resource_id TEXT,
  details TEXT,                -- JSON
  ip_address TEXT,
  user_agent TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  hash TEXT,                   -- SHA-256 hash of this log
  previous_hash TEXT,          -- Hash of previous log (blockchain-like)
  sequence_number INTEGER,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

**Hash Chain (Blockchain-like):**
```typescript
// Each log's hash is calculated from:
hash = SHA256(
  user_id + action + resource_type + resource_id + 
  timestamp + previous_hash
)

// This creates an immutable chain of logs
```

---

#### 10-13. Other Tables

```sql
-- teams (ทีมงาน)
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  leader_id TEXT,              -- FK → users.id
  member_ids TEXT,             -- JSON array
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- news (ข่าวสาร)
CREATE TABLE news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT,              -- FK → users.id
  author_name TEXT,
  category TEXT,
  tags TEXT,                   -- JSON array
  image_url TEXT,
  published_date TEXT,
  is_published INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- vehicle_types (ประเภทรถ)
CREATE TABLE vehicle_types (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  capacity INTEGER,
  features TEXT                -- JSON array
);

-- system_settings (การตั้งค่า)
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_by TEXT,             -- FK → users.id
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Security Features

### 1. Password Hashing (Bcrypt)

```typescript
import bcrypt from 'bcrypt';

// Hash password
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// Verify password
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### 2. JWT Token

```typescript
import jwt from 'jsonwebtoken';

// Generate token
const token = jwt.sign(
  { 
    id: user.id, 
    email: user.email, 
    role: user.role 
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### 3. SQL Injection Prevention

```typescript
// ❌ Bad (vulnerable to SQL injection)
db.prepare(`SELECT * FROM users WHERE email = '${email}'`).get();

// ✅ Good (parameterized query)
db.prepare('SELECT * FROM users WHERE email = ?').get(email);
```

### 4. CORS Configuration

```typescript
import cors from 'cors';

app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));
```

---

## 🔄 Real-time Communication

### Socket.io Implementation

```typescript
import { Server } from 'socket.io';

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.email}`);

  // New ride created
  socket.on('new_ride', (ride) => {
    io.emit('new_ride', ride);
  });

  // Ride status updated
  socket.on('ride_updated', (ride) => {
    io.emit('ride_updated', ride);
  });

  // Driver location update
  socket.on('update_location', (location) => {
    io.emit('driver_location_update', {
      driver_id: socket.user.id,
      ...location
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.email}`);
  });
});
```

---

## 🔗 เอกสารที่เกี่ยวข้อง

- **คู่มือ 1:** Overview & Architecture
- **คู่มือ 2:** Frontend Structure
- **คู่มือ 4:** User Roles & Features

---

**จัดทำโดย:** AI Assistant  
**วันที่:** 29 มกราคม 2569  
**เวอร์ชัน:** 1.0
