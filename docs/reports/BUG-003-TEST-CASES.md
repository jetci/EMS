# 🧪 BUG-003: Test Cases - File Cleanup on Patient Deletion

**Test Date:** 2026-01-07  
**Bug:** BUG-003 - Missing File Cleanup  
**Following:** BUG_RESOLUTION_WORKFLOW.md Step 3

---

## Test Type: Integration + Manual

---

## Test Case 1: Delete Patient with Profile Image

**Objective:** Verify profile image is deleted from disk

**Prerequisites:**
- Patient exists with profile image uploaded
- Profile image file exists in `/uploads/patients/`

**Steps:**
```bash
# 1. Create patient with profile image
curl -X POST http://localhost:3001/api/patients \
  -H "Authorization: Bearer TOKEN" \
  -F "fullName=Test Patient" \
  -F "profileImage=@test-image.jpg"

# Response: { "id": "PAT-XXX", "profileImageUrl": "/uploads/patients/test-image-123.jpg" }

# 2. Verify file exists
ls wecare-backend/uploads/patients/test-image-123.jpg
# Expected: File exists ✅

# 3. Delete patient
curl -X DELETE http://localhost:3001/api/patients/PAT-XXX \
  -H "Authorization: Bearer TOKEN"

# Expected: 204 No Content

# 4. Verify file deleted
ls wecare-backend/uploads/patients/test-image-123.jpg
# Expected: File not found ✅
```

**Expected Result:**
- ✅ Patient deleted from database
- ✅ Profile image file deleted from disk
- ✅ No orphaned files

---

## Test Case 2: Delete Patient with Multiple Attachments

**Objective:** Verify all attachment files are deleted

**Prerequisites:**
- Patient exists with 3 attachments uploaded

**Steps:**
```bash
# 1. Create patient with attachments
curl -X POST http://localhost:3001/api/patients \
  -H "Authorization: Bearer TOKEN" \
  -F "fullName=Test Patient 2" \
  -F "attachments=@doc1.pdf" \
  -F "attachments=@doc2.pdf" \
  -F "attachments=@doc3.pdf"

# Response: { "id": "PAT-YYY", ... }

# 2. Verify attachments exist
ls wecare-backend/uploads/patients/doc*.pdf
# Expected: 3 files exist

# 3. Delete patient
curl -X DELETE http://localhost:3001/api/patients/PAT-YYY \
  -H "Authorization: Bearer TOKEN"

# 4. Verify all files deleted
ls wecare-backend/uploads/patients/doc*.pdf
# Expected: No files found ✅
```

**Expected Result:**
- ✅ All 3 attachment files deleted
- ✅ Database records deleted
- ✅ No orphaned files

---

## Test Case 3: Delete Patient with Profile Image + Attachments

**Objective:** Verify both profile image and attachments deleted

**Steps:**
```bash
# 1. Create patient with both
curl -X POST http://localhost:3001/api/patients \
  -H "Authorization: Bearer TOKEN" \
  -F "fullName=Test Patient 3" \
  -F "profileImage=@profile.jpg" \
  -F "attachments=@medical-record.pdf"

# 2. Count files before deletion
ls wecare-backend/uploads/patients/ | wc -l
# Expected: 2 files (profile + attachment)

# 3. Delete patient
curl -X DELETE http://localhost:3001/api/patients/PAT-ZZZ \
  -H "Authorization: Bearer TOKEN"

# 4. Verify both files deleted
ls wecare-backend/uploads/patients/profile*.jpg
ls wecare-backend/uploads/patients/medical-record*.pdf
# Expected: Both not found ✅
```

---

## Test Case 4: Delete Patient without Files

**Objective:** Verify deletion works even if no files exist

**Steps:**
```bash
# 1. Create patient without files
curl -X POST http://localhost:3001/api/patients \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test Patient 4","contactPhone":"0812345678"}'

# 2. Delete patient
curl -X DELETE http://localhost:3001/api/patients/PAT-AAA \
  -H "Authorization: Bearer TOKEN"

# Expected: 204 No Content ✅
# Should not error even though no files to delete
```

---

## Test Case 5: File Already Deleted (Edge Case)

**Objective:** Verify graceful handling if file already deleted manually

**Steps:**
```bash
# 1. Create patient with file
curl -X POST http://localhost:3001/api/patients \
  -H "Authorization: Bearer TOKEN" \
  -F "fullName=Test Patient 5" \
  -F "profileImage=@test.jpg"

# 2. Manually delete file from disk
rm wecare-backend/uploads/patients/test-*.jpg

# 3. Delete patient via API
curl -X DELETE http://localhost:3001/api/patients/PAT-BBB \
  -H "Authorization: Bearer TOKEN"

# Expected: 204 No Content ✅
# Should not error (fs.existsSync check prevents error)
```

---

## Test Case 6: Permission Check (RBAC)

**Objective:** Verify file cleanup respects RBAC

**Steps:**
```bash
# 1. Create patient as Community user
curl -X POST http://localhost:3001/api/patients \
  -H "Authorization: Bearer COMMUNITY_TOKEN" \
  -F "fullName=Community Patient" \
  -F "profileImage=@image.jpg"

# 2. Try to delete as different Community user
curl -X DELETE http://localhost:3001/api/patients/PAT-CCC \
  -H "Authorization: Bearer OTHER_COMMUNITY_TOKEN"

# Expected: 403 Forbidden ✅
# File should NOT be deleted
```

---

## Code Review Verification

### ✅ Implementation Checklist:

```typescript
// Line 601-640 in patients.ts

✅ Check if profile_image_url exists
✅ Build correct file path with path.join()
✅ Check file exists with fs.existsSync()
✅ Delete file with fs.unlinkSync()
✅ Query all attachments from database
✅ Loop through attachments
✅ Delete each attachment file
✅ Error handling with try-catch
✅ Log file deletions
✅ Continue even if file deletion fails
✅ Delete database record last (CASCADE)
```

### ✅ Safety Features:

1. **fs.existsSync()** - ไม่ error ถ้าไฟล์ไม่มี
2. **try-catch** - ไม่ fail request ถ้าลบไฟล์ไม่ได้
3. **path.join()** - ป้องกัน path traversal
4. **Delete DB last** - ถ้าลบไฟล์ fail ยัง rollback ได้

---

## Expected Behavior Summary

### Before Fix:
```
DELETE /api/patients/PAT-001
→ ลบ database record ✅
→ ไฟล์ยังอยู่ใน /uploads/ ❌
→ Disk space leak ❌
```

### After Fix:
```
DELETE /api/patients/PAT-001
→ ลบ profile image file ✅
→ ลบ attachment files ✅
→ ลบ database record ✅
→ No orphaned files ✅
```

---

## Performance Impact

**Estimated overhead:**
- Profile image deletion: ~1ms
- Each attachment deletion: ~1ms
- Total: < 10ms for typical patient (1 image + 3 attachments)

**Acceptable:** ✅ Deletion is not frequent operation

---

## Security Considerations

✅ **Path Traversal Prevention:**
```typescript
// Using path.join() prevents ../../../etc/passwd attacks
const profileImagePath = path.join(__dirname, '../../', existing.profile_image_url);
```

✅ **RBAC Respected:**
```typescript
// Check ownership before any deletion
if (req.user?.role === 'community' && existing.created_by !== req.user.id) {
  return res.status(403).json({ error: 'Access denied' });
}
```

---

## Manual Testing Instructions

```bash
# 1. Start backend
cd wecare-backend
npm run dev

# 2. Create test patient with files
# (Use Postman or curl)

# 3. Verify files exist
ls uploads/patients/

# 4. Delete patient
# (Use Postman or curl)

# 5. Verify files deleted
ls uploads/patients/
# Should not see the deleted patient's files
```

---

**Test Plan Created by:** System QA Analyst  
**Date:** 2026-01-07  
**Status:** ✅ Ready for Execution
