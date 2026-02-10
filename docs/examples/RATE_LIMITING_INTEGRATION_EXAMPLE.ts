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
// STEP 3: Test rate limiting
// ============================================

/**
 * Test script to verify rate limiting works:
 * 
 * // Make multiple rapid requests to trigger the limiter
 * for (let i = 0; i < 15; i++) {
 *     try {
 *         const response = await fetch('/api/patients', {
 *             method: 'POST',
 *             headers: {
 *                 'Content-Type': 'application/json',
 *                 'Authorization': `Bearer ${token}`
 *             },
 *             body: JSON.stringify({ name: 'Test Patient' })
 *         });
 *         
 *         if (response.status === 429) {
 *             console.log('Rate limit exceeded!');
 *             break;
 *         }
 *         
 *         console.log(`Request ${i + 1}: ${response.status}`);
 *     } catch (error) {
 *         console.error(error);
 *     }
 * }
 */

// ============================================
// Expected Response for Rate Limit Exceeded:
// ============================================

/*
HTTP 429 Too Many Requests

{
    "statusCode": 429,
    "message": "Too many requests, please try again later",
    "retryAfter": 60
}
*/

// ============================================
// Optional: Custom error handling for rate limit
// ============================================

router.post('/',
    createLimiter,
    authenticateToken,
    requireRole(['admin', 'officer', 'community']),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // ... your existing code ...
        } catch (error: any) {
            if (error.status === 429) {
                // Handle rate limit error gracefully
                return res.status(429).json({
                    statusCode: 429,
                    message: 'Too many requests. Please wait before trying again.',
                    retryAfter: error.retryAfter || 60
                });
            }
            next(error);
        }
    }
);

// ============================================
// Configure rate limiter options
// ============================================

/*
If you need to adjust rate limiting, modify:
wecare-backend/src/middleware/rateLimiter.ts

Common configurations:
- windowMs: Time window in milliseconds (default: 15 minutes)
- max: Maximum requests per window (default: varies by endpoint)
- message: Custom error message
- standardHeaders: Return rate limit info in RateLimit-* headers
- legacyHeaders: Disable X-RateLimit-* headers
*/
