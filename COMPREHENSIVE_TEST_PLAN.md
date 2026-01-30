# 🧪 Comprehensive Test Plan: Community Role
## EMS WeCare - Final Testing

**Date:** 2026-01-10  
**Tester:** QA Team  
**Scope:** All Community Role Features + Bug Fixes

---

## 🎯 Test Objectives

1. ✅ Verify all 12 bugs are fixed
2. ✅ Verify all 3 features work correctly
3. ✅ Verify runtime fixes (RIDE-NaN)
4. ✅ Verify no regressions

---

## 📝 Test Checklist

### **Pre-Test Setup**

- [ ] Backend server running (port 3001)
- [ ] Frontend server running (port 3000)
- [ ] Database accessible
- [ ] Login as Community user (USR-COMMUNITY)

---

## 🧪 Test Suite 1: Bug Fixes Verification

### **BUG-COMM-005: Hardcoded API URL** ✅
**Status:** FIXED  
**Test:**
1. [ ] Check CommunityRegisterPatientPage.tsx
2. [ ] Verify uses VITE_API_BASE_URL
3. [ ] No hardcoded localhost URLs

**Expected:** ✅ Uses environment variable

---

### **BUG-COMM-009: Path Traversal** ✅
**Status:** FIXED  
**Test:**
1. [ ] Try uploading patient file
2. [ ] Try deleting patient file
3. [ ] Check backend sanitizes paths

**Expected:** ✅ No path traversal possible

---

### **BUG-COMM-001: Input Validation** ✅
**Status:** FIXED  
**Test:**
1. [ ] Try invalid phone number (9 digits)
2. [ ] Try invalid phone number (starts with 1)
3. [ ] Try short pickup location (<10 chars)
4. [ ] Try >10 caregivers

**Expected:** ✅ Shows validation errors

---

### **BUG-COMM-004: Pagination** ✅
**Status:** FIXED  
**Test:**
1. [ ] Go to patient list
2. [ ] Check pagination controls
3. [ ] Navigate between pages

**Expected:** ✅ Pagination works

---

### **BUG-COMM-007: Rate Limiting** ✅
**Status:** FIXED  
**Test:**
1. [ ] Make 20 rapid requests
2. [ ] Check if rate limited

**Expected:** ✅ Rate limiting active

---

### **BUG-COMM-011: Ownership Check** ✅
**Status:** VERIFIED  
**Test:**
1. [ ] Try to view other user's patients
2. [ ] Try to edit other user's rides

**Expected:** ✅ Access denied (403)

---

### **BUG-COMM-003: Loading State** ✅
**Status:** FIXED  
**Test:**
1. [ ] Check dashboard loading
2. [ ] Check ride request loading
3. [ ] Verify LoadingSpinner shows

**Expected:** ✅ Loading states visible

---

### **BUG-COMM-006: File Validation** ✅
**Status:** FIXED  
**Test:**
1. [ ] Upload >5MB image
2. [ ] Upload .exe file
3. [ ] Upload valid image

**Expected:** ✅ Validates file size/type

---

### **BUG-COMM-002: Error Boundary** ✅
**Status:** VERIFIED  
**Test:**
1. [ ] Check ErrorBoundary exists
2. [ ] Trigger JS error (if possible)

**Expected:** ✅ Error boundary catches errors

---

### **BUG-COMM-010: JSON Validation** ✅
**Status:** FIXED  
**Test:**
1. [ ] Submit form with valid data
2. [ ] Check JSON parsing works

**Expected:** ✅ JSON handled correctly

---

### **BUG-COMM-008: Lat/Lng Validation** ✅
**Status:** FIXED  
**Test:**
1. [ ] Try invalid coordinates (>90 lat)
2. [ ] Try invalid coordinates (<-180 lng)

**Expected:** ✅ Validates coordinate ranges

---

### **BUG-COMM-012: Unique Constraint** ✅
**Status:** VERIFIED  
**Test:**
1. [ ] Try duplicate patient national ID
2. [ ] Check database constraints

**Expected:** ✅ Prevents duplicates

---

## 🧪 Test Suite 2: Feature Testing

### **Feature 1: Create Ride Request** 🚀

**Test Case 1.1: Valid Ride Creation**
- [ ] Login as Community user
- [ ] Go to "สร้างคำขอการเดินทางใหม่"
- [ ] Select patient: "บัว มากมีเงิน"
- [ ] Verify auto-population:
  - [ ] Pickup location filled
  - [ ] Contact phone filled
  - [ ] Coordinates filled
- [ ] Select date: Tomorrow
- [ ] Select time: 10:00
- [ ] Select trip type: "นัดหมอตามปกติ"
- [ ] Enter caregiver count: 1
- [ ] Submit form

**Expected Results:**
- ✅ Success modal shows
- ✅ Ride ID is RIDE-001 (or next number)
- ✅ NOT RIDE-NaN
- ✅ Redirects to rides page
- ✅ New ride appears in list

**Test Case 1.2: Validation Errors**
- [ ] Try submitting without patient
- [ ] Try invalid phone (123)
- [ ] Try short pickup location (abc)
- [ ] Try >10 caregivers

**Expected Results:**
- ✅ Validation errors show
- ✅ Form doesn't submit
- ✅ Error messages clear

**Test Case 1.3: Time Validation**
- [ ] Select today's date
- [ ] Try selecting past time

**Expected Results:**
- ✅ Past times disabled
- ✅ Only future times allowed

---

### **Feature 2: Patient Registration** 👤

**Test Case 2.1: Complete Registration**
- [ ] Go to "ลงทะเบียนผู้ป่วยใหม่"
- [ ] Step 1: Enter identity
  - [ ] Title: นาย
  - [ ] First name: ทดสอบ
  - [ ] Last name: ระบบ
  - [ ] ID card: 1234567890123
  - [ ] DOB: 01/01/1990
  - [ ] Gender: Male
- [ ] Step 2: Medical info
  - [ ] Patient type: ผู้สูงอายุ
  - [ ] Chronic disease: เบาหวาน
  - [ ] Blood type: O
- [ ] Step 3: Contact
  - [ ] Phone: 0812345678
  - [ ] Address: Complete
- [ ] Step 4: Attachments
  - [ ] Upload profile image
- [ ] Step 5: Review & Submit

**Expected Results:**
- ✅ All steps complete
- ✅ Data saved correctly
- ✅ Patient appears in list
- ✅ ID is PAT-xxx (not PAT-NaN)

---

### **Feature 3: Manage Rides** 📋

**Test Case 3.1: View Rides**
- [ ] Go to "จัดการการเดินทาง"
- [ ] Check ride list loads
- [ ] Verify pagination works
- [ ] Check filtering works

**Expected Results:**
- ✅ Rides load successfully
- ✅ Only own rides visible
- ✅ Pagination controls work
- ✅ Can filter by status

**Test Case 3.2: View Ride Details**
- [ ] Click on a ride
- [ ] Check details modal
- [ ] Verify all data shown

**Expected Results:**
- ✅ Details modal opens
- ✅ All information correct
- ✅ Can close modal

---

## 🧪 Test Suite 3: Runtime Fixes

### **Fix 1: RIDE-NaN Bug** 🐛

**Test:**
1. [ ] Create new ride
2. [ ] Check ride ID in backend logs
3. [ ] Verify ID is RIDE-001 or RIDE-002
4. [ ] NOT RIDE-NaN

**Expected:**
```
Creating ride with data: {
  id: 'RIDE-001',  ← ✅ Valid ID
  patient_id: 'PAT-001',  ← ✅ Valid ID
  ...
}
```

### **Fix 2: Error Logging** 📝

**Test:**
1. [ ] Check backend console
2. [ ] Verify debug logs show
3. [ ] Verify error logs show (if error)

**Expected:**
- ✅ "Creating ride with data:" shows
- ✅ Error details show if error occurs

---

## 📊 Test Results Summary

### Bug Fixes: __/12 Passed
- [ ] BUG-COMM-005: Hardcoded API URL
- [ ] BUG-COMM-009: Path Traversal
- [ ] BUG-COMM-001: Input Validation
- [ ] BUG-COMM-004: Pagination
- [ ] BUG-COMM-007: Rate Limiting
- [ ] BUG-COMM-011: Ownership Check
- [ ] BUG-COMM-003: Loading State
- [ ] BUG-COMM-006: File Validation
- [ ] BUG-COMM-002: Error Boundary
- [ ] BUG-COMM-010: JSON Validation
- [ ] BUG-COMM-008: Lat/Lng Validation
- [ ] BUG-COMM-012: Unique Constraint

### Features: __/3 Passed
- [ ] Create Ride Request
- [ ] Patient Registration
- [ ] Manage Rides

### Runtime Fixes: __/2 Passed
- [ ] RIDE-NaN Fix
- [ ] Error Logging

---

## ✅ Pass Criteria

**Minimum to Pass:**
- 🎯 All 12 bugs verified: ✅
- 🎯 All 3 features work: ✅
- 🎯 No RIDE-NaN errors: ✅
- 🎯 No 500 errors: ✅

**Excellent:**
- 🏆 100% test pass rate
- 🏆 No errors in console
- 🏆 Fast performance
- 🏆 Great UX

---

## 🚀 Ready to Test!

**Start testing now:**
1. Open browser: http://localhost:3000
2. Login as Community user
3. Follow test cases above
4. Check each checkbox as you test
5. Report any issues found

---

**Good luck with testing!** 🎉
