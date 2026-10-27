/**
 * Offline & Local Storage Service
 * Provides persistent key-value caching for offline reading, bookmarks, and user settings.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  AUTH_TOKEN: "@quran_companion_auth_token",
  USER_INFO: "@quran_companion_user_info",
  BOOKMARKS: "@quran_companion_bookmarks",
  SETTINGS: "@quran_companion_settings",
  LAST_READ: "@quran_companion_last_read",
};

export interface LocalBookmark {
  id: string;
  surah_number: number;
  ayah_number: number;
  surah_name_en: string;
  text_preview: string;
  created_at: string;
}

export const storageService = {
  async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
    } catch (e) {
      console.warn("Error saving auth token to storage", e);
    }
  },

  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
    } catch (e) {
      return null;
    }
  },

  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
    } catch (e) {
      console.warn("Error removing auth token", e);
    }
  },

  async saveBookmarks(bookmarks: LocalBookmark[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.BOOKMARKS, jsonSafeStringify(bookmarks));
    } catch (e) {
      console.warn("Error saving bookmarks", e);
    }
  },

  async getBookmarks(): Promise<LocalBookmark[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  async setLastRead(surahNumber: number, ayahNumber: number): Promise<void> {
    try {
      await AsyncStorage.setItem(
        KEYS.LAST_READ,
        JSON.stringify({ surahNumber, ayahNumber, timestamp: Date.now() })
      );
    } catch (e) {
      console.warn("Error setting last read", e);
    }
  },

  async getLastRead(): Promise<{ surahNumber: number; ayahNumber: number } | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.LAST_READ);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
};

function jsonSafeStringify(val: any): string {
  return JSON.stringify(val);
}
