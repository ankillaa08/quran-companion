/**
 * REST API Client for Quran Companion AI Backend
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

// Default to local machine dev address (configurable for Android emulator, physical device IP, or cloud via .env)
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api/v1";
export const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WS_URL || "ws://localhost:8000/ws/recitation";


export interface Surah {
  number: number;
  name_arabic: string;
  name_english: string;
  name_translation: string;
  total_ayahs: number;
  revelation_type: string;
}

export interface Ayah {
  surah_number: number;
  ayah_number: number;
  text_uthmani: string;
  translation_en: string;
  words?: Array<{
    position: number;
    text_uthmani: string;
    text_clean: string;
  }>;
}

const TOKEN_KEY = "quran_companion_auth_token";

export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `HTTP Error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; database: string }>("/health"),
  getModelReadiness: () => request<{ status: string; device: string; model_name: string }>("/model/readiness"),

  // Auth
  register: (body: any) => request<any>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: any) => request<any>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  getMe: () => request<any>("/auth/me"),

  // Quran Reader
  getSurahs: (query?: string) => request<any[]>(`/quran/surahs${query ? `?q=${encodeURIComponent(query)}` : ""}`),
  getSurahDetails: (surahNumber: number) => request<{ metadata: Surah; ayahs: Ayah[] }>(`/quran/surahs/${surahNumber}`),
  getAyahs: async (surahNumber: number): Promise<Ayah[]> => {
    const res = await request<{ metadata: Surah; ayahs: Ayah[] }>(`/quran/surahs/${surahNumber}`);
    return res.ayahs || [];
  },
  getAyah: (surah: number, ayah: number) => request<Ayah>(`/quran/ayahs/${surah}/${ayah}`),
  searchQuran: (q: string) => request<any>(`/quran/search?q=${encodeURIComponent(q)}`),

  // Recitation Sessions
  createSession: (body: any) => request<any>("/recitation/sessions", { method: "POST", body: JSON.stringify(body) }),
  getSessions: () => request<any[]>("/recitation/sessions"),
  getSession: (id: string) => request<any>(`/recitation/sessions/${id}`),
  stopSession: (id: string, body: any) => request<any>(`/recitation/sessions/${id}/stop`, { method: "POST", body: JSON.stringify(body) }),
  reviewMistake: (id: string, body: any) => request<any>(`/recitation/mistakes/${id}/review`, { method: "PATCH", body: JSON.stringify(body) }),

  // Progress
  getProgress: () => request<any>("/progress/dashboard"),
  getRevisionPlan: () => request<any>("/progress/revision-planner"),
};

export const apiService = api;
