/**
 * User Preferences & Application Settings Store (Zustand)
 */
import { create } from "zustand";

interface SettingsState {
  theme: "dark" | "light";
  arabicFontSize: number;
  showTranslation: boolean;
  retainAudioSnippets: boolean;
  hifzMaskIntensity: "full" | "blur" | "first_letter";
  
  setTheme: (theme: "dark" | "light") => void;
  setArabicFontSize: (size: number) => void;
  setShowTranslation: (show: boolean) => void;
  setRetainAudioSnippets: (retain: boolean) => void;
  setHifzMaskIntensity: (mode: "full" | "blur" | "first_letter") => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "dark",
  arabicFontSize: 28,
  showTranslation: true,
  retainAudioSnippets: false, // Privacy default: Never store raw audio
  hifzMaskIntensity: "blur",

  setTheme: (theme) => set({ theme }),
  setArabicFontSize: (arabicFontSize) => set({ arabicFontSize }),
  setShowTranslation: (showTranslation) => set({ showTranslation }),
  setRetainAudioSnippets: (retainAudioSnippets) => set({ retainAudioSnippets }),
  setHifzMaskIntensity: (hifzMaskIntensity) => set({ hifzMaskIntensity }),
}));
