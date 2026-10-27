/**
 * Quran Reader Screen (114 Surahs Catalog & Verse Viewer)
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useRecitationStore } from "../../src/store/useRecitationStore";
import { api } from "../../src/services/api";

export default function ReaderScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const fontSize = useSettingsStore((s) => s.arabicFontSize);
  const setFontSize = useSettingsStore((s) => s.setArabicFontSize);
  const showTranslation = useSettingsStore((s) => s.showTranslation);
  const setShowTranslation = useSettingsStore((s) => s.setShowTranslation);
  const theme = colors[themeMode];
  const initSession = useRecitationStore((s) => s.initSession);

  const [surahs, setSurahs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<any | null>(null);
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSurahs();
  }, []);

  const loadSurahs = async (q?: string) => {
    try {
      const data = await api.getSurahs(q);
      setSurahs(data);
    } catch (e) {
      console.error(e);
    }
  };

  const openSurah = async (surah: any) => {
    setSelectedSurah(surah);
    setLoading(true);
    try {
      const details = await api.getSurahDetails(surah.number);
      setAyahs(details.ayahs || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const startRecitationFromHere = () => {
    if (selectedSurah) {
      initSession(selectedSurah.number, 1, selectedSurah.ayah_count, "recite");
      router.push("/(tabs)/recite");
    }
  };

  // If a surah is selected, display Reader View
  if (selectedSurah) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Reader Top Bar */}
        <View style={[styles.readerHeader, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
          <TouchableOpacity onPress={() => setSelectedSurah(null)} style={styles.backBtn}>
            <Text style={[styles.backText, { color: theme.gold }]}>← Surahs</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={[styles.headerSurahEn, { color: theme.textPrimary }]}>{selectedSurah.name_en}</Text>
            <Text style={[styles.headerSurahAr, { color: theme.gold }]}>{selectedSurah.name_ar}</Text>
          </View>
          <TouchableOpacity onPress={startRecitationFromHere} style={[styles.reciteHeaderBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.reciteHeaderBtnText}>Recite 🎙️</Text>
          </TouchableOpacity>
        </View>

        {/* Font Size & Translation Controls */}
        <View style={[styles.controlsRow, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
          <View style={styles.fontSizeControls}>
            <Text style={[styles.ctrlLabel, { color: theme.textSecondary }]}>Font Size:</Text>
            <TouchableOpacity onPress={() => setFontSize(Math.max(20, fontSize - 2))} style={[styles.sizeBtn, { borderColor: theme.surfaceBorder }]}>
              <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.sizeVal, { color: theme.textPrimary }]}>{fontSize}</Text>
            <TouchableOpacity onPress={() => setFontSize(Math.min(42, fontSize + 2))} style={[styles.sizeBtn, { borderColor: theme.surfaceBorder }]}>
              <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setShowTranslation(!showTranslation)} style={styles.toggleTranslationBtn}>
            <Text style={[styles.toggleText, { color: showTranslation ? theme.wordMatched : theme.textMuted }]}>
              {showTranslation ? "Translation ON" : "Translation OFF"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ayahs List */}
        <ScrollView contentContainerStyle={styles.versesScroll}>
          {/* Bismillah Header (except Surah At-Tawbah) */}
          {selectedSurah.number !== 9 && (
            <View style={[styles.bismillahBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.goldGlow }]}>
              <Text style={[styles.bismillahArabic, { color: theme.gold }]}>
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </Text>
            </View>
          )}

          {ayahs.map((ayah) => (
            <View
              key={`ayah-${ayah.ayah}`}
              style={[styles.ayahCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
            >
              <View style={styles.ayahNumberRow}>
                <View style={[styles.ayahBadge, { backgroundColor: theme.primaryGlow }]}>
                  <Text style={[styles.ayahBadgeText, { color: theme.gold }]}>{ayah.ayah}</Text>
                </View>
              </View>

              <Text
                style={[
                  styles.ayahArabicText,
                  {
                    fontSize: fontSize,
                    color: theme.textArabic,
                    lineHeight: fontSize * 1.7,
                  },
                ]}
              >
                {ayah.text_uthmani}
              </Text>

              {showTranslation && ayah.translation_en ? (
                <Text style={[styles.ayahTranslation, { color: theme.textSecondary }]}>
                  {ayah.translation_en}
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 114 Surahs Directory View
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Header */}
      <View style={styles.surahListHeader}>
        <Text style={[styles.listTitle, { color: theme.textPrimary }]}>The Noble Quran</Text>
        <Text style={[styles.listSub, { color: theme.textSecondary }]}>114 Surahs • Medina Mushaf Text</Text>

        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.surfaceBorder }]}
          placeholder="Search by surah name or number..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            loadSurahs(text);
          }}
        />
      </View>

      <FlatList
        data={surahs}
        keyExtractor={(item) => `surah-${item.number}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.surahRow, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
            onPress={() => openSurah(item)}
          >
            <View style={[styles.indexSquare, { backgroundColor: theme.primaryGlow }]}>
              <Text style={[styles.indexText, { color: theme.gold }]}>{item.number}</Text>
            </View>

            <View style={styles.surahInfoCol}>
              <Text style={[styles.surahNameEn, { color: theme.textPrimary }]}>{item.name_en}</Text>
              <Text style={[styles.surahMetaText, { color: theme.textSecondary }]}>
                {item.name_translation} • {item.ayah_count} Ayahs ({item.revelation})
              </Text>
            </View>

            <Text style={[styles.surahNameAr, { color: theme.textArabic }]}>{item.name_ar}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  surahListHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 2,
  },
  listSub: {
    fontSize: 13,
    marginBottom: 14,
  },
  searchInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 10,
  },
  surahRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  indexSquare: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  indexText: {
    fontSize: 14,
    fontWeight: "700",
  },
  surahInfoCol: {
    flex: 1,
  },
  surahNameEn: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  surahMetaText: {
    fontSize: 12,
  },
  surahNameAr: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 10,
  },
  readerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 10,
  },
  backText: {
    fontSize: 14,
    fontWeight: "700",
  },
  headerTitleCol: {
    alignItems: "center",
  },
  headerSurahEn: {
    fontSize: 16,
    fontWeight: "700",
  },
  headerSurahAr: {
    fontSize: 14,
    fontWeight: "600",
  },
  reciteHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reciteHeaderBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  fontSizeControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctrlLabel: {
    fontSize: 12,
  },
  sizeBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeVal: {
    fontSize: 12,
    fontWeight: "700",
  },
  toggleTranslationBtn: {
    paddingVertical: 4,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: "700",
  },
  versesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 16,
  },
  bismillahBox: {
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 8,
  },
  bismillahArabic: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: Platform.select({ ios: "Geeza Pro", default: "serif" }),
  },
  ayahCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  ayahNumberRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  ayahBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ayahBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  ayahArabicText: {
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "600",
    marginBottom: 10,
    fontFamily: Platform.select({ ios: "Geeza Pro", default: "serif" }),
  },
  ayahTranslation: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 8,
  },
});
