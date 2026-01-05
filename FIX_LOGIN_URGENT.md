# 🔴 URGENT: Login System Fix Guide

## Problem Summary
**Login ไม่สามารถใช้งานได้** - ระบบ login ส่ง HTTP 500 Internal Server Error

## Root Cause (สาเหตุหลัก)
Backend กำลังทำงานบน **port 3000** แทนที่จะเป็น **port 3001** ตามที่ควรจะเป็น

### ปัญหาที่พบ:
1. **Port Conflict**: Backend ทำงานบน port 3000 (ซึ่งควรเป็น Vite dev server)
2. **Proxy Mismatch**: Frontend proxy ไปที่ port 3001 แต่ backend ไม่ได้อยู่ที่นั่น
3. **500 Error**: Backend crash เมื่อพยายาม login

### ข้อมูลที่ตรวจสอบแล้ว ✅:
- ✅ Database มีข้อมูล admin user
- ✅ Password `Admin@123` ถูกต้อง (verified ด้วย bcrypt)
- ✅ JWT_SECRET ถูกตั้งค่าใน .env แล้ว (64 chars)
- ✅ bcrypt module ติดตั้งแล้ว
- ✅ Database schema ถูกต้อง

## 🚀 Solution (วิธีแก้ไข)

### Option 1: Restart Backend (แนะนำ - ทำได้เร็วที่สุด)

```powershell
# 1. Stop all Node processes
Get-Process -Name node | Stop-Process -Force

# 2. Start backend on correct port
cd d:\EMS\wecare-backend
npm run dev

# 3. Verify backend is on port 3001
# Should see: "🚀 Server is running on http://localhost:3001"

# 4. Start frontend (in new terminal)
cd d:\EMS
npm run dev

# 5. Test login
# Open http://localhost:3000
# Login with: admin@wecare.ems / Admin@123
```

### Option 2: Fix Port Configuration

If backend keeps starting on port 3000, check:

```powershell
# Check what's using port 3000
Get-NetTCPConnection -LocalPort 3000 -State Listen

# Kill the process using port 3000
$pid = (Get-NetTCPConnection -LocalPort 3000).OwningProcess
Stop-Process -Id $pid -Force
```

### Option 3: Update Frontend API Config (Temporary Workaround)

If you need immediate access, update frontend to point to port 3000:

```typescript
// d:\EMS\src\services\api.ts
const getApiBaseUrl = (): string => {
  // Temporary fix - point to actual backend port
  return 'http://localhost:3000/api';
};
```

⚠️ **Warning**: This is a workaround. The proper fix is Option 1.

## 🧪 Testing After Fix

### Test 1: Check Backend Port
```powershell
# Should show port 3001
Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -eq 3001}
```

### Test 2: Test Login API Directly
```powershell
$body = '{"email":"admin@wecare.ems","password":"Admin@123"}'
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

Expected response:
```json
{
  "user": {
    "id": "USR-ADMIN",
    "email": "admin@wecare.ems",
    "role": "admin",
    "full_name": "System Administrator"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test 3: Test via Frontend
1. Open browser: `http://localhost:3000`
2. Click "เข้าสู่ระบบ"
3. Enter:
   - Email: `admin@wecare.ems`
   - Password: `Admin@123`
4. Should login successfully

## 📋 Verified User Credentials

| Role | Email | Password | Status |
|------|-------|----------|--------|
| **Admin** | admin@wecare.ems | **Admin@123** | ✅ Verified |
| Developer | dev@wecare.ems | password123 | ✅ Available |
| Radio | office1@wecare.dev | password123 | ✅ Available |
| Officer | officer1@wecare.dev | password123 | ✅ Available |
| Driver | driver1@wecare.dev | password123 | ✅ Available |
| Community | community1@wecare.dev | password123 | ✅ Available |
| Executive | executive1@wecare.dev | password123 | ✅ Available |

## 🔍 Technical Details

### Current Configuration
```
Frontend (Vite): http://localhost:3000
Backend (Expected): http://localhost:3001
Backend (Actual): http://localhost:3000 ❌

Vite Proxy Config:
  /api → http://localhost:3001 (not working because backend is on 3000)
```

### Correct Configuration
```
Frontend (Vite): http://localhost:3000
Backend (Express): http://localhost:3001 ✅

Vite Proxy:
  /api → http://localhost:3001 ✅
```

### Environment Variables
```bash
# wecare-backend/.env
PORT=3001                    # ✅ Set correctly
JWT_SECRET=<64-char-secret>  # ✅ Set correctly
NODE_ENV=development         # ✅ Set correctly
```

## ⚡ Quick Fix Script

Run this script to automatically fix and restart:

```powershell
# Save as: fix-login-now.ps1
Write-Host "🔧 Fixing login system..." -ForegroundColor Cyan

# Stop all node processes
Write-Host "Stopping Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start backend
Write-Host "Starting backend on port 3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\EMS\wecare-backend; npm run dev"
Start-Sleep -Seconds 5

# Start frontend
Write-Host "Starting frontend on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\EMS; npm run dev"
Start-Sleep -Seconds 3

Write-Host "✅ System restarted!" -ForegroundColor Green
Write-Host "Open browser: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Login: admin@wecare.ems / Admin@123" -ForegroundColor Cyan
```

## 📞 Support

If the issue persists after following these steps:

1. Check backend console for error messages
2. Check browser console (F12) for network errors
3. Verify `.env` file in `wecare-backend/` directory
4. Run: `cd wecare-backend && npm install` to reinstall dependencies

---

**Priority**: 🔴 P0 - CRITICAL  
**Impact**: All users cannot login  
**Fix Time**: < 5 minutes  
**Status**: Ready to implement
