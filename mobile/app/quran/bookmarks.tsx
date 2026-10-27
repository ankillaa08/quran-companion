/**
 * Saved Bookmarks Screen
 */
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useRecitationStore } from "../../src/store/useRecitationStore";

export default function BookmarksScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = colors[themeMode];
  const initSession = useRecitationStore((s) => s.initSession);

  const [bookmarks, setBookmarks] = useState<any[]>([
    { id: "1", surah_number: 1, ayah_number: 1, note: "Opening prayer bookmark" },
    { id: "2", surah_number: 112, ayah_number: 1, note: "Daily evening recitation" },
    { id: "3", surah_number: 114, ayah_number: 1, note: "Protection surah practice" },
  ]);

  const startRecitingBookmark = (surah: number, ayah: number) => {
    initSession(surah, ayah, ayah + 5, "recite");
    router.push("/(tabs)/recite");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.gold }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Saved Bookmarks</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.bookmarkCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <View style={styles.leftCol}>
              <View style={[styles.surahBadge, { backgroundColor: theme.primaryGlow }]}>
                <Text style={[styles.surahNum, { color: theme.gold }]}>{item.surah_number}</Text>
              </View>
              <View>
                <Text style={[styles.surahName, { color: theme.textPrimary }]}>
                  Surah {item.surah_number} : Ayah {item.ayah_number}
                </Text>
                {item.note ? <Text style={[styles.noteText, { color: theme.textSecondary }]}>{item.note}</Text> : null}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.reciteBtn, { backgroundColor: theme.primary }]}
              onPress={() => startRecitingBookmark(item.surah_number, item.ayah_number)}
            >
              <Text style={styles.reciteBtnText}>Recite 🎙️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
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
    fontSize: 18,
    fontWeight: "800",
  },
  listContent: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  bookmarkCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  leftCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  surahBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  surahNum: {
    fontSize: 13,
    fontWeight: "700",
  },
  surahName: {
    fontSize: 15,
    fontWeight: "700",
  },
  noteText: {
    fontSize: 12,
    marginTop: 2,
  },
  reciteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  reciteBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
