# CORS Testing Guide

## Overview

This directory contains a CORS (Cross-Origin Resource Sharing) test script to verify that the backend's CORS configuration is working correctly.

## Prerequisites

- Node.js installed
- Backend server running on `http://localhost:3001`

## Running the Tests

### 1. Start the Backend Server

```bash
cd wecare-backend
npm run dev
```

### 2. Run CORS Tests

In a new terminal:

```bash
cd wecare-backend
node test-cors.js
```

## Test Cases

The test script validates the following scenarios:

### ✅ Allowed Origins (Development)
- `http://localhost:5173` - Vite dev server
- `http://localhost:3000` - Alternative dev port
- `http://127.0.0.1:5173` - IP-based localhost

### ❌ Blocked Origins
- `https://evil.com` - Unauthorized domain
- `http://random-domain.com` - Random domain
- No origin header - Direct requests

## What the Tests Check

1. **CORS Headers**: Verifies `Access-Control-Allow-Origin` header
2. **Credentials**: Checks `Access-Control-Allow-Credentials` header
3. **Preflight Requests**: Tests OPTIONS requests for allowed origins
4. **Security**: Ensures unauthorized origins are blocked

## Expected Output

```
╔═══════════════════════════════════════════════════════════╗
║          CORS Configuration Test Suite                   ║
╚═══════════════════════════════════════════════════════════╝

Backend URL: http://localhost:3001
Total Tests: 6

✓ Backend is running

Testing: Allowed Origin - localhost:5173
  Origin: http://localhost:5173
  ✓ PASS
  Status: 200
  CORS Header: http://localhost:5173
  Credentials: true
  ✓ Preflight PASS

...

═══════════════════════════════════════════════════════════
Test Summary
═══════════════════════════════════════════════════════════
Total Tests: 6
Passed: 6
Failed: 0
Success Rate: 100.0%

✓ All tests passed! CORS configuration is working correctly.
```

## Production Configuration

### Environment Variables

For production deployment, set the `ALLOWED_ORIGINS` environment variable:

```bash
# .env (production)
NODE_ENV=production
ALLOWED_ORIGINS=https://ems.example.com,https://admin.ems.example.com
```

### Testing Production CORS

To test production CORS configuration:

1. Update `test-cors.js` test cases with your production domains
2. Set `NODE_ENV=production` and `ALLOWED_ORIGINS` in `.env`
3. Restart backend and run tests

## Troubleshooting

### Backend Not Running

```
✗ Backend is not running!
Please start the backend server first:
  cd wecare-backend
  npm run dev
```

**Solution**: Start the backend server before running tests.

### Tests Failing

If tests fail, check:

1. **Backend logs**: Look for CORS-related warnings
2. **Environment**: Verify `NODE_ENV` is set correctly
3. **Origins**: Ensure test origins match allowed origins
4. **Port**: Confirm backend is running on port 3001

### CORS Errors in Browser

If you see CORS errors in the browser console:

1. Check browser's origin (e.g., `http://localhost:5173`)
2. Verify origin is in allowed list (dev or production)
3. Check backend logs for blocked origin warnings
4. Ensure credentials are enabled if using cookies/auth

## Security Best Practices

### Development
- ✅ Allow localhost origins only
- ✅ Use specific ports (not wildcards)
- ✅ Enable credentials for auth testing

### Production
- ✅ **MUST** set `ALLOWED_ORIGINS` environment variable
- ✅ Use HTTPS origins only
- ✅ List specific domains (no wildcards)
- ✅ Enable credentials for authenticated requests
- ✅ Monitor unauthorized origin attempts

## CORS Configuration Files

- **Backend**: `wecare-backend/src/index.ts` (lines 57-100)
- **Environment**: `wecare-backend/.env.example` (lines 5-9)
- **Tests**: `wecare-backend/test-cors.js`

## Additional Resources

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)
- [OWASP: CORS](https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny)

## Support

For issues or questions about CORS configuration:

1. Check backend logs for warnings
2. Review `.env.example` for configuration examples
3. Run `node test-cors.js` to verify setup
4. Check browser console for specific CORS errors
