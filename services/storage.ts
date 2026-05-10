/**
 * Persistent storage using expo-secure-store.
 * Works in Expo Go without npm install (bundled in the Expo Go client).
 * For standalone builds, run: npm install expo-secure-store
 */
import { Platform } from 'react-native';

// Web fallback (SecureStore is native-only)
const webStore = new Map<string, string>();

let SecureStore: any = null;
try {
  SecureStore = require('expo-secure-store');
} catch {
  // expo-secure-store not available — will use web/memory fallback
}

export const Storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web' || !SecureStore) return webStore.get(key) ?? null;
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return webStore.get(key) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web' || !SecureStore) {
      webStore.set(key, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
      webStore.set(key, value); // keep in-memory copy as cache
    } catch {
      webStore.set(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    webStore.delete(key);
    if (Platform.OS === 'web' || !SecureStore) return;
    try {
      await SecureStore.deleteItemAsync(key);
    } catch { }
  },
};
