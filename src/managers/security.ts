import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export const SecurityManager = {
  initializeKeyStore: async () => {
    let key = await SecureStore.getItemAsync('pockade_salt_key');
    if (!key) {
      key = Crypto.randomUUID();
      await SecureStore.setItemAsync('pockade_salt_key', key);
    }
    return key;
  },

  generateChecksum: async (payload: string): Promise<string> => {
    const salt = await SecurityManager.initializeKeyStore();
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${payload}:${salt}`
    );
    return digest;
  },

  verifyChecksum: async (payload: string, expectedChecksum: string): Promise<boolean> => {
    const actualChecksum = await SecurityManager.generateChecksum(payload);
    return actualChecksum === expectedChecksum;
  },

  obfuscateMemoryValue: (val: number): string => {
    const obfuscated = val * 104729;
    return obfuscated.toString(16);
  },

  deobfuscateMemoryValue: (valStr: string): number => {
    return parseInt(valStr, 16) / 104729;
  }
};
