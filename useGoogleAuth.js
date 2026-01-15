import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";
import { auth, db, firebaseConfig } from "./firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: firebaseConfig.webClientId,
     androidClientId: firebaseConfig.androidClientId,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;

      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential).then(async (userCred) => {
        const user = userCred.user;

        await setDoc(
          doc(db, "users", user.uid),
          {
            name: user.displayName,
            email: user.email,
            profilePic: user.photoURL,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      });
    }
  }, [response]);

  return {
    promptAsync: () => promptAsync({ useProxy: true }),
    request,
  };
}
