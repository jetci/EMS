# ✅ Sprint 1 Checklist - Security & Data Encryption

**วันที่เริ่ม:** __________  
**วันที่สิ้นสุด:** __________  
**ผู้รับผิดชอบ:** __________

---

## 📋 Task 1.1: Encrypt Sensitive Data (2 วัน)

### Day 1: Encryption Utilities
- [ ] สร้างไฟล์ `wecare-backend/src/utils/encryption.ts`
- [ ] เขียนฟังก์ชัน `encrypt(text: string): string`
- [ ] เขียนฟังก์ชัน `decrypt(text: string): string`
- [ ] ทดสอบ encryption/decryption
- [ ] เพิ่ม environment variable `ENCRYPTION_KEY`

**Notes:**
```
ENCRYPTION_KEY ต้องเป็น 64 characters hex string
สร้างด้วย: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Day 2: Update Patient Service
- [ ] แก้ไข `wecare-backend/src/services/patientService.ts`
- [ ] Encrypt ใน `createPatient()`: national_id, contact_phone, chronic_diseases, allergies
- [ ] Decrypt ใน `getPatient()`, `getAllPatients()`
- [ ] เขียน unit tests `tests/encryption.test.ts`
- [ ] เขียน integration tests `tests/patientService.test.ts`
- [ ] Run tests: `npm test`
- [ ] Test coverage ≥ 95%

**Manual Testing:**
- [ ] สร้างผู้ป่วยใหม่ผ่าน API
- [ ] ตรวจสอบ database (ควรเห็นข้อมูล encrypted)
- [ ] ดึงข้อมูลผ่าน API (ควรเห็นข้อมูล decrypted)

---

## 📋 Task 1.2: Database File Encryption (1 วัน)

- [ ] ติดตั้ง SQLCipher: `npm install @journeyapps/sqlcipher`
- [ ] Backup database เดิม: `cp db/wecare.db db/wecare.db.backup`
- [ ] แก้ไข `wecare-backend/src/db/connection.ts`
- [ ] เพิ่ม `DB_ENCRYPTION_KEY` ใน .env
- [ ] สร้าง script `encrypt-db.ts` สำหรับ migrate database เดิม
- [ ] Run encryption script
- [ ] ทดสอบ: เปิด database ด้วย sqlite3 (ควรไม่ได้)
- [ ] ทดสอบ: Start server และ call API (ควรทำงานปกติ)
- [ ] เขียน tests `tests/database.test.ts`

**Rollback Plan:**
```bash
# ถ้ามีปัญหา restore จาก backup
cp db/wecare.db.backup db/wecare.db
```

---

## 📋 Task 1.3: HTTPS & Security Headers (1 วัน)

- [ ] ติดตั้ง Helmet: `npm install helmet`
- [ ] แก้ไข `wecare-backend/src/index.ts`
- [ ] เพิ่ม Helmet middleware
- [ ] เพิ่ม HTTPS redirect (production only)
- [ ] Setup SSL certificate (Let's Encrypt หรือ self-signed สำหรับ dev)
- [ ] เพิ่ม `SSL_KEY_PATH` และ `SSL_CERT_PATH` ใน .env
- [ ] ทดสอบ security headers: `curl -I https://localhost/api/health`
- [ ] ตรวจสอบ headers: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security

**Expected Headers:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 📋 Task 1.4: CORS & Rate Limiting (1 วัน)

- [ ] ติดตั้ง: `npm install express-rate-limit`
- [ ] สร้างไฟล์ `wecare-backend/src/middleware/security.ts`
- [ ] เพิ่ม CORS configuration
- [ ] เพิ่ม `ALLOWED_ORIGINS` ใน .env
- [ ] สร้าง rate limiters:
  - [ ] authLimiter (5 requests/15min)
  - [ ] apiLimiter (100 requests/15min)
  - [ ] createLimiter (10 requests/1min)
- [ ] Apply limiters ใน routes
- [ ] เขียน tests `tests/rateLimiting.test.ts`
- [ ] ทดสอบ manual: ลอง login ผิด 6 ครั้ง (ครั้งที่ 6 ควร blocked)

**Manual Test:**
```bash
# Test rate limiting
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo "\nAttempt $i"
done
```

---

## 📊 Sprint 1 Summary

### Metrics
- [ ] Test Coverage: ___% (Target: ≥ 92%)
- [ ] Security Score: ___ (Target: A+)
- [ ] All tests passing: ☐ Yes ☐ No

### Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Lessons Learned
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Ready for Sprint 2?
☐ Yes - All tasks completed
☐ No - Reason: _________________________________

---

**Completed by:** __________  
**Date:** __________  
**Sign-off:** __________
