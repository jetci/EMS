import fs from 'fs';

const base = process.env.TEST_API_BASE || 'http://localhost:3001';

try {
  const loginRes = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'community1@wecare.dev', password: 'password123' })
  });
  const login = await loginRes.json();
  fs.writeFileSync('wecare_login.json', JSON.stringify(login, null, 2), 'utf8');
  console.log('LOGIN_OK');

  const token = login.token;
  const patientRes = await fetch(base + '/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ name: 'Automated Test Patient', age: 30, phone: '000-0000', latitude: 13.7563, longitude: 100.5018 })
  });
  const create = await patientRes.json();
  fs.writeFileSync('create_patient_response.json', JSON.stringify(create, null, 2), 'utf8');
  console.log('CREATE_OK');
} catch (err) {
  fs.writeFileSync('api_test_error.txt', err.stack || err.toString(), 'utf8');
  console.error('ERROR');
  process.exit(1);
}
