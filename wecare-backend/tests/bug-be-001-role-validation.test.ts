/**
 * BUG-BE-001: Role Validation at Router Level - Test Suite
 * 
 * Tests to verify that role-based access control is properly enforced
 * at the router level for all sensitive endpoints
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/index'; // Assuming app is exported from index.ts
import { initializeDatabase, sqliteDB } from '../src/db/sqliteDB';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// Helper function to generate JWT token for different roles
function generateToken(userId: string, email: string, role: string): string {
    return jwt.sign(
        { id: userId, email, role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
}

// Global tokens for cross-describe tests
const tokens = {
    developer: generateToken('dev-001', 'developer@wecare.dev', 'DEVELOPER'),
    admin: generateToken('admin-001', 'admin@wecare.dev', 'admin'),
    officer: generateToken('officer-001', 'officer@wecare.dev', 'OFFICER'),
    radioCenter: generateToken('radio-001', 'radio@wecare.dev', 'radio_center'),
    driver: generateToken('driver-001', 'driver@wecare.dev', 'driver'),
    community: generateToken('community-001', 'community@wecare.dev', 'community'),
    executive: generateToken('exec-001', 'executive@wecare.dev', 'EXECUTIVE'),
    noRole: generateToken('user-001', 'user@wecare.dev', ''),
};

beforeAll(async () => {
    await initializeDatabase();
});

afterAll(() => {
    try { sqliteDB.close(); } catch {}
});

describe('BUG-BE-001: Role-Based Access Control at Router Level', () => {
    // Test tokens for different roles
    const tokens = {
        developer: generateToken('dev-001', 'developer@wecare.dev', 'DEVELOPER'),
        admin: generateToken('admin-001', 'admin@wecare.dev', 'admin'),
        officer: generateToken('officer-001', 'officer@wecare.dev', 'OFFICER'),
        radioCenter: generateToken('radio-001', 'radio@wecare.dev', 'radio_center'),
        driver: generateToken('driver-001', 'driver@wecare.dev', 'driver'),
        community: generateToken('community-001', 'community@wecare.dev', 'community'),
        executive: generateToken('exec-001', 'executive@wecare.dev', 'EXECUTIVE'),
        noRole: generateToken('user-001', 'user@wecare.dev', ''), // User with no role
    };

    describe('Patient Routes (/api/patients)', () => {

        it('should allow ADMIN to access patients', async () => {
            const response = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .expect(200);

            expect(response.body).toBeDefined();
        });

        it('should allow COMMUNITY to access patients', async () => {
            const response = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${tokens.community}`)
                .expect(200);

            expect(response.body).toBeDefined();
        });

        it('should allow OFFICER to access patients', async () => {
            const response = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${tokens.officer}`)
                .expect(200);
        });

        it('should DENY DRIVER access to patients', async () => {
            const response = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${tokens.driver}`)
                .expect(403);

            expect(response.body.error).toBe('Insufficient permissions');
        });

        it('should DENY unauthenticated access', async () => {
            await request(app)
                .get('/api/patients')
                .expect(401);
        });

        it('should DENY user with no role', async () => {
            const response = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${tokens.noRole}`)
                .expect(403);

            expect(response.body.error).toBe('No role assigned');
        });
    });

    describe('User Management Routes (/api/users)', () => {

        it('should allow ADMIN to access user management', async () => {
            await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .expect(200);
        });

        it('should allow DEVELOPER to access user management', async () => {
            await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${tokens.developer}`)
                .expect(200);
        });

        it('should DENY OFFICER access to user management', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${tokens.officer}`)
                .expect(403);

            expect(response.body.error).toBe('Insufficient permissions');
        });

        it('should DENY COMMUNITY access to user management', async () => {
            await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${tokens.community}`)
                .expect(403);
        });

        it('should DENY DRIVER access to user management', async () => {
            await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${tokens.driver}`)
                .expect(403);
        });
    });

    describe('Audit Logs Routes (/api/audit-logs)', () => {

        it('should allow ADMIN to access audit logs', async () => {
            await request(app)
                .get('/api/audit-logs')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .expect(200);
        });

        it('should allow EXECUTIVE to access audit logs', async () => {
            await request(app)
                .get('/api/audit-logs')
                .set('Authorization', `Bearer ${tokens.executive}`)
                .expect(200);
        });

        it('should DENY OFFICER access to audit logs', async () => {
            await request(app)
                .get('/api/audit-logs')
                .set('Authorization', `Bearer ${tokens.officer}`)
                .expect(403);
        });

        it('should DENY COMMUNITY access to audit logs', async () => {
            await request(app)
                .get('/api/audit-logs')
                .set('Authorization', `Bearer ${tokens.community}`)
                .expect(403);
        });
    });

    describe('Driver Routes (/api/drivers)', () => {

        it('should allow ADMIN to access drivers', async () => {
            await request(app)
                .get('/api/drivers')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .expect(200);
        });

        it('should allow DRIVER to access drivers (for own profile)', async () => {
            await request(app)
                .get('/api/drivers')
                .set('Authorization', `Bearer ${tokens.driver}`)
                .expect(200);
        });

        it('should DENY COMMUNITY access to drivers', async () => {
            await request(app)
                .get('/api/drivers')
                .set('Authorization', `Bearer ${tokens.community}`)
                .expect(403);
        });
    });

    describe('Ride Routes (/api/rides)', () => {

        it('should allow ADMIN to access rides', async () => {
            await request(app)
                .get('/api/rides')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .expect(200);
        });

        it('should allow DRIVER to access rides', async () => {
            await request(app)
                .get('/api/rides')
                .set('Authorization', `Bearer ${tokens.driver}`)
                .expect(200);
        });

        it('should allow COMMUNITY to access rides', async () => {
            await request(app)
                .get('/api/rides')
                .set('Authorization', `Bearer ${tokens.community}`)
                .expect(200);
        });

        it('should allow OFFICER to access rides', async () => {
            await request(app)
                .get('/api/rides')
                .set('Authorization', `Bearer ${tokens.officer}`)
                .expect(200);
        });
    });

    describe('System Routes (/api/admin/system)', () => {

        it('should allow ADMIN to access system routes', async () => {
            await request(app)
                .get('/api/admin/system/health')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .expect(200);
        });

        it('should allow DEVELOPER to access system routes', async () => {
            await request(app)
                .get('/api/admin/system/health')
                .set('Authorization', `Bearer ${tokens.developer}`)
                .expect(200);
        });

        it('should DENY OFFICER access to system routes', async () => {
            await request(app)
                .get('/api/admin/system/health')
                .set('Authorization', `Bearer ${tokens.officer}`)
                .expect(403);
        });

        it('should DENY COMMUNITY access to system routes', async () => {
            await request(app)
                .get('/api/admin/system/health')
                .set('Authorization', `Bearer ${tokens.community}`)
                .expect(403);
        });

        it('should DENY EXECUTIVE access to system routes', async () => {
            await request(app)
                .get('/api/admin/system/health')
                .set('Authorization', `Bearer ${tokens.executive}`)
                .expect(403);
        });
    });

    describe('Role Normalization', () => {

        it('should handle case-insensitive role matching', async () => {
            // Create token with lowercase 'admin' (as stored in DB)
            const lowerCaseAdminToken = generateToken('admin-002', 'admin2@wecare.dev', 'admin');

            await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${lowerCaseAdminToken}`)
                .expect(200);
        });

        it('should handle uppercase OFFICER role', async () => {
            const upperCaseOfficerToken = generateToken('officer-002', 'officer2@wecare.dev', 'OFFICER');

            await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${upperCaseOfficerToken}`)
                .expect(200);
        });
    });

    describe('Error Messages', () => {

        it('should return clear error message for insufficient permissions', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${tokens.community}`)
                .expect(403);

            expect(response.body).toHaveProperty('error');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('userRole');
            expect(response.body).toHaveProperty('requiredRoles');
            expect(response.body.error).toBe('Insufficient permissions');
        });

        it('should return clear error message for missing authentication', async () => {
            const response = await request(app)
                .get('/api/patients')
                .expect(401);

            expect(response.body.error).toBe('Authentication required');
        });
    });

    describe('Multiple Role Access', () => {

        it('should allow any of the specified roles to access endpoint', async () => {
            // /api/patients allows: ADMIN, DEVELOPER, OFFICER, RADIO_CENTER, COMMUNITY, EXECUTIVE

            const roles = [
                { token: tokens.admin, name: 'ADMIN' },
                { token: tokens.developer, name: 'DEVELOPER' },
                { token: tokens.officer, name: 'OFFICER' },
                { token: tokens.radioCenter, name: 'RADIO_CENTER' },
                { token: tokens.community, name: 'COMMUNITY' },
                { token: tokens.executive, name: 'EXECUTIVE' },
            ];

            for (const role of roles) {
                const response = await request(app)
                    .get('/api/patients')
                    .set('Authorization', `Bearer ${role.token}`);

                expect(response.status).toBe(200);
            }
        });
    });
});

describe('Map Data Routes (/api/map-data)', () => {
    it('should allow ADMIN/DEVELOPER/OFFICER/RADIO_CENTER/RADIO to GET map data', async () => {
        const radioToken = generateToken('radio-002', 'radio2@wecare.dev', 'radio');
        const allowed = [tokens.admin, tokens.developer, tokens.officer, tokens.radioCenter, radioToken];
        for (const tk of allowed) {
            const res = await request(app)
                .get('/api/map-data')
                .set('Authorization', `Bearer ${tk}`);
            expect([200, 204]).toContain(res.status);
        }
    });

    it('should DENY EXECUTIVE/DRIVER/COMMUNITY to GET map data', async () => {
        const roles = [tokens.executive, tokens.driver, tokens.community];
        for (const tk of roles) {
            await request(app)
                .get('/api/map-data')
                .set('Authorization', `Bearer ${tk}`)
                .expect(403);
        }
    });
});

describe('Driver Location Routes (/api/driver-locations)', () => {
    it('should allow ADMIN/DEVELOPER/OFFICER/RADIO_CENTER/RADIO/DRIVER/EXECUTIVE to GET driver locations', async () => {
        const radioToken = generateToken('radio-003', 'radio3@wecare.dev', 'radio');
        const allowed = [tokens.admin, tokens.developer, tokens.officer, tokens.radioCenter, radioToken, tokens.driver, tokens.executive];
        for (const tk of allowed) {
            const res = await request(app)
                .get('/api/driver-locations')
                .set('Authorization', `Bearer ${tk}`);
            expect([200, 204]).toContain(res.status);
        }
    });

    it('should DENY COMMUNITY to GET driver locations', async () => {
        await request(app)
            .get('/api/driver-locations')
            .set('Authorization', `Bearer ${tokens.community}`)
            .expect(403);
    });

    it('should DENY unauthenticated access', async () => {
        await request(app)
            .get('/api/driver-locations')
            .expect(401);
    });
});

describe('Office Routes (/api/office)', () => {
    it('should allow OFFICER/RADIO_CENTER/RADIO to access dashboard', async () => {
        const radioToken = generateToken('radio-004', 'radio4@wecare.dev', 'radio');
        const allowed = [tokens.officer, tokens.radioCenter, radioToken];
        for (const tk of allowed) {
            await request(app)
                .get('/api/office/dashboard')
                .set('Authorization', `Bearer ${tk}`)
                .expect(200);
        }
    });

    it('should DENY EXECUTIVE/COMMUNITY to access office dashboard', async () => {
        const denied = [tokens.executive, tokens.community];
        for (const tk of denied) {
            await request(app)
                .get('/api/office/dashboard')
                .set('Authorization', `Bearer ${tk}`)
                .expect(403);
        }
    });
});

describe('Teams Routes (/api/teams)', () => {
    it('should allow ADMIN/DEVELOPER/OFFICER/RADIO_CENTER/RADIO/EXECUTIVE to GET teams', async () => {
        const radioToken = generateToken('radio-005', 'radio5@wecare.dev', 'radio');
        const allowed = [tokens.admin, tokens.developer, tokens.officer, tokens.radioCenter, radioToken, tokens.executive];
        for (const tk of allowed) {
            await request(app)
                .get('/api/teams')
                .set('Authorization', `Bearer ${tk}`)
                .expect(200);
        }
    });

    it('should DENY COMMUNITY/DRIVER to GET teams', async () => {
        const denied = [tokens.community, tokens.driver];
        for (const tk of denied) {
            await request(app)
                .get('/api/teams')
                .set('Authorization', `Bearer ${tk}`)
                .expect(403);
        }
    });
});

describe('Vehicles Routes (/api/vehicles)', () => {
    it('should allow ADMIN/DEVELOPER/OFFICER/RADIO_CENTER/RADIO to GET vehicles', async () => {
        const radioToken = generateToken('radio-006', 'radio6@wecare.dev', 'radio');
        const allowed = [tokens.admin, tokens.developer, tokens.officer, tokens.radioCenter, radioToken];
        for (const tk of allowed) {
            await request(app)
                .get('/api/vehicles')
                .set('Authorization', `Bearer ${tk}`)
                .expect(200);
        }
    });

    it('should DENY EXECUTIVE/COMMUNITY/DRIVER to GET vehicles', async () => {
        const denied = [tokens.executive, tokens.community, tokens.driver];
        for (const tk of denied) {
            await request(app)
                .get('/api/vehicles')
                .set('Authorization', `Bearer ${tk}`)
                .expect(403);
        }
    });
});

describe('Reports Routes (/api/office/reports and /api/executive/reports)', () => {
    it('should allow OFFICER/RADIO_CENTER to access office reports roster', async () => {
        const res1 = await request(app)
            .get('/api/office/reports/roster')
            .set('Authorization', `Bearer ${tokens.officer}`);
        expect([200, 204]).toContain(res1.status);

        const res2 = await request(app)
            .get('/api/office/reports/roster')
            .set('Authorization', `Bearer ${tokens.radioCenter}`);
        expect([200, 204]).toContain(res2.status);
    });

    it('should DENY COMMUNITY to access office reports roster', async () => {
        await request(app)
            .get('/api/office/reports/roster')
            .set('Authorization', `Bearer ${tokens.community}`)
            .expect(403);
    });

    it('should allow EXECUTIVE to access executive reports personnel', async () => {
        const res = await request(app)
            .get('/api/executive/reports/personnel')
            .set('Authorization', `Bearer ${tokens.executive}`);
        expect([200, 204]).toContain(res.status);
    });

    it('should DENY OFFICER to access executive reports personnel', async () => {
        await request(app)
            .get('/api/executive/reports/personnel')
            .set('Authorization', `Bearer ${tokens.officer}`)
            .expect(403);
    });
});

describe('Dashboard Routes (/api/dashboard)', () => {
    it('should allow EXECUTIVE to access executive dashboard', async () => {
        await request(app)
            .get('/api/dashboard/executive')
            .set('Authorization', `Bearer ${tokens.executive}`)
            .expect(200);
    });

    it('should allow ADMIN/DEVELOPER to access admin dashboard', async () => {
        await request(app)
            .get('/api/dashboard/admin')
            .set('Authorization', `Bearer ${tokens.admin}`)
            .expect(200);

        await request(app)
            .get('/api/dashboard/admin')
            .set('Authorization', `Bearer ${tokens.developer}`)
            .expect(200);
    });

    it('should DENY OFFICER to access admin dashboard', async () => {
        await request(app)
            .get('/api/dashboard/admin')
            .set('Authorization', `Bearer ${tokens.officer}`)
            .expect(403);
    });
});

// Export for use in other test files
export { generateToken };
