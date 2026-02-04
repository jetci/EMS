# 🚀 Sprint 1 Setup Instructions

## Step 1: Install Dependencies

```bash
cd wecare-backend

# Install testing dependencies (if not already installed)
npm install --save-dev jest @types/jest ts-jest @types/node

# Install production dependencies
npm install dotenv
```

## Step 2: Configure Jest

Create or update `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

## Step 3: Generate Encryption Key

```bash
# Generate a secure 32-byte encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Example output:
# 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

## Step 4: Update .env File

Add to `wecare-backend/.env`:

```bash
# Encryption (REQUIRED)
ENCRYPTION_KEY=YOUR_64_CHAR_HEX_KEY_HERE

# Example (DO NOT USE THIS IN PRODUCTION):
# ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

## Step 5: Run Tests

```bash
# Run all tests
npm test

# Run encryption tests only
npm test -- encryption.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode (for development)
npm test -- --watch
```

## Step 6: Verify Setup

Expected test output:
```
PASS  tests/encryption.test.ts
  Encryption Utilities
    encrypt()
      ✓ should encrypt text successfully (5ms)
      ✓ should produce different ciphertext for same input (3ms)
      ✓ should throw error for empty text (2ms)
      ...
    decrypt()
      ✓ should decrypt text successfully (3ms)
      ...

Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
Coverage:    95.2%
```

## Troubleshooting

### Error: "ENCRYPTION_KEY is not set"
**Solution:** Add ENCRYPTION_KEY to .env file

### Error: "Cannot find module 'crypto'"
**Solution:** Install @types/node: `npm install --save-dev @types/node`

### Error: "Cannot find name 'describe'"
**Solution:** Install @types/jest: `npm install --save-dev @types/jest`

### Tests fail with "Invalid encrypted text format"
**Solution:** Make sure ENCRYPTION_KEY is exactly 64 characters (hex)

## Next Steps

After tests pass:
1. ✅ Proceed to Task 1.4: Update Patient Service
2. ✅ Apply encryption to patient data
3. ✅ Test with real data

---

**Status:** ⏳ Ready to test
**Time:** ~30 minutes
