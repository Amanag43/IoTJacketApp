import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function Home() {
  const user = auth.currentUser;

  const jackets = [
    { id: 1, name: "My Jacket", owner: "You", status: "Normal" },
    { id: 2, name: "Father's Jacket", owner: "Father", status: "Alert" },
    { id: 3, name: "Mother's Jacket", owner: "Mother", status: "Normal" },
  ];

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Hello 👋</Text>
            <Text style={styles.username}>
              {user?.displayName || "User"}
            </Text>
          </View>

          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={26} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {/* SECTION TITLE */}
        <Text style={styles.subtitle}>Your Connected Jackets</Text>

        {/* JACKETS */}
        {jackets.map((jacket) => (
          <View key={jacket.id} style={styles.card}>
            <Ionicons name="shirt-outline" size={30} color="#4D96FF" />

            <View style={styles.cardCenter}>
              <Text style={styles.cardTitle}>{jacket.name}</Text>
              <Text style={styles.cardSub}>{jacket.owner}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    jacket.status === "Alert" ? "#FF6B6B" : "#4CD964",
                },
              ]}
            >
              <Text style={styles.statusText}>{jacket.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  hello: {
    color: "#94A3B8",
    fontSize: 16,
  },
  username: {
    color: "#F8FAFC",
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: "#E5E7EB",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardCenter: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "600",
  },
  cardSub: {
    color: "#94A3B8",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
