import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/(app)/home");
      } else {
        router.replace("/(auth)/login");
      }
    });

    return unsub;
  }, []);

  return <Slot />;
}
