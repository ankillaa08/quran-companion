/**
 * Quran Companion AI Typography System
 * Supports elegant Arabic Uthmani text rendering and clear modern Latin UI typography.
 */
import { Platform, TextStyle } from "react-native";

export const typography = {
  // Arabic Script Styling (Right-to-Left, diacritics, proportional line-height)
  arabic: {
    fontFamily: Platform.select({
      ios: "Geeza Pro",
      android: "serif",
      default: "serif"
    }),
    writingDirection: "rtl" as const,
    textAlign: "right" as const,
  },
  
  // Latin / UI Styling
  ui: {
    fontFamily: Platform.select({
      ios: "System",
      android: "Roboto",
      default: "sans-serif"
    }),
  },
  
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    heading: 28,
    display: 34,
    
    // Arabic Verse Font Sizes
    arabicSm: 22,
    arabicMd: 28,
    arabicLg: 34,
    arabicXl: 40,
  }
};
