/**
 * AI Model & Backend Service Status Diagnostics Screen
 */
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { api, API_BASE_URL, WS_BASE_URL } from "../../src/services/api";

export default function StatusScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];

  const [health, setHealth] = useState<any>(null);
  const [model, setModel] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    const start = Date.now();
    try {
      const [h, m] = await Promise.all([
        api.getHealth(),
        api.getModelReadiness(),
      ]);
      setLatency(Date.now() - start);
      setHealth(h);
      setModel(m);
    } catch (e: any) {
      setHealth({ status: "offline", error: e.message });
      setModel({ status: "unavailable" });
      setLatency(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.gold }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>System & AI Diagnostics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Status Hero */}
        <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <View
            style={[
              styles.pulseDot,
              {
                backgroundColor: health?.status === "online" ? theme.wordMatched : theme.wordMistake,
              },
            ]}
          />
          <Text style={[styles.statusHeroTitle, { color: theme.textPrimary }]}>
            {health?.status === "online" ? "All Systems Operational" : "Backend Service Offline"}
          </Text>
          <Text style={[styles.statusHeroSub, { color: theme.textSecondary }]}>
            {latency !== null ? `Round-trip latency: ${latency}ms` : "FastAPI & PyTorch Service"}
          </Text>
        </View>

        {/* Diagnostics Table */}
        <View style={[styles.infoGroup, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <Text style={[styles.groupTitle, { color: theme.gold }]}>AI SPEECH MODEL</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: theme.textSecondary }]}>Model Architecture</Text>
            <Text style={[styles.infoVal, { color: theme.textPrimary }]}>Whisper Base (Arabic Quran)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: theme.textSecondary }]}>Target HuggingFace ID</Text>
            <Text style={[styles.infoVal, { color: theme.textPrimary }]}>tarteel-ai/whisper-base-ar-quran</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: theme.textSecondary }]}>Inference Hardware</Text>
            <Text style={[styles.infoVal, { color: theme.gold }]}>
              {model?.device ? model.device.toUpperCase() : "CPU"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: theme.textSecondary }]}>Model Readiness</Text>
            <Text style={[styles.infoVal, { color: theme.wordMatched }]}>
              {model?.status ? model.status.toUpperCase() : "INITIALIZING"}
            </Text>
          </View>
        </View>

        {/* Network & Infrastructure */}
        <View style={[styles.infoGroup, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <Text style={[styles.groupTitle, { color: theme.gold }]}>ENDPOINTS & PROTOCOLS</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: theme.textSecondary }]}>REST Base URL</Text>
            <Text style={[styles.infoVal, { color: theme.textPrimary }]}>{API_BASE_URL}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: theme.textSecondary }]}>WebSocket Gateway</Text>
            <Text style={[styles.infoVal, { color: theme.textPrimary }]}>{WS_BASE_URL}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: theme.textSecondary }]}>Database Driver</Text>
            <Text style={[styles.infoVal, { color: theme.wordMatched }]}>SQLAlchemy 2.x (Async)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoKey, { color: theme.textSecondary }]}>Audio Ingestion Rate</Text>
            <Text style={[styles.infoVal, { color: theme.textPrimary }]}>16kHz 16-bit Mono PCM</Text>
          </View>
        </View>

        {/* Refresh Ping Button */}
        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: theme.primary }]}
          onPress={checkStatus}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.refreshBtnText}>Ping Diagnostics 🔄</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: "700",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  heroCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
  },
  pulseDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 10,
  },
  statusHeroTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  statusHeroSub: {
    fontSize: 13,
  },
  infoGroup: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  infoKey: {
    fontSize: 13,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: "600",
  },
  refreshBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  refreshBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
