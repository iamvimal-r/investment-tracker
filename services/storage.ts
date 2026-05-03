/**
 * Lightweight storage shim – works without @react-native-async-storage installed.
 * Data is persisted in-memory only (cleared on app restart).
 * Replace this file with expo-secure-store or AsyncStorage once packages are installed.
 */
const store = new Map<string, string>();

export const Storage = {
  async getItem(key: string): Promise<string | null> {
    return store.get(key) ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    store.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    store.delete(key);
  },
};
