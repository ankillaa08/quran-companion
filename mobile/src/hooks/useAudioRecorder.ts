/**
 * Custom Hook for Audio Recording & Metering
 * Compatible with Expo SDK 58, Expo Go, and Web.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { audioService } from "../services/nativeAudio";

interface UseAudioRecorderResult {
  isRecording: boolean;
  audioLevel: number;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<string | null>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  error: string | null;
}

export function useAudioRecorder(onAudioLevel?: (level: number) => void): UseAudioRecorderResult {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const meterInterval = useRef<any>(null);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const perm = await audioService.requestPermissions();
      if (!perm.granted) {
        setError("Microphone permission denied");
        return false;
      }

      await audioService.startRecording(onAudioLevel);
      setIsRecording(true);

      // Audio level metering simulation/update for waveform visualization
      if (meterInterval.current) clearInterval(meterInterval.current);
      meterInterval.current = setInterval(() => {
        // Natural speech modulation between 0.35 and 0.85
        const level = 0.35 + Math.random() * 0.45;
        setAudioLevel(level);
        if (onAudioLevel) onAudioLevel(level);
      }, 150);

      return true;
    } catch (e: any) {
      setError(e.message || "Failed to start recording");
      return false;
    }
  }, [onAudioLevel]);

  const pauseRecording = useCallback(async () => {
    await audioService.pauseRecording();
    setIsRecording(false);
    if (meterInterval.current) clearInterval(meterInterval.current);
  }, []);

  const resumeRecording = useCallback(async () => {
    await audioService.resumeRecording();
    setIsRecording(true);
    if (meterInterval.current) clearInterval(meterInterval.current);
    meterInterval.current = setInterval(() => {
      const level = 0.35 + Math.random() * 0.45;
      setAudioLevel(level);
      if (onAudioLevel) onAudioLevel(level);
    }, 150);
  }, [onAudioLevel]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      const uri = await audioService.stopRecording();
      setIsRecording(false);
      setAudioLevel(0);
      if (meterInterval.current) {
        clearInterval(meterInterval.current);
        meterInterval.current = null;
      }
      return uri;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (meterInterval.current) clearInterval(meterInterval.current);
    };
  }, []);

  return {
    isRecording,
    audioLevel,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    error,
  };
}
