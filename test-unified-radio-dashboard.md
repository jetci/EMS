# 🧪 Test Plan: UnifiedRadioDashboard

**วันที่:** 16 มกราคม 2026  
**Phase:** 1.2 - Testing  
**Status:** 🟡 Ready for Testing

---

## ✅ Pre-Test Checklist

- [x] UnifiedRadioDashboard.tsx สร้างเรียบร้อย
- [x] หน้าเดิม (RadioDashboard.tsx, RadioCenterDashboard.tsx) ยังอยู่
- [ ] Backend running
- [ ] Frontend running
- [ ] Test accounts ready

---

## 🎯 Test Cases

### Test Case 1: Radio Role (radio)

#### Setup
```
Account: radio@wecare.ems / password
Role: radio
```

#### Steps
1. [ ] Login ด้วย radio account
2. [ ] Navigate to Radio Dashboard
3. [ ] ตรวจสอบ title แสดง "ศูนย์วิทยุ (Radio)"
4. [ ] ตรวจสอบ subtitle แสดงถูกต้อง
5. [ ] ตรวจสอบ Stats Cards แสดงครบ 4 cards
6. [ ] ตรวจสอบ "คำขอใหม่" table แสดงถูกต้อง
7. [ ] ทดสอบปุ่ม "จ่ายงาน"
8. [ ] ทดสอบปุ่ม "ดูรายละเอียด"
9. [ ] ตรวจสอบ Schedule Timeline แสดงถูกต้อง
10. [ ] ตรวจสอบ Live Driver Status Panel แสดงถูกต้อง
11. [ ] ทดสอบ auto-refresh (รอ 30 วินาที)

#### Expected Results
- ✅ ทุกอย่างทำงานเหมือนหน้าเดิม (RadioDashboard.tsx)
- ✅ ไม่มี console errors
- ✅ UI แสดงถูกต้อง

---

### Test Case 2: Radio Center Role (radio_center)

#### Setup
```
Account: radio_center@wecare.ems / password
Role: radio_center
```

#### Steps
1. [ ] Login ด้วย radio_center account
2. [ ] Navigate to Radio Center Dashboard
3. [ ] ตรวจสอบ title แสดง "ศูนย์วิทยุกลาง (Radio Center)"
4. [ ] ตรวจสอบ subtitle แสดงถูกต้อง
5. [ ] ตรวจสอบ Stats Cards แสดงครบ 4 cards
6. [ ] ตรวจสอบ "คำขอใหม่" table แสดงถูกต้อง
7. [ ] ทดสอบปุ่ม "จ่ายงาน"
8. [ ] ทดสอบปุ่ม "ดูรายละเอียด"
9. [ ] ตรวจสอบ Schedule Timeline แสดงถูกต้อง
10. [ ] ตรวจสอบ Live Driver Status Panel แสดงถูกต้อง
11. [ ] ทดสอบ auto-refresh (รอ 30 วินาที)

#### Expected Results
- ✅ ทุกอย่างทำงานเหมือนหน้าเดิม (RadioCenterDashboard.tsx)
- ✅ ไม่มี console errors
- ✅ UI แสดงถูกต้อง

---

### Test Case 3: Comparison Test (เปรียบเทียบหน้าเดิมกับหน้าใหม่)

#### Steps
1. [ ] เปิด 2 tabs
   - Tab 1: ใช้หน้าเดิม (RadioDashboard)
   - Tab 2: ใช้หน้าใหม่ (UnifiedRadioDashboard)
2. [ ] เปรียบเทียบ UI
3. [ ] เปรียบเทียบ functionality
4. [ ] เปรียบเทียบ performance

#### Expected Results
- ✅ UI เหมือนกัน 100%
- ✅ Functionality เหมือนกัน 100%
- ✅ Performance ไม่แย่ลง

---

## 🐛 Bug Tracking

### Bugs Found
- [ ] Bug #1: _____________________
- [ ] Bug #2: _____________________
- [ ] Bug #3: _____________________

### Bugs Fixed
- [x] Bug #1: _____________________
- [x] Bug #2: _____________________
- [x] Bug #3: _____________________

---

## ✅ Test Results

### Radio Role
- [ ] ✅ PASSED - ทำงานถูกต้อง
- [ ] ❌ FAILED - มีปัญหา: _____________________

### Radio Center Role
- [ ] ✅ PASSED - ทำงานถูกต้อง
- [ ] ❌ FAILED - มีปัญหา: _____________________

### Comparison
- [ ] ✅ PASSED - เหมือนหน้าเดิม 100%
- [ ] ❌ FAILED - มีความแตกต่าง: _____________________

---

## 📊 Performance Metrics

### Before (หน้าเดิม)
```
Load Time:     ___ ms
Bundle Size:   ___ KB
Memory Usage:  ___ MB
```

### After (หน้าใหม่)
```
Load Time:     ___ ms
Bundle Size:   ___ KB
Memory Usage:  ___ MB
```

### Comparison
```
Load Time:     +/- ___ ms
Bundle Size:   +/- ___ KB
Memory Usage:  +/- ___ MB
```

---

## 🎯 Acceptance Criteria

- [ ] ✅ ทุก test cases ผ่าน
- [ ] ✅ ไม่มี critical bugs
- [ ] ✅ Performance ไม่แย่ลง
- [ ] ✅ UI เหมือนหน้าเดิม
- [ ] ✅ Functionality ครบถ้วน

---

## 📝 Notes

### Issues Found
- _____________________
- _____________________

### Solutions Applied
- _____________________
- _____________________

---

## ✅ Sign-off

### Tester (Programmer)
- [ ] All tests completed
- [ ] No critical issues
- [ ] Ready for routing update

**Date:** _______________  
**Signature:** _______________

### QA (SA)
- [ ] Tests reviewed
- [ ] Approved for production
- [ ] Ready to update routing

**Date:** _______________  
**Signature:** _______________

---

**Next Step:** ถ้า test ผ่านทั้งหมด → Phase 1.3 (Update Routing)
