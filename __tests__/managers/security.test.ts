import { SecurityManager } from '../../src/managers/security';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

describe('SecurityManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('KeyStore Initialization', () => {
    it('should generate and save a new key if none exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
      
      const key = await SecurityManager.initializeKeyStore();
      
      expect(key).toBe('mocked-uuid');
      expect(Crypto.randomUUID).toHaveBeenCalled();
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'pockade_salt_key',
        'mocked-uuid',
        { requireAuthentication: false }
      );
    });

    it('should return existing key if one exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('existing-key');
      
      const key = await SecurityManager.initializeKeyStore();
      
      expect(key).toBe('existing-key');
      expect(Crypto.randomUUID).not.toHaveBeenCalled();
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('Checksum generation and verification', () => {
    it('should generate a checksum combining payload and salt', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('test-salt');
      
      const hash = await SecurityManager.generateChecksum('my-score-payload');
      
      expect(hash).toBe('mocked-hash');
      expect(Crypto.digestStringAsync).toHaveBeenCalledWith(
        'SHA256',
        'default:my-score-payload:test-salt'
      );
    });

    it('should verify checksum successfully when payload matches expected', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('test-salt');
      const isValid = await SecurityManager.verifyChecksum('my-score-payload', 'mocked-hash');
      expect(isValid).toBe(true);
    });
    
    it('should fail verification when expected checksum differs', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('test-salt');
      const isValid = await SecurityManager.verifyChecksum('my-score-payload', 'wrong-hash');
      expect(isValid).toBe(false);
    });
  });

  describe('Memory Obfuscation', () => {
    it('should obfuscate and deobfuscate correctly', () => {
      const originalScore = 999;
      const obfuscated = SecurityManager.obfuscateMemoryValue(originalScore);
      
      expect(typeof obfuscated).toBe('string');
      expect(obfuscated).not.toBe(originalScore.toString());
      
      const recovered = SecurityManager.deobfuscateMemoryValue(obfuscated);
      expect(recovered).toBe(originalScore);
    });
  });

  describe('Backup payload encryption', () => {
    it('encrypts and decrypts backup payloads', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('backup-key');

      const encrypted = await SecurityManager.encryptBackupPayload('hello-world');
      const decrypted = await SecurityManager.decryptBackupPayload(encrypted);

      expect(encrypted.ciphertext).not.toBe('hello-world');
      expect(decrypted).toBe('hello-world');
    });
  });
});
