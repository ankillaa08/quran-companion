/**
 * Ayah & Surah Range Selector Component
 * Allows users to choose target recitation ranges for live recitation and Hifz mode.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { colors } from "../theme/colors";
import { useSettingsStore } from "../store/useSettingsStore";

interface AyahSelectorProps {
  totalAyahs: number;
  selectedAyah: number;
  onSelectAyah: (ayah: number) => void;
}

export const AyahSelector: React.FC<AyahSelectorProps> = ({
  totalAyahs,
  selectedAyah,
  onSelectAyah,
}) => {
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];

  const ayahs = Array.from({ length: totalAyahs }, (_, i) => i + 1);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {ayahs.map((num) => {
        const isSelected = num === selectedAyah;
        return (
          <TouchableOpacity
            key={`ayah-select-${num}`}
            onPress={() => onSelectAyah(num)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? theme.gold : theme.surface,
                borderColor: isSelected ? theme.gold : theme.surfaceBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: isSelected ? "#000" : theme.textPrimary },
              ]}
            >
              Ayah {num}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
