import fetch from 'node-fetch';

(async () => {
  try {
    const res = await fetch('http://localhost:4001/api/community/patients/register', { method: 'OPTIONS' });
    console.log('status', res.status);
    const text = await res.text();
    console.log('body', text.slice(0, 200));
  } catch (err) {
    console.error('ping error', err);
  }
})();