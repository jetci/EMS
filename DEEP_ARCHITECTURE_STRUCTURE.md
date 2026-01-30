# 🏗️ EMS WeCare - โครงสร้างเชิงลึกของแอปพลิเคชัน

**โครงการ:** EMS WeCare (Emergency Medical Services - We Care)  
**วันที่อัพเดท:** 2026-01-04  
**เวอร์ชัน:** 4.0  
**สถาปัตยกรรม:** Full-Stack Web Application (React + Node.js + SQLite)

---

## 📋 สารบัญ

1. [ภาพรวมสถาปัตยกรรม](#ภาพรวมสถาปัตยกรรม)
2. [โครงสร้าง Frontend](#โครงสร้าง-frontend)
3. [โครงสร้าง Backend](#โครงสร้าง-backend)
4. [โครงสร้างฐานข้อมูล](#โครงสร้างฐานข้อมูล)
5. [โครงสร้างโมดูลตามบทบาท](#โครงสร้างโมดูลตามบทบาท)
6. [ระบบความปลอดภัย](#ระบบความปลอดภัย)
7. [Flow การทำงาน](#flow-การทำงาน)
8. [Technology Stack](#technology-stack)

---

## 🎯 ภาพรวมสถาปัตยกรรม

### **Architecture Pattern:**
```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  React 19 + TypeScript + Vite + TailwindCSS                 │
│  - SPA (Single Page Application)                            │
│  - Client-side routing                                       │
│  - Role-based UI rendering                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/HTTPS (REST API)
                       │ JSON + JWT Authentication
┌──────────────────────▼──────────────────────────────────────┐
│                     API LAYER                                │
│  Express.js + TypeScript                                     │
│  - RESTful API endpoints                                     │
│  - JWT authentication                                        │
│  - RBAC (Role-Based Access Control)                         │
│  - CSRF protection                                           │
│  - Rate limiting                                             │
│  - Input validation                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL Queries
                       │ better-sqlite3
┌──────────────────────▼──────────────────────────────────────┐
│                   DATABASE LAYER                             │
│  SQLite 3 (wecare.db)                                       │
│  - ACID transactions                                         │
│  - Foreign key constraints                                   │
│  - WAL mode (Write-Ahead Logging)                           │
│  - Indexed queries                                           │
└─────────────────────────────────────────────────────────────┘
```

### **Deployment Architecture:**
```
Production:
├── Frontend: Static files (Vite build) → Hosting (FTP/Netlify)
├── Backend: Node.js server → Port 3001
└── Database: SQLite file (wecare.db)

Development:
├── Frontend: Vite dev server → Port 5173
├── Backend: ts-node dev server → Port 3001
└── Database: SQLite file (wecare.db)
```

---

## 🎨 โครงสร้าง Frontend

### **1. Directory Structure**

```
d:\EMS\
├── App.tsx                          # Root component, routing, auth
├── index.tsx                        # React entry point
├── types.ts                         # TypeScript type definitions
├── vite.config.ts                   # Vite configuration
│
├── components/                      # Reusable components
│   ├── admin/                       # Admin-specific components
│   │   ├── AdminUserForm.tsx
│   │   ├── AdminUserTable.tsx
│   │   ├── AuditLogTable.tsx
│   │   ├── SystemSettingsForm.tsx
│   │   └── UserManagementFilters.tsx
│   │
│   ├── charts/                      # Chart components
│   │   ├── BarChart.tsx
│   │   ├── LineChart.tsx
│   │   └── PieChart.tsx
│   │
│   ├── dashboard/                   # Dashboard widgets
│   │   ├── DashboardCard.tsx
│   │   ├── StatCard.tsx
│   │   └── QuickActions.tsx
│   │
│   ├── driver/                      # Driver components
│   │   ├── DriverJobCard.tsx
│   │   └── DriverLocationTracker.tsx
│   │
│   ├── executive/                   # Executive components
│   │   └── ExecutiveDashboardWidgets.tsx
│   │
│   ├── icons/                       # Icon components (76 files)
│   │   ├── AlertIcon.tsx
│   │   ├── UserIcon.tsx
│   │   └── ... (74 more)
│   │
│   ├── illustrations/               # Illustration components
│   │   └── EmptyState.tsx
│   │
│   ├── layout/                      # Layout components
│   │   ├── AuthenticatedLayout.tsx  # Main layout for logged-in users
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   │
│   ├── modals/                      # Modal dialogs (15 files)
│   │   ├── ConfirmDeleteModal.tsx
│   │   ├── EditPatientModal.tsx
│   │   ├── EditRideModal.tsx
│   │   └── ... (12 more)
│   │
│   ├── news/                        # News components
│   │   ├── NewsCard.tsx
│   │   ├── NewsEditor.tsx
│   │   └── NewsFilters.tsx
│   │
│   ├── radio/                       # Radio center components
│   │   └── RadioDashboardWidgets.tsx
│   │
│   ├── reports/                     # Report components
│   │   └── ReportGenerator.tsx
│   │
│   ├── rides/                       # Ride components
│   │   └── RideTimeline.tsx
│   │
│   ├── schedules/                   # Schedule components (4 files)
│   │   ├── ScheduleCalendar.tsx
│   │   ├── ScheduleForm.tsx
│   │   ├── ScheduleList.tsx
│   │   └── ScheduleFilters.tsx
│   │
│   ├── teams/                       # Team components
│   │   └── TeamManagement.tsx
│   │
│   ├── ui/                          # UI primitives (21 files)
│   │   ├── ActionSheet.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── ModernDatePicker.tsx
│   │   ├── MultiSelectAutocomplete.tsx
│   │   ├── Pagination.tsx
│   │   ├── PasswordStrengthIndicator.tsx
│   │   ├── Select.tsx
│   │   ├── StarRating.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Table.tsx
│   │   ├── TagInput.tsx
│   │   ├── ThaiTimePicker.tsx
│   │   ├── ToggleSwitch.tsx
│   │   └── ... (6 more badges)
│   │
│   ├── Dashboard.tsx                # Main dashboard component
│   ├── ErrorBoundary.tsx            # Error handling
│   ├── ErrorFallback.tsx            # Error UI
│   ├── Header.tsx                   # Public header
│   ├── PublicHeader.tsx             # Public site header
│   ├── PublicFooter.tsx             # Public site footer
│   ├── LandingPage.tsx              # Public landing page
│   ├── LoginScreen.tsx              # Login form
│   ├── RegisterScreen.tsx           # Registration form
│   ├── AboutUsScreen.tsx            # About page
│   ├── ContactUsScreen.tsx          # Contact page
│   ├── LeafletMapPicker.tsx         # Map component (Leaflet)
│   ├── SimpleLeafletMapPicker.tsx   # Simplified map
│   ├── RouteMiniMap.tsx             # Mini map for routes
│   ├── RideCard.tsx                 # Ride display card
│   ├── RideList.tsx                 # Ride list
│   ├── Toast.tsx                    # Toast notifications
│   └── LoadingSpinner.tsx           # Loading indicator
│
├── pages/                           # Page components (34 files)
│   ├── AdminDashboardPage.tsx       # Admin dashboard
│   ├── AdminUserManagementPage.tsx  # User management
│   ├── AdminAuditLogsPage.tsx       # Audit logs
│   ├── AdminSystemSettingsPage.tsx  # System settings
│   ├── CommunityDashboard.tsx       # Community user dashboard
│   ├── CommunityProfilePage.tsx     # Community profile
│   ├── CommunityRegisterPatientPage.tsx
│   ├── CommunityRequestRidePage.tsx
│   ├── DeveloperDashboardPage.tsx   # Developer dashboard
│   ├── DriverTodayJobsPage.tsx      # Driver jobs
│   ├── DriverHistoryPage.tsx        # Driver history
│   ├── DriverProfilePage.tsx        # Driver profile
│   ├── ExecutiveDashboardPage.tsx   # Executive dashboard
│   ├── OfficeDashboard.tsx          # Officer dashboard
│   ├── OfficeManageDriversPage.tsx
│   ├── OfficeManagePatientsPage.tsx
│   ├── OfficeManageRidesPage.tsx
│   ├── OfficeReportsPage.tsx
│   ├── RadioDashboard.tsx           # Radio operator dashboard
│   ├── RadioCenterDashboard.tsx     # Radio center dashboard
│   ├── ManageNewsPage.tsx           # News management
│   ├── ManagePatientsPage.tsx       # Patient management
│   ├── ManageRidesPage.tsx          # Ride management
│   ├── ManageSchedulePage.tsx       # Schedule management
│   ├── ManageTeamsPage.tsx          # Team management
│   ├── ManageVehicleTypesPage.tsx   # Vehicle types
│   ├── ManageVehiclesPage.tsx       # Vehicle management
│   ├── MapCommandPage.tsx           # Map command center
│   ├── NewsEditorPage.tsx           # News editor
│   ├── PatientDetailPage.tsx        # Patient details
│   ├── PublicNewsListingPage.tsx    # Public news list
│   ├── PublicSingleNewsPage.tsx     # Public news article
│   ├── SystemLogsPage.tsx           # System logs
│   └── TestMapPage.tsx              # Map testing
│
├── src/                             # Source utilities
│   ├── services/                    # API services
│   │   ├── api.ts                   # Main API client
│   │   ├── authService.ts           # Authentication
│   │   └── dataService.ts           # Data fetching
│   │
│   ├── hooks/                       # Custom React hooks
│   │   └── useAuth.ts
│   │
│   ├── types/                       # TypeScript types
│   │   └── index.ts
│   │
│   └── theme/                       # Theme configuration
│       └── colors.ts
│
└── utils/                           # Utility functions
    ├── dateUtils.ts                 # Date formatting
    ├── formatters.ts                # Data formatters
    ├── validators.ts                # Input validation
    ├── constants.ts                 # App constants
    └── helpers.ts                   # Helper functions
```

### **2. Frontend Architecture Patterns**

#### **Component Hierarchy:**
```
App.tsx
├── PublicHeader (unauthenticated)
├── LandingPage / LoginScreen / RegisterScreen
├── PublicFooter
└── AuthenticatedLayout (authenticated)
    ├── Sidebar (role-based menu)
    ├── TopBar (user info, logout)
    └── Main Content Area
        └── Role-specific Dashboard/Pages
```

#### **State Management:**
- **Local State:** `useState` for component-level state
- **Context:** User authentication context
- **Props:** Parent-to-child data flow
- **localStorage:** JWT token, user data persistence

#### **Routing Strategy:**
```typescript
// Client-side routing (no react-router)
// Custom routing in App.tsx
const navigate = (path: string) => {
  window.history.pushState({}, '', url);
  applyRoute(window.location.pathname);
};

// Routes:
/ → Landing page
/login → Login screen
/register → Registration
/about → About us
/contact → Contact us
/news → News listing
/news/:id → Single news article
```

#### **Authentication Flow:**
```
1. User enters credentials
2. Frontend calls POST /api/auth/login
3. Backend validates & returns JWT + user data
4. Frontend stores token in localStorage
5. Frontend sets user state → renders AuthenticatedLayout
6. All API calls include JWT in Authorization header
```

---

## ⚙️ โครงสร้าง Backend

### **1. Directory Structure**

```
d:\EMS\wecare-backend\
├── src/
│   ├── index.ts                     # Express server entry point
│   │
│   ├── config/                      # Configuration
│   │   └── database.ts              # Database config
│   │
│   ├── db/                          # Database layer
│   │   ├── sqliteDB.ts              # SQLite wrapper
│   │   ├── queries.ts               # SQL queries
│   │   ├── migrations.ts            # Database migrations
│   │   └── seeders.ts               # Data seeders
│   │
│   ├── middleware/                  # Express middleware (10 files)
│   │   ├── auth.ts                  # JWT authentication
│   │   ├── roleProtection.ts        # RBAC middleware
│   │   ├── csrfProtection.ts        # CSRF token validation
│   │   ├── rateLimiter.ts           # Rate limiting
│   │   ├── validation.ts            # Input validation
│   │   ├── sqlInjectionPrevention.ts
│   │   ├── domainValidation.ts      # Domain whitelist
│   │   ├── errorHandler.ts          # Error handling
│   │   ├── multerErrorHandler.ts    # File upload errors
│   │   └── idempotency.ts           # Idempotent requests
│   │
│   ├── routes/                      # API routes (18 files)
│   │   ├── auth.ts                  # Authentication endpoints
│   │   ├── users.ts                 # User management
│   │   ├── patients.ts              # Patient CRUD
│   │   ├── drivers.ts               # Driver management
│   │   ├── rides.ts                 # Ride management
│   │   ├── ride-events.ts           # Ride event tracking
│   │   ├── driver-locations.ts      # Driver GPS tracking
│   │   ├── teams.ts                 # Team management
│   │   ├── vehicles.ts              # Vehicle management
│   │   ├── vehicle-types.ts         # Vehicle type management
│   │   ├── news.ts                  # News management
│   │   ├── audit-logs.ts            # Audit log queries
│   │   ├── dashboard.ts             # Dashboard data
│   │   ├── reports.ts               # Report generation
│   │   ├── office.ts                # Officer-specific endpoints
│   │   ├── map-data.ts              # Map data management
│   │   ├── settings.ts              # System settings
│   │   └── system.ts                # System utilities
│   │
│   ├── services/                    # Business logic
│   │   └── notificationService.ts   # Notifications
│   │
│   └── utils/                       # Utility functions (4 files)
│       ├── logger.ts                # Logging utility
│       ├── validators.ts            # Data validators
│       ├── formatters.ts            # Data formatters
│       └── helpers.ts               # Helper functions
│
├── db/                              # Database files
│   ├── wecare.db                    # SQLite database (237 KB)
│   ├── wecare.db-shm                # Shared memory file
│   ├── wecare.db-wal                # Write-ahead log
│   ├── schema.sql                   # Database schema
│   └── data/                        # Legacy JSON files (14 files)
│       ├── users.json
│       ├── patients.json
│       ├── drivers.json
│       └── ... (11 more)
│
├── uploads/                         # File uploads
│   └── patients/                    # Patient attachments
│
├── tests/                           # Backend tests
│   └── api.test.ts
│
├── tools/                           # Development tools
│   └── seed-data.ts
│
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── .env                             # Environment variables
└── start.js                         # Server starter
```

### **2. API Endpoints Structure**

#### **Authentication (`/api/auth`)**
```
POST   /api/auth/login              # User login
POST   /api/auth/logout             # User logout
GET    /api/auth/me                 # Get current user
POST   /api/auth/refresh            # Refresh token
GET    /api/auth/csrf-token         # Get CSRF token
```

#### **Users (`/api/users`)**
```
GET    /api/users                   # List all users (admin)
GET    /api/users/:id               # Get user by ID
POST   /api/users                   # Create user (admin)
PUT    /api/users/:id               # Update user (admin)
DELETE /api/users/:id               # Delete user (admin)
PATCH  /api/users/:id/status        # Toggle user status
PATCH  /api/users/:id/password      # Change password
```

#### **Patients (`/api/patients`)**
```
GET    /api/patients                # List patients (filtered by role)
GET    /api/patients/:id            # Get patient details
POST   /api/patients                # Create patient
PUT    /api/patients/:id            # Update patient
DELETE /api/patients/:id            # Delete patient
POST   /api/patients/:id/attachments # Upload attachment
GET    /api/patients/:id/attachments # Get attachments
DELETE /api/patients/:id/attachments/:attachmentId # Delete attachment
```

#### **Drivers (`/api/drivers`)**
```
GET    /api/drivers                 # List all drivers
GET    /api/drivers/:id             # Get driver details
POST   /api/drivers                 # Create driver
PUT    /api/drivers/:id             # Update driver
DELETE /api/drivers/:id             # Delete driver
PATCH  /api/drivers/:id/status      # Update driver status
GET    /api/drivers/:id/stats       # Get driver statistics
```

#### **Rides (`/api/rides`)**
```
GET    /api/rides                   # List rides (filtered by role)
GET    /api/rides/:id               # Get ride details
POST   /api/rides                   # Create ride request
PUT    /api/rides/:id               # Update ride
DELETE /api/rides/:id               # Cancel ride
PATCH  /api/rides/:id/assign        # Assign driver
PATCH  /api/rides/:id/status        # Update ride status
GET    /api/rides/:id/events        # Get ride events
POST   /api/rides/:id/events        # Add ride event
```

#### **Driver Locations (`/api/driver-locations`)**
```
GET    /api/driver-locations        # Get all driver locations
GET    /api/driver-locations/:driverId # Get specific driver location
POST   /api/driver-locations        # Update driver location
GET    /api/driver-locations/:driverId/history # Location history
```

#### **Vehicles (`/api/vehicles`)**
```
GET    /api/vehicles                # List vehicles
GET    /api/vehicles/:id            # Get vehicle details
POST   /api/vehicles                # Create vehicle
PUT    /api/vehicles/:id            # Update vehicle
DELETE /api/vehicles/:id            # Delete vehicle
```

#### **Vehicle Types (`/api/vehicle-types`)**
```
GET    /api/vehicle-types           # List vehicle types
POST   /api/vehicle-types           # Create vehicle type
PUT    /api/vehicle-types/:id       # Update vehicle type
DELETE /api/vehicle-types/:id       # Delete vehicle type
```

#### **Teams (`/api/teams`)**
```
GET    /api/teams                   # List teams
GET    /api/teams/:id               # Get team details
POST   /api/teams                   # Create team
PUT    /api/teams/:id               # Update team
DELETE /api/teams/:id               # Delete team
```

#### **News (`/api/news`)**
```
GET    /api/news                    # List news (public + admin)
GET    /api/news/:id                # Get news article
POST   /api/news                    # Create news (admin)
PUT    /api/news/:id                # Update news (admin)
DELETE /api/news/:id                # Delete news (admin)
PATCH  /api/news/:id/publish        # Publish/unpublish news
```

#### **Audit Logs (`/api/audit-logs`)**
```
GET    /api/audit-logs              # List audit logs (admin)
GET    /api/audit-logs/:id          # Get audit log details
POST   /api/audit-logs              # Create audit log (system)
```

#### **Dashboard (`/api/dashboard`)**
```
GET    /api/dashboard/stats         # Get dashboard statistics
GET    /api/dashboard/recent-activities # Recent activities
GET    /api/dashboard/charts        # Chart data
```

#### **Reports (`/api/reports`)**
```
GET    /api/reports/rides           # Ride reports
GET    /api/reports/drivers         # Driver performance
GET    /api/reports/patients        # Patient statistics
POST   /api/reports/export          # Export report
```

#### **System (`/api/system`)**
```
GET    /api/system/health           # Health check
GET    /api/system/version          # System version
GET    /api/system/settings         # System settings (admin)
PUT    /api/system/settings         # Update settings (admin)
```

### **3. Middleware Stack**

```typescript
// Request flow:
1. helmet()                          // Security headers
2. cors()                            // CORS handling
3. express.json()                    // Body parsing
4. cookieParser()                    // Cookie parsing
5. preventSQLInjection()             // SQL injection prevention
6. rateLimiter()                     // Rate limiting
7. authenticateToken()               // JWT validation
8. roleProtection(['admin'])         // RBAC
9. csrfTokenMiddleware()             // CSRF validation
10. validation()                     // Input validation
11. Route handler                    // Business logic
12. errorHandler()                   // Error handling
```

---

## 🗄️ โครงสร้างฐานข้อมูล

### **Database: SQLite 3**

**File:** `d:\EMS\wecare-backend\db\wecare.db`  
**Size:** ~237 KB  
**Mode:** WAL (Write-Ahead Logging)  
**Library:** `better-sqlite3`

### **ER Diagram (Simplified)**

```
┌─────────────┐
│    users    │
│ (8 records) │
└──────┬──────┘
       │
       ├──────────────────┬──────────────────┬──────────────────┐
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  patients   │    │   drivers   │    │    teams    │    │    news     │
│ (1 record)  │    │ (2 records) │    │ (2 records) │    │ (0 records) │
└──────┬──────┘    └──────┬──────┘    └─────────────┘    └─────────────┘
       │                  │
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│    rides    │◄───┤  vehicles   │
│ (2 records) │    │ (0 records) │
└──────┬──────┘    └─────────────┘
       │
       ├──────────────────┬──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ ride_events │    │driver_locs  │    │ audit_logs  │
│ (0 records) │    │ (0 records) │    │ (0 records) │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **Tables (13 ตาราง)**

#### **1. users** (ผู้ใช้งานระบบ)
```sql
- id: TEXT PRIMARY KEY
- email: TEXT UNIQUE NOT NULL
- password: TEXT NOT NULL (bcrypt hashed)
- role: TEXT (DEVELOPER, admin, OFFICER, radio, radio_center, driver, community, EXECUTIVE)
- full_name: TEXT NOT NULL
- date_created: TEXT
- status: TEXT (Active, Inactive)
- created_at, updated_at: DATETIME
```

#### **2. patients** (ผู้ป่วย)
```sql
- id: TEXT PRIMARY KEY
- full_name, national_id, dob, age, gender, blood_type
- contact_phone
- Address: id_card_*, current_*
- Location: latitude, longitude, landmark
- Medical: patient_types, chronic_diseases, allergies (JSON)
- Metadata: profile_image_url, registered_date, created_by
- FOREIGN KEY: created_by → users(id)
```

#### **3. patient_attachments** (ไฟล์แนบผู้ป่วย)
```sql
- id: TEXT PRIMARY KEY
- patient_id: TEXT NOT NULL
- file_name, file_path, file_type, file_size
- uploaded_at: DATETIME
- FOREIGN KEY: patient_id → patients(id) ON DELETE CASCADE
```

#### **4. drivers** (คนขับ)
```sql
- id: TEXT PRIMARY KEY
- user_id: TEXT UNIQUE
- full_name, phone, license_number, license_expiry
- status: TEXT (AVAILABLE, ON_DUTY, OFF_DUTY, UNAVAILABLE)
- current_vehicle_id: TEXT
- profile_image_url
- total_trips, trips_this_month: INTEGER
- FOREIGN KEY: user_id → users(id), current_vehicle_id → vehicles(id)
```

#### **5. vehicles** (รถพยาบาล)
```sql
- id: TEXT PRIMARY KEY
- license_plate: TEXT UNIQUE NOT NULL
- vehicle_type_id, brand, model, year, color, capacity
- status: TEXT (AVAILABLE, IN_USE, MAINTENANCE, RETIRED)
- mileage, last_maintenance_date, next_maintenance_date
- FOREIGN KEY: vehicle_type_id → vehicle_types(id)
```

#### **6. vehicle_types** (ประเภทรถ)
```sql
- id: TEXT PRIMARY KEY
- name: TEXT UNIQUE NOT NULL
- description, icon, capacity
- features: TEXT (JSON array)
```

#### **7. rides** (การเดินทาง)
```sql
- id: TEXT PRIMARY KEY
- patient_id, patient_name, patient_phone
- driver_id, driver_name, vehicle_id
- Trip: pickup_location, pickup_lat/lng, destination, destination_lat/lng
- Timing: appointment_time, pickup_time, dropoff_time
- trip_type, special_needs (JSON), notes, distance_km
- status: TEXT (PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED)
- cancellation_reason, created_by
- FOREIGN KEYS: patient_id, driver_id, vehicle_id, created_by
```

#### **8. ride_events** (เหตุการณ์การเดินทาง)
```sql
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- ride_id, event_type, timestamp
- latitude, longitude, notes, created_by
- FOREIGN KEY: ride_id → rides(id)
```

#### **9. driver_locations** (ตำแหน่ง GPS คนขับ)
```sql
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- driver_id, latitude, longitude
- accuracy, heading, speed, timestamp
- FOREIGN KEY: driver_id → drivers(id)
```

#### **10. teams** (ทีมงาน)
```sql
- id: TEXT PRIMARY KEY
- name: TEXT UNIQUE NOT NULL
- description, leader_id
- member_ids: TEXT (JSON array)
- status: TEXT (Active)
- FOREIGN KEY: leader_id → users(id)
```

#### **11. news** (ข่าวสาร)
```sql
- id: TEXT PRIMARY KEY
- title, content, author_id, author_name
- category, tags (JSON), image_url
- published_date, is_published, views
- FOREIGN KEY: author_id → users(id)
```

#### **12. audit_logs** (บันทึกการตรวจสอบ)
```sql
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- user_id, user_email, user_role
- action, resource_type, resource_id
- details (JSON), ip_address, user_agent, timestamp
- FOREIGN KEY: user_id → users(id)
```

#### **13. system_settings** (การตั้งค่าระบบ)
```sql
- key: TEXT PRIMARY KEY
- value, description, updated_by, updated_at
- FOREIGN KEY: updated_by → users(id)
```

#### **14. map_data** (ข้อมูลแผนที่)
```sql
- id: TEXT PRIMARY KEY
- name, description, type
- coordinates (JSON), properties (JSON)
- created_by
- FOREIGN KEY: created_by → users(id)
```

### **Indexes (Performance)**

```sql
-- Users
idx_users_email, idx_users_role

-- Patients
idx_patients_created_by, idx_patients_registered_date, idx_patients_village
idx_patient_attachments_patient_id

-- Drivers
idx_drivers_status, idx_drivers_user_id

-- Rides
idx_rides_patient_id, idx_rides_driver_id, idx_rides_status
idx_rides_appointment_time, idx_rides_created_by

-- Ride Events
idx_ride_events_ride_id, idx_ride_events_timestamp

-- Driver Locations
idx_driver_locations_driver_id, idx_driver_locations_timestamp

-- Audit Logs
idx_audit_logs_user_id, idx_audit_logs_timestamp, idx_audit_logs_action

-- News
idx_news_published_date, idx_news_is_published
```

---

## 👥 โครงสร้างโมดูลตามบทบาท

### **1. DEVELOPER** (นักพัฒนา)
```
Dashboard: DeveloperDashboardPage.tsx
Features:
├── System monitoring
├── Database management
├── API testing
├── Log viewing
└── Debug tools

Access Level: Full system access
```

### **2. ADMIN** (ผู้ดูแลระบบ)
```
Dashboard: AdminDashboardPage.tsx
Features:
├── User Management (AdminUserManagementPage.tsx)
│   ├── Create/Edit/Delete users
│   ├── Reset passwords
│   └── Toggle user status
├── Audit Logs (AdminAuditLogsPage.tsx)
│   ├── View all system activities
│   ├── Filter by user/action/date
│   └── Export logs
├── System Settings (AdminSystemSettingsPage.tsx)
│   ├── Configure system parameters
│   ├── Manage vehicle types
│   └── System maintenance
└── News Management (ManageNewsPage.tsx)
    ├── Create/Edit/Delete news
    ├── Publish/Unpublish
    └── View analytics

Access Level: Administrative functions
```

### **3. OFFICER** (เจ้าหน้าที่)
```
Dashboard: OfficeDashboard.tsx
Features:
├── Patient Management (OfficeManagePatientsPage.tsx)
│   ├── Register patients
│   ├── Edit patient details
│   ├── Upload attachments
│   └── View patient history
├── Ride Management (OfficeManageRidesPage.tsx)
│   ├── Create ride requests
│   ├── Assign drivers
│   ├── Track ride status
│   └── Cancel rides
├── Driver Management (OfficeManageDriversPage.tsx)
│   ├── View driver status
│   ├── Assign vehicles
│   └── View driver performance
├── Reports (OfficeReportsPage.tsx)
│   ├── Generate reports
│   ├── Export data
│   └── View statistics
├── Schedule Management (ManageSchedulePage.tsx)
│   └── Manage ride schedules
└── Team Management (ManageTeamsPage.tsx)
    └── Manage teams

Access Level: Operational management
```

### **4. RADIO / RADIO_CENTER** (ศูนย์วิทยุ)
```
Dashboard: RadioDashboard.tsx / RadioCenterDashboard.tsx
Features:
├── Real-time ride monitoring
├── Driver location tracking
├── Emergency dispatch
├── Communication logs
└── Status updates

Access Level: Dispatch and monitoring
```

### **5. DRIVER** (คนขับ)
```
Dashboard: DriverTodayJobsPage.tsx
Features:
├── Today's Jobs (DriverTodayJobsPage.tsx)
│   ├── View assigned rides
│   ├── Accept/Reject rides
│   ├── Update ride status
│   └── Navigate to pickup/destination
├── History (DriverHistoryPage.tsx)
│   ├── View completed rides
│   ├── View earnings
│   └── View ratings
├── Profile (DriverProfilePage.tsx)
│   ├── Update personal info
│   ├── Upload documents
│   └── View statistics
└── Location Tracking
    └── Real-time GPS updates

Access Level: Job execution
```

### **6. COMMUNITY** (ผู้ใช้ชุมชน)
```
Dashboard: CommunityDashboard.tsx
Features:
├── Register Patient (CommunityRegisterPatientPage.tsx)
│   ├── Add patient details
│   ├── Upload documents
│   └── Set pickup location
├── Request Ride (CommunityRequestRidePage.tsx)
│   ├── Select patient
│   ├── Choose destination
│   ├── Set appointment time
│   └── Add special needs
├── Profile (CommunityProfilePage.tsx)
│   ├── View personal info
│   ├── View registered patients
│   └── View ride history
└── Track Rides
    └── Real-time ride tracking

Access Level: Patient and ride management (own data only)
```

### **7. EXECUTIVE** (ผู้บริหาร)
```
Dashboard: ExecutiveDashboardPage.tsx
Features:
├── Analytics & Reports
│   ├── System performance metrics
│   ├── Financial reports
│   ├── Driver performance
│   └── Patient statistics
├── Data Visualization
│   ├── Charts and graphs
│   ├── Trend analysis
│   └── Comparative reports
└── Export Functions
    └── Export reports to PDF/Excel

Access Level: Read-only analytics
```

---

## 🔒 ระบบความปลอดภัย

### **1. Authentication & Authorization**

#### **JWT (JSON Web Token)**
```typescript
// Token structure:
{
  id: "USR-001",
  email: "admin@wecare.com",
  role: "admin",
  iat: 1704384000,
  exp: 1704470400
}

// Token lifetime: 24 hours
// Storage: localStorage (client), memory (server)
```

#### **RBAC (Role-Based Access Control)**
```typescript
// Middleware: roleProtection.ts
const roleHierarchy = {
  DEVELOPER: ['DEVELOPER', 'admin', 'OFFICER', 'radio', 'radio_center', 'driver', 'community', 'EXECUTIVE'],
  admin: ['admin', 'OFFICER', 'radio', 'radio_center'],
  OFFICER: ['OFFICER'],
  radio: ['radio'],
  radio_center: ['radio_center'],
  driver: ['driver'],
  community: ['community'],
  EXECUTIVE: ['EXECUTIVE']
};

// Usage:
router.get('/users', authenticateToken, requireRole(['admin']), getUsers);
```

### **2. Security Middleware**

#### **CSRF Protection**
```typescript
// csrfProtection.ts
- Generate CSRF token on login
- Validate token on state-changing requests
- Store in httpOnly cookie
```

#### **Rate Limiting**
```typescript
// rateLimiter.ts
- Auth endpoints: 5 requests / 15 minutes
- API endpoints: 100 requests / 15 minutes
- Create operations: 10 requests / minute
```

#### **Input Validation**
```typescript
// validation.ts
- Joi schema validation
- Sanitize inputs
- Prevent XSS attacks
```

#### **SQL Injection Prevention**
```typescript
// sqlInjectionPrevention.ts
- Prepared statements only
- Parameterized queries
- Input sanitization
```

#### **Password Security**
```typescript
// bcrypt hashing
- Salt rounds: 10
- Password strength validation
- Password history (prevent reuse)
```

### **3. Security Headers (Helmet)**
```typescript
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security
```

### **4. Audit Logging**
```typescript
// All actions logged:
- User login/logout
- CRUD operations
- Permission changes
- Failed authentication attempts
- Suspicious activities

// Log fields:
- user_id, user_email, user_role
- action, resource_type, resource_id
- ip_address, user_agent, timestamp
- details (JSON)
```

---

## 🔄 Flow การทำงาน

### **1. User Registration Flow**
```
1. User fills registration form (RegisterScreen.tsx)
2. Frontend validates input
3. POST /api/auth/register
4. Backend validates & creates user (role: community)
5. Backend hashes password (bcrypt)
6. Backend inserts into users table
7. Backend creates audit log
8. Backend returns success
9. Frontend redirects to login
```

### **2. User Login Flow**
```
1. User enters credentials (LoginScreen.tsx)
2. POST /api/auth/login
3. Backend validates credentials
4. Backend generates JWT token
5. Backend creates audit log
6. Backend returns { user, token }
7. Frontend stores token in localStorage
8. Frontend sets user state
9. Frontend renders AuthenticatedLayout
10. Frontend shows role-specific dashboard
```

### **3. Community User: Register Patient & Request Ride**
```
┌─────────────────────────────────────────────────────────┐
│ 1. Register Patient                                     │
│    CommunityRegisterPatientPage.tsx                     │
│    ├── Fill patient form                                │
│    ├── Upload attachments                               │
│    ├── Select location on map (LeafletMapPicker)        │
│    └── POST /api/patients                               │
│        ├── Validate input                               │
│        ├── Insert into patients table                   │
│        ├── Set created_by = current user ID             │
│        └── Return patient ID                            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Request Ride                                         │
│    CommunityRequestRidePage.tsx                         │
│    ├── Select patient (from own patients only)          │
│    ├── Select pickup location                           │
│    ├── Select destination                               │
│    ├── Set appointment time (ModernDatePicker)          │
│    ├── Add special needs                                │
│    └── POST /api/rides                                  │
│        ├── Validate input                               │
│        ├── Insert into rides table (status: PENDING)    │
│        ├── Set created_by = current user ID             │
│        ├── Create audit log                             │
│        └── Return ride ID                               │
└─────────────────────────────────────────────────────────┘
```

### **4. Officer: Assign Driver to Ride**
```
┌─────────────────────────────────────────────────────────┐
│ 1. View Pending Rides                                   │
│    OfficeManageRidesPage.tsx                            │
│    ├── GET /api/rides?status=PENDING                    │
│    └── Display ride list with details                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Assign Driver                                        │
│    ├── Click "Assign Driver" button                     │
│    ├── Modal opens with available drivers               │
│    ├── GET /api/drivers?status=AVAILABLE                │
│    ├── Select driver                                    │
│    └── PATCH /api/rides/:id/assign                      │
│        ├── Update ride: driver_id, status=ASSIGNED      │
│        ├── Update driver: status=ON_DUTY                │
│        ├── Create ride_event: ASSIGNED                  │
│        ├── Create audit log                             │
│        └── Send notification to driver                  │
└─────────────────────────────────────────────────────────┘
```

### **5. Driver: Accept & Complete Ride**
```
┌─────────────────────────────────────────────────────────┐
│ 1. View Assigned Ride                                   │
│    DriverTodayJobsPage.tsx                              │
│    ├── GET /api/rides?driver_id=:id&status=ASSIGNED     │
│    └── Display ride card with details                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Accept Ride                                          │
│    ├── Click "Accept" button                            │
│    └── PATCH /api/rides/:id/status                      │
│        ├── Update ride: status=IN_PROGRESS               │
│        ├── Set pickup_time = now                        │
│        ├── Create ride_event: STARTED                   │
│        └── Start location tracking                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Update Location (Real-time)                          │
│    ├── Every 30 seconds                                 │
│    └── POST /api/driver-locations                       │
│        ├── Insert: driver_id, lat, lng, timestamp       │
│        └── Broadcast to tracking clients                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Complete Ride                                        │
│    ├── Click "Complete" button                          │
│    └── PATCH /api/rides/:id/status                      │
│        ├── Update ride: status=COMPLETED                 │
│        ├── Set dropoff_time = now                       │
│        ├── Calculate distance_km                        │
│        ├── Update driver: status=AVAILABLE               │
│        ├── Increment driver.total_trips                 │
│        ├── Create ride_event: COMPLETED                 │
│        └── Create audit log                             │
└─────────────────────────────────────────────────────────┘
```

### **6. Executive: View Analytics**
```
┌─────────────────────────────────────────────────────────┐
│ ExecutiveDashboardPage.tsx                              │
│ ├── GET /api/dashboard/stats                            │
│ │   ├── Total rides (all time)                          │
│ │   ├── Rides this month                                │
│ │   ├── Active drivers                                  │
│ │   ├── Total patients                                  │
│ │   └── Average response time                           │
│ ├── GET /api/reports/rides?period=month                 │
│ │   └── Chart: Rides per day                            │
│ ├── GET /api/reports/drivers                            │
│ │   └── Chart: Driver performance                       │
│ └── Export to PDF/Excel                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### **Frontend**
```
Core:
├── React 19.1.1                     # UI library
├── TypeScript 5.8.2                 # Type safety
├── Vite 6.2.0                       # Build tool
└── TailwindCSS                      # Styling

UI Components:
├── Custom components (165 files)
├── Leaflet 1.9.4                    # Maps
├── React Leaflet 5.0.0              # React bindings
├── Day.js 1.11.18                   # Date handling
└── Lucide React                     # Icons

State Management:
├── React useState                   # Local state
├── React Context                    # Global state
└── localStorage                     # Persistence
```

### **Backend**
```
Core:
├── Node.js 20+                      # Runtime
├── Express 4.19.2                   # Web framework
├── TypeScript 5.4.5                 # Type safety
└── ts-node 10.9.2                   # TS execution

Database:
├── SQLite 3                         # Database
├── better-sqlite3 12.5.0            # SQLite driver
└── WAL mode                         # Concurrency

Security:
├── jsonwebtoken 9.0.2               # JWT auth
├── bcrypt 6.0.0                     # Password hashing
├── helmet 8.1.0                     # Security headers
├── cors 2.8.5                       # CORS handling
├── express-rate-limit 8.2.1         # Rate limiting
├── express-validator 7.3.1          # Input validation
├── csurf 1.11.0                     # CSRF protection
└── joi 18.0.2                       # Schema validation

File Handling:
└── multer 2.0.2                     # File uploads
```

### **Development Tools**
```
Frontend:
├── Vite dev server                  # Hot reload
├── TypeScript compiler              # Type checking
└── ESLint                           # Linting

Backend:
├── nodemon 3.1.0                    # Auto-restart
├── ts-node                          # TS execution
└── TypeScript compiler              # Type checking

Testing:
├── PowerShell scripts (100+ files)  # E2E tests
├── API testing scripts              # Integration tests
└── Manual QA                        # User acceptance
```

### **Deployment**
```
Frontend:
├── Build: npm run build             # Vite build
├── Output: dist/                    # Static files
└── Deploy: FTP / Netlify            # Hosting

Backend:
├── Build: npm run build             # TypeScript compile
├── Output: dist/                    # JavaScript files
├── Start: npm start                 # Production server
└── Deploy: VPS / Railway            # Node.js hosting

Database:
└── SQLite file (wecare.db)          # Portable database
```

---

## 📊 สรุป

### **ขนาดโครงการ:**
```
Frontend:
├── Components: 165 files
├── Pages: 34 files
├── Icons: 76 files
├── UI Components: 21 files
└── Total: ~300 files

Backend:
├── Routes: 18 files
├── Middleware: 10 files
├── Database: 14 tables
└── Total: ~50 files

Tests:
└── PowerShell scripts: 100+ files

Documentation:
└── Markdown files: 50+ files
```

### **Database:**
```
Tables: 14
Records: ~15 (development)
Size: 237 KB
Indexes: 25
```

### **API Endpoints:**
```
Total: ~80 endpoints
Authentication: 5
Users: 7
Patients: 7
Drivers: 7
Rides: 9
Vehicles: 5
Teams: 5
News: 6
Reports: 4
Dashboard: 3
System: 3
```

### **User Roles:**
```
1. DEVELOPER (full access)
2. admin (administrative)
3. OFFICER (operational)
4. radio / radio_center (dispatch)
5. driver (job execution)
6. community (patient & ride management)
7. EXECUTIVE (analytics)
```

---

## 🎯 Key Features

### **Core Functionality:**
✅ User authentication & authorization (JWT + RBAC)  
✅ Patient registration & management  
✅ Ride request & assignment  
✅ Driver management & tracking  
✅ Real-time GPS location tracking  
✅ Vehicle & vehicle type management  
✅ Team management  
✅ News management (public + admin)  
✅ Audit logging (all actions)  
✅ Dashboard & analytics  
✅ Report generation & export  
✅ Map integration (Leaflet)  
✅ File upload (patient attachments)  
✅ Schedule management  
✅ System settings  

### **Security Features:**
✅ JWT authentication  
✅ RBAC (Role-Based Access Control)  
✅ CSRF protection  
✅ Rate limiting  
✅ SQL injection prevention  
✅ XSS prevention  
✅ Password hashing (bcrypt)  
✅ Security headers (Helmet)  
✅ Input validation (Joi)  
✅ Audit logging  
✅ Domain validation  
✅ Idempotency  

### **Performance Features:**
✅ Database indexing  
✅ WAL mode (SQLite)  
✅ Prepared statements  
✅ Pagination  
✅ Lazy loading  
✅ Caching (localStorage)  

---

**สิ้นสุดเอกสารโครงสร้างเชิงลึก EMS WeCare** 🎉
