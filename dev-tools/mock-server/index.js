import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import Joi from 'joi';
import crypto from 'crypto';
import fs from 'fs';

const app = express();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit for safety
app.use(cors());
app.use(bodyParser.json());

// In-memory stores
const users = {
  'user-1': { id: 'user-1', name: 'Regular User', email: 'user@example.com', phone: '0812345678', password: 'correct-password', role: 'user' },
  'officer-1': { id: 'officer-1', name: 'Officer One', email: 'officer@example.com', phone: '0811111111', password: 'officer-pass', role: 'officer' },
  'admin-1': { id: 'admin-1', name: 'Admin', email: 'admin@example.com', phone: '0800000000', password: 'admin-pass', role: 'admin' }
};
const tokens = {
  'user-token': 'user-1',
  'officer-token': 'officer-1',
  'admin-token': 'admin-1'
};

const patientsByIdCard = {}; // idCard -> patient
const patients = {};
const rides = {};
let patientCounter = 1;
let rideCounter = 1;

// Idempotency store: key -> { status, body }
const idempotencyStore = new Map();

// Simple rate limiter store: key (ip:route) -> { count, windowStart }
const rateStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per window

// Simple auth middleware
function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Missing token' });
  const token = auth.slice('Bearer '.length);
  const userId = tokens[token];
  if (!userId) return res.status(401).json({ success: false, message: 'Invalid token' });
  const user = users[userId];
  if (!user) return res.status(401).json({ success: false, message: 'Unknown user' });
  req.userId = userId;
  req.user = user;
  req.token = token;
  next();
}

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: false });
    if (error) {
      return res.status(400).json({ success: false, message: error.details.map(d => d.message).join('; ') });
    }
    req.validatedBody = value;
    next();
  };
}

function validateHeaders(schema) {
  return (req, res, next) => {
    const hdrs = {
      'idempotency-key': req.headers['idempotency-key'],
      'x-request-id': req.headers['x-request-id'],
      'content-type': req.headers['content-type']
    };
    const { error, value } = schema.validate(hdrs, { abortEarly: false, allowUnknown: true });
    if (error) {
      return res.status(400).json({ success: false, message: error.details.map(d => d.message).join('; ') });
    }
    req.validatedHeaders = value;
    next();
  };
}

function sanitizeString(s) {
  if (!s || typeof s !== 'string') return s;
  // remove control chars and trim
  return s.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

// request id middleware
function requestIdMiddleware(req, res, next) {
  req.requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  next();
}

// simple rate limiter middleware factory
function rateLimiter(routeKey) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || 'unknown';
    const key = `${ip}:${routeKey}`;
    const now = Date.now();
    const state = rateStore.get(key) || { count: 0, windowStart: now };
    if (now - state.windowStart > RATE_LIMIT_WINDOW_MS) {
      state.count = 0;
      state.windowStart = now;
    }
    state.count += 1;
    rateStore.set(key, state);
    if (state.count > RATE_LIMIT_MAX) {
      console.log(`[RATE_LIMIT] ip=${ip} route=${routeKey} count=${state.count}`);
      return res.status(429).json({ success: false, message: 'Too many requests' });
    }
    next();
  };
}

app.use(requestIdMiddleware);

// Initialize SQLite audit DB (file: dev-tools/mock-server/audit.db)
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auditLogPath = path.join(__dirname, 'audit.ndjson');
try {
  if (!fs.existsSync(auditLogPath)) fs.writeFileSync(auditLogPath, '');
} catch (err) {
  console.error('Failed to initialize audit log file', err);
}

function hashToken(t) {
  if (!t) return null;
  return crypto.createHash('sha256').update(t).digest('hex');
}

async function writeAudit(audit) {
  try {
    const ts = Date.now();
    const token_hash = hashToken(audit.token);
    const record = {
      actor: audit.actor,
      action: audit.action,
      target: audit.target,
      client_ip: audit.client_ip,
      request_id: audit.request_id,
      token_hash,
      timestamp: ts
    };
    await fs.promises.appendFile(auditLogPath, `${JSON.stringify(record)}\n`, 'utf8');
  } catch (err) {
    console.error('Failed to write audit', err);
  }
}

const registerSchema = Joi.object({
  idCard: Joi.string().pattern(/^\d{13}$/).required(),
  firstName: Joi.string().max(100).required(),
  lastName: Joi.string().max(100).required(),
});

const headerSchema = Joi.object({
  'idempotency-key': Joi.string().pattern(/^[A-Za-z0-9_\-]{6,128}$/).optional(),
  'x-request-id': Joi.string().optional(),
  'content-type': Joi.string().optional()
});

app.post('/api/community/patients/register', requestIdMiddleware, authMiddleware, rateLimiter('register_patient'), validateHeaders(headerSchema), validate(registerSchema), (req, res) => {
  const idempotencyKey = req.validatedHeaders['idempotency-key'] || req.headers['idempotency-key'];
  // idempotency: return prior result if exists
  if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
    const stored = idempotencyStore.get(idempotencyKey);
    console.log(`[IDEMPOTENCY] returning stored response for key=${idempotencyKey}`);
    return res.status(200).json(stored);
  }

  // Only officers or admins can register patients
  if (!req.user || !['officer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
  }

  const body = req.validatedBody;
  const idCard = body.idCard;
  if (patientsByIdCard[idCard]) {
    return res.status(409).json({ success: false, message: 'Patient already exists', patient_id: patientsByIdCard[idCard].id });
  }
  const id = `PAT-${String(patientCounter++).padStart(3, '0')}`;
  const patient = { id, full_name: `${body.firstName || ''} ${body.lastName || ''}`.trim(), idCard, createdBy: req.userId };
  patients[id] = patient;
  patientsByIdCard[idCard] = patient;
  console.log('Created patient', patient);

  // Log audit with metadata
  const audit = { actor: req.userId, action: 'create_patient', target: id, client_ip: req.headers['x-forwarded-for'] || req.ip, request_id: req.requestId, token: req.token };
  console.log('[AUDIT]', JSON.stringify(audit));
  writeAudit(audit);

  const result = { success: true, patient_id: id, patient };
  if (idempotencyKey) idempotencyStore.set(idempotencyKey, result);
  // include request_id in response for audit correlation
  result.request_id = req.requestId;
  res.status(201).json(result);
});

const userPatchSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  phone: Joi.string().pattern(/^\d{9,11}$/).optional()
});

app.patch('/api/community/users/:id', authMiddleware, validate(userPatchSchema), (req, res) => {
  const id = req.params.id;
  if (id !== req.userId) return res.status(403).json({ success: false, message: 'Forbidden' });
  const user = users[id];
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { name, phone } = req.validatedBody || {};
  if (name) user.name = name;
  if (phone) user.phone = phone;
  console.log(`[AUDIT] user=${req.userId} action=update_profile`);
  writeAudit({ actor: req.userId, action: 'update_profile', target: id, client_ip: req.headers['x-forwarded-for'] || req.ip, request_id: req.requestId, token: req.token });
  res.json({ success: true, user });
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(1).required(),
  newPassword: Joi.string().min(6).required()
});

app.post('/api/auth/change-password', authMiddleware, validate(changePasswordSchema), (req, res) => {
  const { currentPassword, newPassword } = req.validatedBody || {};
  const user = users[req.userId];
  if (currentPassword !== user.password) return res.status(400).json({ success: false, message: 'Current password incorrect' });
  if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password too short' });
  user.password = newPassword;
  console.log(`[AUDIT] user=${req.userId} action=change_password`);
  writeAudit({ actor: req.userId, action: 'change_password', target: req.userId, client_ip: req.headers['x-forwarded-for'] || req.ip, request_id: req.requestId, token: req.token });
  res.json({ success: true, message: 'Password changed' });
});

const rideSchema = Joi.object({
  patientId: Joi.string().required(),
  appointmentDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  appointmentTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
});

app.post('/api/community/rides', requestIdMiddleware, authMiddleware, rateLimiter('create_ride'), validateHeaders(headerSchema), validate(rideSchema), (req, res) => {
  const { patientId, appointmentDate, appointmentTime } = req.validatedBody;
  const idempotencyKey = req.validatedHeaders['idempotency-key'] || req.headers['idempotency-key'];
  if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
    const stored = idempotencyStore.get(idempotencyKey);
    console.log(`[IDEMPOTENCY] returning stored ride for key=${idempotencyKey}`);
    return res.status(200).json(stored);
  }
  const patient = patients[patientId];
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  const dateTimeStr = `${appointmentDate}T${appointmentTime}:00`;
  const appt = new Date(dateTimeStr);
  const now = new Date();
  if (isNaN(appt.getTime())) return res.status(400).json({ success: false, message: 'Invalid date/time' });
  if (appt < now) return res.status(400).json({ success: false, message: 'Appointment is in the past' });
  const id = `RIDE-${String(rideCounter++).padStart(3, '0')}`;
  const ride = { id, patientId, appointmentDate, appointmentTime, createdBy: req.userId };
  rides[id] = ride;
  const audit = { actor: req.userId, action: 'create_ride', target: id, client_ip: req.headers['x-forwarded-for'] || req.ip, request_id: req.requestId, token: req.token };
  console.log('[AUDIT]', JSON.stringify(audit));
  writeAudit(audit);
  const result = { success: true, ride };
  if (idempotencyKey) idempotencyStore.set(idempotencyKey, result);
  result.request_id = req.requestId;
  res.status(201).json(result);
});

// File upload endpoint
app.post('/api/upload', authMiddleware, upload.array('files', 10), (req, res) => {
  const files = req.files || [];
  if (files.length > 5) return res.status(400).json({ success: false, message: 'Too many files' });
  // server-side stricter checks: mime types and extensions
  const allowedMime = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
  const disallowedExt = ['.exe', '.bat', '.sh', '.js', '.jar'];
  for (const f of files) {
    const buf = f.buffer || null;
    // AV scan simulation
    if (buf && buf.toString().includes('EICAR')) {
      console.log('Virus detected in upload');
      return res.status(400).json({ success: false, message: 'Virus detected' });
    }
    const orig = (f.originalname || '').toLowerCase();
    for (const ext of disallowedExt) {
      if (orig.endsWith(ext)) {
        return res.status(400).json({ success: false, message: 'Disallowed file extension' });
      }
    }
    if (f.mimetype && !allowedMime.includes(f.mimetype)) {
      return res.status(400).json({ success: false, message: 'Unsupported file type' });
    }
  }
  console.log('Uploaded files:', files.map(f => f.originalname));
  res.json({ success: true, files: files.map((f, i) => ({ fileName: f.originalname, id: `FILE-${Date.now()}-${i}` })) });
});

// --- Quick Auth endpoints for UI testing ---
app.get('/api/csrf-token', (req, res) => {
  // Minimal CSRF token endpoint for frontend to fetch before POST requests
  res.json({ csrfToken: 'test-csrf-token' });
});

// Mapping of test users used by QuickLoginPanel and E2E tests
const quickLoginUsers = {
  'admin@wecare.ems': { id: 'admin-wecare', full_name: 'Admin User', email: 'admin@wecare.ems', role: 'admin', token: 'admin-wecare-token' },
  'dev@wecare.ems': { id: 'dev-wecare', full_name: 'Developer User', email: 'dev@wecare.ems', role: 'DEVELOPER', token: 'developer-wecare-token' },
  'office1@wecare.dev': { id: 'radio-wecare', full_name: 'Radio Office 1', email: 'office1@wecare.dev', role: 'radio', token: 'radio-wecare-token' },
  'officer1@wecare.dev': { id: 'officer-wecare', full_name: 'Officer 1', email: 'officer1@wecare.dev', role: 'OFFICER', token: 'officer-wecare-token' },
  'driver1@wecare.dev': { id: 'driver1', full_name: 'Driver One', email: 'driver1@wecare.dev', role: 'driver', token: 'driver1-token' },
  'community1@wecare.dev': { id: 'community1', full_name: 'อาสาสมัครตัวอย่าง', email: 'community1@wecare.dev', role: 'community', token: 'community1-token' },
  'executive1@wecare.dev': { id: 'exec1', full_name: 'Executive User', email: 'executive1@wecare.dev', role: 'EXECUTIVE', token: 'exec1-token' },
};

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = (email || '').toLowerCase().trim();
    const normalizedPass = (password || '').trim();

    // Accept only the standard test password for our UI tests
    if (!normalizedEmail || normalizedPass !== 'password123') {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = quickLoginUsers[normalizedEmail];
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Simulate issuing a JWT and set a dummy cookie for CSRF flow
    res.cookie && res.cookie('XSRF-TOKEN', 'test-csrf-token', { httpOnly: false });

    return res.json({ success: true, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }, token: user.token });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const token = auth.slice('Bearer '.length);
  const user = Object.values(quickLoginUsers).find(u => u.token === token);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
  return res.json({ success: true, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
});

// --- End Quick Auth endpoints ---

// Public settings endpoint (no auth)
app.get('/api/settings/public', (req, res) => {
  return res.json({
    success: true,
    appName: 'WeCare Platform',
    organizationName: 'EMS WeCare HQ',
    logoUrl: undefined,
    maintenanceMode: false,
  });
});

// Admin settings endpoint (requires auth and admin role)
app.get('/api/admin/settings', authMiddleware, (req, res) => {
  const user = req.user;
  if (!user || (user.role !== 'admin' && user.role !== 'DEVELOPER')) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  return res.json({
    success: true,
    appName: 'WeCare Platform (Admin)',
    organizationName: 'EMS WeCare HQ',
    logoUrl: undefined,
    maintenanceMode: false,
  });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Mock server listening on http://localhost:${PORT}`);
});

// Admin-only audit query endpoint
app.get('/api/admin/audit/:requestId', authMiddleware, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
  const rid = req.params.requestId;
  try {
    const content = await fs.promises.readFile(auditLogPath, 'utf8').catch(() => '');
    const audits = content
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try { return JSON.parse(line); } catch { return null; }
      })
      .filter((row) => row && row.request_id === rid);
    res.json({ success: true, audits });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Audit query failed' });
  }
});
