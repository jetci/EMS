# 🧪 Community Module - QA Test Checklist

**วันที่:** 2026-01-10 21:32 ICT  
**Tester:** QA Team  
**Module:** Community User Role  
**Status:** ✅ READY FOR TESTING

---

## 📋 Test Account

```
Email: community1@wecare.dev
Password: password
Role: COMMUNITY
User ID: USR-COMMUNITY
```

---

## ✅ Pre-Test Verification

### **Environment Setup:**
- [ ] Backend running on http://localhost:3001
- [ ] Frontend running on http://localhost:3000
- [ ] Database accessible (wecare.db)
- [ ] Test account exists and active

### **Known Fixes Applied:**
- [x] BUG-COMM-001: Input Validation ✅
- [x] BUG-COMM-005: Hardcoded API URL ✅
- [x] BUG-COMM-009: Path Traversal ✅

---

## 🧪 Test Scenarios (20 Tests)

### **1. LOGIN & AUTHENTICATION (3 tests)**

#### **TC-001: Login with Valid Credentials**
- [ ] Navigate to http://localhost:3000
- [ ] Enter email: community1@wecare.dev
- [ ] Enter password: password
- [ ] Click "เข้าสู่ระบบ"
- [ ] **Expected:** Redirect to Community Dashboard
- [ ] **Expected:** See welcome message with user name
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-002: Login with Invalid Credentials**
- [ ] Navigate to http://localhost:3000
- [ ] Enter email: community1@wecare.dev
- [ ] Enter password: wrongpassword
- [ ] Click "เข้าสู่ระบบ"
- [ ] **Expected:** Error message "Invalid credentials"
- [ ] **Expected:** Remain on login page
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-003: Logout Successfully**
- [ ] Login as community user
- [ ] Click logout button
- [ ] **Expected:** Redirect to login page
- [ ] **Expected:** Cannot access protected pages
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

---

### **2. PATIENT REGISTRATION (7 tests)**

#### **TC-004: Register New Patient with Valid Data**
- [ ] Login as community user
- [ ] Click "ลงทะเบียนผู้ป่วย"
- [ ] Fill all required fields:
  - [ ] ชื่อ-นามสกุล: สมชาย ทดสอบ
  - [ ] เลขบัตรประชาชน: 1234567890123
  - [ ] เบอร์โทรศัพท์: 081-234-5678
  - [ ] ที่อยู่: 123 ถนนทดสอบ
- [ ] Click "บันทึก"
- [ ] **Expected:** Success message
- [ ] **Expected:** Patient appears in patient list
- [ ] **Expected:** created_by = USR-COMMUNITY
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-005: Validate Thai National ID (13 digits)**
- [ ] Try to register patient with invalid ID
- [ ] Test cases:
  - [ ] Too short: 123456789012 (12 digits)
  - [ ] Too long: 12345678901234 (14 digits)
  - [ ] Invalid format: 123-456-7890-1
  - [ ] Letters: 123456789012A
- [ ] **Expected:** Validation error for each case
- [ ] **Expected:** Cannot submit form
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-006: Validate Phone Number Format**
- [ ] Try to register patient with invalid phone
- [ ] Test cases:
  - [ ] Too short: 081-234-567
  - [ ] Too long: 081-234-56789
  - [ ] Invalid format: 0812345678
  - [ ] Letters: 081-ABC-DEFG
- [ ] **Expected:** Validation error for each case
- [ ] **Expected:** Cannot submit form
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-007: Upload Patient Photo**
- [ ] Click "ลงทะเบียนผู้ป่วย"
- [ ] Fill required fields
- [ ] Click "อัพโหลดรูปภาพ"
- [ ] Select image file (JPG/PNG)
- [ ] **Expected:** Image preview shows
- [ ] **Expected:** File size displayed
- [ ] Submit form
- [ ] **Expected:** Image saved successfully
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-008: Upload Medical Documents (PDF)**
- [ ] Click "ลงทะเบียนผู้ป่วย"
- [ ] Fill required fields
- [ ] Click "แนบเอกสาร"
- [ ] Select PDF file
- [ ] **Expected:** File name displayed
- [ ] **Expected:** File size displayed
- [ ] Submit form
- [ ] **Expected:** Document saved successfully
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-009: Select Location on Map**
- [ ] Click "ลงทะเบียนผู้ป่วย"
- [ ] Click on map to select location
- [ ] **Expected:** Marker placed on map
- [ ] **Expected:** Latitude/Longitude populated
- [ ] **Expected:** Address auto-filled (if available)
- [ ] Submit form
- [ ] **Expected:** Location saved correctly
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-010: Add Chronic Diseases and Allergies**
- [ ] Click "ลงทะเบียนผู้ป่วย"
- [ ] Fill required fields
- [ ] Add chronic diseases:
  - [ ] Select from dropdown: "เบาหวาน"
  - [ ] Type custom: "โรคหัวใจ"
- [ ] Add allergies:
  - [ ] Select from dropdown: "ยาปฏิชีวนะ"
  - [ ] Type custom: "กุ้ง"
- [ ] **Expected:** All entries saved
- [ ] **Expected:** Display correctly in patient detail
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

---

### **3. PATIENT MANAGEMENT (3 tests)**

#### **TC-011: View Patient List (Only Own Patients)**
- [ ] Login as community1@wecare.dev
- [ ] Navigate to "จัดการผู้ป่วย"
- [ ] **Expected:** See only patients created by community1
- [ ] **Expected:** Cannot see patients from other users
- [ ] Verify created_by field matches user ID
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-012: Edit Patient Information**
- [ ] Click on existing patient
- [ ] Click "แก้ไข"
- [ ] Modify patient name
- [ ] Modify phone number
- [ ] Click "บันทึก"
- [ ] **Expected:** Success message
- [ ] **Expected:** Changes reflected immediately
- [ ] **Expected:** updated_at timestamp updated
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-013: Delete Patient**
- [ ] Click on existing patient
- [ ] Click "ลบ"
- [ ] Confirm deletion
- [ ] **Expected:** Confirmation dialog appears
- [ ] **Expected:** Patient removed from list
- [ ] **Expected:** Cannot view deleted patient
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

---

### **4. RIDE REQUEST (5 tests)**

#### **TC-014: Create Ride Request**
- [ ] Navigate to "ขอใช้บริการรถ"
- [ ] Select patient from dropdown
- [ ] Fill destination
- [ ] Select emergency level
- [ ] Click "ส่งคำขอ"
- [ ] **Expected:** Success message
- [ ] **Expected:** Ride appears in ride list
- [ ] **Expected:** Status = "PENDING"
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-015: Auto-populate Patient Data**
- [ ] Navigate to "ขอใช้บริการรถ"
- [ ] Select patient from dropdown
- [ ] **Expected:** Pickup location auto-filled
- [ ] **Expected:** Patient phone auto-filled
- [ ] **Expected:** Coordinates auto-filled
- [ ] **Expected:** All data matches patient record
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-016: Select Destination**
- [ ] Navigate to "ขอใช้บริการรถ"
- [ ] Select patient
- [ ] Click on map to select destination
- [ ] **Expected:** Destination marker placed
- [ ] **Expected:** Destination address filled
- [ ] **Expected:** Coordinates captured
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-017: Set Emergency Level**
- [ ] Navigate to "ขอใช้บริการรถ"
- [ ] Select patient
- [ ] Test each emergency level:
  - [ ] ฉุกเฉินมาก (Critical)
  - [ ] ฉุกเฉิน (Urgent)
  - [ ] ปกติ (Normal)
- [ ] **Expected:** Each level selectable
- [ ] **Expected:** Level saved correctly
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-018: View Ride Status**
- [ ] Navigate to "ติดตามสถานะ"
- [ ] **Expected:** See all own rides
- [ ] **Expected:** Status displayed correctly
- [ ] **Expected:** Cannot see other users' rides
- [ ] **Expected:** Real-time updates (if applicable)
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

---

### **5. DATA ISOLATION (2 tests)**

#### **TC-019: Cannot See Other Users' Patients**
- [ ] Login as community1@wecare.dev
- [ ] Navigate to patient list
- [ ] Note patient IDs
- [ ] Logout
- [ ] Login as community2@wecare.dev (if exists)
- [ ] Navigate to patient list
- [ ] **Expected:** Different patient list
- [ ] **Expected:** No overlap in patient IDs
- [ ] **Expected:** Cannot access community1's patients via URL
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

#### **TC-020: Cannot See Other Users' Rides**
- [ ] Login as community1@wecare.dev
- [ ] Navigate to ride list
- [ ] Note ride IDs
- [ ] Logout
- [ ] Login as community2@wecare.dev (if exists)
- [ ] Navigate to ride list
- [ ] **Expected:** Different ride list
- [ ] **Expected:** No overlap in ride IDs
- [ ] **Expected:** Cannot access community1's rides via URL
- [ ] **Result:** ⬜ PASS / ⬜ FAIL
- [ ] **Notes:** ___________________________

---

## 📊 Test Summary

### **Results:**
- **Total Tests:** 20
- **Passed:** _____ / 20
- **Failed:** _____ / 20
- **Blocked:** _____ / 20
- **Pass Rate:** _____ %

### **Critical Issues Found:**
1. ___________________________
2. ___________________________
3. ___________________________

### **Minor Issues Found:**
1. ___________________________
2. ___________________________
3. ___________________________

### **Recommendations:**
1. ___________________________
2. ___________________________
3. ___________________________

---

## ✅ Sign-off

**Tested by:** ___________________________  
**Date:** ___________________________  
**Status:** ⬜ APPROVED / ⬜ REJECTED  
**Notes:** ___________________________

---

**Next Steps:**
- [ ] Fix all critical issues
- [ ] Retest failed scenarios
- [ ] Update documentation
- [ ] Deploy to staging

---

**Created by:** AI System QA Analyst  
**Date:** 2026-01-10 21:32 ICT
