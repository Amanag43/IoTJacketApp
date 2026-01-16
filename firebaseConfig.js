import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBRd_mfI2Aiio4G8U_yWObhiH8HzNigEr0",
  authDomain: "iotjacketapp.firebaseapp.com",
  projectId: "iotjacketapp",
  storageBucket: "iotjacketapp.appspot.com",
  messagingSenderId: "395190689721",
  appId: "1:395190689721:web:d23c423b69ccfe03fc2068",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Safe Auth init (works even on reload)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
