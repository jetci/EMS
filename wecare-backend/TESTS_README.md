Running backend tests

Prerequisites:
- Node.js installed
- Backend running locally (see project README)

Steps:

1. Start backend (in a separate terminal):

```bash
cd wecare-backend
npm install
npm run dev
```

2. Run tests (from repo root or wecare-backend):

```bash
cd wecare-backend
npm install --save-dev jest node-fetch
npx jest tests/api.test.ts
```

Notes:
- Tests are a scaffold for smoke checks and expect a running server at `http://localhost:3001`.
- Configure `API_URL` env var to point to a different address.
