/**
 * Encryption Utilities
 * AES-256-CBC encryption for sensitive data
 * 
 * Usage:
 *   const encrypted = encrypt('sensitive data');
 *   const decrypted = decrypt(encrypted);
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

/**
 * Validate encryption key
 */
function getEncryptionKey(): string | undefined {
  return process.env.ENCRYPTION_KEY;
}

function validateKey(key: string | undefined): asserts key is string {
  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY is not set in environment variables. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }

  if (key.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY must be 64 characters (32 bytes in hex). ' +
      `Current length: ${key.length}`
    );
  }

  // Validate hex format
  if (!/^[0-9a-f]{64}$/i.test(key)) {
    throw new Error('ENCRYPTION_KEY must be a valid hex string');
  }
}

/**
 * Encrypt text using AES-256-CBC
 * @param text - Plain text to encrypt
 * @returns Encrypted text in format: iv:encryptedData (both in hex)
 */
export const encrypt = (text: string): string => {
  if (!text) {
    throw new Error('Cannot encrypt empty text');
  }

  const key = getEncryptionKey();
  validateKey(key);

  try {
    // Generate random IV for each encryption
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(key, 'hex'),
      iv
    );

    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted data (separated by :)
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Decrypt text using AES-256-CBC
 * @param encryptedText - Encrypted text in format: iv:encryptedData
 * @returns Decrypted plain text
 */
export const decrypt = (encryptedText: string): string => {
  if (!encryptedText) {
    throw new Error('Cannot decrypt empty text');
  }

  const key = getEncryptionKey();
  validateKey(key);

  try {
    // Split IV and encrypted data
    const parts = encryptedText.split(':');

    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format. Expected format: iv:encryptedData');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];

    // Validate IV length
    if (iv.length !== IV_LENGTH) {
      throw new Error(`Invalid IV length. Expected ${IV_LENGTH}, got ${iv.length}`);
    }

    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(key, 'hex'),
      iv
    );

    // Decrypt
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Encrypt array of strings (for chronic_diseases, allergies, etc.)
 * @param items - Array of strings to encrypt
 * @returns Encrypted JSON string
 */
export const encryptArray = (items: string[]): string => {
  if (!items || items.length === 0) {
    return encrypt('[]');
  }
  return encrypt(JSON.stringify(items));
};

/**
 * Decrypt array of strings
 * @param encryptedText - Encrypted JSON string
 * @returns Array of strings
 */
export const decryptArray = (encryptedText: string): string[] => {
  if (!encryptedText) {
    return [];
  }

  try {
    const decrypted = decrypt(encryptedText);
    const parsed = JSON.parse(decrypted);

    if (!Array.isArray(parsed)) {
      throw new Error('Decrypted data is not an array');
    }

    return parsed;
  } catch (error) {
    console.error('Failed to decrypt array:', error);
    return [];
  }
};

/**
 * Check if text is encrypted (has iv:data format)
 * @param text - Text to check
 * @returns True if text appears to be encrypted
 */
export const isEncrypted = (text: string): boolean => {
  if (!text) return false;

  const parts = text.split(':');
  if (parts.length !== 2) return false;

  // Check if both parts are valid hex strings
  const ivHex = parts[0];
  const dataHex = parts[1];

  return (
    /^[0-9a-f]+$/i.test(ivHex) &&
    /^[0-9a-f]+$/i.test(dataHex) &&
    ivHex.length === IV_LENGTH * 2 // IV in hex is double the byte length
  );
};

// Validate key on module load (in production)
if (process.env.NODE_ENV === 'production') {
  try {
    validateKey(getEncryptionKey());
    console.log('✅ Encryption key validated successfully');
  } catch (error) {
    console.error('❌ Encryption key validation failed:', error);
    // In serverless, we don't exit the process
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}
