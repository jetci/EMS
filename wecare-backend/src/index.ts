import dotenv from 'dotenv';

// CRITICAL: Load environment variables BEFORE any other imports
// This ensures JWT_SECRET is available when routes are imported
dotenv.config();
console.log('🚀 Starting WeCare Backend initialization...');

// CRITICAL: Initialize Sentry BEFORE importing other modules
// This ensures all errors are captured from the start
import { initializeSentry } from './config/sentry';
initializeSentry();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import http from 'http';
import path from 'path';
// Socket.IO Server import moved to socketService usage
import authRoutes from './routes/auth';
import patientRoutes from './routes/patients';
import driverRoutes from './routes/drivers';
import rideRoutes from './routes/rides';
import userRoutes from './routes/users';
import teamRoutes from './routes/teams';
import vehicleRoutes from './routes/vehicles';
import vehicleTypeRoutes from './routes/vehicle-types';
import newsRoutes from './routes/news';
import facilitiesRoutes from './routes/facilities';
import apiProxyRoutes from './routes/api-proxy';
import auditLogRoutes from './routes/audit-logs';
import dashboardRoutes from './routes/dashboard';
import settingsRoutes from './routes/settings';
import reportsRoutes from './routes/reports';
import officeRoutes from './routes/office';
import mapDataRoutes from './routes/map-data';
import driverLocationRoutes from './routes/driver-locations';
import rideEventRoutes from './routes/ride-events';
import systemRoutes from './routes/system';
import healthRoutes from './routes/health';
import backupRoutes from './routes/backup';
import lockoutRoutes from './routes/lockout';
import teamShiftRoutes from './routes/team-shifts';
import driverShiftRoutes from './routes/driver-shifts';
import { authenticateToken } from './middleware/auth';
import { preventSQLInjection } from './middleware/sqlInjectionPrevention';
import { csrfTokenMiddleware, getCsrfToken } from './middleware/csrfProtection';
import { authLimiter, apiLimiter, createLimiter, userBasedAuthLimiter } from './middleware/rateLimiter';
import { handleMulterError } from './middleware/multerErrorHandler';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { requireRole, UserRole } from './middleware/roleProtection';
import backupService from './services/backupService';
import { setupSwagger } from './config/swagger';

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`⚠️ WARNING: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('   Please set them in your Vercel Project Settings or .env file');
  // Continuing execution - requests requiring these will fail gracefully later
}

const app = express();
const isVercel = !!process.env.VERCEL;

// Export app for testing
export default app;
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development, enable in production
  crossOriginEmbedderPolicy: false,
}));

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

// Debug Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// CORS Configuration - Environment-aware and secure
// Validates origins and provides helpful error messages

/**
 * Validate origin URL format
 */
function isValidOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    // Must be http or https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }
    // Must have a hostname
    if (!url.hostname) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Get and validate allowed origins from environment
 */
function getAllowedOrigins(): string[] {
  const env = process.env.NODE_ENV || 'development';

  if (env === 'production') {
    // Production: Require ALLOWED_ORIGINS
    if (!process.env.ALLOWED_ORIGINS) {
      console.warn('');
      console.warn('⚠️  WARNING: ALLOWED_ORIGINS environment variable is missing in production');
      console.warn('   Defaulting to empty allowed list. API requests may fail CORS checks.');
      console.warn('   Please set ALLOWED_ORIGINS in Vercel Project Settings.');
      console.warn('');
      return [];
    }

    const origins = process.env.ALLOWED_ORIGINS
      .split(',')
      .map(o => o.trim())
      .filter(o => o.length > 0);

    if (origins.length === 0) {
      console.warn('⚠️  WARNING: ALLOWED_ORIGINS is empty. CORS requests will be blocked.');
      return [];
    }

    // Validate each origin
    const invalidOrigins: string[] = [];
    origins.forEach(origin => {
      if (!isValidOrigin(origin)) {
        invalidOrigins.push(origin);
      }
    });

    if (invalidOrigins.length > 0) {
      console.warn('');
      console.warn('⚠️  WARNING: Invalid origins detected in ALLOWED_ORIGINS');
      invalidOrigins.forEach(o => console.warn(`   - "${o}"`));
      console.warn('');
    }

    // Warn about http in production
    const httpOrigins = origins.filter(o => o.startsWith('http://'));
    if (httpOrigins.length > 0) {
      console.warn('');
      console.warn('⚠️  WARNING: HTTP origins detected in production (should use HTTPS):');
      httpOrigins.forEach(o => console.warn(`   - ${o}`));
      console.warn('');
    }

    console.log('✅ CORS Configuration (Production):');
    console.log(`   Allowed origins: ${origins.length}`);
    origins.forEach(o => console.log(`   - ${o}`));
    console.log('');

    return origins;
  }
  else if (env === 'staging' || env === 'test') {
    // Staging/Test: Use ALLOWED_ORIGINS if provided, otherwise use safe defaults
    if (process.env.ALLOWED_ORIGINS) {
      const origins = process.env.ALLOWED_ORIGINS
        .split(',')
        .map(o => o.trim())
        .filter(o => o.length > 0);

      console.log(`✅ CORS Configuration (${env}): Using ALLOWED_ORIGINS`);
      origins.forEach(o => console.log(`   - ${o}`));
      return origins;
    } else {
      // Safe defaults for staging/test
      const defaultOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
      ];
      console.log(`ℹ️  CORS Configuration (${env}): Using default localhost origins`);
      return defaultOrigins;
    }
  }
  else {
    // Development: Allow localhost on common ports
    const devOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
    console.log('ℹ️  CORS Configuration (Development): Allowing localhost origins');
    return devOrigins;
  }
}

// Get allowed origins with validation
const allowedOrigins = getAllowedOrigins();

// CORS Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-XSRF-TOKEN, Access-Control-Allow-Credentials');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours cache for preflight
  } else if (origin) {
    // Log unauthorized origin attempts
    console.warn(`⚠️  Blocked CORS request from unauthorized origin: ${origin}`);

    // In development, provide helpful message
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`   💡 Tip: Add "${origin}" to ALLOWED_ORIGINS if this is expected`);
    }
  }

  // Handle Preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Cookie Parser (required for CSRF protection)
app.use(cookieParser());

// Serve uploads statically (not recommended for production serverless, but kept for compatibility)
const uploadsDir = isVercel
  ? path.join(process.cwd(), 'wecare-backend/uploads')
  : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Body Parser with size limits
app.use(express.json({
  limit: '10mb', // Limit JSON payload size
  strict: true,
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
}));

// Sentry Request Handler - captures request context for error reporting
import { sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from './config/sentry';
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

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
// Health check endpoint (handled by healthRoutes below)
// app.get('/api/health', ...);

// Setup Swagger API Documentation
setupSwagger(app);

// Routes
app.get('/', (req, res) => res.send('EMS WeCare Backend is running!'));

// Apply rate limiters to auth routes (dual-layer: IP + user-based)
app.use('/api/auth/login', authLimiter, userBasedAuthLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/change-password', authLimiter);

// Apply general API rate limiter
app.use('/api', (req, res, next) => {
  console.log(`⏱️ [Rate Limiter] ${req.method} ${req.path}`);
  next();
}, apiLimiter);

// Health check routes (public - no auth required)
app.use('/api', healthRoutes);

// Auth routes (public)
app.use('/api', (req, res, next) => {
  console.log(`🔓 [Auth Routes] ${req.method} ${req.path}`);
  next();
}, authRoutes);

// ============================================
// PROTECTED ROUTES WITH ROLE-BASED ACCESS CONTROL
// ============================================

// Patient routes - accessible by multiple roles
app.use('/api/patients',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.OFFICER, UserRole.RADIO_CENTER, UserRole.COMMUNITY, UserRole.EXECUTIVE]),
  patientRoutes
);
app.use('/api/office/patients',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.OFFICER, UserRole.RADIO_CENTER]),
  patientRoutes
);
app.use('/api/community/patients',
  authenticateToken,
  requireRole([UserRole.COMMUNITY]),
  patientRoutes
);

// Driver routes - accessible by admin, officer, and drivers themselves
app.use('/api/drivers',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.OFFICER, UserRole.RADIO_CENTER, UserRole.DRIVER]),
  driverRoutes
);

// Ride routes - accessible by multiple roles
app.use('/api/rides',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.OFFICER, UserRole.RADIO_CENTER, UserRole.DRIVER, UserRole.COMMUNITY, UserRole.EXECUTIVE]),
  rideRoutes
);
app.use('/api/community/rides',
  authenticateToken,
  requireRole([UserRole.COMMUNITY]),
  rideRoutes
);

app.use('/api/users',
  authenticateToken,
  userRoutes
);

// Team management - admin, developer, officer, executive (view)
app.use('/api/teams',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.OFFICER, UserRole.RADIO_CENTER, UserRole.EXECUTIVE]),
  teamRoutes
);

// Team shifts - admin, developer, officer, radio_center, executive (view)
app.use('/api/team-shifts',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.OFFICER, UserRole.RADIO_CENTER, UserRole.EXECUTIVE]),
  teamShiftRoutes
);

// Driver shifts - admin, developer, officer, radio_center, executive (view)
app.use('/api/driver-shifts',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.OFFICER, UserRole.RADIO_CENTER, UserRole.EXECUTIVE]),
  driverShiftRoutes
);

// Vehicle management - admin, developer, officer
app.use('/api/vehicles',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.OFFICER, UserRole.RADIO_CENTER]),
  vehicleRoutes
);

// Vehicle types - admin, developer, officer
app.use('/api/vehicle-types',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.OFFICER, UserRole.RADIO_CENTER]),
  vehicleTypeRoutes
);

// Facilities - healthcare destinations
app.use('/api/facilities',
  authenticateToken,
  facilitiesRoutes
);

// News - public read, admin write (handled in route)
app.use('/api/news', newsRoutes);

// API Proxy routes for PHP-style endpoints (for frontend fallback compatibility)
app.use('/api-proxy', apiProxyRoutes);

// Audit logs - admin, developer, executive only
app.use('/api/audit-logs',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.EXECUTIVE]),
  auditLogRoutes
);

// Dashboard routes
app.use('/api/dashboard',
  authenticateToken,
  dashboardRoutes
);
app.use('/api/admin/dashboard',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER]),
  dashboardRoutes
);

// Settings - router handles internal protection for admin vs public
app.use('/api/settings', settingsRoutes);
// Backward-compatible admin-specific path for existing frontend calls
app.use('/api/admin/settings', settingsRoutes);

// Reports - officer and executive
app.use('/api/office/reports',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.OFFICER, UserRole.RADIO_CENTER]),
  reportsRoutes
);
app.use('/api/executive/reports',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.EXECUTIVE]),
  reportsRoutes
);

// Office routes - officer and radio center
app.use('/api/office',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.OFFICER, UserRole.RADIO_CENTER]),
  officeRoutes
);

// Map data - admin, developer, officer, radio center
app.use('/api/map-data',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.OFFICER, UserRole.RADIO_CENTER]),
  mapDataRoutes
);

// Driver locations - accessible by multiple roles for tracking
app.use('/api/driver-locations',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.OFFICER, UserRole.RADIO_CENTER, UserRole.DRIVER, UserRole.EXECUTIVE]),
  driverLocationRoutes
);

// Ride events - accessible by multiple roles
app.use('/api/ride-events',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.OFFICER, UserRole.RADIO_CENTER, UserRole.DRIVER]),
  rideEventRoutes
);

// System routes - admin and developer only
app.use('/api/admin/system',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER]),
  systemRoutes
);

// Backup routes - admin and developer only
app.use('/api/backup',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER]),
  backupRoutes
);

// Lockout routes - admin and developer only
app.use('/api/lockout',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER]),
  lockoutRoutes
);

// Error handling middleware (must be after routes)
app.use(handleMulterError);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(globalErrorHandler);

// Only start server and create httpServer if not on Vercel
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  const httpServer = http.createServer(app);

  const startServer = async () => {
    try {
      // Initialize Database first
      const { initializeDatabase, ensureSchema } = require('./db/postgresDB');
      await initializeDatabase();
      await ensureSchema();

      // ✅ Move Socket.IO initialization here
      const socketService = require('./services/socketService').default;
      socketService.initialize(httpServer);

      httpServer.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`🔌 WebSocket server ready for real-time location tracking`);
        console.log('');

        // Start automatic backup scheduler
        console.log('🔄 Initializing automatic backup system...');
        backupService.startAutomaticBackups();
        console.log('');
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();

  httpServer.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', error);
      process.exit(1);
    }
  });
}

// Don't register handlers on Vercel
if (!process.env.VERCEL) {
  process.on('uncaughtException', async (error) => {
    console.error('❌ Uncaught Exception:', error);
    const { captureException, flushSentry } = await import('./config/sentry');
    captureException(error, { type: 'uncaughtException' });
    await flushSentry(2000);
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    const { captureException, flushSentry } = await import('./config/sentry');
    const error = reason instanceof Error ? reason : new Error(String(reason));
    captureException(error, { type: 'unhandledRejection', promise: String(promise) });
    await flushSentry(2000);
    process.exit(1);
  });
}
// Force restart
