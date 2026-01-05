import dotenv from 'dotenv';

// CRITICAL: Load environment variables BEFORE any other imports
// This ensures JWT_SECRET is available when routes are imported
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/auth';
import patientRoutes from './routes/patients';
import driverRoutes from './routes/drivers';
import rideRoutes from './routes/rides';
import userRoutes from './routes/users';
import teamRoutes from './routes/teams';
import vehicleRoutes from './routes/vehicles';
import vehicleTypeRoutes from './routes/vehicle-types';
import newsRoutes from './routes/news';
import auditLogRoutes from './routes/audit-logs';
import dashboardRoutes from './routes/dashboard';
import settingsRoutes from './routes/settings';
import reportsRoutes from './routes/reports';
import officeRoutes from './routes/office';
import mapDataRoutes from './routes/map-data';
import driverLocationRoutes from './routes/driver-locations';
import rideEventRoutes from './routes/ride-events';
import systemRoutes from './routes/system';
import { authenticateToken } from './middleware/auth';
import { preventSQLInjection } from './middleware/sqlInjectionPrevention';
import { csrfTokenMiddleware, getCsrfToken } from './middleware/csrfProtection';
import { authLimiter, apiLimiter, createLimiter } from './middleware/rateLimiter';
import { handleMulterError } from './middleware/multerErrorHandler';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`❌ FATAL: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('   Please set them in your .env file');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development, enable in production
  crossOriginEmbedderPolicy: false,
}));

// Debug Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// CORS Configuration - Environment-aware and secure
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Get allowed origins from environment or use defaults
  let allowedOrigins: string[];

  if (process.env.NODE_ENV === 'production') {
    // Production: Only allow specific domains from environment variable
    if (!process.env.ALLOWED_ORIGINS) {
      console.error('❌ FATAL: ALLOWED_ORIGINS must be set in production');
      process.exit(1);
    }
    allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  } else {
    // Development: Allow localhost on common ports
    allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
  }

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-XSRF-TOKEN, Access-Control-Allow-Credentials');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours cache for preflight
  } else if (origin) {
    // Log unauthorized origin attempts
    console.warn(`⚠️ Blocked CORS request from unauthorized origin: ${origin}`);
  }

  // Handle Preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Cookie Parser (required for CSRF protection)
app.use(cookieParser());

// Body Parser with size limits
app.use(express.json({
  limit: '10mb', // Limit JSON payload size
  strict: true,
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
}));

// SQL Injection Prevention (apply to all routes)
app.use(preventSQLInjection);

// CSRF Token Middleware (attach token to responses)
app.use(csrfTokenMiddleware);

// Request timeout
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  next();
});

// CSRF Token Endpoint
app.get('/api/csrf-token', getCsrfToken);

// Health check endpoint (no rate limit)
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.get('/', (req, res) => res.send('EMS WeCare Backend is running!'));

// Apply rate limiters to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/change-password', authLimiter);

// Apply general API rate limiter
app.use('/api', apiLimiter);

// Auth routes
app.use('/api', authRoutes);

// Public routes (no auth required for now, or handled internally)
app.use('/api/patients', patientRoutes);
app.use('/api/office/patients', patientRoutes);
app.use('/api/community/patients', patientRoutes); // Community User route alias

app.use('/api/drivers', driverRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/community/rides', rideRoutes); // Community User route alias

app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/vehicle-types', vehicleTypeRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/audit-logs', auditLogRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/office/reports', reportsRoutes);
app.use('/api/executive/reports', reportsRoutes);
app.use('/api/office', officeRoutes);
app.use('/api/map-data', mapDataRoutes);
app.use('/api/driver-locations', driverLocationRoutes);
app.use('/api/ride-events', rideEventRoutes);
app.use('/api/admin/system', systemRoutes);

// Error handling middleware (must be after routes)
app.use(handleMulterError);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(globalErrorHandler);

// ✅ FIX BUG-009: WebSocket Implementation for Real-time Location Tracking
const httpServer = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim())
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
  }
});

// Location tracking namespace
const locationNamespace = io.of('/locations');

locationNamespace.on('connection', (socket) => {
  console.log('🔌 Client connected to location tracking:', socket.id);

  // Handle location updates from drivers
  socket.on('location:update', (data) => {
    console.log('📍 Location update received:', {
      socketId: socket.id,
      lat: data.lat,
      lng: data.lng,
      driverId: data.driverId
    });

    // Broadcast to all connected clients (office, executives, etc.)
    locationNamespace.emit('location:updated', {
      driverId: data.driverId,
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date().toISOString(),
      ...data
    });
  });

  // Handle driver status updates
  socket.on('driver:status', (data) => {
    console.log('👤 Driver status update:', data);
    locationNamespace.emit('driver:status:updated', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected from location tracking:', socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time location tracking`);
});

httpServer.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
