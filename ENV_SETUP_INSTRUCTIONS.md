# 🔧 Environment Setup Instructions

## สร้างไฟล์ .env

เนื่องจากไฟล์ `.env` ถูก gitignore คุณต้องสร้างเอง

---

## วิธีที่ 1: Copy จาก .env.example

```powershell
# ใน PowerShell
cd D:\EMS
Copy-Item .env.example .env
```

---

## วิธีที่ 2: สร้างด้วย PowerShell

```powershell
cd D:\EMS

# สร้างไฟล์ .env
@"
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001/api
VITE_API_BASE_URL=http://localhost:3001/api
"@ | Out-File -FilePath ".env" -Encoding UTF8
```

---

## วิธีที่ 3: สร้างด้วย Text Editor

1. เปิด Notepad หรือ VS Code
2. สร้างไฟล์ใหม่ชื่อ `.env` ใน `D:\EMS`
3. เพิ่มเนื้อหา:

```bash
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001/api
VITE_API_BASE_URL=http://localhost:3001/api
```

4. บันทึกไฟล์

---

## ✅ หลังจากสร้างไฟล์ .env

### 1. Restart Dev Server

```powershell
# กด Ctrl+C เพื่อหยุด dev server
# จากนั้นรันใหม่
npm run dev
```

### 2. ตรวจสอบ Console

ควรเห็น:
```
[Router] Base Path: 
[Router] API Base: http://localhost:3001/api
```

---

## 🚨 ถ้ายังไม่ได้

### ตรวจสอบว่าไฟล์ .env อยู่ที่ถูกต้อง

```powershell
# ตรวจสอบว่ามีไฟล์ .env
cd D:\EMS
Get-ChildItem -Force | Where-Object { $_.Name -eq ".env" }
```

### ตรวจสอบเนื้อหาไฟล์

```powershell
Get-Content .env
```

---

## 📝 ไฟล์ที่ต้องมี

```
D:\EMS\
├── .env                    ← ต้องสร้างเอง (gitignored)
├── .env.example           ← Template (มีใน repo)
└── package.json
```

---

## 🎯 ค่าที่ต้องตั้ง

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `http://localhost:3001/api` | API endpoint |
| `VITE_API_BASE_URL` | `http://localhost:3001/api` | API base (same as above) |

---

**หลังจากทำตามขั้นตอน restart dev server แล้วจะใช้งานได้! 🚀**
