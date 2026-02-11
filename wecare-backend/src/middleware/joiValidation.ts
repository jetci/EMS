import Joi from 'joi';

/**
 * Joi Schema Validation for EMS WeCare
 * Provides comprehensive input validation with whitelisting
 */

// ============================================
// Common Schemas
// ============================================

// Thai National ID: 13 digits
const nationalIdSchema = Joi.string()
    .pattern(/^\d{13}$/)
    .messages({
        'string.pattern.base': 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก'
    });

// Thai Phone Number: 9-10 digits starting with 0 (supports landline and mobile)
const phoneSchema = Joi.string()
    .pattern(/^0\d{8,9}$/)
    .messages({
        'string.pattern.base': 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก ขึ้นต้นด้วย 0'
    });

// Email
const emailSchema = Joi.string()
    .email()
    .max(100)
    .messages({
        'string.email': 'รูปแบบอีเมลไม่ถูกต้อง'
    });

// Safe Text (ไม่มี Special Characters อันตราย)
const safeTextSchema = Joi.string()
    .pattern(/^[a-zA-Z0-9ก-๙\s,.-]+$/)
    .messages({
        'string.pattern.base': 'ข้อความมีอักขระที่ไม่อนุญาต'
    });

// Date (YYYY-MM-DD)
const dateSchema = Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
        'string.pattern.base': 'รูปแบบวันที่ต้องเป็น YYYY-MM-DD'
    });

// Latitude (-90 to 90)
const latitudeSchema = Joi.number()
    .min(-90)
    .max(90)
    .messages({
        'number.min': 'ละติจูดต้องอยู่ระหว่าง -90 ถึง 90',
        'number.max': 'ละติจูดต้องอยู่ระหว่าง -90 ถึง 90'
    });

// Longitude (-180 to 180)
const longitudeSchema = Joi.number()
    .min(-180)
    .max(180)
    .messages({
        'number.min': 'ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180',
        'number.max': 'ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180'
    });

// ============================================
// Patient Schemas
// ============================================

export const patientCreateSchema = Joi.object({
    fullName: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร',
            'string.max': 'ชื่อ-นามสกุลต้องไม่เกิน 100 ตัวอักษร',
            'any.required': 'กรุณากรอกชื่อ-นามสกุล'
        }),

    title: Joi.string()
        .valid('นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง', 'น.ส.', 'ด.ช.', 'ด.ญ.')
        .optional()
        .allow(null),

    nationalId: nationalIdSchema.optional().allow(null),

    dob: dateSchema.optional().allow(null),

    age: Joi.number()
        .integer()
        .min(0)
        .max(150)
        .optional()
        .allow(null),

    gender: Joi.string()
        .valid('ชาย', 'หญิง', 'ไม่ระบุ')
        .optional()
        .allow(null),

    bloodType: Joi.string()
        .valid('A', 'B', 'AB', 'O')
        .optional()
        .allow(null),

    rhFactor: Joi.string()
        .valid('+', '-')
        .optional()
        .allow(null),

    healthCoverage: Joi.string()
        .max(100)
        .optional()
        .allow(null),

    keyInfo: Joi.string()
        .max(1000)
        .optional()
        .allow(null, ''),

    caregiverName: Joi.string()
        .max(100)
        .optional()
        .allow(null, ''),

    caregiverPhone: phoneSchema.optional().allow(null, ''),

    contactPhone: phoneSchema.optional().allow(null),

    // Address
    currentAddress: Joi.string()
        .optional()
        .allow(null),

    idCardAddress: Joi.string()
        .optional()
        .allow(null),

    landmark: Joi.string()
        .max(500)
        .pattern(/^[a-zA-Z0-9ก-๙\s,.-]+$/)
        .optional()
        .allow(null)
        .messages({
            'string.pattern.base': 'จุดสังเกตมีอักขระที่ไม่อนุญาต'
        }),

    latitude: Joi.alternatives()
        .try(
            Joi.string().pattern(/^-?\d+\.?\d*$/),
            latitudeSchema
        )
        .optional()
        .allow(null),

    longitude: Joi.alternatives()
        .try(
            Joi.string().pattern(/^-?\d+\.?\d*$/),
            longitudeSchema
        )
        .optional()
        .allow(null),

    // Emergency Contact
    emergencyContactName: Joi.string()
        .max(100)
        .optional()
        .allow(null),

    emergencyContactPhone: phoneSchema.optional().allow(null),

    emergencyContactRelation: Joi.string()
        .max(50)
        .optional()
        .allow(null),

    // Medical (JSON strings)
    patientTypes: Joi.string().optional().allow(null),
    chronicDiseases: Joi.string().optional().allow(null),
    allergies: Joi.string().optional().allow(null),

    profileImageUrl: Joi.string()
        .uri({ allowRelative: true })
        .optional()
        .allow(null)
});

export const patientUpdateSchema = patientCreateSchema.fork(
    ['fullName'],
    (schema) => schema.optional()
);

// ============================================
// Ride Schemas
// ============================================

export const rideCreateSchema = Joi.object({
    patientId: Joi.string()
        .pattern(/^PAT-\d{3}$/)
        .required()
        .messages({
            'string.pattern.base': 'รหัสผู้ป่วยไม่ถูกต้อง',
            'any.required': 'กรุณาเลือกผู้ป่วย'
        }),

    patientName: Joi.string()
        .min(2)
        .max(100)
        .required(),

    patientPhone: phoneSchema.optional().allow(null),

    pickupLocation: Joi.string()
        .min(5)
        .max(500)
        .required()
        .messages({
            'string.min': 'ที่อยู่จุดรับต้องมีอย่างน้อย 5 ตัวอักษร',
            'any.required': 'กรุณากรอกที่อยู่จุดรับ'
        }),

    pickupLat: Joi.alternatives()
        .try(
            Joi.string().pattern(/^-?\d+\.?\d*$/),
            latitudeSchema
        )
        .optional()
        .allow(null),

    pickupLng: Joi.alternatives()
        .try(
            Joi.string().pattern(/^-?\d+\.?\d*$/),
            longitudeSchema
        )
        .optional()
        .allow(null),

    destination: Joi.string()
        .min(5)
        .max(500)
        .required()
        .messages({
            'string.min': 'ปลายทางต้องมีอย่างน้อย 5 ตัวอักษร',
            'any.required': 'กรุณากรอกปลายทาง'
        }),

    destinationLat: Joi.alternatives()
        .try(
            Joi.string().pattern(/^-?\d+\.?\d*$/),
            latitudeSchema
        )
        .optional()
        .allow(null),

    destinationLng: Joi.alternatives()
        .try(
            Joi.string().pattern(/^-?\d+\.?\d*$/),
            longitudeSchema
        )
        .optional()
        .allow(null),

    appointmentTime: Joi.string()
        .isoDate()
        .required()
        .messages({
            'any.required': 'กรุณาเลือกเวลานัดหมาย'
        }),

    tripType: Joi.string()
        .valid('ไป', 'กลับ', 'ไป-กลับ')
        .optional()
        .allow(null),

    specialNeeds: Joi.string().optional().allow(null),

    notes: Joi.string()
        .max(1000)
        .optional()
        .allow(null)
});

export const rideUpdateSchema = Joi.object({
    status: Joi.string()
        .valid('PENDING', 'ASSIGNED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
        .optional(),

    driverId: Joi.string()
        .pattern(/^DRV-\d{3}$/)
        .optional()
        .allow(null),

    driverName: Joi.string()
        .max(100)
        .optional()
        .allow(null),

    vehicleId: Joi.string()
        .optional()
        .allow(null),

    cancellationReason: Joi.string()
        .max(500)
        .optional()
        .allow(null)
});

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = Joi.object({
    email: emailSchema.required().messages({
        'any.required': 'กรุณากรอกอีเมล'
    }),

    password: Joi.string()
        .min(6)
        .max(100)
        .required()
        .messages({
            'string.min': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
            'any.required': 'กรุณากรอกรหัสผ่าน'
        })
});

export const registerSchema = Joi.object({
    email: emailSchema.required(),

    password: Joi.string()
        .min(8)
        .max(100)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
            'string.pattern.base': 'รหัสผ่านต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข',
            'any.required': 'กรุณากรอกรหัสผ่าน'
        }),

    fullName: Joi.string()
        .min(2)
        .max(100)
        .required(),

    role: Joi.string()
        .valid('admin', 'OFFICER', 'radio_center', 'driver', 'community', 'EXECUTIVE', 'DEVELOPER')
        .required()
});

// ============================================
// User Schemas
// ============================================

export const userCreateSchema = Joi.object({
    email: emailSchema.required(),

    password: Joi.string()
        .min(8)
        .max(100)
        .required(),

    fullName: Joi.string()
        .min(2)
        .max(100)
        .required(),

    role: Joi.string()
        .valid('admin', 'OFFICER', 'radio_center', 'driver', 'community', 'EXECUTIVE', 'DEVELOPER')
        .required(),

    status: Joi.string()
        .valid('Active', 'Inactive')
        .default('Active')
});

export const userUpdateSchema = userCreateSchema.fork(
    ['email', 'password', 'fullName', 'role'],
    (schema) => schema.optional()
);

// ============================================
// Validation Middleware
// ============================================

export const validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: any, res: any, next: any) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }

        // Replace req.body with validated value
        req.body = value;
        next();
    };
};
