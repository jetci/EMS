/**
 * Example: How to add Rate Limiting to routes/patients.ts and routes/rides.ts
 * 
 * Instructions:
 * 1. Import rate limiters
 * 2. Add limiters to POST/PUT/DELETE routes
 * 3. Test the implementation
 */

// ============================================
// STEP 1: Add imports (add at the top of patients.ts)
// ============================================

import { createLimiter, uploadLimiter } from '../middleware/rateLimiter';

// ============================================
// STEP 2: Add rate limiters to routes
// ============================================

// Example for patients.ts:

// GET /api/patients - No rate limiting needed (read operation)
router.get('/', authenticateToken, requireRole(['admin', 'officer', 'radio_center', 'community']), async (req: Request, res: Response) => {
    // ... existing code ...
});

// POST /api/patients - Add createLimiter and uploadLimiter
router.post('/',
    createLimiter,        // Limit creation requests
    uploadLimiter,        // Limit file uploads
    authenticateToken,
    requireRole(['admin', 'officer', 'community']),
    upload.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'attachments', maxCount: 5 }
    ]),
    checkDuplicatePatient,
    async (req: Request, res: Response) => {
        // ... existing code ...
    }
);

// PUT /api/patients/:id - Add createLimiter and uploadLimiter
router.put('/:id',
    createLimiter,        // Limit update requests
    uploadLimiter,        // Limit file uploads
    authenticateToken,
    requireRole(['admin', 'officer', 'community']),
    upload.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'attachments', maxCount: 5 }
    ]),
    async (req: Request, res: Response) => {
        // ... existing code ...
    }
);

// DELETE /api/patients/:id - Add createLimiter
router.delete('/:id',
    createLimiter,        // Limit delete requests
    authenticateToken,
    requireRole(['admin', 'officer', 'community']),
    async (req: Request, res: Response) => {
        // ... existing code ...
    }
);

// ============================================
// Example for rides.ts:
// ============================================

import { createLimiter } from '../middleware/rateLimiter';

// POST /api/rides - Add createLimiter
router.post('/',
    createLimiter,        // Limit ride creation requests
    authenticateToken,
    requireRole(['admin', 'officer', 'radio_center', 'community']),
    async (req: Request, res: Response) => {
        // ... existing code ...
    }
);

// PUT /api/rides/:id - Add createLimiter
router.put('/:id',
    createLimiter,        // Limit ride update requests
    authenticateToken,
    requireRole(['admin', 'officer', 'radio_center', 'driver', 'community']),
    async (req: Request, res: Response) => {
        // ... existing code ...
    }
);

// DELETE /api/rides/:id - Add createLimiter
router.delete('/:id',
    createLimiter,        // Limit ride deletion requests
    authenticateToken,
    requireRole(['admin', 'officer', 'community']),
    async (req: Request, res: Response) => {
        // ... existing code ...
    }
);

// ============================================
// Rate Limiter Configuration Summary
// ============================================

/**
 * createLimiter:
 * - Window: 1 minute
 * - Max: 10 requests per minute
 * - Use for: POST, PUT, DELETE operations
 *
 * uploadLimiter:
 * - Window: 5 minutes
 * - Max: 20 uploads per 5 minutes
 * - Use for: Routes with file uploads
 *
 * authLimiter:
 * - Window: 15 minutes
 * - Max: 5 attempts (production), 200 (development)
 * - Use for: /auth/login endpoint
 *
 * apiLimiter:
 * - Window: 1 minute
 * - Max: 100 requests per minute
 * - Use for: General API endpoints
 */

// ============================================
// Testing Rate Limiting
// ============================================

/**
 * Test 1: Create Patient Rate Limit
 *
 * Try to create more than 10 patients within 1 minute
 * Expected: After 10 requests, receive 429 error
 *
 * curl -X POST http://localhost:3001/api/patients \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{"fullName":"Test Patient","contactPhone":"0812345678"}'
 *
 * Repeat 11 times quickly
 */

/**
 * Test 2: File Upload Rate Limit
 *
 * Try to upload more than 20 files within 5 minutes
 * Expected: After 20 uploads, receive 429 error
 */

/**
 * Test 3: Check Rate Limit Headers
 *
 * After making a request, check response headers:
 * - RateLimit-Limit: Maximum requests allowed
 * - RateLimit-Remaining: Requests remaining
 * - RateLimit-Reset: Time when limit resets
 * - Retry-After: Seconds to wait (if rate limited)
 */

// ============================================
// Error Handling for Rate Limiting
// ============================================

/**
 * When rate limit is exceeded, the response will be:
 *
 * Status: 429 Too Many Requests
 *
 * Body:
 * {
 *   "error": "Too many creation requests, please slow down",
 *   "retryAfter": "1 minute"
 * }
 *
 * Headers:
 * RateLimit-Limit: 10
 * RateLimit-Remaining: 0
 * RateLimit-Reset: 1704844800
 * Retry-After: 60
 */

// ============================================
// Frontend Handling
// ============================================

/**
 * In your frontend API client, handle 429 errors:
 *
 * try {
 *   const response = await fetch('/api/patients', {
 *     method: 'POST',
 *     headers: {
 *       'Authorization': `Bearer ${token}`,
 *       'Content-Type': 'application/json'
 *     },
 *     body: JSON.stringify(patientData)
 *   });
 *
 *   if (response.status === 429) {
 *     const data = await response.json();
 *     alert(`คุณส่งคำขอมากเกินไป กรุณารอ ${data.retryAfter} แล้วลองใหม่อีกครั้ง`);
 *     return;
 *   }
 *
 *   // ... handle success ...
 * } catch (error) {
 *   // ... handle error ...
 * }
 */

// ============================================
// Production Recommendations
// ============================================

/**
 * 1. Adjust limits based on actual usage patterns
 * 2. Monitor rate limit hits in logs
 * 3. Consider using Redis for distributed rate limiting
 * 4. Implement exponential backoff in frontend
 * 5. Add rate limit monitoring/alerting
 * 6. Document rate limits in API documentation
 */
