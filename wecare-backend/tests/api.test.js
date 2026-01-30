"use strict";
/**
 * Basic API smoke tests for EMS WeCare backend.
 *
 * These tests expect the backend server to be running (see TESTS_README.md).
 * They use `node-fetch` to perform HTTP requests to endpoints and validate
 * status codes, latency, and minimal response schema.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const BASE = process.env.API_URL || 'http://localhost:3001';
const TIMEOUT_MS = 5000;
describe('EMS WeCare API - smoke tests', () => {
    test('health endpoint returns OK', () => __awaiter(void 0, void 0, void 0, function* () {
        const start = Date.now();
        const res = yield (0, node_fetch_1.default)(`${BASE}/api/health`, { timeout: TIMEOUT_MS });
        const latency = Date.now() - start;
        expect(res.status).toBe(200);
        const body = yield res.json();
        expect(body).toHaveProperty('status', 'ok');
        expect(latency).toBeLessThan(2000); // expect <2s
    }));
    test('unauthenticated auth/login returns 400 for missing fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, node_fetch_1.default)(`${BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        expect([400, 429, 401]).toContain(res.status); // allow rate limit or invalid
    }));
    test('GET /api/rides returns 401 when no token provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, node_fetch_1.default)(`${BASE}/api/rides`);
        expect([401, 403]).toContain(res.status);
    }));
});
