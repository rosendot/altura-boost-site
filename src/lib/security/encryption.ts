import crypto from 'crypto';

/**
 * AES-256-GCM encryption for sensitive credentials
 * Used to encrypt customer game account passwords
 */

export interface EncryptedData {
  iv: string; // Base64 initialization vector
  authTag: string; // Base64 authentication tag
  encryptedData: string; // Base64 ciphertext
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Get the encryption key from environment variable
 * Key must be 32 bytes (256 bits) for AES-256
 */
function getEncryptionKey(): Buffer {
  const key = process.env.CREDENTIAL_ENCRYPTION_KEY;

  if (!key) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY environment variable is not set');
  }

  // Decode base64 key
  const keyBuffer = Buffer.from(key, 'base64');

  if (keyBuffer.length !== 32) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (256 bits) when decoded from base64');
  }

  return keyBuffer;
}

/**
 * Encrypt a plaintext string using AES-256-GCM
 * @param plaintext - The string to encrypt
 * @returns EncryptedData object containing iv, authTag, and encryptedData
 */
export function encryptCredential(plaintext: string): EncryptedData {
  const key = getEncryptionKey();

  // Generate random IV for each encryption
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  // Encrypt
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Get auth tag
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    encryptedData: encrypted,
  };
}

/**
 * Decrypt an encrypted credential using AES-256-GCM
 * @param encrypted - EncryptedData object containing iv, authTag, and encryptedData
 * @returns Decrypted plaintext string
 */
export function decryptCredential(encrypted: EncryptedData): string {
  const key = getEncryptionKey();

  // Decode base64 values
  const iv = Buffer.from(encrypted.iv, 'base64');
  const authTag = Buffer.from(encrypted.authTag, 'base64');
  const encryptedData = encrypted.encryptedData;

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  // Set auth tag for verification
  decipher.setAuthTag(authTag);

  // Decrypt
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypt an array of 2FA codes
 * @param codes - Array of 2FA backup codes
 * @returns EncryptedData object or null if codes is empty/null
 */
export function encrypt2FACodes(codes: string[] | null | undefined): EncryptedData | null {
  if (!codes || codes.length === 0) {
    return null;
  }

  // Join codes with delimiter and encrypt
  const joined = codes.join('|');
  return encryptCredential(joined);
}

/**
 * Decrypt 2FA codes back to array
 * @param encrypted - EncryptedData object or null
 * @returns Array of 2FA codes or null
 */
export function decrypt2FACodes(encrypted: EncryptedData | null | undefined): string[] | null {
  if (!encrypted) {
    return null;
  }

  const decrypted = decryptCredential(encrypted);
  return decrypted.split('|').filter((code) => code.length > 0);
}

/**
 * Validate that the encryption key is properly configured
 * Call this at server startup to fail fast if misconfigured
 */
export function validateEncryptionKey(): boolean {
  try {
    getEncryptionKey();
    return true;
  } catch {
    return false;
  }
}
