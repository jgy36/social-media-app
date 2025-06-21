import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get("window");

const LandingScreen = () => {
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.user);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user.token) {
      navigation.navigate("MainTabs");
    }
  }, [user.token, navigation]);

  // Check if Google OAuth credentials are configured
  const hasGoogleCredentials = !!(
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID &&
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID &&
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
  );

  // Google OAuth setup - provide dummy credentials if not configured to prevent hook errors
  const googleAuthConfig = hasGoogleCredentials
    ? {
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      }
    : {
        webClientId: "dummy-web-client-id",
        androidClientId: "dummy-android-client-id",
        iosClientId: "dummy-ios-client-id",
      };

  const [request, response, promptAsync] =
    Google.useAuthRequest(googleAuthConfig);

  useEffect(() => {
    if (response?.type === "success") {
      console.log("Google login successful", response);
      // Handle Google login logic here
    }
  }, [response]);

  const handleGoogleSignIn = () => {
    if (hasGoogleCredentials && request) {
      promptAsync();
    } else {
      console.log("Google OAuth not configured");
      // You could show an alert here if you want
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground} />
            <View style={styles.logoCircle}>
              <MaterialIcons name="how-to-vote" size={44} color="white" />
            </View>
          </View>

          <Text style={styles.title}>Political App</Text>
          <Text style={styles.subtitle}>
            Connect with your political community and make your voice heard
          </Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonsContainer}>
          {/* Google Sign Up Button - only show if credentials are configured */}
          {hasGoogleCredentials && (
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={!request}
              style={[styles.googleButton, !request && styles.disabledButton]}
              activeOpacity={0.8}
            >
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          )}

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={styles.createAccountButton}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.signInButton}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Terms and Privacy */}
        <Text style={styles.termsText}>
          By signing up, you agree to our{" "}
          <Text style={styles.linkText}>Terms of Service</Text> and{" "}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc", // Lighter background similar to shadcn
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoBackground: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  logoCircle: {
    width: 88,
    height: 88,
    backgroundColor: "#3b82f6",
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1e293b", // Darker text for better contrast
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b", // More muted subtitle
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: width * 0.05,
  },
  buttonsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  googleButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.5,
  },
  googleIcon: {
    width: 22,
    height: 22,
    backgroundColor: "#ef4444",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  googleIconText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  googleButtonText: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 16,
  },
  createAccountButton: {
    width: "100%",
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButton: {
    width: "100%",
    backgroundColor: "transparent",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  signInButtonText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 16,
  },
  termsText: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  linkText: {
    color: "#3b82f6",
    fontWeight: "500",
  },
});

export default LandingScreen;
