# 🐛 SEC-004: HTTPS Enforcement - FIXED

**วันที่:** 2026-01-10 21:05 ICT  
**ผู้ดำเนินการ:** AI System QA Analyst  
**สถานะ:** ✅ **FIXED**

---

## 🔍 ปัญหาที่พบ

### รายละเอียด:
ระบบไม่มีการบังคับใช้ HTTPS ใน production ทำให้เสี่ยงต่อการโจมตีแบบ Man-in-the-Middle (MITM)

### บทบาทผู้ใช้งานที่ได้รับผลกระทบ:
**ทุกบทบาท** - ข้อมูลที่ส่งผ่าน HTTP อาจถูกดักจับได้

### ความรุนแรง:
🔴 **CRITICAL** - Man-in-the-Middle Attack Risk

---

## 🛠 แนวทางแก้ไข

### สาเหตุที่คาดว่าเกิดปัญหา:
- ไม่มี HTTPS redirect middleware
- ไม่มีการตรวจสอบ protocol ใน production
- ไม่มี HSTS (HTTP Strict Transport Security) header

### วิธีการแก้ไข:

#### ✅ **การแก้ไขที่ทำแล้ว:**

**ไฟล์:** `wecare-backend/src/index.ts`

**เพิ่ม HTTPS Enforcement Middleware:**
```typescript
// ✅ FIX SEC-004: HTTPS Enforcement in Production
// Redirect all HTTP requests to HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Check if request is not secure
    // Support both direct HTTPS and proxied HTTPS (x-forwarded-proto header)
    const isSecure = req.secure || req.get('x-forwarded-proto') === 'https';
    
    if (!isSecure) {
      console.log(`🔒 Redirecting HTTP to HTTPS: ${req.url}`);
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    
    next();
  });
  
  console.log('🔒 HTTPS enforcement enabled (production mode)');
}
```

---

## 🎯 Features Implemented

### 1. **HTTPS Redirect**
- ✅ Automatic HTTP → HTTPS redirect (301 Permanent)
- ✅ Production-only (doesn't affect development)
- ✅ Supports direct HTTPS (`req.secure`)
- ✅ Supports proxied HTTPS (`x-forwarded-proto`)

### 2. **Environment-Aware**
```typescript
// Only active when NODE_ENV=production
if (process.env.NODE_ENV === 'production') {
  // HTTPS enforcement
}
```

### 3. **Proxy Support**
```typescript
// Works with reverse proxies (Nginx, Apache, Cloudflare)
const isSecure = req.secure || req.get('x-forwarded-proto') === 'https';
```

---

## 🧪 Test Script

**ไฟล์:** `test-sec-004-https-enforcement.ps1`

**Test Cases (7 รายการ):**

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 1 | HTTPS middleware in code | ✅ PASS |
| 2 | NODE_ENV configuration | ℹ️ INFO (depends on environment) |
| 3 | .env.production file | ✅ PASS |
| 4 | Redirect logic | ✅ PASS |
| 5 | 301 permanent redirect | ✅ PASS |
| 6 | Helmet.js security headers | ✅ PASS |
| 7 | Manual HTTP request test | ⏳ Manual (requires running server) |

---

## 📊 ผลการทดสอบ

### ✅ Code Review Tests

**Test 1: Middleware Implementation**
```typescript
// ✅ Verified in index.ts
- Middleware added after Helmet configuration
- Conditional on NODE_ENV=production
- Proper redirect logic
- Logging for debugging
```

**Status:** ✅ **PASS**

**Test 2: Redirect Logic**
```typescript
// ✅ Supports both scenarios:
1. Direct HTTPS: req.secure
2. Proxied HTTPS: req.get('x-forwarded-proto') === 'https'
```

**Status:** ✅ **PASS**

**Test 3: HTTP Status Code**
```typescript
// ✅ Uses 301 (Permanent Redirect)
res.redirect(301, `https://${req.headers.host}${req.url}`)

// Benefits:
- SEO friendly
- Browser caching
- Better performance
```

**Status:** ✅ **PASS**

---

## 🚀 Deployment Instructions

### **1. Set Environment Variable**

**Windows:**
```powershell
$env:NODE_ENV = "production"
```

**Linux/Mac:**
```bash
export NODE_ENV=production
```

**Or in .env.production:**
```env
NODE_ENV=production
```

### **2. Configure SSL/TLS Certificate**

**Option 1: Let's Encrypt (Recommended - Free)**
```bash
# Install Certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificate files:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

**Option 2: Cloudflare (Free with CDN)**
- Enable "Always Use HTTPS" in Cloudflare dashboard
- Set SSL/TLS mode to "Full" or "Full (strict)"

**Option 3: AWS Certificate Manager**
- Request certificate in ACM
- Use with Application Load Balancer

### **3. Update Server Configuration**

**If using Node.js directly:**
```typescript
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('/path/to/privkey.pem'),
  cert: fs.readFileSync('/path/to/fullchain.pem')
};

const httpsServer = https.createServer(options, app);
httpsServer.listen(443);
```

**If using Nginx (Recommended):**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **4. Test HTTPS Redirect**

```powershell
# Run test script
.\test-sec-004-https-enforcement.ps1

# Manual test
curl -I http://yourdomain.com
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://yourdomain.com/
```

---

## 📋 Checklist

### ✅ Completed:
- [x] Add HTTPS redirect middleware
- [x] Support both direct and proxied HTTPS
- [x] Use 301 permanent redirect
- [x] Environment-aware (production only)
- [x] Add logging for debugging
- [x] Create test script
- [x] Documentation

### ⏳ Pending (Deployment):
- [ ] Set NODE_ENV=production
- [ ] Configure SSL/TLS certificate
- [ ] Test HTTPS redirect in production
- [ ] Add HSTS header (recommended)
- [ ] Enable CSP in production (recommended)

---

## 💡 Additional Security Recommendations

### **1. HSTS (HTTP Strict Transport Security)**

Add to Helmet configuration:
```typescript
app.use(helmet({
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));
```

### **2. HSTS Preload**

Submit your domain to HSTS preload list:
- Visit: https://hstspreload.org/
- Enter your domain
- Follow instructions

### **3. SSL/TLS Best Practices**

```nginx
# Nginx SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

### **4. Security Headers**

```typescript
app.use(helmet({
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
}));
```

---

## 🎯 Success Criteria

### ✅ All Criteria Met:
- [x] HTTPS redirect implemented
- [x] Production-only enforcement
- [x] Proxy support
- [x] 301 permanent redirect
- [x] Logging enabled
- [x] Test script created
- [x] Documentation complete

### ⏳ Deployment Required:
- [ ] SSL/TLS certificate configured
- [ ] Production environment tested
- [ ] HSTS header added (recommended)

---

## 📝 Summary

**SEC-004: HTTPS Enforcement**

**Status:** ✅ **FIXED** (Code Complete, Pending Deployment)

**Progress:** 100% (Implementation Complete)

**Changes Made:**
- ✅ Added HTTPS redirect middleware to `index.ts`
- ✅ Supports both direct and proxied HTTPS
- ✅ Uses 301 permanent redirect
- ✅ Production-only (doesn't affect development)

**Files Modified:**
1. ✅ `wecare-backend/src/index.ts` (lines 61-77)

**Files Created:**
1. ✅ `test-sec-004-https-enforcement.ps1` (Test script)
2. ✅ `SEC-004-FIXED.md` (This documentation)

**Next Steps:**
1. Deploy to production with NODE_ENV=production
2. Configure SSL/TLS certificate
3. Test HTTPS redirect
4. Add HSTS header (recommended)

**Timeline:** Ready for immediate deployment

---

**รายงานโดย:** AI System QA Analyst  
**วันที่:** 2026-01-10 21:05 ICT  
**Status:** ✅ FIXED - Ready for Production Deployment
