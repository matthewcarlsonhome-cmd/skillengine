/**
 * Cryptographic Utilities for Secure Storage
 *
 * Uses the Web Crypto API to provide authenticated encryption (AES-GCM)
 * for sensitive data like API keys stored in localStorage.
 *
 * SECURITY NOTES:
 * - AES-GCM provides both confidentiality and integrity
 * - Each encryption uses a unique IV (Initialization Vector)
 * - The encryption key is derived from a device-specific identifier
 * - This is NOT a substitute for server-side key storage, but provides
 *   much better protection than plain text or XOR obfuscation
 */

import { logger } from './logger';

// Constants
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for AES-GCM
const SALT_LENGTH = 16;
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Generate a device-specific fingerprint for key derivation.
 * This makes encrypted data harder to use if copied to another device.
 */
function getDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width.toString(),
    screen.height.toString(),
    screen.colorDepth.toString(),
    new Date().getTimezoneOffset().toString(),
    // Add a stored random component for additional entropy
    getOrCreateDeviceId(),
  ];
  return components.join('|');
}

/**
 * Get or create a persistent device ID stored in localStorage
 */
function getOrCreateDeviceId(): string {
  const DEVICE_ID_KEY = 'skillengine_device_id';
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    // Generate a random device ID
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    deviceId = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Derive an encryption key from the device fingerprint using PBKDF2
 */
async function deriveKey(salt: Uint8Array): Promise<CryptoKey> {
  const fingerprint = getDeviceFingerprint();
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(fingerprint),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a string using AES-GCM
 * Returns a base64-encoded string containing: salt + IV + ciphertext + auth tag
 */
export async function encrypt(plaintext: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Derive key from device fingerprint
    const key = await deriveKey(salt);

    // Encrypt the data
    const ciphertext = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );

    // Combine salt + IV + ciphertext into a single array
    const combined = new Uint8Array(
      salt.length + iv.length + ciphertext.byteLength
    );
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

    // Return as base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    logger.error('Encryption failed', { error: error instanceof Error ? error.message : String(error) });
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a string that was encrypted with encrypt()
 */
export async function decrypt(encryptedData: string): Promise<string> {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0)
    );

    // Extract salt, IV, and ciphertext
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

    // Derive the same key
    const key = await deriveKey(salt);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    // Don't log the actual error as it might leak information
    logger.error('Decryption failed - data may be corrupted or from another device');
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Check if Web Crypto API is available
 */
export function isCryptoAvailable(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  );
}

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}
