import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyBRd_mfI2Aiio4G8U_yWObhiH8HzNigEr0",
  authDomain: "iotjacketapp.firebaseapp.com",
  projectId: "iotjacketapp",
  storageBucket: "iotjacketapp.appspot.com",
  messagingSenderId: "395190689721",
  appId: "1:395190689721:web:d23c423b69ccfe03fc2068",

  // 👇 ADD THESE (from Firebase console → OAuth credentials)
  webClientId:
    "395190689721-ngts22dancqnlnc5ic9qius00rvb6r84.apps.googleusercontent.com",
    androidClientId: "395190689721-2maq8i4gejqteupuokt6sepvcshocriv.apps.googleusercontent.com",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
