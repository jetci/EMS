/**
 * Joi Validation Integration Guide
 * วิธีการ Apply Joi Validation Middleware ใน Routes
 */

// ============================================
// 1. Auth Routes (auth.ts)
// ============================================

// ก่อนแก้ไข (Line 33):
router.post('/auth/login', async (req, res) => {

    // หลังแก้ไข:
    router.post('/auth/login', validateRequest(loginSchema), async (req, res) => {

        // ก่อนแก้ไข (Line 182):
        router.post('/auth/register', async (req, res) => {

            // หลังแก้ไข:
            router.post('/auth/register', validateRequest(registerSchema), async (req, res) => {

                // ============================================
                // 2. Patient Routes (patients.ts)
                // ============================================

                // เพิ่ม import ที่บรรทัดแรก:
                import { validateRequest, patientCreateSchema, patientUpdateSchema } from '../middleware/joiValidation';

                // ก่อนแก้ไข (Line 319):
                router.post('/', checkDuplicatePatient, upload.fields([...]), async (req: AuthRequest, res) => {

                    // หลังแก้ไข:
                    router.post('/',
                        checkDuplicatePatient,
                        upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'attachments', maxCount: 5 }]),
                        validateRequest(patientCreateSchema),
                        async (req: AuthRequest, res) => {

                            // ก่อนแก้ไข (Line 500):
                            router.put('/:id', upload.fields([...]), async (req: AuthRequest, res) => {

                                // หลังแก้ไข:
                                router.put('/:id',
                                    upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'attachments', maxCount: 5 }]),
                                    validateRequest(patientUpdateSchema),
                                    async (req: AuthRequest, res) => {

                                        // ============================================
                                        // 3. Ride Routes (rides.ts)
                                        // ============================================

                                        // เพิ่ม import ที่บรรทัดแรก:
                                        import { validateRequest, rideCreateSchema, rideUpdateSchema } from '../middleware/joiValidation';

                                        // ก่อนแก้ไข (Line 178):
                                        router.post('/', checkDuplicateRide, async (req: AuthRequest, res) => {

                                            // หลังแก้ไข:
                                            router.post('/',
                                                checkDuplicateRide,
                                                validateRequest(rideCreateSchema),
                                                async (req: AuthRequest, res) => {

                                                    // ก่อนแก้ไข (Line 260):
                                                    router.put('/:id', async (req: AuthRequest, res) => {

                                                        // หลังแก้ไข:
                                                        router.put('/:id',
                                                            validateRequest(rideUpdateSchema),
                                                            async (req: AuthRequest, res) => {

                                                                // ============================================
                                                                // สรุปการเปลี่ยนแปลง
                                                                // ============================================

                                                                /**
                                                                 * ไฟล์ที่ต้องแก้ไข: 3 ไฟล์
                                                                 * 
                                                                 * 1. wecare-backend/src/routes/auth.ts
                                                                 *    - Line 33: เพิ่ม validateRequest(loginSchema)
                                                                 *    - Line 182: เพิ่ม validateRequest(registerSchema)
                                                                 * 
                                                                 * 2. wecare-backend/src/routes/patients.ts
                                                                 *    - Line 1: เพิ่ม import
                                                                 *    - Line 319: เพิ่ม validateRequest(patientCreateSchema)
                                                                 *    - Line 500: เพิ่ม validateRequest(patientUpdateSchema)
                                                                 * 
                                                                 * 3. wecare-backend/src/routes/rides.ts
                                                                 *    - Line 1: เพิ่ม import
                                                                 *    - Line 178: เพิ่ม validateRequest(rideCreateSchema)
                                                                 *    - Line 260: เพิ่ม validateRequest(rideUpdateSchema)
                                                                 */

                                                                // ============================================
                                                                // ตัวอย่างการทดสอบ
                                                                // ============================================

                                                                /**
                                                                 * Test 1: Login with Invalid Email
                                                                 * 
                                                                 * Request:
                                                                 * POST /api/auth/login
                                                                 * {
                                                                 *   "email": "invalid-email",
                                                                 *   "password": "password123"
                                                                 * }
                                                                 * 
                                                                 * Expected Response (400):
                                                                 * {
                                                                 *   "error": "Validation failed",
                                                                 *   "details": [
                                                                 *     {
                                                                 *       "field": "email",
                                                                 *       "message": "รูปแบบอีเมลไม่ถูกต้อง"
                                                                 *     }
                                                                 *   ]
                                                                 * }
                                                                 */

                                                                /**
                                                                 * Test 2: Create Patient with Invalid Data
                                                                 * 
                                                                 * Request:
                                                                 * POST /api/patients
                                                                 * {
                                                                 *   "fullName": "A",
                                                                 *   "nationalId": "123"
                                                                 * }
                                                                 * 
                                                                 * Expected Response (400):
                                                                 * {
                                                                 *   "error": "Validation failed",
                                                                 *   "details": [
                                                                 *     {
                                                                 *       "field": "fullName",
                                                                 *       "message": "ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร"
                                                                 *     },
                                                                 *     {
                                                                 *       "field": "nationalId",
                                                                 *       "message": "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก"
                                                                 *     }
                                                                 *   ]
                                                                 * }
                                                                 */

                                                                export default {
                                                                    // This file is for documentation only
                                                                    // Apply changes manually to the routes files
                                                                };
