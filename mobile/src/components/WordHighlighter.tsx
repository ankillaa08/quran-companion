/**
 * Real-Time Arabic Word Highlighter & Hifz Masking Component
 * Renders RTL Arabic words with dynamic match, omission, and current word highlights.
 */
import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { colors } from "../theme/colors";
import { useSettingsStore } from "../store/useSettingsStore";
import { WordToken } from "../store/useRecitationStore";

interface WordHighlighterProps {
  words: WordToken[];
  currentWordIndex?: number;
  isHifzMode?: boolean;
}

export const WordHighlighter: React.FC<WordHighlighterProps> = ({
  words,
  currentWordIndex = 0,
  isHifzMode = false,
}) => {
  const themeMode = useSettingsStore((s) => s.theme);
  const fontSize = useSettingsStore((s) => s.arabicFontSize);
  const theme = colors[themeMode];

  return (
    <View style={styles.container}>
      <View style={styles.wordsWrapper}>
        {words.map((word, index) => {
          const isMatched = word.status === "matched";
          const isOmitted = word.status === "omitted";
          const isSubstituted = word.status === "substituted";
          const isCurrent = index === currentWordIndex && !isMatched;

          // Hifz masking: hide future words if in memorize mode
          const shouldHide = isHifzMode && !isMatched && index > currentWordIndex;

          let badgeBg = "transparent";
          let textColor = theme.textArabic;
          let borderColor = "transparent";

          if (isMatched) {
            badgeBg = theme.wordMatchedBg;
            textColor = theme.wordMatched;
            borderColor = theme.wordMatched;
          } else if (isCurrent) {
            badgeBg = theme.goldGlow;
            borderColor = theme.gold;
            textColor = theme.gold;
          } else if (isOmitted) {
            badgeBg = theme.wordMistakeBg;
            textColor = theme.wordMistake;
            borderColor = theme.wordMistake;
          } else if (isSubstituted) {
            badgeBg = theme.wordMistakeBg;
            textColor = theme.wordMistake;
          }

          return (
            <View
              key={`word-${word.position}-${index}`}
              style={[
                styles.wordBadge,
                {
                  backgroundColor: badgeBg,
                  borderColor: borderColor,
                  borderWidth: isCurrent || isMatched ? 1 : 0,
                },
              ]}
            >
              <Text
                style={[
                  styles.arabicText,
                  {
                    fontSize: fontSize,
                    color: shouldHide ? theme.textMuted : textColor,
                    opacity: shouldHide ? 0.35 : 1,
                  },
                ]}
              >
                {shouldHide ? "••••" : word.text_uthmani}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  wordsWrapper: {
    flexDirection: "row-reverse", // Right-to-Left Arabic reading direction
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
  },
  wordBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginVertical: 4,
  },
  arabicText: {
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "600",
    lineHeight: 46,
    fontFamily: Platform.select({
      ios: "Geeza Pro",
      android: "serif",
      default: "serif",
    }),
  },
});
