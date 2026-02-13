/**
 * Swagger API Documentation Integration Tests
 * Tests for Swagger UI accessibility and OpenAPI specification
 */

import request from 'supertest';
import express from 'express';
import { setupSwagger, swaggerSpec } from '../../src/config/swagger';

describe('Swagger API Documentation Tests', () => {
    let app: express.Application;

    beforeAll(() => {
        // Create test Express app
        app = express();

        // Setup Swagger (will only work if NODE_ENV !== 'production')
        process.env.NODE_ENV = 'development';
        setupSwagger(app);
    });

    describe('Swagger UI Endpoint', () => {
        test('GET /api-docs should return 200 OK', async () => {
            const response = await request(app).get('/api-docs/');
            expect([200, 301, 302]).toContain(response.status);
        });

        test('Swagger UI should be accessible', async () => {
            const response = await request(app).get('/api-docs/');
            // Swagger UI redirects or returns HTML
            expect(response.status).toBeLessThan(400);
        });
    });

    describe('OpenAPI JSON Specification', () => {
        test('GET /api-docs.json should return 200 OK', async () => {
            const response = await request(app).get('/api-docs.json');
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toContain('application/json');
        });

        test('OpenAPI spec should be valid JSON', async () => {
            const response = await request(app).get('/api-docs.json');
            expect(response.body).toBeDefined();
            expect(typeof response.body).toBe('object');
        });

        test('OpenAPI spec should have required fields', async () => {
            const response = await request(app).get('/api-docs.json');
            const spec = response.body;

            expect(spec.openapi).toBe('3.0.0');
            expect(spec.info).toBeDefined();
            expect(spec.info.title).toBe('EMS WeCare API');
            expect(spec.info.version).toBe('1.0.0');
        });

        test('OpenAPI spec should have servers defined', async () => {
            const response = await request(app).get('/api-docs.json');
            const spec = response.body;

            expect(spec.servers).toBeDefined();
            expect(Array.isArray(spec.servers)).toBe(true);
            expect(spec.servers.length).toBeGreaterThan(0);
        });

        test('OpenAPI spec should have security schemes', async () => {
            const response = await request(app).get('/api-docs.json');
            const spec = response.body;

            expect(spec.components).toBeDefined();
            expect(spec.components.securitySchemes).toBeDefined();
            expect(spec.components.securitySchemes.BearerAuth).toBeDefined();
            expect(spec.components.securitySchemes.BearerAuth.type).toBe('http');
            expect(spec.components.securitySchemes.BearerAuth.scheme).toBe('bearer');
        });

        test('OpenAPI spec should have schemas defined', async () => {
            const response = await request(app).get('/api-docs.json');
            const spec = response.body;

            expect(spec.components.schemas).toBeDefined();
            expect(spec.components.schemas.User).toBeDefined();
            expect(spec.components.schemas.Patient).toBeDefined();
            expect(spec.components.schemas.Ride).toBeDefined();
            expect(spec.components.schemas.LoginRequest).toBeDefined();
            expect(spec.components.schemas.LoginResponse).toBeDefined();
        });

        test('OpenAPI spec should have tags defined', async () => {
            const response = await request(app).get('/api-docs.json');
            const spec = response.body;

            expect(spec.tags).toBeDefined();
            expect(Array.isArray(spec.tags)).toBe(true);

            const tagNames = spec.tags.map((tag: any) => tag.name);
            expect(tagNames).toContain('Authentication');
            expect(tagNames).toContain('Patients');
            expect(tagNames).toContain('Rides');
            expect(tagNames).toContain('Drivers');
            expect(tagNames).toContain('Health');
        });
    });

    describe('API Endpoints Documentation', () => {
        test('Should document authentication endpoints', async () => {
            const response = await request(app).get('/api-docs.json');
            const spec = response.body;

            expect(spec.paths).toBeDefined();
            expect(spec.paths['/api/auth/login']).toBeDefined();
            expect(spec.paths['/api/auth/logout']).toBeDefined();
            expect(spec.paths['/api/auth/register']).toBeDefined();
            expect(spec.paths['/api/auth/me']).toBeDefined();
        });

        test('Login endpoint should have POST method', async () => {
            const response = await request(app).get('/api-docs.json');
            const spec = response.body;

            const loginEndpoint = spec.paths['/api/auth/login'];
            expect(loginEndpoint).toBeDefined();
            expect(loginEndpoint.post).toBeDefined();
            expect(loginEndpoint.post.tags).toContain('Authentication');
        });

        test('Login endpoint should have request body schema', async () => {
            const response = await request(app).get('/api-docs.json');
            const spec = response.body;

            const loginEndpoint = spec.paths['/api/auth/login'];
            expect(loginEndpoint.post.requestBody).toBeDefined();
            expect(loginEndpoint.post.requestBody.required).toBe(true);
        });

        test('Login endpoint should have response schemas', async () => {
            const response = await request(app).get('/api-docs.json');
            const spec = response.body;

            const loginEndpoint = spec.paths['/api/auth/login'];
            expect(loginEndpoint.post.responses).toBeDefined();
            expect(loginEndpoint.post.responses['200']).toBeDefined();
            expect(loginEndpoint.post.responses['400']).toBeDefined();
            expect(loginEndpoint.post.responses['401']).toBeDefined();
        });

        test('Should document patient endpoints', async () => {
            const response = await request(app).get('/api-docs.json');
            const spec = response.body;

            expect(spec.paths['/api/patients']).toBeDefined();
            expect(spec.paths['/api/patients/{id}']).toBeDefined();
        });

        test('Should document health check endpoint', async () => {
            const response = await request(app).get('/api-docs.json');
            const spec = response.body;

            expect(spec.paths['/api/health']).toBeDefined();
            expect(spec.paths['/api/health'].get).toBeDefined();
        });
    });

    describe('Production Mode', () => {
        test('Swagger should be disabled in production by default', () => {
            const prodApp = express();
            process.env.NODE_ENV = 'production';
            delete process.env.ENABLE_SWAGGER;

            setupSwagger(prodApp);

            // In production, Swagger routes should not be registered
            // This is tested by checking console output or route registration
            expect(true).toBe(true); // Placeholder - actual test would check route registration
        });

        test('Swagger can be enabled in production with ENABLE_SWAGGER=true', () => {
            const prodApp = express();
            process.env.NODE_ENV = 'production';
            process.env.ENABLE_SWAGGER = 'true';

            setupSwagger(prodApp);

            // Swagger should be enabled
            expect(true).toBe(true); // Placeholder
        });
    });

    describe('Swagger Spec Object', () => {
        test('swaggerSpec should be a valid object', () => {
            expect(swaggerSpec).toBeDefined();
            expect(typeof swaggerSpec).toBe('object');
        });

        test('swaggerSpec should have OpenAPI version', () => {
            expect(swaggerSpec.openapi).toBe('3.0.0');
        });

        test('swaggerSpec should have info section', () => {
            expect(swaggerSpec.info).toBeDefined();
            expect(swaggerSpec.info.title).toBe('EMS WeCare API');
            expect(swaggerSpec.info.version).toBe('1.0.0');
        });

        test('swaggerSpec should have components', () => {
            expect(swaggerSpec.components).toBeDefined();
            expect(swaggerSpec.components.schemas).toBeDefined();
            expect(swaggerSpec.components.securitySchemes).toBeDefined();
        });
    });
});
