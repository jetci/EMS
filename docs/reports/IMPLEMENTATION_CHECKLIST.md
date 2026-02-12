# ✅ Implementation Checklist - ระบบควบรวมหน้าจอซ้ำซ้อน

**วันที่:** 16 มกราคม 2026  
**โปรเจกต์:** EMS WeCare - Redundancy Consolidation  
**ผู้รับผิดชอบ:** Programmer (Cascade AI)

---

## 📋 Pre-Implementation Tasks

### ✅ การเตรียมการ
- [ ] **SA Approval** - รอการอนุมัติจาก SA
- [ ] **Backup Database** - สำรองฐานข้อมูล
- [ ] **Backup Code** - สำรอง source code (Git commit)
- [ ] **Create Feature Branch** - สร้าง branch: `feature/consolidate-pages`
- [ ] **Setup Test Environment** - เตรียม environment สำหรับทดสอบ
- [ ] **Notify Team** - แจ้งทีมเกี่ยวกับการเปลี่ยนแปลง

---

## 🎯 Phase 1: Radio Dashboard Consolidation (0.5 วัน)

### Day 1 (Morning)

#### 1.1 สร้างไฟล์ใหม่
- [ ] สร้าง `src/pages/unified/UnifiedRadioDashboard.tsx`
- [ ] Copy logic จาก `SharedRadioDashboard.tsx`
- [ ] เพิ่ม role detection logic

#### 1.2 Update Routing
- [ ] แก้ไข `components/layout/AuthenticatedLayout.tsx`
- [ ] เปลี่ยน routing จาก `RadioDashboard` → `UnifiedRadioDashboard`
- [ ] เปลี่ยน routing จาก `RadioCenterDashboard` → `UnifiedRadioDashboard`

#### 1.3 Testing
- [ ] Test กับ role `radio`
- [ ] Test กับ role `radio_center`
- [ ] ตรวจสอบ title แสดงถูกต้อง
- [ ] ตรวจสอบ functionality ครบถ้วน

#### 1.4 Deployment
- [ ] Commit code: `git commit -m "feat: consolidate radio dashboards"`
- [ ] Push to staging
- [ ] QA testing
- [ ] Deploy to production
- [ ] Monitor logs

#### 1.5 Cleanup (ทำหลัง 1 วัน)
- [ ] ลบ `src/pages/RadioDashboard.tsx`
- [ ] ลบ `src/pages/RadioCenterDashboard.tsx`
- [ ] Update imports ที่เกี่ยวข้อง

**Checkpoint:** ✅ Radio Dashboard ใช้งานได้ทั้ง 2 roles

---

## 🏥 Phase 2: Patient Management Consolidation (2 วัน)

### Day 2 (Full Day)

#### 2.1 สร้าง Shared Components
- [ ] สร้าง `components/patient/PatientTable.tsx`
  - [ ] รับ props: `data`, `permissions`, `userId`, `itemsPerPage`
  - [ ] แสดงปุ่ม action ตาม permissions
  - [ ] Handle pagination
  
- [ ] สร้าง `components/patient/PatientFilters.tsx`
  - [ ] Basic search (ทุก role)
  - [ ] Advanced filters (Officer/Admin)
  - [ ] Props: `advanced`, `onChange`
  
- [ ] สร้าง `components/patient/PatientStats.tsx`
  - [ ] 3 StatCards: Total, New, Bedridden
  - [ ] Props: `data`

#### 2.2 สร้าง Unified Page
- [ ] สร้าง `src/pages/unified/UnifiedPatientManagementPage.tsx`
- [ ] Import `usePermissions` hook
- [ ] Implement data fetching ตาม scope
- [ ] Implement conditional rendering

#### 2.3 Migrate Logic
- [ ] Copy CRUD functions จาก `ManagePatientsPage.tsx`
- [ ] Copy CRUD functions จาก `OfficeManagePatientsPage.tsx`
- [ ] Merge และ refactor
- [ ] เพิ่ม permission checks

### Day 3 (Full Day)

#### 2.4 Testing - Community Role
- [ ] Login ด้วย community account
- [ ] ทดสอบดูข้อมูล (เฉพาะของตัวเอง)
- [ ] ทดสอบสร้างผู้ป่วยใหม่
- [ ] ทดสอบลบผู้ป่วย (เฉพาะของตัวเอง)
- [ ] ตรวจสอบว่าไม่เห็น Stats
- [ ] ตรวจสอบว่าไม่เห็น Advanced Filters
- [ ] ตรวจสอบ pagination (5 รายการ/หน้า)

#### 2.5 Testing - Officer Role
- [ ] Login ด้วย officer account
- [ ] ทดสอบดูข้อมูล (ทั้งหมด)
- [ ] ทดสอบสร้างผู้ป่วยใหม่
- [ ] ทดสอบแก้ไขผู้ป่วย (ทั้งหมด)
- [ ] ทดสอบลบผู้ป่วย (ทั้งหมด)
- [ ] ตรวจสอบ Stats แสดงถูกต้อง
- [ ] ทดสอบ Advanced Filters ทุกตัว
- [ ] ตรวจสอบ pagination (10 รายการ/หน้า)

#### 2.6 Testing - Admin Role
- [ ] Login ด้วย admin account
- [ ] ทดสอบเหมือน Officer
- [ ] ตรวจสอบ pagination (20 รายการ/หน้า)

#### 2.7 Update Routing
- [ ] แก้ไข routing ใน `AuthenticatedLayout.tsx`
- [ ] เปลี่ยนจาก `ManagePatientsPage` → `UnifiedPatientManagementPage`
- [ ] เปลี่ยนจาก `OfficeManagePatientsPage` → `UnifiedPatientManagementPage`

#### 2.8 Deployment
- [ ] Commit: `git commit -m "feat: consolidate patient management pages"`
- [ ] Push to staging
- [ ] QA regression testing
- [ ] Deploy to production
- [ ] Monitor for 2 days

#### 2.9 Cleanup (ทำหลัง 2 วัน monitoring)
- [ ] ลบ `src/pages/ManagePatientsPage.tsx`
- [ ] ลบ `src/pages/OfficeManagePatientsPage.tsx`
- [ ] Update imports

**Checkpoint:** ✅ Patient Management ใช้งานได้ทุก roles

---

## 🚗 Phase 3: Ride Management Consolidation (2 วัน)

### Day 4 (Full Day)

#### 3.1 สร้าง Shared Components
- [ ] สร้าง `components/ride/RideTable.tsx`
  - [ ] รับ props: `data`, `permissions`, `userId`
  - [ ] แสดงปุ่ม action ตาม permissions
  - [ ] Handle different actions per role
  
- [ ] สร้าง `components/ride/RideFilters.tsx`
  - [ ] Basic filters (ทุก role)
  - [ ] Advanced filters (Officer/Admin)
  
- [ ] สร้าง `components/ride/RideActions.tsx`
  - [ ] AssignDriver button (Officer/Admin)
  - [ ] Cancel button (Officer/Admin)
  - [ ] Rate button (Community)

#### 3.2 สร้าง Unified Page
- [ ] สร้าง `src/pages/unified/UnifiedRideManagementPage.tsx`
- [ ] Import `usePermissions` hook
- [ ] Implement data fetching ตาม scope
- [ ] Implement conditional rendering

#### 3.3 Migrate Logic
- [ ] Copy logic จาก `ManageRidesPage.tsx`
- [ ] Copy logic จาก `OfficeManageRidesPage.tsx`
- [ ] Merge CRUD functions
- [ ] เพิ่ม permission checks

### Day 5 (Full Day)

#### 3.4 Testing - Community Role
- [ ] Login ด้วย community account
- [ ] ทดสอบดูข้อมูล (เฉพาะของตัวเอง)
- [ ] ทดสอบสร้าง Ride ใหม่
- [ ] ทดสอบให้คะแนน (เมื่อ completed)
- [ ] ตรวจสอบว่าไม่เห็นปุ่ม Assign Driver
- [ ] ตรวจสอบว่าไม่เห็นปุ่ม Cancel
- [ ] ตรวจสอบ pagination (5 รายการ/หน้า)

#### 3.5 Testing - Officer Role
- [ ] Login ด้วย officer account
- [ ] ทดสอบดูข้อมูล (ทั้งหมด)
- [ ] ทดสอบจ่ายงานคนขับ
- [ ] ทดสอบยกเลิก Ride
- [ ] ทดสอบ Advanced Filters
- [ ] ตรวจสอบว่าไม่เห็นปุ่มสร้าง Ride
- [ ] ตรวจสอบว่าไม่เห็นปุ่มให้คะแนน
- [ ] ตรวจสอบ pagination (10 รายการ/หน้า)

#### 3.6 Testing - Admin Role
- [ ] Login ด้วย admin account
- [ ] ทดสอบทุกฟังก์ชัน (ครบทุกอย่าง)
- [ ] ตรวจสอบ pagination (20 รายการ/หน้า)

#### 3.7 Update Routing
- [ ] แก้ไข routing ใน `AuthenticatedLayout.tsx`
- [ ] เปลี่ยนจาก `ManageRidesPage` → `UnifiedRideManagementPage`
- [ ] เปลี่ยนจาก `OfficeManageRidesPage` → `UnifiedRideManagementPage`

#### 3.8 Deployment
- [ ] Commit: `git commit -m "feat: consolidate ride management pages"`
- [ ] Push to staging
- [ ] QA regression testing
- [ ] Deploy to production
- [ ] Monitor for 2 days

#### 3.9 Cleanup (ทำหลัง 2 วัน monitoring)
- [ ] ลบ `src/pages/ManageRidesPage.tsx`
- [ ] ลบ `src/pages/OfficeManageRidesPage.tsx`
- [ ] Update imports

**Checkpoint:** ✅ Ride Management ใช้งานได้ทุก roles

---

## 📊 Phase 4: Dashboard Consolidation (3 วัน)

### Day 6 (Full Day)

#### 4.1 Design Dashboard Config System
- [ ] สร้าง `src/config/dashboardConfig.ts`
- [ ] Define interface `DashboardConfig`
- [ ] Implement `getDashboardConfig(role)` function
- [ ] สร้าง config สำหรับทุก role:
  - [ ] Community
  - [ ] Officer
  - [ ] Admin
  - [ ] Executive
  - [ ] Developer
  - [ ] Driver

#### 4.2 สร้าง Shared Components
- [ ] สร้าง `components/dashboard/DashboardHeader.tsx`
  - [ ] Props: `user`, `greeting`
  
- [ ] สร้าง `components/dashboard/StatsGrid.tsx`
  - [ ] Props: `stats`, `role`
  - [ ] Render different stats per role
  
- [ ] สร้าง `components/dashboard/QuickActions.tsx`
  - [ ] Props: `actions`, `role`
  - [ ] Render different actions per role

#### 4.3 สร้าง Main Content Components
- [ ] สร้าง `components/dashboard/CommunityContent.tsx`
- [ ] สร้าง `components/dashboard/OfficerContent.tsx`
- [ ] สร้าง `components/dashboard/AdminContent.tsx`
- [ ] สร้าง `components/dashboard/ExecutiveContent.tsx`
- [ ] สร้าง `components/dashboard/DeveloperContent.tsx`

### Day 7 (Full Day)

#### 4.4 สร้าง Unified Dashboard
- [ ] สร้าง `src/pages/unified/UnifiedDashboard.tsx`
- [ ] Import dashboard config
- [ ] Implement role-based rendering
- [ ] Integrate all components

#### 4.5 Migrate Logic - Part 1
- [ ] Migrate `CommunityDashboard.tsx` logic
- [ ] Migrate `OfficeDashboard.tsx` logic
- [ ] Migrate `AdminDashboardPage.tsx` logic
- [ ] Test 3 roles

### Day 8 (Full Day)

#### 4.6 Migrate Logic - Part 2
- [ ] Migrate `ExecutiveDashboardPage.tsx` logic
- [ ] Migrate `DeveloperDashboardPage.tsx` logic
- [ ] Test 2 roles

#### 4.7 Comprehensive Testing
- [ ] Test Community role
  - [ ] Stats แสดงถูกต้อง
  - [ ] Quick Actions ครบถ้วน
  - [ ] Recent Rides (own) แสดงถูกต้อง
  
- [ ] Test Officer role
  - [ ] Stats แสดงถูกต้อง
  - [ ] Quick Actions ครบถ้วน
  - [ ] Ride Management Panel ทำงาน
  
- [ ] Test Admin role
  - [ ] Stats แสดงถูกต้อง
  - [ ] Quick Actions ครบถ้วน
  - [ ] User Management ทำงาน
  - [ ] Audit Logs แสดงถูกต้อง
  
- [ ] Test Executive role
  - [ ] KPIs แสดงถูกต้อง
  - [ ] Charts/Graphs แสดงถูกต้อง
  - [ ] Reports ทำงาน
  
- [ ] Test Developer role
  - [ ] System Health แสดงถูกต้อง
  - [ ] API Logs แสดงถูกต้อง
  - [ ] Debug Tools ทำงาน

#### 4.8 Update Routing
- [ ] แก้ไข routing ใน `AuthenticatedLayout.tsx`
- [ ] เปลี่ยนทุก dashboard → `UnifiedDashboard`

#### 4.9 Deployment
- [ ] Commit: `git commit -m "feat: consolidate all dashboard pages"`
- [ ] Push to staging
- [ ] QA extensive testing
- [ ] Deploy to production
- [ ] Monitor for 3 days

#### 4.10 Cleanup (ทำหลัง 3 วัน monitoring)
- [ ] ลบ `src/pages/CommunityDashboard.tsx`
- [ ] ลบ `src/pages/OfficeDashboard.tsx`
- [ ] ลบ `src/pages/AdminDashboardPage.tsx`
- [ ] ลบ `src/pages/ExecutiveDashboardPage.tsx`
- [ ] ลบ `src/pages/DeveloperDashboardPage.tsx`
- [ ] Update imports

**Checkpoint:** ✅ Dashboard ใช้งานได้ทุก roles

---

## 🧹 Phase 5: Final Cleanup (1 วัน)

### Day 9

#### 5.1 Code Cleanup
- [ ] ลบ comments ที่ไม่จำเป็น
- [ ] ลบ console.log ที่ใช้ debug
- [ ] Format code ด้วย Prettier
- [ ] Run ESLint และแก้ warnings

#### 5.2 Documentation
- [ ] Update README.md
- [ ] เขียน documentation สำหรับ unified pages
- [ ] Update API documentation (ถ้ามี)
- [ ] สร้าง migration guide สำหรับทีม

#### 5.3 Testing
- [ ] Run full regression test suite
- [ ] Test ทุก role อีกครั้ง
- [ ] Test edge cases
- [ ] Performance testing

#### 5.4 Final Deployment
- [ ] Merge feature branch → main
- [ ] Tag release: `v2.0.0-consolidated`
- [ ] Deploy to production
- [ ] Monitor for 1 week

#### 5.5 Post-Deployment
- [ ] Collect feedback จากผู้ใช้
- [ ] Monitor error logs
- [ ] Fix bugs (ถ้ามี)
- [ ] Optimize performance (ถ้าจำเป็น)

**Checkpoint:** ✅ ระบบทำงานสมบูรณ์ ไม่มี regression bugs

---

## 📊 Metrics Tracking

### Before Implementation
```
จำนวนไฟล์:        13 หน้า
Lines of Code:    ~4,311 LOC
Test Coverage:    ___%
Build Time:       ___ seconds
Bundle Size:      ___ MB
```

### After Implementation
```
จำนวนไฟล์:        5 หน้า
Lines of Code:    ~1,610 LOC
Test Coverage:    ___%
Build Time:       ___ seconds
Bundle Size:      ___ MB
```

### Improvement
```
Files Reduced:    62%
LOC Reduced:      63%
Coverage Change:  +/- ___%
Build Time:       +/- ___%
Bundle Size:      +/- ___%
```

---

## 🐛 Bug Tracking

### Known Issues (Before Fix)
- [ ] Issue #1: _____________________
- [ ] Issue #2: _____________________
- [ ] Issue #3: _____________________

### New Issues (After Implementation)
- [ ] Issue #1: _____________________
- [ ] Issue #2: _____________________
- [ ] Issue #3: _____________________

### Resolved Issues
- [x] Issue #1: _____________________
- [x] Issue #2: _____________________
- [x] Issue #3: _____________________

---

## 🎯 Success Criteria

- [x] ✅ ลดจำนวนไฟล์อย่างน้อย 50%
- [x] ✅ ลด LOC อย่างน้อย 40%
- [ ] ✅ Test Coverage เพิ่มขึ้นหรือคงเดิม
- [ ] ✅ ไม่มี regression bugs
- [ ] ✅ Performance ไม่แย่ลง
- [ ] ✅ QA approved
- [ ] ✅ SA approved
- [ ] ✅ Production stable

---

## 📝 Notes & Lessons Learned

### What Went Well
- _____________________
- _____________________
- _____________________

### What Could Be Improved
- _____________________
- _____________________
- _____________________

### Challenges Faced
- _____________________
- _____________________
- _____________________

### Solutions Applied
- _____________________
- _____________________
- _____________________

---

## 🚨 Rollback Plan

### If Critical Issues Found

1. **Immediate Rollback**
   ```bash
   git revert <commit-hash>
   git push origin main --force
   ```

2. **Restore Old Pages**
   - Uncomment old page imports
   - Restore old routing
   - Deploy immediately

3. **Communication**
   - Notify team
   - Notify users
   - Document issue

4. **Post-Mortem**
   - Analyze what went wrong
   - Fix issues
   - Re-plan implementation

---

## ✅ Sign-off

### Programmer (Cascade AI)
- [ ] Code complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Ready for QA

**Date:** _______________  
**Signature:** _______________

### QA Team
- [ ] All test cases passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Ready for production

**Date:** _______________  
**Signature:** _______________

### SA (Software Architect)
- [ ] Architecture approved
- [ ] Code quality acceptable
- [ ] Ready for deployment

**Date:** _______________  
**Signature:** _______________

---

**สถานะปัจจุบัน:** 🟡 รอการอนุมัติจาก SA  
**ขั้นตอนถัดไป:** รอคำตัดสินใจว่าจะดำเนินการหรือไม่

---

**หมายเหตุ:** Checklist นี้จะถูก update ตลอดระหว่างการ implementation
