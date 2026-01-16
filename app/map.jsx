import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import BottomSheet from "@gorhom/bottom-sheet";
import polyline from "@mapbox/polyline";
import MapView, { Marker, Polyline } from "react-native-maps";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

import { Ionicons } from "@expo/vector-icons";
import { useEmergencyStore } from "../src/store/emergencyStore";
import { theme } from "../src/theme/theme";

// ✅ CHANGE THIS to your laptop IP
const BACKEND_URL = "http://192.168.29.170:5000";

export default function MapScreen() {
  const { jacketId } = useLocalSearchParams();

  const mapRef = useRef(null);
  const sheetRef = useRef(null);

  const snapPoints = useMemo(() => ["18%", "52%", "80%"], []);

  const { emergencyActive, startEmergency, stopEmergency } = useEmergencyStore();

  // ✅ Jacket location (LIVE from backend)
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.209 });
  const lastLocationRef = useRef({ lat: 28.6139, lng: 77.209 });

  // ✅ Jacket health
  const [health, setHealth] = useState({
    spo2: 98,
    pulse: 78,
    temperature: 36.7,
  });

  // ✅ Hospitals list
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  // ✅ Selected hospital + route
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ distanceKm: null, durationMin: null });
  const [loadingRoute, setLoadingRoute] = useState(false);

  // ✅ Navigation mode
  const [navMode, setNavMode] = useState(false);

  // ✅ Search
  const [search, setSearch] = useState("");

  // ✅ SOS state
  const [sosSent, setSosSent] = useState(false);

  // ✅ distance function (km)
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ✅ Smooth follow marker (avoid shaky jumping)
  const animateToLocation = (lat, lng) => {
    if (!mapRef.current) return;

    mapRef.current.animateCamera(
      {
        center: { latitude: lat, longitude: lng },
        zoom: navMode ? 16 : 14,
      },
      { duration: 700 }
    );
  };

  // ✅ LIVE fetch jacket data
  useEffect(() => {
    if (!jacketId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/location/${jacketId}`);
        const data = await res.json();

        if (data.lat !== undefined && data.lng !== undefined) {
          const newLat = Number(data.lat);
          const newLng = Number(data.lng);

          const old = lastLocationRef.current;
          const diff = getDistanceKm(old.lat, old.lng, newLat, newLng);

          // ✅ update only when movement is meaningful (prevents jitter)
          if (diff > 0.02) {
            lastLocationRef.current = { lat: newLat, lng: newLng };
            setLocation({ lat: newLat, lng: newLng });

            // ✅ keep camera following in navigation
            if (navMode) animateToLocation(newLat, newLng);
          }
        }

        setHealth((prev) => ({
          spo2: data.spo2 ?? prev.spo2,
          pulse: data.pulse ?? prev.pulse,
          temperature: data.temperature ?? prev.temperature,
        }));
      } catch (err) {
        console.log("Live fetch error:", err.message);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jacketId, navMode]);

  // ✅ Fetch hospitals (FREE)
  const fetchHospitals = async () => {
    try {
      setLoadingHospitals(true);
      setHospitals([]);
      setSearch("");
      setRouteCoords([]);
      setRouteInfo({ distanceKm: null, durationMin: null });
      setSelectedHospital(null);

      const radius = 8000; // 8 km
      const query = `
[out:json];
(
  node["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
);
out;
      `;

      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: query,
      });

      const data = await res.json();

      const list = (data.elements || []).map((h) => ({
        id: String(h.id),
        name: h.tags?.name || "Hospital",
        lat: h.lat,
        lng: h.lon,
      }));

      setHospitals(list);

      // ✅ Open hospital list sheet
      setTimeout(() => {
        sheetRef.current?.snapToIndex(1);
      }, 300);
    } catch (err) {
      console.log("Hospital fetch error:", err.message);
      Alert.alert("Error", "Unable to fetch hospitals now");
    } finally {
      setLoadingHospitals(false);
    }
  };

  // ✅ Route fetch (FREE OSRM)
  const fetchRouteToHospital = async (hospital) => {
    try {
      setLoadingRoute(true);
      setRouteCoords([]);
      setRouteInfo({ distanceKm: null, durationMin: null });

      const url = `https://router.project-osrm.org/route/v1/driving/${location.lng},${location.lat};${hospital.lng},${hospital.lat}?overview=full&geometries=polyline`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.routes || data.routes.length === 0) {
        Alert.alert("Route not found", "Try another hospital");
        return;
      }

      const route = data.routes[0];

      const coords = polyline.decode(route.geometry).map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));

      setRouteCoords(coords);

      setRouteInfo({
        distanceKm: (route.distance / 1000).toFixed(2),
        durationMin: Math.ceil(route.duration / 60),
      });

      // ✅ focus map towards route start
      animateToLocation(location.lat, location.lng);
    } catch (err) {
      console.log("Route fetch error:", err.message);
      Alert.alert("Error", "Unable to fetch route now");
    } finally {
      setLoadingRoute(false);
    }
  };

  // ✅ Filter & sort hospitals
  const filteredHospitals = hospitals
    .map((h) => ({
      ...h,
      distanceKm: getDistanceKm(location.lat, location.lng, h.lat, h.lng),
    }))
    .filter((h) => h.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // ✅ Start Navigation (keeps updating)
  const startNavigation = () => {
    if (!selectedHospital) {
      Alert.alert("Select Hospital", "Please select a hospital first ✅");
      return;
    }

    setNavMode(true);

    // ✅ snap sheet down for better view
    sheetRef.current?.close();
    animateToLocation(location.lat, location.lng);
  };

  const stopNavigation = () => {
    setNavMode(false);
  };

  // ✅ Auto reroute while navigation (when jacket moves)
  useEffect(() => {
    if (!navMode || !selectedHospital) return;

    const rerouteInterval = setInterval(() => {
      fetchRouteToHospital(selectedHospital);
    }, 6000);

    return () => clearInterval(rerouteInterval);
  }, [navMode, selectedHospital, location.lat, location.lng]);

  // ✅ SOS BUTTON
  const handleSOS = async () => {
    try {
      if (sosSent) return;

      if (!jacketId) {
        Alert.alert("Error", "No Jacket ID found");
        return;
      }

      setSosSent(true);

      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const reason = "Auto SOS Activated";

      // ✅ Save to Firestore
      await addDoc(collection(db, "users", uid, "alerts"), {
        jacketId,
        reason,
        spo2: health.spo2,
        pulse: health.pulse,
        temperature: health.temperature,
        lat: location.lat,
        lng: location.lng,
        status: "ACTIVE",
        createdAt: serverTimestamp(),
      });

      startEmergency(reason);

      Alert.alert("🚨 SOS SENT", "Alert saved & Emergency Mode Activated ✅");

      // ✅ Auto fetch hospitals and open list
      fetchHospitals();
    } catch (err) {
      console.log(err);
      Alert.alert("SOS Failed", err.message);
      setSosSent(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ MAP */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Jacket Marker */}
        <Marker
          coordinate={{ latitude: location.lat, longitude: location.lng }}
          title={`Jacket: ${jacketId || "Unknown"}`}
          description={`SpO2 ${health.spo2}% | Pulse ${health.pulse} bpm`}
          pinColor={emergencyActive ? "red" : "blue"}
        />

        {/* Hospitals */}
        {hospitals.map((h) => (
          <Marker
            key={h.id}
            coordinate={{ latitude: h.lat, longitude: h.lng }}
            title={h.name}
            pinColor={selectedHospital?.id === h.id ? "green" : "purple"}
            onPress={() => {
              setSelectedHospital(h);
              fetchRouteToHospital(h);
              sheetRef.current?.snapToIndex(1);
            }}
          />
        ))}

        {/* Route */}
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={5} strokeColor="#2563EB" />
        )}
      </MapView>

      {/* ✅ TOP BAR */}
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Live Tracking</Text>

        <Pressable
          style={[styles.listBtn, { backgroundColor: theme.colors.chip }]}
          onPress={() => sheetRef.current?.snapToIndex(1)}
        >
          <Ionicons name="list" size={18} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* ✅ BOTTOM CARD */}
      <View style={styles.card}>
        {/* Header Row */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Jacket ID: {jacketId || "N/A"}</Text>

          <Pressable
            style={[styles.sosBtn, sosSent && { opacity: 0.6 }]}
            onPress={handleSOS}
          >
            <Ionicons name="alert" size={14} color="#fff" />
            <Text style={styles.sosText}>{sosSent ? "SOS Sent" : "SOS"}</Text>
          </Pressable>
        </View>

        {/* Health */}
        <View style={styles.row}>
          <Chip label="SpO2" value={`${health.spo2}%`} />
          <Chip label="Pulse" value={`${health.pulse} bpm`} />
          <Chip label="Temp" value={`${health.temperature}°C`} />
        </View>

        {/* Actions */}
        <View style={styles.btnRow}>
          <Pressable style={styles.primaryBtn} onPress={fetchHospitals}>
            {loadingHospitals ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="medical" size={16} color="#fff" />
                <Text style={styles.primaryText}>Nearby Hospitals</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={[styles.secondaryBtn, navMode && { backgroundColor: theme.colors.dangerSoft }]}
            onPress={navMode ? stopNavigation : startNavigation}
          >
            <Ionicons
              name={navMode ? "stop-circle" : "navigate"}
              size={16}
              color={navMode ? theme.colors.danger : theme.colors.text}
            />
            <Text
              style={[
                styles.secondaryText,
                navMode && { color: theme.colors.danger },
              ]}
            >
              {navMode ? "Stop" : "Start Nav"}
            </Text>
          </Pressable>
        </View>

        {/* Route Info */}
        {loadingRoute ? (
          <Text style={styles.routeText}>Finding route...</Text>
        ) : routeInfo.distanceKm ? (
          <Text style={styles.routeText}>
            ✅ {routeInfo.distanceKm} km • {routeInfo.durationMin} min
          </Text>
        ) : (
          <Text style={styles.routeText}>Select a hospital to view route</Text>
        )}
      </View>

      {/* ✅ Hospital List BottomSheet */}
      <BottomSheet ref={sheetRef} index={-1} snapPoints={snapPoints} enablePanDownToClose>
        <View style={{ padding: 14 }}>
          <Text style={styles.sheetTitle}>Hospitals Nearby ({filteredHospitals.length})</Text>

          <TextInput
            placeholder="Search hospital..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchBox}
            placeholderTextColor="#999"
          />

          <FlatList
            data={filteredHospitals}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelectedHospital(item);
                  fetchRouteToHospital(item);

                  mapRef.current?.animateCamera(
                    { center: { latitude: item.lat, longitude: item.lng }, zoom: 14 },
                    { duration: 700 }
                  );
                }}
                style={[
                  styles.hospitalItem,
                  selectedHospital?.id === item.id && styles.hospitalActive,
                ]}
              >
                <Text style={styles.hospitalName}>{item.name}</Text>
                <Text style={styles.hospitalDist}>{item.distanceKm.toFixed(2)} km away</Text>
              </Pressable>
            )}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

function Chip({ label, value }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 45,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(17,26,46,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
  },
  backText: { color: "#fff", fontWeight: "900" },

  title: { color: theme.colors.text, fontSize: 14, fontWeight: "900", flex: 1 },

  listBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  card: {
    position: "absolute",
    bottom: 18,
    left: 16,
    right: 16,
    backgroundColor: "rgba(17,26,46,0.95)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    borderRadius: 22,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  cardTitle: { color: theme.colors.text, fontWeight: "900" },

  sosBtn: {
    backgroundColor: theme.colors.danger,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  sosText: { color: "#fff", fontWeight: "900" },

  row: { flexDirection: "row", gap: 10, marginTop: 8 },

  chip: {
    flex: 1,
    backgroundColor: theme.colors.chip,
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipLabel: { color: theme.colors.muted, fontSize: 11, fontWeight: "800" },
  chipValue: { marginTop: 4, color: theme.colors.text, fontWeight: "900" },

  btnRow: { flexDirection: "row", gap: 10, marginTop: 14 },

  primaryBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryText: { color: "#fff", fontWeight: "900" },

  secondaryBtn: {
    flex: 1,
    backgroundColor: theme.colors.chip,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryText: { color: theme.colors.text, fontWeight: "900" },

  routeText: {
    marginTop: 10,
    fontSize: 12,
    color: theme.colors.muted,
    fontWeight: "700",
    textAlign: "center",
  },

  sheetTitle: { fontWeight: "900", fontSize: 16, marginBottom: 10 },

  searchBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },

  hospitalItem: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  hospitalActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
  },

  hospitalName: { fontWeight: "900" },
  hospitalDist: { marginTop: 4, fontSize: 12, color: "#666" },
});
