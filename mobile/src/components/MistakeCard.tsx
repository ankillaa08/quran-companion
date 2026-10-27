/**
 * Potential Mistake Review Card Widget
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { useSettingsStore } from "../store/useSettingsStore";
import { MistakeItem } from "../store/useRecitationStore";

interface MistakeCardProps {
  mistake: MistakeItem;
  onDismiss?: () => void;
  onConfirm?: () => void;
}

export const MistakeCard: React.FC<MistakeCardProps> = ({ mistake, onDismiss, onConfirm }) => {
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];

  const getLabel = () => {
    switch (mistake.mistake_type) {
      case "omission":
        return "Possible Omission (Skipped)";
      case "substitution":
        return "Possible Substitution";
      case "repetition":
        return "Word Repeated";
      case "insertion":
        return "Extra Word Spoken";
      default:
        return "Recitation Check";
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
      <View style={styles.headerRow}>
        <View style={[styles.typeBadge, { backgroundColor: theme.wordMistakeBg }]}>
          <Text style={[styles.typeText, { color: theme.wordMistake }]}>{getLabel()}</Text>
        </View>
        <Text style={[styles.ayahMarker, { color: theme.textSecondary }]}>
          Surah {mistake.surah_number} : Ayah {mistake.ayah_number}
        </Text>
      </View>

      <View style={styles.comparisonRow}>
        {mistake.expected_word_uthmani ? (
          <View style={styles.column}>
            <Text style={[styles.columnLabel, { color: theme.textMuted }]}>EXPECTED</Text>
            <Text style={[styles.arabicWord, { color: theme.wordMatched }]}>
              {mistake.expected_word_uthmani}
            </Text>
          </View>
        ) : null}

        {mistake.recited_word ? (
          <View style={styles.column}>
            <Text style={[styles.columnLabel, { color: theme.textMuted }]}>HEARD</Text>
            <Text style={[styles.arabicWord, { color: theme.wordMistake }]}>
              {mistake.recited_word}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={onDismiss}
          style={[styles.dismissBtn, { borderColor: theme.surfaceBorder }]}
        >
          <Text style={[styles.dismissText, { color: theme.textSecondary }]}>Dismiss</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onConfirm}
          style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.confirmText, { color: "#FFFFFF" }]}>Practice Word</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  ayahMarker: {
    fontSize: 12,
    fontWeight: "500",
  },
  comparisonRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
  },
  column: {
    alignItems: "center",
  },
  columnLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  arabicWord: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
  },
  dismissBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  dismissText: {
    fontSize: 12,
    fontWeight: "600",
  },
  confirmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confirmText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
