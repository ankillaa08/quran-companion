/**
 * Live AI Recitation Screen — Real-Time Speech Recognition & Word Highlighting
 */
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { audioService } from "../../src/services/nativeAudio";
import { colors } from "../../src/theme/colors";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useRecitationStore } from "../../src/store/useRecitationStore";
import { WordHighlighter } from "../../src/components/WordHighlighter";
import { AudioVisualizer } from "../../src/components/AudioVisualizer";
import { RecitationWebSocket } from "../../src/services/websocket";
import { api } from "../../src/services/api";

export default function ReciteScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];

  const {
    sessionId,
    surahNumber,
    currentAyahNumber,
    ayahStart,
    ayahEnd,
    status,
    connectionStatus,
    expectedWords,
    alignedWords,
    currentWordIndex,
    recentTranscript,
    mistakes,
    audioLevel,
    initSession,
    setSessionId,
    setStatus,
    setConnectionStatus,
    setExpectedWords,
    updateAlignment,
    setRecentTranscript,
    addMistake,
    setAudioLevel,
    advanceAyah,
    resetSession,
  } = useRecitationStore();

  const [isAudioActive, setIsAudioActive] = useState(false);
  const socketRef = useRef<RecitationWebSocket | null>(null);
  const audioMeterInterval = useRef<any>(null);

  // Initialize session with Surah 1 if not initialized
  useEffect(() => {
    if (expectedWords.length === 0) {
      loadAyahWords(surahNumber, currentAyahNumber);
    }
  }, [surahNumber, currentAyahNumber]);

  const loadAyahWords = async (surah: number, ayah: number) => {
    try {
      const data = await api.getAyah(surah, ayah);
      if (data && data.words) {
        setExpectedWords(data.words);
      }
    } catch {
      // Fallback words for Surah 1 Ayah 1
      setExpectedWords([
        { position: 1, text_uthmani: "بِسْمِ", text_clean: "بسم" },
        { position: 2, text_uthmani: "ٱللَّهِ", text_clean: "الله" },
        { position: 3, text_uthmani: "ٱلرَّحْمَـٰنِ", text_clean: "الرحمن" },
        { position: 4, text_uthmani: "ٱلرَّحِيمِ", text_clean: "الرحيم" },
      ]);
    }
  };

  const startRecitation = async () => {
    try {
      // 1. Request Microphone Permissions safely
      const perm = await audioService.requestPermissions();
      if (!perm.granted) {
        Alert.alert(
          "Microphone Permission Required",
          "Quran Companion AI needs microphone access to listen to your recitation."
        );
        return;
      }

      // 2. Create session in backend
      const newSession = await api.createSession({
        surah_number: surahNumber,
        ayah_start: ayahStart,
        ayah_end: ayahEnd,
        mode: "recite",
      });
      const activeSessionId = newSession.session_id;
      setSessionId(activeSessionId);

      // 3. Connect WebSocket
      setConnectionStatus("connecting");
      const socket = new RecitationWebSocket(activeSessionId);
      socketRef.current = socket;

      socket.on("open", () => {
        setConnectionStatus("connected");
        socket.startSession(surahNumber, ayahStart, ayahEnd, "recite");
      });

      socket.on("partial_transcript", (data) => {
        setRecentTranscript(data.text);
      });

      socket.on("word_alignment", (data) => {
        updateAlignment(data);
      });

      socket.on("possible_mistake", (data) => {
        addMistake(data);
      });

      socket.on("verse_transitioned", async (data) => {
        const nextWords = await api.getAyah(data.surah_number, data.current_ayah);
        if (nextWords && nextWords.words) {
          advanceAyah(data.current_ayah, nextWords.words);
        }
      });

      socket.on("error", () => {
        setConnectionStatus("error");
      });

      await socket.connect();

      // 4. Start Audio Recording with Metering
      await audioService.startRecording((level) => {
        setAudioLevel(level);
      });

      setIsAudioActive(true);
      setStatus("recording");

      // Start simulated audio chunk streaming over WebSocket
      let seq = 1;
      audioMeterInterval.current = setInterval(() => {
        if (socketRef.current && status !== "paused") {
          // Send simulated 250ms PCM chunk frame
          socketRef.current.send({
            type: "audio_chunk",
            sequence: seq++,
            data: "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
          });
        }
      }, 500);
    } catch (err) {
      console.error("Failed to start recitation", err);
      setConnectionStatus("error");
      setStatus("idle");
    }
  };

  const pauseRecitation = async () => {
    if (status === "recording") {
      setStatus("paused");
      if (socketRef.current) socketRef.current.pauseSession();
      await audioService.pauseRecording();
    } else if (status === "paused") {
      setStatus("recording");
      if (socketRef.current) socketRef.current.resumeSession();
      await audioService.resumeRecording();
    }
  };

  const stopRecitation = async () => {
    setStatus("completed");
    clearInterval(audioMeterInterval.current);

    await audioService.stopRecording();
    setIsAudioActive(false);

    if (socketRef.current) {
      socketRef.current.stopSession();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setConnectionStatus("disconnected");
    router.push("/recitation/summary");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Recitation Header */}
      <View style={[styles.headerBar, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
        <View>
          <Text style={[styles.surahTitle, { color: theme.textPrimary }]}>Surah {surahNumber}</Text>
          <Text style={[styles.ayahSub, { color: theme.textSecondary }]}>
            Ayah {currentAyahNumber} of {ayahEnd}
          </Text>
        </View>

        {mistakes.length > 0 ? (
          <TouchableOpacity
            style={[styles.mistakesPill, { backgroundColor: theme.wordMistakeBg }]}
            onPress={() => router.push("/recitation/mistakes")}
          >
            <Text style={[styles.mistakesCountText, { color: theme.wordMistake }]}>
              {mistakes.length} Flagged ⚠️
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Live Audio Visualizer */}
        <AudioVisualizer
          isRecording={status === "recording"}
          audioLevel={audioLevel}
          connectionStatus={connectionStatus}
        />

        {/* Real-Time Quran Verse Word Alignment Display */}
        <View style={[styles.verseDisplayCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.targetLabel, { color: theme.textSecondary }]}>EXPECTED AYAH</Text>
            <View style={[styles.ayahBadge, { backgroundColor: theme.primaryGlow }]}>
              <Text style={[styles.ayahBadgeNum, { color: theme.gold }]}>{currentAyahNumber}</Text>
            </View>
          </View>

          <WordHighlighter
            words={alignedWords.length > 0 ? alignedWords : expectedWords}
            currentWordIndex={currentWordIndex}
          />
        </View>

        {/* Live Speech Recognition Transcript */}
        {recentTranscript ? (
          <View style={[styles.transcriptBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.surfaceBorder }]}>
            <Text style={[styles.transcriptLabel, { color: theme.gold }]}>RECOGNIZED SPEECH:</Text>
            <Text style={[styles.transcriptText, { color: theme.textPrimary }]}>"{recentTranscript}"</Text>
          </View>
        ) : null}

        {/* Mistake Alert Banner if detected */}
        {mistakes.length > 0 && (
          <TouchableOpacity
            style={[styles.alertBanner, { backgroundColor: theme.wordMistakeBg, borderColor: theme.wordMistake }]}
            onPress={() => router.push("/recitation/mistakes")}
          >
            <Text style={{ fontSize: 18, marginRight: 8 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: theme.wordMistake }]}>Potential Mistake Detected</Text>
              <Text style={[styles.alertSub, { color: theme.textSecondary }]}>
                {mistakes[mistakes.length - 1].mistake_type.toUpperCase()}: Tap to review
              </Text>
            </View>
            <Text style={{ color: theme.wordMistake, fontWeight: "700" }}>Review →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Floating Bottom Control Bar */}
      <View style={[styles.bottomControlBar, { backgroundColor: theme.surface, borderTopColor: theme.surfaceBorder }]}>
        {status === "idle" ? (
          <TouchableOpacity
            style={[styles.startRecitingBtn, { backgroundColor: theme.primary }]}
            onPress={startRecitation}
          >
            <Text style={styles.startRecitingBtnText}>Start AI Listening 🎙️</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControlsRow}>
            <TouchableOpacity
              style={[styles.pauseBtn, { borderColor: theme.surfaceBorder, backgroundColor: theme.surfaceElevated }]}
              onPress={pauseRecitation}
            >
              <Text style={[styles.btnIcon, { color: theme.textPrimary }]}>
                {status === "paused" ? "▶️ Resume" : "⏸️ Pause"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stopBtn, { backgroundColor: theme.wordMistake }]}
              onPress={stopRecitation}
            >
              <Text style={styles.stopBtnText}>⏹️ Finish Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  surahTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  ayahSub: {
    fontSize: 12,
    marginTop: 2,
  },
  mistakesPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mistakesCountText: {
    fontSize: 12,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 110,
  },
  verseDisplayCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  ayahBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  ayahBadgeNum: {
    fontSize: 12,
    fontWeight: "700",
  },
  transcriptBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  transcriptLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.select({ ios: "Geeza Pro", default: "serif" }),
    textAlign: "right",
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  alertSub: {
    fontSize: 11,
    marginTop: 1,
  },
  bottomControlBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  startRecitingBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  startRecitingBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  activeControlsRow: {
    flexDirection: "row",
    gap: 12,
  },
  pauseBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnIcon: {
    fontSize: 14,
    fontWeight: "700",
  },
  stopBtn: {
    flex: 1.2,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stopBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
