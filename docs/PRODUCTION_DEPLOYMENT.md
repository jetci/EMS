# 🔐 Production Deployment Guide

## Overview

This guide covers the security configuration and deployment steps for running EMS WeCare in production.

---

## 1. Environment Variables

### 🔴 Critical Security Variables

These MUST be set with strong, unique values in production:

| Variable | Description | How to Generate |
|----------|-------------|-----------------|
| `JWT_SECRET` | JWT token signing key | `openssl rand -base64 32` |
| `SESSION_SECRET` | Session cookie secret | `openssl rand -base64 32` |
| `ALLOWED_ORIGINS` | CORS allowed origins | Your production domain(s) |

### Generate Secrets

```bash
# Generate all required secrets
node scripts/validate-env.js --generate-secrets

# Or manually with OpenSSL
openssl rand -base64 32
```

### Example Production .env

```env
# ============================================
# PRODUCTION CONFIGURATION
# ============================================

NODE_ENV=production
PORT=3001

# Security (REQUIRED - use generated values)
JWT_SECRET=YourGeneratedBase64SecretHere
SESSION_SECRET=AnotherGeneratedBase64SecretHere

# CORS (REQUIRED - your actual domains)
ALLOWED_ORIGINS=https://wecare.example.com,https://app.wecare.com

# CSRF Protection
CSRF_COOKIE_SECURE=true

# Logging
LOG_LEVEL=warn
LOG_TO_FILE=true
LOG_FILE_PATH=./logs/app.log

# Database
DATABASE_PATH=./db/wecare.db

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 2. Secret Management

### ⚠️ Never Commit Secrets

The `.env` file should **NEVER** be committed to version control.

### Recommended Secret Storage Options

| Platform | Solution |
|----------|----------|
| **AWS** | AWS Secrets Manager, SSM Parameter Store |
| **Google Cloud** | Secret Manager |
| **Azure** | Key Vault |
| **Docker** | Docker Secrets |
| **Kubernetes** | Kubernetes Secrets |
| **Railway/Render** | Environment Variables in Dashboard |
| **Vercel/Netlify** | Environment Variables in Dashboard |

### Example: Using Docker Secrets

```yaml
# docker-compose.production.yml
services:
  app:
    image: wecare-ems:latest
    secrets:
      - jwt_secret
      - session_secret
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - SESSION_SECRET_FILE=/run/secrets/session_secret

secrets:
  jwt_secret:
    external: true
  session_secret:
    external: true
```

---

## 3. Pre-Deployment Checklist

### Run Environment Validation

```bash
cd wecare-backend
NODE_ENV=production node scripts/validate-env.js
```

This will check:
- ✅ All required variables are set
- ✅ Secrets meet minimum length requirements
- ✅ No placeholder values (e.g., "change-this")
- ✅ CORS doesn't allow localhost
- ✅ CSRF cookie is secured

### Security Checklist

- [ ] JWT_SECRET is 32+ characters, randomly generated
- [ ] SESSION_SECRET is 32+ characters, randomly generated
- [ ] ALLOWED_ORIGINS only contains production domains
- [ ] ALLOWED_ORIGINS uses HTTPS (not HTTP)
- [ ] CSRF_COOKIE_SECURE=true
- [ ] LOG_LEVEL=warn or error (not debug/info)
- [ ] No sensitive data in logs

---

## 4. Docker Production Deployment

### Build Production Image

```bash
# Build the multi-stage production image
docker-compose build

# Or build directly
docker build -t wecare-ems:latest .
```

### Run with Docker Compose

```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f app

# Check health
curl http://localhost:3001/api/csrf-token
```

### Environment Variables with Docker

```bash
# Option 1: Using .env file
docker-compose --env-file .env.production up -d

# Option 2: Using environment variables
JWT_SECRET=xxx SESSION_SECRET=xxx docker-compose up -d

# Option 3: Using Docker secrets (recommended)
docker secret create jwt_secret secret.txt
```

---

## 5. Health Checks

### API Health Check

```bash
# Check if API is responding
curl -f http://localhost:3001/api/csrf-token

# Expected response:
# {"csrfToken":"..."}
```

### Docker Health Check

The Dockerfile includes a built-in health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/csrf-token || exit 1
```

---

## 6. Logging in Production

### Log Levels

| Level | Description | When to Use |
|-------|-------------|-------------|
| `error` | Errors only | Production (minimal logs) |
| `warn` | Warnings + Errors | Production (recommended) |
| `info` | General info | Staging |
| `debug` | All details | Development only |

### Set Log Level

```env
LOG_LEVEL=warn
```

### View Logs

```bash
# Docker
docker-compose logs -f app

# PM2
pm2 logs wecare

# File
tail -f ./logs/app.log
```

---

## 7. Backup & Restore

### Automatic Backup

The system creates automatic backups. Configure in environment:

```env
BACKUP_ENABLED=true
BACKUP_INTERVAL=86400000  # 24 hours in ms
BACKUP_RETENTION=7        # Keep 7 backups
```

### Manual Backup

```bash
# Create backup
sqlite3 db/wecare.db ".backup 'backup_$(date +%Y%m%d_%H%M%S).db'"

# Verify backup
sqlite3 backup_*.db "SELECT count(*) FROM users;"
```

---

## 8. SSL/HTTPS

### Option 1: Reverse Proxy (Recommended)

Use Nginx or Traefik as a reverse proxy:

```nginx
server {
    listen 443 ssl;
    server_name wecare.example.com;
    
    ssl_certificate /etc/letsencrypt/live/wecare.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wecare.example.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Cloud Load Balancer

Use AWS ALB, GCP Load Balancer, or Cloudflare for SSL termination.

---

## 9. Monitoring

### Recommended Tools

| Category | Tool |
|----------|------|
| **Error Tracking** | Sentry |
| **APM** | New Relic, Datadog |
| **Logging** | ELK Stack, Loki |
| **Uptime** | UptimeRobot, Pingdom |

### Sentry Integration

```env
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 10. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| 403 Forbidden | Check ALLOWED_ORIGINS, CORS settings |
| 401 Unauthorized | Check JWT_SECRET matches between deploys |
| Database locked | Single instance only, check file permissions |
| Port in use | Change PORT or stop conflicting service |

### Debug Commands

```bash
# Check environment
node scripts/validate-env.js

# Test database
sqlite3 db/wecare.db "SELECT count(*) FROM users;"

# Check container health
docker inspect --format='{{.State.Health.Status}}' wecare-app
```

---

## Quick Start Summary

```bash
# 1. Generate secrets
node scripts/validate-env.js --generate-secrets

# 2. Create production .env
cp .env.example .env.production
# Edit with your secrets and domains

# 3. Validate configuration
NODE_ENV=production node scripts/validate-env.js

# 4. Build and deploy
docker-compose --env-file .env.production up -d

# 5. Verify health
curl http://localhost:3001/api/csrf-token
```
