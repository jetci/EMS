/**
 * Security Configuration
 * HTTPS, Helmet, and Security Headers
 */

import helmet from 'helmet';
import { Express } from 'express';

/**
 * Configure Helmet security headers
 */
export const configureSecurityHeaders = (app: Express) => {
  // Helmet with custom configuration
  app.use(
    helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          connectSrc: ["'self'", 'ws:', 'wss:'], // For Socket.io
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        },
      },

      // HTTP Strict Transport Security
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },

      // X-Frame-Options
      frameguard: {
        action: 'deny',
      },

      // X-Content-Type-Options
      noSniff: true,

      // X-XSS-Protection (legacy but still useful)
      xssFilter: true,

      // Referrer-Policy
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },

      // X-Permitted-Cross-Domain-Policies
      permittedCrossDomainPolicies: {
        permittedPolicies: 'none',
      },

      // Hide X-Powered-By
      hidePoweredBy: true,
    })
  );

  console.log('✅ Security headers configured');
};

/**
 * Force HTTPS redirect in production
 */
export const forceHTTPS = (app: Express) => {
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect(301, `https://${req.get('host')}${req.url}`);
      }
      next();
    });

    console.log('✅ HTTPS redirect enabled');
  } else {
    console.log('⚠️  HTTPS redirect disabled (development mode)');
  }
};

/**
 * Additional security headers
 */
export const additionalSecurityHeaders = (app: Express) => {
  app.use((req, res, next) => {
    // Permissions Policy (formerly Feature-Policy)
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(self), microphone=(), camera=(), payment=()'
    );

    // X-DNS-Prefetch-Control
    res.setHeader('X-DNS-Prefetch-Control', 'off');

    // Expect-CT (Certificate Transparency)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Expect-CT', 'max-age=86400, enforce');
    }

    next();
  });

  console.log('✅ Additional security headers configured');
};
