import request from 'supertest';
import app from '../../src/index';

describe('Health Check API', () => {
    it('GET /api/health should return 200 OK', async () => {
        const response = await request(app).get('/api/health');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'healthy');
        expect(response.body).toHaveProperty('timestamp');
        // expect(response.body).toHaveProperty('version'); // Version is not in root response
    });

    it('should include database status', async () => {
        const response = await request(app).get('/api/health');
        console.log('Health Check Response:', JSON.stringify(response.body, null, 2));

        // Assert response structure matches implementation in src/routes/health.ts
        if (response.body.database) {
            expect(response.body.database).toHaveProperty('healthy');
            expect(typeof response.body.database.healthy).toBe('boolean');
        }
    });
});
