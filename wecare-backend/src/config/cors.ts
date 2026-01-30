/**
 * CORS Configuration
 * Controls which origins can access the API
 */

import cors from 'cors';
import { Express } from 'express';

/**
 * Get allowed origins from environment
 */
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.ALLOWED_ORIGINS;

  if (envOrigins) {
    return envOrigins.split(',').map(origin => origin.trim());
  }

  // Default origins for development
  if (process.env.NODE_ENV !== 'production') {
    return [
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // Alternative dev port
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ];
  }

  // Production should always specify ALLOWED_ORIGINS
  console.warn('⚠️  ALLOWED_ORIGINS not set in production!');
  return [];
};

/**
 * Configure CORS middleware
 */
export const configureCORS = (app: Express) => {
  const allowedOrigins = getAllowedOrigins();

  console.log('🌐 Allowed origins:', allowedOrigins);

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ Blocked CORS request from: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
  };

  app.use(cors(corsOptions));

  // Handle preflight requests
  app.options('*', cors(corsOptions));

  console.log('✅ CORS configured');
};
