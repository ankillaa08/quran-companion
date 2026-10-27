/**
 * Recitation Session & Word Alignment State Store (Zustand)
 */
import { create } from "zustand";

export interface WordToken {
  position: number;
  text_uthmani: string;
  text_clean: string;
  status?: "pending" | "matched" | "omitted" | "substituted";
  similarity?: number;
}

export interface MistakeItem {
  id?: string;
  surah_number: number;
  ayah_number: number;
  position: number;
  mistake_type: "omission" | "substitution" | "repetition" | "insertion";
  expected_word?: string;
  expected_word_uthmani?: string;
  recited_word?: string;
  confidence: number;
}

interface RecitationState {
  sessionId: string | null;
  surahNumber: number;
  currentAyahNumber: number;
  ayahStart: number;
  ayahEnd: number;
  mode: "recite" | "memorize";
  status: "idle" | "recording" | "paused" | "completed";
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
  
  expectedWords: WordToken[];
  alignedWords: WordToken[];
  matchedPositions: number[];
  currentWordIndex: number;
  recentTranscript: string;
  confidence: number;
  
  mistakes: MistakeItem[];
  audioLevel: number;
  isHifzHidden: boolean;
  
  // Actions
  initSession: (surah: number, start: number, end: number, mode?: "recite" | "memorize") => void;
  setSessionId: (id: string) => void;
  setStatus: (status: "idle" | "recording" | "paused" | "completed") => void;
  setConnectionStatus: (status: "disconnected" | "connecting" | "connected" | "error") => void;
  setExpectedWords: (words: WordToken[]) => void;
  updateAlignment: (data: {
    matched_positions: number[];
    current_word_index: number;
    aligned_words: WordToken[];
    confidence: number;
  }) => void;
  setRecentTranscript: (text: string) => void;
  addMistake: (mistake: MistakeItem) => void;
  setAudioLevel: (level: number) => void;
  toggleHifzHidden: () => void;
  advanceAyah: (newAyah: number, newWords: WordToken[]) => void;
  resetSession: () => void;
}

export const useRecitationStore = create<RecitationState>((set) => ({
  sessionId: null,
  surahNumber: 1,
  currentAyahNumber: 1,
  ayahStart: 1,
  ayahEnd: 7,
  mode: "recite",
  status: "idle",
  connectionStatus: "disconnected",
  
  expectedWords: [],
  alignedWords: [],
  matchedPositions: [],
  currentWordIndex: 0,
  recentTranscript: "",
  confidence: 1.0,
  
  mistakes: [],
  audioLevel: 0,
  isHifzHidden: false,

  initSession: (surah, start, end, mode = "recite") =>
    set({
      surahNumber: surah,
      currentAyahNumber: start,
      ayahStart: start,
      ayahEnd: end,
      mode,
      status: "idle",
      matchedPositions: [],
      currentWordIndex: 0,
      recentTranscript: "",
      mistakes: [],
      audioLevel: 0,
    }),

  setSessionId: (id) => set({ sessionId: id }),
  setStatus: (status) => set({ status }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setExpectedWords: (words) =>
    set({
      expectedWords: words,
      alignedWords: words.map((w) => ({ ...w, status: "pending", similarity: 0 })),
      matchedPositions: [],
      currentWordIndex: 0,
    }),

  updateAlignment: (data) =>
    set({
      matchedPositions: data.matched_positions,
      currentWordIndex: data.current_word_index,
      alignedWords: data.aligned_words,
      confidence: data.confidence,
    }),

  setRecentTranscript: (text) => set({ recentTranscript: text }),

  addMistake: (mistake) =>
    set((state) => ({
      mistakes: [...state.mistakes, mistake],
    })),

  setAudioLevel: (audioLevel) => set({ audioLevel }),
  toggleHifzHidden: () => set((state) => ({ isHifzHidden: !state.isHifzHidden })),

  advanceAyah: (newAyah, newWords) =>
    set({
      currentAyahNumber: newAyah,
      expectedWords: newWords,
      alignedWords: newWords.map((w) => ({ ...w, status: "pending", similarity: 0 })),
      matchedPositions: [],
      currentWordIndex: 0,
    }),

  resetSession: () =>
    set({
      sessionId: null,
      status: "idle",
      connectionStatus: "disconnected",
      expectedWords: [],
      alignedWords: [],
      matchedPositions: [],
      currentWordIndex: 0,
      recentTranscript: "",
      mistakes: [],
      audioLevel: 0,
    }),
}));
