import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

import { Ionicons } from "@expo/vector-icons";
import AppScreen from "../src/components/AppScreen";
import { theme } from "../src/theme/theme";

export default function SettingsScreen() {
  const email = auth.currentUser?.email || "Unknown";
  const uid = auth.currentUser?.uid || "";

  const shortUid = uid ? uid.slice(0, 6) + "..." + uid.slice(-4) : "N/A";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("✅ Logged out", "You have been logged out successfully");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <AppScreen>
      {/* ✅ HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={18} color={theme.colors.text} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subTitle}>Account & App preferences</Text>
        </View>

        <View style={{ width: 42 }} />
      </View>

      {/* ✅ PROFILE CARD */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={18} color={theme.colors.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.profileTitle}>Logged In</Text>
            <Text style={styles.profileValue} numberOfLines={1}>
              {email}
            </Text>
            <Text style={styles.profileSmall}>UID: {shortUid}</Text>
          </View>
        </View>
      </View>

      {/* ✅ APP SETTINGS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>App</Text>

        <SettingsItem
          icon="shield-checkmark"
          title="Privacy Policy"
          subtitle="View privacy policy (placeholder)"
          onPress={() => Alert.alert("Privacy Policy", "We will add it later ✅")}
        />

        <SettingsItem
          icon="document-text"
          title="Terms & Conditions"
          subtitle="View terms (placeholder)"
          onPress={() => Alert.alert("Terms", "We will add it later ✅")}
        />

        <SettingsItem
          icon="information-circle"
          title="App Version"
          subtitle="v1.0.0 (Beta)"
          onPress={() => Alert.alert("Version", "IoTJacket v1.0.0 ✅")}
        />
      </View>

      {/* ✅ SAFETY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Safety</Text>

        <SettingsItem
          icon="alert-circle"
          title="SOS Alerts"
          subtitle="View emergency logs"
          onPress={() => router.push("/alerts")}
        />

        <SettingsItem
          icon="call"
          title="Emergency Contacts"
          subtitle="Manage who gets notified"
          onPress={() => router.push("/contacts")}
        />
      </View>

      {/* ✅ DEV TOOLS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Developer Tools</Text>

        <SettingsItem
          icon="hammer"
          title="Reset SOS (Testing)"
          subtitle="Only for demo/testing purpose"
          onPress={() => Alert.alert("Reset SOS", "We will connect this to map later ✅")}
        />
      </View>

      {/* ✅ LOGOUT */}
      <Pressable
        style={styles.logoutBtn}
        onPress={() =>
          Alert.alert("Logout?", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: handleLogout },
          ])
        }
      >
        <Ionicons name="log-out-outline" size={18} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </AppScreen>
  );
}

function SettingsItem({ icon, title, subtitle, onPress }) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.itemIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.text} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSub}>{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: theme.colors.chip,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "900",
  },

  subTitle: {
    marginTop: 2,
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: 12,
  },

  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    padding: 16,
    marginBottom: 12,
  },

  cardTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 14,
    marginBottom: 12,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  profileIcon: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },

  profileTitle: {
    color: theme.colors.muted,
    fontWeight: "800",
    fontSize: 12,
  },

  profileValue: {
    marginTop: 4,
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 14,
  },

  profileSmall: {
    marginTop: 4,
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: 12,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.chip,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
  },

  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  itemTitle: { color: theme.colors.text, fontWeight: "900" },
  itemSub: { color: theme.colors.muted, fontWeight: "700", fontSize: 12, marginTop: 3 },

  logoutBtn: {
    marginTop: 6,
    backgroundColor: theme.colors.danger,
    paddingVertical: 14,
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
});
