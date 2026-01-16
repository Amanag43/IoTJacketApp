import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

import { Ionicons } from "@expo/vector-icons";
import AppButton from "../src/components/AppButton";
import AppInput from "../src/components/AppInput";
import AppScreen from "../src/components/AppScreen";
import { theme } from "../src/theme/theme";

export default function EditDevice() {
  const { deviceId } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deviceName, setDeviceName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [jacketId, setJacketId] = useState("");

  // ✅ Fetch Device data
  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const ref = doc(db, "users", uid, "devices", deviceId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          Alert.alert("Not Found", "Device not found");
          router.back();
          return;
        }

        const d = snap.data();

        setDeviceName(d.deviceName || "");
        setAge(d.age || "");
        setWeight(d.weight || "");
        setHeight(d.height || "");
        setBloodGroup(d.bloodGroup || "");
        setAllergies(d.allergies || "");
        setJacketId(d.jacketId || "");
      } catch (err) {
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();
  }, [deviceId]);

  // ✅ Save updates
  const handleSave = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return Alert.alert("Error", "User not logged in");

      if (!deviceName.trim() || !jacketId.trim()) {
        return Alert.alert("Error", "Device Name and Jacket ID are required");
      }

      setSaving(true);

      const ref = doc(db, "users", uid, "devices", deviceId);

      await updateDoc(ref, {
        deviceName: deviceName.trim(),
        age: age.trim(),
        weight: weight.trim(),
        height: height.trim(),
        bloodGroup: bloodGroup.trim(),
        allergies: allergies.trim(),
        jacketId: jacketId.trim(),
        updatedAt: new Date().toISOString(),
      });

      Alert.alert("✅ Updated", "Device updated successfully!");
      router.back();
    } catch (err) {
      Alert.alert("Update Failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={{ color: theme.colors.muted, marginTop: 10, fontWeight: "700" }}>
            Loading device...
          </Text>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={18} color={theme.colors.text} />
        </Pressable>

        <Text style={styles.title}>Edit Device</Text>

        <View style={{ width: 42 }} />
      </View>

      {/* Form Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Update Device Info</Text>
        <Text style={styles.sub}>
          Keep jacket details updated for accurate tracking & alerts.
        </Text>

        <AppInput
          label="Device Name"
          placeholder="My Dad Jacket"
          value={deviceName}
          onChangeText={setDeviceName}
        />

        <AppInput
          label="Jacket ID"
          placeholder="JACKET123"
          value={jacketId}
          onChangeText={setJacketId}
        />

        <AppInput
          label="Age"
          placeholder="21"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <AppInput
          label="Weight (kg)"
          placeholder="70"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />

        <AppInput
          label="Height (cm)"
          placeholder="175"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />

        <AppInput
          label="Blood Group"
          placeholder="O+"
          value={bloodGroup}
          onChangeText={setBloodGroup}
        />

        <AppInput
          label="Allergies"
          placeholder="None"
          value={allergies}
          onChangeText={setAllergies}
        />

        <AppButton
          title={saving ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          disabled={saving}
          style={{ marginTop: 8 }}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  title: { color: theme.colors.text, fontSize: 18, fontWeight: "900" },

  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    padding: 16,
  },

  cardTitle: { color: theme.colors.text, fontWeight: "900", fontSize: 16 },
  sub: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 14,
  },
});
