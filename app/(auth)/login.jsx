import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { router } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useGoogleAuth } from "../../useGoogleAuth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { promptAsync, request } = useGoogleAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "All fields are required");
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Logged in!");
      // ❌ no manual navigation
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/iotjacket_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>IoTJacketApp</Text>
      </View>

      {/* Login Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <View style={styles.inputBox}>
          <Ionicons name="mail" size={20} color="#666" style={styles.icon} />
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputBox}>
          <Ionicons
            name="lock-closed"
            size={20}
            color="#666"
            style={styles.icon}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Email Login */}
        <Pressable style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>Login</Text>
        </Pressable>

        {/* Google Login */}
        <Pressable
          style={[styles.btn, styles.googleBtn]}
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <Ionicons name="logo-google" size={20} color="#000" />
          <Text style={styles.googleText}>Continue with Google</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/(auth)/signup")}>
          <Text style={styles.link}>Don't have an account? Sign up</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7",
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 5,
    color: "#111",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "#111",
  },
  btn: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  googleBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  googleText: {
    color: "#000",
    fontWeight: "600",
  },
  link: {
    textAlign: "center",
    marginTop: 12,
    color: "#007aff",
    fontWeight: "500",
  },
});
