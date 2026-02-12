# Fix: ไม่สามารถเพิ่มผู้ใช้งานใหม่ได้

## ปัญหาที่พบ

### Error 1: UNIQUE constraint failed: users.id
```
SqliteError: UNIQUE constraint failed: users.id
```

**สาเหตุ:** `generateUserId()` ใช้ `ORDER BY id DESC` ซึ่งเป็น string sorting
- String comparison: `"USR-009"` > `"USR-100"` 
- ทำให้ generate ID ซ้ำกับ user ที่มีอยู่

### Error 2: SQL Syntax Error
```
SqliteError: no such column: "USR-%" - should this be a string literal in single-quotes?
```

**สาเหตุ:** ใช้ double quotes แทน single quotes ใน SQL LIKE clause

## การแก้ไข

### 1. แก้ไข generateUserId() Function

**Before:**
```typescript
const generateUserId = (): string => {
  const users = sqliteDB.all<User>('SELECT id FROM users ORDER BY id DESC LIMIT 1');
  if (users.length === 0) return 'USR-001';

  const lastId = users[0].id;
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `USR-${String(num).padStart(3, '0')}`;
};
```

**After:**
```typescript
const generateUserId = (): string => {
  const users = sqliteDB.all<User>('SELECT id FROM users WHERE id LIKE \'USR-%\'');
  if (users.length === 0) return 'USR-001';

  // Extract numeric parts and find the maximum
  const numbers = users
    .map(u => parseInt(u.id.split('-')[1]))
    .filter(n => !isNaN(n));
  
  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNum = maxNum + 1;
  
  return `USR-${String(nextNum).padStart(3, '0')}`;
};
```

### 2. เพิ่ม Detailed Logging

เพิ่ม console.log ใน POST /api/users endpoint เพื่อ debug:
- 📝 Creating new user
- 🆔 Generated ID
- 🔐 Hashing password
- 💾 Inserting user into database
- ✅ User created

## การเปลี่ยนแปลง

### ไฟล์ที่แก้ไข
- `wecare-backend/src/routes/users.ts`
  - แก้ไข `generateUserId()` function
  - เพิ่ม detailed logging
  - แก้ไข error handling

### Logic ที่เปลี่ยน
1. **String sorting → Numeric sorting**
   - ดึง user IDs ทั้งหมดที่ขึ้นต้นด้วย "USR-"
   - Extract ตัวเลขจาก ID
   - หา max number
   - สร้าง ID ใหม่จาก max + 1

2. **SQL Syntax**
   - Double quotes → Single quotes ใน LIKE clause

## ผลการทดสอบ

### ✅ Test 1: Create Single User
```
ID: USR-002
Email: newuser013826@wecare.dev
Name: New Test User
Role: community
Status: Success (201)
```

### ✅ Test 2: Create Multiple Users
```
ID: USR-003
Email: testuser013832@wecare.dev
Name: Test User
Role: community
Status: Success (201)
```

### ✅ Test 3: List Users
```
Total users: 10 (เพิ่มจาก 8)
```

## สรุป

### ปัญหา
❌ ไม่สามารถเพิ่มผู้ใช้งานใหม่ได้ (500 Internal Server Error)

### สาเหตุ
1. `generateUserId()` ใช้ string sorting ทำให้ generate ID ซ้ำ
2. SQL syntax error (double quotes แทน single quotes)

### การแก้ไข
1. ✅ แก้ไข `generateUserId()` ให้ใช้ numeric sorting
2. ✅ แก้ไข SQL syntax
3. ✅ เพิ่ม detailed logging

### ผลลัพธ์
✅ **สามารถเพิ่มผู้ใช้งานใหม่ได้แล้ว**
- POST /api/users: Success (201)
- User ID generation: ทำงานถูกต้อง
- ไม่มี duplicate ID errors

## Test Scripts
- `test-create-user.ps1` - Basic test
- `test-create-user-verbose.ps1` - Verbose test with error details
