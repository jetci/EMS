import swaggerJsdoc from 'swagger-jsdoc';
import { Application } from 'express';

/**
 * Swagger/OpenAPI Configuration
 * Provides API documentation for EMS WeCare Backend
 */

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'EMS WeCare API',
        version: '1.0.0',
        description: 'Emergency Medical Services - WeCare System API Documentation',
        contact: {
            name: 'EMS WeCare Team',
            email: 'support@wecare.ems'
        },
        license: {
            name: 'Private',
            url: 'https://wecare.ems/license'
        }
    },
    servers: [
        {
            url: 'http://localhost:3001',
            description: 'Development server'
        },
        {
            url: 'https://api.wecare.ems',
            description: 'Production server'
        }
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT token in the format: Bearer <token>'
            }
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'USR-001' },
                    email: { type: 'string', format: 'email', example: 'admin@wecare.ems' },
                    role: {
                        type: 'string',
                        enum: ['admin', 'executive', 'developer', 'officer', 'driver', 'community'],
                        example: 'admin'
                    },
                    full_name: { type: 'string', example: 'System Administrator' },
                    status: { type: 'string', enum: ['Active', 'Inactive'], example: 'Active' },
                    phone: { type: 'string', example: '0812345678' },
                    profile_image_url: { type: 'string', example: '/uploads/profiles/profile-123.jpg' },
                    date_created: { type: 'string', format: 'date-time' }
                }
            },
            Patient: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'PAT-001' },
                    hn_number: { type: 'string', example: 'HN-2024-001' },
                    id_card: { type: 'string', example: '1234567890123' },
                    title: { type: 'string', enum: ['นาย', 'นาง', 'นางสาว'], example: 'นาย' },
                    first_name: { type: 'string', example: 'สมชาย' },
                    last_name: { type: 'string', example: 'ใจดี' },
                    date_of_birth: { type: 'string', format: 'date', example: '1990-01-01' },
                    gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
                    blood_type: { type: 'string', enum: ['A', 'B', 'AB', 'O', 'Unknown'], example: 'A' },
                    phone: { type: 'string', example: '0812345678' },
                    address: { type: 'string', example: '123 ถนนสุขุมวิท' },
                    village: { type: 'string', example: 'บ้านสวนดอก' },
                    subdistrict: { type: 'string', example: 'ในเมือง' },
                    district: { type: 'string', example: 'เมือง' },
                    province: { type: 'string', example: 'เชียงใหม่' },
                    postal_code: { type: 'string', example: '50000' },
                    emergency_contact_name: { type: 'string', example: 'สมหญิง ใจดี' },
                    emergency_contact_phone: { type: 'string', example: '0823456789' },
                    medical_conditions: { type: 'string', example: 'โรคเบาหวาน, ความดันโลหิตสูง' },
                    allergies: { type: 'string', example: 'แพ้ยาปฏิชีวนะ' },
                    current_medications: { type: 'string', example: 'Metformin 500mg' }
                }
            },
            Ride: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'RIDE-001' },
                    patient_id: { type: 'string', example: 'PAT-001' },
                    driver_id: { type: 'string', example: 'DRV-001' },
                    pickup_location: { type: 'string', example: '123 ถนนสุขุมวิท' },
                    dropoff_location: { type: 'string', example: 'โรงพยาบาลเชียงใหม่' },
                    pickup_lat: { type: 'number', example: 18.7883 },
                    pickup_lng: { type: 'number', example: 98.9853 },
                    dropoff_lat: { type: 'number', example: 18.7953 },
                    dropoff_lng: { type: 'number', example: 98.9933 },
                    status: {
                        type: 'string',
                        enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
                        example: 'pending'
                    },
                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], example: 'high' },
                    notes: { type: 'string', example: 'ผู้ป่วยมีอาการหายใจลำบาก' },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    error: { type: 'string', example: 'Error message' },
                    message: { type: 'string', example: 'Detailed error description' },
                    details: { type: 'object' }
                }
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'admin@wecare.ems' },
                    password: { type: 'string', format: 'password', example: 'password123' }
                }
            },
            LoginResponse: {
                type: 'object',
                properties: {
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                }
            },
            HealthCheck: {
                type: 'object',
                properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number', example: 123456 },
                    database: { type: 'string', example: 'connected' }
                }
            }
        }
    },
    tags: [
        {
            name: 'Authentication',
            description: 'User authentication and authorization endpoints'
        },
        {
            name: 'Patients',
            description: 'Patient management endpoints'
        },
        {
            name: 'Rides',
            description: 'Emergency ride/transport management'
        },
        {
            name: 'Drivers',
            description: 'Driver management and availability'
        },
        {
            name: 'Users',
            description: 'User management endpoints'
        },
        {
            name: 'Health',
            description: 'System health and monitoring'
        }
    ]
};

const options: swaggerJsdoc.Options = {
    swaggerDefinition,
    // Path to the API routes and documentation
    apis: [
        './src/routes/*.ts',
        './src/docs/*.ts',
        './src/index.ts'
    ]
};

// Lazy-loaded swagger spec
let swaggerSpec: any = null;

const getSwaggerSpec = () => {
    if (swaggerSpec) return swaggerSpec;

    // Disable scanner in production/serverless to avoid filesystem errors
    const isServerless = !!process.env.VERCEL;
    if (isServerless) {
        console.log('ℹ️ Swagger scanner disabled in serverless mode');
        return { openapi: '3.0.0', info: swaggerDefinition.info, paths: {} };
    }

    swaggerSpec = swaggerJsdoc(options);
    return swaggerSpec;
};

/**
 * Setup Swagger UI for Express app
 * Only enabled in development mode by default
 */
export const setupSwagger = (app: Application) => {
    const swaggerUi = require('swagger-ui-express');

    // Only enable Swagger in development or if explicitly enabled
    const enableSwagger = process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true';

    if (enableSwagger) {
        const spec = getSwaggerSpec();
        // Swagger UI
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'EMS WeCare API Documentation'
        }));

        // Swagger JSON
        app.get('/api-docs.json', (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(spec);
        });

        console.log('📚 Swagger UI available at /api-docs');
    } else {
        console.log('📚 Swagger UI disabled in production mode');
    }
};
