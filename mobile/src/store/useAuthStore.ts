/**
 * User Authentication State Store (Zustand)
 */
import { create } from "zustand";
import { api, getAuthToken, setAuthToken, removeAuthToken } from "../services/api";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  checkAuth: () => Promise<void>;
  login: (credentials: any) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const me = await api.getMe();
      set({ user: me, isAuthenticated: true, isLoading: false });
    } catch {
      await removeAuthToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    const res = await api.login(credentials);
    await setAuthToken(res.access_token);
    set({ user: res.user, isAuthenticated: true });
  },

  register: async (payload) => {
    const res = await api.register(payload);
    await setAuthToken(res.access_token);
    set({ user: res.user, isAuthenticated: true });
  },

  logout: async () => {
    await removeAuthToken();
    set({ user: null, isAuthenticated: false });
  },
}));
