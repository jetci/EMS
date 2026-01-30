# 📘 คู่มือโครงสร้างแอป EMS WeCare
## ส่วนที่ 2: โครงสร้าง Frontend

**โครงการ:** EMS WeCare (Emergency Medical Services - We Care)  
**วันที่จัดทำ:** 29 มกราคม 2569  
**เวอร์ชัน:** 4.0

---

## 📋 สารบัญ

1. [ภาพรวม Frontend](#ภาพรวม-frontend)
2. [โครงสร้างโฟลเดอร์ Frontend](#โครงสร้างโฟลเดอร์-frontend)
3. [Pages (หน้าจอ)](#pages-หน้าจอ)
4. [Components (คอมโพเนนต์)](#components-คอมโพเนนต์)
5. [Services (บริการ API)](#services-บริการ-api)
6. [Routing และ Navigation](#routing-และ-navigation)
7. [State Management](#state-management)
8. [Authentication Flow](#authentication-flow)

---

## 🎨 ภาพรวม Frontend

### เทคโนโลยีหลัก
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** TailwindCSS + Vanilla CSS
- **Routing:** React Router DOM v7
- **Maps:** Leaflet + React-Leaflet
- **Real-time:** Socket.io-client
- **HTTP Client:** Axios

### Component Hierarchy

```
App.tsx (Root Component)
│
├── Unauthenticated Routes
│   ├── PublicHeader
│   ├── LandingPage
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── AboutUsScreen
│   ├── ContactUsScreen
│   ├── PublicNewsListingPage
│   ├── PublicSingleNewsPage
│   └── PublicFooter
│
└── Authenticated Routes
    └── AuthenticatedLayout
        ├── Sidebar (Role-based menu)
        ├── TopBar (User info, notifications)
        └── Main Content Area
            └── Role-specific Dashboard/Pages
                ├── DEVELOPER → DeveloperDashboardPage
                ├── ADMIN → AdminDashboardPage
                ├── OFFICER → OfficeDashboard
                ├── DRIVER → DriverTodayJobsPage
                ├── COMMUNITY → CommunityDashboard
                └── EXECUTIVE → ExecutiveDashboardPage
```

---

## 📁 โครงสร้างโฟลเดอร์ Frontend

### ภาพรวมโครงสร้าง

```
d:\EMS\
├── src/                                  # Main source directory
│   ├── pages/                           # 41 page components
│   ├── services/                        # 5 API service files
│   ├── utils/                           # 2 utility files
│   ├── hooks/                           # 3 custom hooks
│   ├── types/                           # 1 type definition file
│   ├── theme/                           # 1 theme config file
│   ├── config/                          # 1 config file
│   ├── styles/                          # 1 global styles
│   └── main.tsx                         # React entry point
│
├── components/                          # 167 reusable components
│   ├── admin/                           # 5 files
│   ├── charts/                          # 3 files
│   ├── dashboard/                       # 3 files
│   ├── driver/                          # 2 files
│   ├── executive/                       # 1 file
│   ├── icons/                           # 76 files
│   ├── illustrations/                   # 1 file
│   ├── layout/                          # 4 files
│   ├── modals/                          # 15 files
│   ├── news/                            # 3 files
│   ├── radio/                           # 1 file
│   ├── reports/                         # 1 file
│   ├── rides/                           # 1 file
│   ├── schedules/                       # 4 files
│   ├── teams/                           # 1 file
│   ├── ui/                              # 21 files
│   └── ... (other standalone components)
│
├── App.tsx                              # Root component
├── types.ts                             # Global TypeScript types
├── index.html                           # HTML entry point
├── vite.config.ts                       # Vite configuration
├── tsconfig.json                        # TypeScript config
├── tailwind.config.js                   # TailwindCSS config
└── package.json                         # Dependencies
```

---

## 📄 Pages (หน้าจอ)

### รายการหน้าจอทั้งหมด (41 ไฟล์)

#### 🏠 Public Pages (6 หน้า)
```
src/pages/
├── LandingPage.tsx                      # หน้าแรก (Public)
├── LoginScreen.tsx                      # เข้าสู่ระบบ
├── RegisterScreen.tsx                   # ลงทะเบียน
├── AboutUsScreen.tsx                    # เกี่ยวกับเรา
├── ContactUsScreen.tsx                  # ติดต่อเรา
├── PublicNewsListingPage.tsx           # รายการข่าว (Public)
└── PublicSingleNewsPage.tsx            # อ่านข่าว (Public)
```

#### 🔧 Developer Pages (1 หน้า)
```
src/pages/
└── DeveloperDashboardPage.tsx          # Dashboard นักพัฒนา
```

#### 👨‍💼 Admin Pages (4 หน้า)
```
src/pages/
├── AdminDashboardPage.tsx              # Dashboard ผู้ดูแลระบบ
├── AdminUserManagementPage.tsx         # จัดการผู้ใช้
├── AdminAuditLogsPage.tsx              # ดู Audit Logs
└── AdminSystemSettingsPage.tsx         # ตั้งค่าระบบ
```

#### 📞 Officer/Radio Pages (5 หน้า)
```
src/pages/
├── OfficeDashboard.tsx                 # Dashboard เจ้าหน้าที่
├── RadioDashboard.tsx                  # Dashboard ศูนย์วิทยุ
├── RadioCenterDashboard.tsx            # Dashboard ศูนย์ควบคุม
├── OfficeManagePatientsPage.tsx        # จัดการผู้ป่วย
├── OfficeManageRidesPage.tsx           # จัดการการเดินทาง
├── OfficeManageDriversPage.tsx         # จัดการคนขับ
├── OfficeReportsPage.tsx               # รายงาน
└── MapCommandPage.tsx                  # แผนที่ควบคุม
```

#### 🚗 Driver Pages (3 หน้า)
```
src/pages/
├── DriverTodayJobsPage.tsx             # งานวันนี้
├── DriverHistoryPage.tsx               # ประวัติการทำงาน
└── DriverProfilePage.tsx               # โปรไฟล์คนขับ
```

#### 🏘️ Community Pages (6 หน้า)
```
src/pages/
├── CommunityDashboard.tsx              # Dashboard ประชาชน
├── CommunityProfilePage.tsx            # โปรไฟล์
├── CommunityRegisterPatientPage.tsx    # ลงทะเบียนผู้ป่วย (Wizard)
├── CommunityRequestRidePage.tsx        # เรียกรถพยาบาล
├── ManagePatientsPage.tsx              # จัดการผู้ป่วย
├── ManageRidesPage.tsx                 # ดูสถานะการเดินทาง
└── PatientDetailPage.tsx               # รายละเอียดผู้ป่วย
```

#### 📊 Executive Pages (1 หน้า)
```
src/pages/
└── ExecutiveDashboardPage.tsx          # Dashboard ผู้บริหาร
```

#### 🔧 Management Pages (10 หน้า)
```
src/pages/
├── ManageNewsPage.tsx                  # จัดการข่าวสาร
├── NewsEditorPage.tsx                  # แก้ไขข่าว
├── ManageSchedulePage.tsx              # จัดการตารางงาน
├── ManageTeamsPage.tsx                 # จัดการทีม
├── ManageVehiclesPage.tsx              # จัดการรถพยาบาล
├── ManageVehicleTypesPage.tsx          # จัดการประเภทรถ
├── SystemLogsPage.tsx                  # ดู System Logs
└── TestMapPage.tsx                     # ทดสอบแผนที่
```

### รายละเอียดหน้าสำคัญ

#### 1. CommunityRegisterPatientPage.tsx
**Wizard 5 ขั้นตอนในการลงทะเบียนผู้ป่วย**

```typescript
// Step 1: ข้อมูลพื้นฐาน
- ชื่อ-นามสกุล
- เลขบัตรประชาชน
- วันเกิด / อายุ
- เพศ
- กลุ่มเลือด

// Step 2: ที่อยู่
- ที่อยู่ตามบัตรประชาชน
- ที่อยู่ปัจจุบัน
- เบอร์โทรติดต่อ

// Step 3: ตำแหน่งบนแผนที่
- เลือกตำแหน่งบนแผนที่ Leaflet
- ระบุ Landmark

// Step 4: ข้อมูลสุขภาพ
- ประเภทผู้ป่วย (ติดเตียง, ผู้สูงอายุ, ฯลฯ)
- โรคประจำตัว
- ประวัติแพ้ยา

// Step 5: อัปโหลดรูปภาพและเอกสาร
- รูปโปรไฟล์
- สำเนาบัตรประชาชน
- เอกสารอื่นๆ
```

#### 2. CommunityRequestRidePage.tsx
**เรียกรถพยาบาล**

```typescript
// Features:
- เลือกผู้ป่วยจาก Dropdown (Auto-populate ข้อมูล)
- กรอกสถานที่รับ (Pickup Location)
- กรอกปลายทาง (Destination)
- เลือกเวลานัดหมาย
- ระบุประเภทการเดินทาง
- ระบุความต้องการพิเศษ
- บันทึกหมายเหตุ
```

#### 3. OfficeDashboard.tsx
**Dashboard ศูนย์ควบคุม**

```typescript
// Real-time Features:
- แสดงคำขอใหม่ (Socket.io)
- สถานะรถพยาบาลทั้งหมด
- คนขับที่พร้อมให้บริการ
- แผนที่แสดงตำแหน่ง Real-time
- สถิติการให้บริการ
```

#### 4. DriverTodayJobsPage.tsx
**งานวันนี้ของคนขับ**

```typescript
// Features:
- รายการงานที่ได้รับมอบหมาย
- อัปเดตสถานะงาน (รับงาน, เริ่มเดินทาง, เสร็จสิ้น)
- ดูรายละเอียดผู้ป่วย
- ดูเส้นทางบนแผนที่
- AI Route Optimization (Gemini)
- ส่งตำแหน่ง GPS Real-time
```

---

## 🧩 Components (คอมโพเนนต์)

### การจัดหมวดหมู่ Components (167 ไฟล์)

#### 1. Admin Components (5 ไฟล์)
```
components/admin/
├── AdminUserForm.tsx                   # ฟอร์มสร้าง/แก้ไขผู้ใช้
├── AdminUserTable.tsx                  # ตารางแสดงผู้ใช้
├── AuditLogTable.tsx                   # ตาราง Audit Logs
├── SystemSettingsForm.tsx              # ฟอร์มตั้งค่าระบบ
└── UserManagementFilters.tsx           # ฟิลเตอร์ค้นหาผู้ใช้
```

#### 2. Chart Components (3 ไฟล์)
```
components/charts/
├── BarChart.tsx                        # กราฟแท่ง
├── LineChart.tsx                       # กราฟเส้น
└── PieChart.tsx                        # กราฟวงกลม
```

#### 3. Dashboard Components (3 ไฟล์)
```
components/dashboard/
├── DashboardCard.tsx                   # การ์ดแสดงข้อมูล
├── StatCard.tsx                        # การ์ดสถิติ
└── QuickActions.tsx                    # ปุ่มด่วน
```

#### 4. Driver Components (2 ไฟล์)
```
components/driver/
├── DriverJobCard.tsx                   # การ์ดแสดงงาน
└── DriverLocationTracker.tsx           # ติดตามตำแหน่ง GPS
```

#### 5. Icon Components (76 ไฟล์)
```
components/icons/
├── AlertIcon.tsx
├── UserIcon.tsx
├── CarIcon.tsx
├── MapIcon.tsx
├── CalendarIcon.tsx
├── ChartIcon.tsx
├── SettingsIcon.tsx
└── ... (69 more icons)
```

#### 6. Layout Components (4 ไฟล์)
```
components/layout/
├── AuthenticatedLayout.tsx             # Layout หลักสำหรับผู้ใช้ที่ล็อกอิน
├── DashboardLayout.tsx                 # Layout สำหรับ Dashboard
├── Sidebar.tsx                         # เมนูด้านข้าง (Role-based)
└── TopBar.tsx                          # แถบด้านบน (User info, Logout)
```

**AuthenticatedLayout.tsx:**
```typescript
// Structure:
<div className="flex h-screen">
  <Sidebar role={user.role} />
  <div className="flex-1 flex flex-col">
    <TopBar user={user} />
    <main className="flex-1 overflow-auto">
      {children}
    </main>
  </div>
</div>
```

#### 7. Modal Components (15 ไฟล์)
```
components/modals/
├── ConfirmDeleteModal.tsx              # ยืนยันการลบ
├── EditPatientModal.tsx                # แก้ไขผู้ป่วย
├── EditRideModal.tsx                   # แก้ไขการเดินทาง
├── AssignDriverModal.tsx               # มอบหมายคนขับ
├── ViewPatientModal.tsx                # ดูรายละเอียดผู้ป่วย
├── ViewRideModal.tsx                   # ดูรายละเอียดการเดินทาง
├── CreateNewsModal.tsx                 # สร้างข่าว
├── EditNewsModal.tsx                   # แก้ไขข่าว
├── UploadImageModal.tsx                # อัปโหลดรูปภาพ
└── ... (6 more modals)
```

#### 8. UI Components (21 ไฟล์)
```
components/ui/
├── Button.tsx                          # ปุ่ม
├── Input.tsx                           # ช่องกรอกข้อมูล
├── Select.tsx                          # Dropdown
├── Modal.tsx                           # Modal พื้นฐาน
├── Table.tsx                           # ตาราง
├── Pagination.tsx                      # Pagination
├── Badge.tsx                           # Badge/Tag
├── StatusBadge.tsx                     # Badge สถานะ
├── ModernDatePicker.tsx                # เลือกวันที่
├── ThaiTimePicker.tsx                  # เลือกเวลา (ไทย)
├── MultiSelectAutocomplete.tsx         # เลือกหลายรายการ
├── TagInput.tsx                        # กรอก Tags
├── ToggleSwitch.tsx                    # สวิตช์
├── StarRating.tsx                      # ให้คะแนน
├── PasswordStrengthIndicator.tsx       # แสดงความแข็งแรงรหัสผ่าน
├── ActionSheet.tsx                     # Action Sheet
└── ... (5 more UI components)
```

#### 9. Map Components (3 ไฟล์)
```
components/
├── LeafletMapPicker.tsx                # แผนที่เลือกตำแหน่ง (Full)
├── SimpleLeafletMapPicker.tsx          # แผนที่เลือกตำแหน่ง (Simple)
└── RouteMiniMap.tsx                    # แผนที่ขนาดเล็กแสดงเส้นทาง
```

#### 10. Other Components
```
components/
├── Dashboard.tsx                       # Dashboard component
├── ErrorBoundary.tsx                   # จัดการ Error
├── ErrorFallback.tsx                   # UI เมื่อเกิด Error
├── LoadingSpinner.tsx                  # Loading indicator
├── Toast.tsx                           # Toast notification
├── Header.tsx                          # Header
├── PublicHeader.tsx                    # Public header
├── PublicFooter.tsx                    # Public footer
├── RideCard.tsx                        # การ์ดแสดงการเดินทาง
└── RideList.tsx                        # รายการการเดินทาง
```

---

## 🔌 Services (บริการ API)

### รายการ Service Files (5 ไฟล์)

```
src/services/
├── api.ts                              # Main API client
├── geminiService.ts                    # AI Route Optimization
├── socketService.ts                    # Real-time updates
├── dashboardService.ts                 # Dashboard data
└── authService.ts                      # Authentication (ถ้ามี)
```

### 1. api.ts - Main API Client

```typescript
// Base Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Axios Instance with Interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Add JWT Token)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor (Handle Errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Functions
export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (data) => apiClient.post('/auth/register', data),
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};

export const patientsAPI = {
  getAll: (params) => apiClient.get('/patients', { params }),
  getById: (id) => apiClient.get(`/patients/${id}`),
  create: (data) => apiClient.post('/patients', data),
  update: (id, data) => apiClient.put(`/patients/${id}`, data),
  delete: (id) => apiClient.delete(`/patients/${id}`),
};

export const ridesAPI = {
  getAll: (params) => apiClient.get('/rides', { params }),
  getById: (id) => apiClient.get(`/rides/${id}`),
  create: (data) => apiClient.post('/rides', data),
  updateStatus: (id, status, driverId) => 
    apiClient.put(`/rides/${id}`, { status, driver_id: driverId }),
  cancel: (id, reason) => 
    apiClient.delete(`/rides/${id}`, { data: { reason } }),
};

export const driversAPI = {
  getAll: () => apiClient.get('/drivers'),
  getAvailable: () => apiClient.get('/drivers/available'),
  getMyRides: () => apiClient.get('/drivers/my-rides'),
  updateLocation: (lat, lng) => 
    apiClient.put('/driver-locations', { latitude: lat, longitude: lng }),
};

export const adminAPI = {
  getUsers: (params) => apiClient.get('/users', { params }),
  createUser: (data) => apiClient.post('/users', data),
  updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
  getAuditLogs: (params) => apiClient.get('/audit-logs', { params }),
};
```

### 2. socketService.ts - Real-time Updates

```typescript
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io('http://localhost:3001', {
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Listen to events
  onNewRide(callback: (ride: any) => void) {
    this.socket?.on('new_ride', callback);
  }

  onRideUpdate(callback: (ride: any) => void) {
    this.socket?.on('ride_updated', callback);
  }

  onDriverLocationUpdate(callback: (location: any) => void) {
    this.socket?.on('driver_location_update', callback);
  }

  // Emit events
  emitDriverLocation(lat: number, lng: number) {
    this.socket?.emit('update_location', { latitude: lat, longitude: lng });
  }
}

export default new SocketService();
```

### 3. geminiService.ts - AI Route Optimization

```typescript
import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const geminiService = {
  async optimizeRoute(origin: string, destination: string) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `Suggest the best route from ${origin} to ${destination} in Thailand. 
                     Consider traffic, distance, and emergency vehicle priority.`
            }]
          }]
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }
};
```

---

## 🧭 Routing และ Navigation

### Routing Strategy

ระบบใช้ **React Router DOM v7** สำหรับการจัดการ Routing

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/about" element={<AboutUsScreen />} />
        <Route path="/contact" element={<ContactUsScreen />} />
        <Route path="/news" element={<PublicNewsListingPage />} />
        <Route path="/news/:id" element={<PublicSingleNewsPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <AuthenticatedLayout user={user}>
                {renderDashboard(user.role)}
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Role-specific Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/community/*" element={<CommunityRoutes />} />
        <Route path="/driver/*" element={<DriverRoutes />} />
        <Route path="/officer/*" element={<OfficerRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Route Protection

```typescript
// ProtectedRoute Component
function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles: string[] 
}) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user || !user.role) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
}

// Usage
<Route
  path="/admin/users"
  element={
    <ProtectedRoute allowedRoles={['DEVELOPER', 'admin']}>
      <AdminUserManagementPage />
    </ProtectedRoute>
  }
/>
```

---

## 🔄 State Management

### Local State (useState)

```typescript
// Component-level state
const [patients, setPatients] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### Context API

```typescript
// AuthContext.tsx
export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### localStorage

```typescript
// Persistent storage
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Retrieve
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');
```

---

## 🔐 Authentication Flow

### Login Process

```
1. User enters email & password
   ↓
2. Frontend: authAPI.login(email, password)
   ↓
3. POST /api/auth/login
   ↓
4. Backend: Validate credentials
   ↓
5. Backend: Generate JWT token
   ↓
6. Backend: Return { token, user }
   ↓
7. Frontend: Store token & user in localStorage
   ↓
8. Frontend: Set user state
   ↓
9. Frontend: Redirect to dashboard based on role
```

### Auto-login on Page Refresh

```typescript
useEffect(() => {
  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');
  
  if (token && savedUser) {
    setUser(JSON.parse(savedUser));
    // Optionally verify token with backend
    authAPI.getProfile()
      .then(response => setUser(response.data))
      .catch(() => {
        // Token expired
        localStorage.clear();
        navigate('/login');
      });
  }
}, []);
```

### Logout Process

```typescript
const handleLogout = () => {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Clear state
  setUser(null);
  
  // Disconnect socket
  socketService.disconnect();
  
  // Redirect to login
  navigate('/login');
};
```

---

## 📊 Data Flow Example

### การลงทะเบียนผู้ป่วย (Community User)

```
1. CommunityRegisterPatientPage.tsx
   ↓
2. User fills Wizard (5 steps)
   ↓
3. handleWizardComplete(patientData)
   ↓
4. patientsAPI.create(patientData)
   ↓
5. POST /api/patients
   ↓
6. Backend: Validate & Insert to DB
   ↓
7. Backend: Return { id, ...patientData }
   ↓
8. Frontend: Show success message
   ↓
9. Frontend: Navigate to ManagePatientsPage
```

### การเรียกรถพยาบาล (Community User)

```
1. CommunityRequestRidePage.tsx
   ↓
2. Select patient (Auto-populate data)
   ↓
3. Fill destination & details
   ↓
4. handleSubmit(rideData)
   ↓
5. ridesAPI.create(rideData)
   ↓
6. POST /api/rides
   ↓
7. Backend: Create ride & Emit Socket event
   ↓
8. Officer Dashboard receives 'new_ride' event
   ↓
9. Frontend: Show success & Navigate to ManageRidesPage
```

---

## 🔗 เอกสารที่เกี่ยวข้อง

- **คู่มือ 1:** Overview & Architecture (ภาพรวมและสถาปัตยกรรม)
- **คู่มือ 3:** Backend & Database (โครงสร้าง Backend และฐานข้อมูล)
- **คู่มือ 4:** User Roles & Features (การใช้งานตามบทบาท)

---

**จัดทำโดย:** AI Assistant  
**วันที่:** 29 มกราคม 2569  
**เวอร์ชัน:** 1.0
