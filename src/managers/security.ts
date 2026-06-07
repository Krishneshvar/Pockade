import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import QuickCrypto from 'react-native-quick-crypto';

const SALT_KEY = 'pockade_salt_key';
const BACKUP_KEY = 'pockade_backup_key';

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

function hexToBytes(value: string) {
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }
  return bytes;
}

function bytesToHex(value: Uint8Array) {
  return Array.from(value)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function getOrCreateKey(keyName: string) {
  const existing = await SecureStore.getItemAsync(keyName);
  if (existing) {
    return existing;
  }

  const generated = Crypto.randomUUID();
  await SecureStore.setItemAsync(keyName, generated, {
    requireAuthentication: false,
  });
  return generated;
}

async function getDerivedEncryptionKey() {
  const rawKey = await SecurityManager.getBackupKey();
  const salt = await SecurityManager.initializeKeyStore();
  // Use PBKDF2 to derive a strong 32-byte (256-bit) key for AES-256-GCM
  return QuickCrypto.pbkdf2Sync(rawKey, salt, 100000, 32, 'sha256');
}

export interface EncryptedBackupPayload {
  version: number;
  nonce: string; // Hex string of IV
  checksum: string;
  ciphertext: string; // Hex string
  authTag: string; // Hex string
}

export const SecurityManager = {
  initializeKeyStore() {
    return getOrCreateKey(SALT_KEY);
  },

  getBackupKey() {
    return getOrCreateKey(BACKUP_KEY);
  },

  async generateChecksum(payload: string, namespace = 'default') {
    const salt = await SecurityManager.initializeKeyStore();
    return Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${namespace}:${payload}:${salt}`
    );
  },

  async verifyChecksum(payload: string, expectedChecksum: string, namespace = 'default') {
    const actualChecksum = await SecurityManager.generateChecksum(payload, namespace);
    return safeEqual(actualChecksum, expectedChecksum);
  },

  obfuscateMemoryValue(value: number) {
    const seed = Math.abs(Math.trunc(value * 131)) + 7919;
    const mask = (seed ^ 0x5f3759df) >>> 0;
    const encoded = (Math.trunc(value) ^ mask) >>> 0;
    return `${mask.toString(16)}:${encoded.toString(16)}`;
  },

  deobfuscateMemoryValue(value: string) {
    const [maskHex, encodedHex] = value.split(':');
    if (!maskHex || !encodedHex) {
      return Number.NaN;
    }

    const mask = Number.parseInt(maskHex, 16) >>> 0;
    const encoded = Number.parseInt(encodedHex, 16) >>> 0;
    return (encoded ^ mask) >>> 0;
  },

  async encryptBackupPayload(payload: string): Promise<EncryptedBackupPayload> {
    const key = await getDerivedEncryptionKey();
    const iv = QuickCrypto.randomBytes(12); // Standard 96-bit IV for GCM

    const cipher = QuickCrypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(payload, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    const nonceHex = iv.toString('hex');
    
    // Overall checksum for the file structural integrity
    const checksum = await SecurityManager.generateChecksum(`${nonceHex}:${encrypted}:${authTag}`, 'backup');

    return {
      version: 2, // Upgraded version for AES-GCM
      nonce: nonceHex,
      checksum,
      ciphertext: encrypted,
      authTag,
    };
  },

  async decryptBackupPayload(payload: EncryptedBackupPayload) {
    // 1. Verify structural integrity
    const isValid = await SecurityManager.verifyChecksum(
      `${payload.nonce}:${payload.ciphertext}:${payload.authTag}`,
      payload.checksum,
      'backup'
    );

    if (!isValid) {
      throw new Error('Backup structural integrity check failed.');
    }

    // 2. Decrypt with AES-GCM (which guarantees cryptographic authenticity)
    const key = await getDerivedEncryptionKey();
    const iv = hexToBytes(payload.nonce);
    const authTag = hexToBytes(payload.authTag);

    const decipher = QuickCrypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    try {
      let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error('Backup cryptographic authentication failed. Invalid key or corrupted data.');
    }
  },
};
