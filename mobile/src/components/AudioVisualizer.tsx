/**
 * Live Audio Waveform & Microphone Visualizer
 */
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { colors } from "../theme/colors";
import { useSettingsStore } from "../store/useSettingsStore";

interface AudioVisualizerProps {
  isRecording: boolean;
  audioLevel?: number; // 0.0 to 1.0
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isRecording,
  audioLevel = 0,
  connectionStatus,
}) => {
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Generate 7 waveform height bars modulated by audioLevel
  const barHeights = [10, 18, 28, 38, 28, 18, 10].map((base) => {
    const scale = isRecording ? Math.max(0.3, audioLevel * 1.5) : 0.2;
    return Math.max(6, Math.min(48, base * scale));
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
      {/* Mic Status Badge */}
      <View style={styles.badgeRow}>
        <Animated.View
          style={[
            styles.micIndicator,
            {
              backgroundColor: isRecording ? theme.micActive : theme.textMuted,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <Text style={[styles.statusText, { color: theme.textSecondary }]}>
          {isRecording ? "Listening to Recitation..." : "Microphone Ready"}
        </Text>

        <View
          style={[
            styles.connectionPill,
            {
              backgroundColor:
                connectionStatus === "connected"
                  ? theme.primaryGlow
                  : connectionStatus === "connecting"
                  ? theme.goldGlow
                  : "rgba(231, 111, 81, 0.15)",
            },
          ]}
        >
          <Text
            style={[
              styles.connectionText,
              {
                color:
                  connectionStatus === "connected"
                    ? theme.wordMatched
                    : connectionStatus === "connecting"
                    ? theme.gold
                    : theme.wordMistake,
              },
            ]}
          >
            {connectionStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Waveform Bars */}
      <View style={styles.waveRow}>
        {barHeights.map((h, i) => (
          <View
            key={`wave-bar-${i}`}
            style={[
              styles.waveBar,
              {
                height: h,
                backgroundColor: isRecording ? theme.waveform : theme.divider,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    marginVertical: 10,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 14,
  },
  micIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  connectionPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  connectionText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  waveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
  },
});
