import crypto from 'crypto';
import { config } from '../config/index.js';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey() {
  const hex = config.encryptionKeyHex || '';
  if (hex.length === 64) {
    return Buffer.from(hex, 'hex');
  }
  // Fallback 32-byte key generated from secret
  return crypto.createHash('sha256').update(config.jwtSecret).digest();
}

/**
 * AES-256-GCM Server-Side Encryption Utility
 * Conforms to MindMitra Security & RLS Architecture
 *
 * @param {string} plainText
 * @returns {{ ciphertext: string, iv: string, tag: string }}
 */
export function encryptField(plainText) {
  if (!plainText) {
    return { ciphertext: '', iv: '', tag: '' };
  }
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    tag
  };
}

/**
 * AES-256-GCM Server-Side Decryption Utility
 *
 * @param {string} ciphertext
 * @param {string} ivHex
 * @param {string} tagHex
 * @returns {string}
 */
export function decryptField(ciphertext, ivHex, tagHex) {
  if (!ciphertext || !ivHex || !tagHex) {
    return '';
  }
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

