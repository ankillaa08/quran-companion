/**
 * Reusable Quran Reader Component
 * Renders authentic Uthmani Quran text with RTL direction, font size scaling,
 * verse markers, and optional translation.
 */
import React from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { useSettingsStore } from "../store/useSettingsStore";

export interface QuranVerseItem {
  surah_number: number;
  ayah_number: number;
  text_uthmani: string;
  translation_en?: string;
  words?: Array<{
    position: number;
    text_uthmani: string;
    text_clean: string;
  }>;
}

interface QuranReaderProps {
  verses: QuranVerseItem[];
  activeAyahNumber?: number;
  onSelectAyah?: (ayahNumber: number) => void;
  showTranslation?: boolean;
}

export const QuranReader: React.FC<QuranReaderProps> = ({
  verses,
  activeAyahNumber,
  onSelectAyah,
  showTranslation = true,
}) => {
  const themeMode = useSettingsStore((s) => s.theme);
  const fontSize = useSettingsStore((s) => s.arabicFontSize);
  const theme = colors[themeMode];

  return (
    <View style={styles.container}>
      {verses.map((verse) => {
        const isActive = activeAyahNumber === verse.ayah_number;

        return (
          <TouchableOpacity
            key={`ayah-${verse.surah_number}-${verse.ayah_number}`}
            activeOpacity={0.8}
            onPress={() => onSelectAyah && onSelectAyah(verse.ayah_number)}
            style={[
              styles.verseCard,
              {
                backgroundColor: isActive ? theme.goldGlow : theme.surface,
                borderColor: isActive ? theme.gold : theme.surfaceBorder,
              },
            ]}
          >
            {/* Header: Ayah Number Badge */}
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.ayahBadge,
                  { backgroundColor: isActive ? theme.gold : theme.primaryLight },
                ]}
              >
                <Text
                  style={[
                    styles.ayahBadgeText,
                    { color: isActive ? "#000" : theme.gold },
                  ]}
                >
                  {verse.ayah_number}
                </Text>
              </View>
            </View>

            {/* Arabic Uthmani Text */}
            <Text
              style={[
                styles.arabicText,
                {
                  fontSize: fontSize,
                  color: isActive ? theme.gold : theme.textArabic,
                },
              ]}
            >
              {verse.text_uthmani}{" "}
              <Text style={{ color: theme.gold, fontSize: fontSize * 0.8 }}>
                ۝{verse.ayah_number}
              </Text>
            </Text>

            {/* Translation */}
            {showTranslation && !!verse.translation_en && (
              <Text style={[styles.translationText, { color: theme.textSecondary }]}>
                {verse.translation_en}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  verseCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ayahBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  ayahBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  arabicText: {
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 46,
    fontFamily: Platform.select({
      ios: "Geeza Pro",
      android: "serif",
      default: "serif",
    }),
  },
  translationText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
  },
});
