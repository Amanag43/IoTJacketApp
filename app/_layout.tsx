import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";

import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCheckingAuth(false);

      if (user) {
        router.replace("/(app)/home");
      } else {
        router.replace("/(auth)/login");
      }
    });

    return unsub;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Loader */}
        <Stack.Screen name="loading" />

        {/* Auth */}
        <Stack.Screen name="(auth)" />

        {/* Main App */}
        <Stack.Screen name="(app)" />

        {/* Extra Screens */}
        <Stack.Screen name="add-device" />
        <Stack.Screen name="device-details" />
        <Stack.Screen name="edit-device" />
        <Stack.Screen name="map" />
        <Stack.Screen name="alerts" />
        <Stack.Screen name="contacts" />
        <Stack.Screen name="settings" />
      </Stack>
    </GestureHandlerRootView>
  );
}
