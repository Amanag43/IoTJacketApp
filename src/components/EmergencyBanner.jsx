import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useEmergencyStore } from "../store/emergencyStore";
import { theme } from "../theme/theme";

export default function EmergencyBanner({ onOpenMap }) {
  const { emergencyActive, emergencyReason, stopEmergency } = useEmergencyStore();

  if (!emergencyActive) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <View style={styles.icon}>
          <Ionicons name="alert" size={18} color="#fff" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>EMERGENCY MODE ACTIVE</Text>
          <Text style={styles.sub} numberOfLines={1}>
            {emergencyReason || "SOS triggered"}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Pressable style={styles.smallBtn} onPress={onOpenMap}>
          <Text style={styles.btnText}>Track</Text>
        </Pressable>

        <Pressable
          style={[styles.smallBtn, { backgroundColor: "rgba(255,255,255,0.14)" }]}
          onPress={stopEmergency}
        >
          <Text style={styles.btnText}>Stop</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  icon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.3,
  },

  sub: {
    marginTop: 2,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "700",
    fontSize: 11,
  },

  right: {
    flexDirection: "row",
    gap: 8,
  },

  smallBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.22)",
  },

  btnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
  },
});
