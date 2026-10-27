/**
 * Custom hook for fetching and caching Quran surahs and ayahs.
 */
import { useState, useEffect, useCallback } from "react";
import { apiService, Surah, Ayah } from "../services/api";

export function useQuranData(surahNumber?: number) {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [currentAyahs, setCurrentAyahs] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSurahs = useCallback(async (query?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getSurahs(query);
      setSurahs(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load Surahs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAyahs = useCallback(async (surahNum: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getAyahs(surahNum);
      setCurrentAyahs(data);
    } catch (err: any) {
      setError(err?.message || `Failed to load Ayahs for Surah ${surahNum}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurahs();
  }, [fetchSurahs]);

  useEffect(() => {
    if (surahNumber) {
      fetchAyahs(surahNumber);
    }
  }, [surahNumber, fetchAyahs]);

  return {
    surahs,
    currentAyahs,
    isLoading,
    error,
    refreshSurahs: fetchSurahs,
    loadSurahAyahs: fetchAyahs,
  };
}
