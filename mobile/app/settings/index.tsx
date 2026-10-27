/**
 * Profile & Settings Screen
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import { useSettingsStore } from "../../src/store/useSettingsStore";
import { useAuthStore } from "../../src/store/useAuthStore";

export default function SettingsIndexScreen() {
  const router = useRouter();
  const {
    theme,
    setTheme,
    arabicFontSize,
    setArabicFontSize,
    showTranslation,
    setShowTranslation,
  } = useSettingsStore();

  const { user, isAuthenticated, logout } = useAuthStore();
  const themeColors = colors[theme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.surfaceBorder }]}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>Settings</Text>
        <Text style={[styles.sub, { color: themeColors.textSecondary }]}>Preferences, account & diagnostics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Account Card */}
        <View style={[styles.accountCard, { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder }]}>
          <View style={[styles.avatarCircle, { backgroundColor: themeColors.primaryGlow }]}>
            <Text style={{ fontSize: 24 }}>👤</Text>
          </View>
          <View style={styles.accountTextCol}>
            <Text style={[styles.accountName, { color: themeColors.textPrimary }]}>
              {isAuthenticated && user?.email ? user.full_name || user.email : "Guest Reciter"}
            </Text>
            <Text style={[styles.accountStatus, { color: themeColors.textSecondary }]}>
              {isAuthenticated ? "Signed In" : "Local Device Profile"}
            </Text>
          </View>
          {isAuthenticated ? (
            <TouchableOpacity onPress={logout} style={styles.authBtn}>
              <Text style={[styles.authBtnText, { color: themeColors.wordMistake }]}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={[styles.authBtn, { backgroundColor: themeColors.primary }]}>
              <Text style={[styles.authBtnText, { color: "#FFFFFF" }]}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Display & Reading Section */}
        <View style={[styles.section, { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder }]}>
          <Text style={[styles.sectionLabel, { color: themeColors.gold }]}>READING & DISPLAY</Text>

          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>Dark Mode</Text>
              <Text style={[styles.rowSub, { color: themeColors.textSecondary }]}>High-contrast emerald night theme</Text>
            </View>
            <Switch
              value={theme === "dark"}
              onValueChange={(val) => setTheme(val ? "dark" : "light")}
              trackColor={{ false: themeColors.divider, true: themeColors.primary }}
              thumbColor={theme === "dark" ? themeColors.gold : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>Show Translations</Text>
              <Text style={[styles.rowSub, { color: themeColors.textSecondary }]}>Display Sahih International meanings</Text>
            </View>
            <Switch
              value={showTranslation}
              onValueChange={setShowTranslation}
              trackColor={{ false: themeColors.divider, true: themeColors.primary }}
              thumbColor={showTranslation ? themeColors.gold : "#f4f3f4"}
            />
          </View>

          <View style={styles.fontSizeRow}>
            <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>Arabic Font Size ({arabicFontSize}px)</Text>
            <View style={styles.fontStepper}>
              <TouchableOpacity
                onPress={() => setArabicFontSize(Math.max(20, arabicFontSize - 2))}
                style={[styles.stepperBtn, { borderColor: themeColors.surfaceBorder }]}
              >
                <Text style={{ color: themeColors.textPrimary, fontWeight: "700" }}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.stepperVal, { color: themeColors.textPrimary }]}>{arabicFontSize}</Text>
              <TouchableOpacity
                onPress={() => setArabicFontSize(Math.min(42, arabicFontSize + 2))}
                style={[styles.stepperBtn, { borderColor: themeColors.surfaceBorder }]}
              >
                <Text style={{ color: themeColors.textPrimary, fontWeight: "700" }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Privacy & System Navigation */}
        <View style={[styles.section, { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder }]}>
          <Text style={[styles.sectionLabel, { color: themeColors.gold }]}>SYSTEM & PRIVACY</Text>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => router.push("/settings/privacy")}
          >
            <View style={styles.navRowLeft}>
              <Text style={styles.navIcon}>🛡️</Text>
              <View>
                <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>Audio Privacy & Data Retention</Text>
                <Text style={[styles.rowSub, { color: themeColors.textSecondary }]}>Zero raw audio retention controls</Text>
              </View>
            </View>
            <Text style={[styles.navArrow, { color: themeColors.textMuted }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => router.push("/settings/status")}
          >
            <View style={styles.navRowLeft}>
              <Text style={styles.navIcon}>⚡</Text>
              <View>
                <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>AI Engine Diagnostics</Text>
                <Text style={[styles.rowSub, { color: themeColors.textSecondary }]}>Live ping, model architecture & latency</Text>
              </View>
            </View>
            <Text style={[styles.navArrow, { color: themeColors.textMuted }]}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => router.push("/recitation/history")}
          >
            <View style={styles.navRowLeft}>
              <Text style={styles.navIcon}>📜</Text>
              <View>
                <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>Recitation History</Text>
                <Text style={[styles.rowSub, { color: themeColors.textSecondary }]}>Review past sessions and mistakes</Text>
              </View>
            </View>
            <Text style={[styles.navArrow, { color: themeColors.textMuted }]}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  sub: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 16,
    paddingBottom: 40,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  accountTextCol: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "700",
  },
  accountStatus: {
    fontSize: 12,
  },
  authBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  authBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  fontSizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
  },
  fontStepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperVal: {
    fontSize: 14,
    fontWeight: "700",
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  navRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  navIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  navArrow: {
    fontSize: 18,
    fontWeight: "700",
  },
});
