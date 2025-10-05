# FTP Upload - ขั้นตอนละเอียด

## 📦 ไฟล์ที่ต้อง Upload

### จาก Local → Server

```
d:\EMS\build\index.html          → /public_html/ems_staging/index.html
d:\EMS\build\assets\*            → /public_html/ems_staging/assets/*
d:\EMS\.htaccess                 → /public_html/ems_staging/.htaccess
```

---

## 🔧 วิธีที่ 1: ใช้ FileZilla (แนะนำ)

### 1. Download FileZilla
- https://filezilla-project.org/download.php?type=client
- ติดตั้งและเปิดโปรแกรม

### 2. เชื่อมต่อ FTP
```
Host: ftp.wiangwecare.com (หรือ IP)
Username: (FTP username)
Password: (FTP password)
Port: 21
```
คลิก "Quickconnect"

### 3. Navigate to Folder
- **Local (ซ้าย)**: ไปที่ `d:\EMS\build\`
- **Remote (ขวา)**: ไปที่ `/domains/wiangwecare.com/public_html/`

### 4. สร้าง Folder
- คลิกขวาที่ Remote → Create directory
- ชื่อ: `ems_staging`
- Enter

### 5. Upload ไฟล์
1. เข้า folder `ems_staging` (Remote)
2. เลือกทุกไฟล์ใน `build/` (Local)
3. Drag & Drop ไปฝั่ง Remote
4. รอจน Transfer เสร็จ (100%)

### 6. Upload .htaccess
1. Local: ไปที่ `d:\EMS\`
2. เลือกไฟล์ `.htaccess`
3. Drag & Drop ไปที่ `/public_html/ems_staging/`

### 7. ตั้งค่า Permissions
- คลิกขวาที่ `ems_staging` → File permissions → `755`
- คลิกขวาที่ `index.html` → File permissions → `644`
- คลิกขวาที่ `assets` folder → File permissions → `755`

---

## 🌐 วิธีที่ 2: ใช้ cPanel File Manager

### 1. Login cPanel
- URL: https://wiangwecare.com:2083 (หรือ cPanel URL ที่ได้รับ)
- Login ด้วย cPanel credentials

### 2. เปิด File Manager
- คลิก "File Manager" icon
- ไปที่ `/domains/wiangwecare.com/public_html/`

### 3. สร้าง Folder
- คลิก "+ Folder" (บนซ้าย)
- ชื่อ: `ems_staging`
- Create New Folder

### 4. Upload ไฟล์
1. เข้า folder `ems_staging`
2. คลิก "Upload" (บนขวา)
3. คลิก "Select File" หรือ Drag & Drop
4. เลือกทุกไฟล์จาก `d:\EMS\build\`
5. รอจน Upload 100%
6. กลับไปที่ File Manager

### 5. Upload .htaccess
1. อยู่ใน `/public_html/ems_staging/`
2. คลิก "Upload"
3. เลือกไฟล์ `d:\EMS\.htaccess`
4. Upload

### 6. ตั้งค่า Permissions
1. เลือก folder `ems_staging`
2. คลิก "Permissions" (บนขวา)
3. ตั้งค่า: `755` (rwxr-xr-x)
4. Apply to all files: เลือก `644` สำหรับไฟล์

---

## 🖥️ วิธีที่ 3: ใช้ PowerShell FTP (Advanced)

### สร้าง FTP Upload Script

```powershell
# ftp-upload.ps1
$ftpServer = "ftp://ftp.wiangwecare.com"
$ftpUser = "YOUR_FTP_USERNAME"
$ftpPass = "YOUR_FTP_PASSWORD"
$localPath = "d:\EMS\build\"
$remotePath = "/public_html/ems_staging/"

# Upload files
Get-ChildItem -Path $localPath -Recurse | ForEach-Object {
    $uri = "$ftpServer$remotePath$($_.Name)"
    $webclient = New-Object System.Net.WebClient
    $webclient.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
    $webclient.UploadFile($uri, $_.FullName)
    Write-Host "Uploaded: $($_.Name)"
}
```

---

## ✅ ตรวจสอบหลัง Upload

### 1. ตรวจสอบไฟล์บน Server
ต้องมี:
```
/public_html/ems_staging/
├── index.html          ✓
├── assets/
│   └── index-3R5xO6KV.js  ✓
└── .htaccess           ✓
```

### 2. ตรวจสอบ Permissions
```
ems_staging/     → 755
index.html       → 644
assets/          → 755
.htaccess        → 644
```

### 3. ทดสอบ URL
เปิด Browser:
```
https://wiangwecare.com/ems_staging/
```

ต้องเห็น:
- ✓ หน้า Landing Page
- ✓ ไม่มี Error 404
- ✓ ไม่มี White Screen

---

## ⚠️ Troubleshooting

### ปัญหา: 404 Not Found
- ตรวจสอบ path: `/public_html/ems_staging/`
- ตรวจสอบว่ามี `index.html`
- ตรวจสอบ Permissions

### ปัญหา: White Screen
- ตรวจสอบ JavaScript path
- เปิด Browser Console (F12) ดู Error
- ตรวจสอบว่า Upload `.htaccess` แล้ว

### ปัญหา: Permission Denied
- ตั้งค่า Permissions ใหม่
- Folders: 755
- Files: 644

---

## 📋 Checklist

- [ ] Download FileZilla (หรือใช้ cPanel)
- [ ] เชื่อมต่อ FTP สำเร็จ
- [ ] สร้าง folder `ems_staging`
- [ ] Upload ทุกไฟล์จาก `build/`
- [ ] Upload `.htaccess`
- [ ] ตั้งค่า Permissions (755/644)
- [ ] ทดสอบ https://wiangwecare.com/ems_staging/
- [ ] เห็นหน้า Landing Page ✓
