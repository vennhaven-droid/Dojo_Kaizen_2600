import { useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "@/context/auth";
import { colors } from "@/constants/Colors";
import { website } from "@/lib/links";
import { supabaseConfigured } from "@/lib/supabase";

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const busy = loading || googleLoading;

  async function onSubmit() {
    setError("");
    if (!supabaseConfigured) {
      setError("Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to mobile/.env");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError("");
    if (!supabaseConfigured) {
      setError("Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to mobile/.env");
      return;
    }
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>Dojo Kaizen 2600</Text>
        <Text style={styles.title}>Member login</Text>
        <Text style={styles.sub}>Use Google or the same email and password as the website.</Text>

        <Pressable
          style={[styles.google, busy && styles.disabled]}
          onPress={() => void onGoogle()}
          disabled={busy}
        >
          <Text style={styles.googleMark}>G</Text>
          <Text style={styles.googleText}>
            {googleLoading ? "Opening Google…" : "Continue with Google"}
          </Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.or}>or</Text>
          <View style={styles.divider} />
        </View>

        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.passwordWrap}>
          <TextInput
            secureTextEntry={!showPassword}
            autoComplete="password"
            placeholder="Password"
            placeholderTextColor={colors.muted}
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            onPress={() => setShowPassword((value) => !value)}
            style={styles.showBtn}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Text style={styles.showText}>{showPassword ? "Hide" : "Show"}</Text>
          </Pressable>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={[styles.button, busy && styles.disabled]} onPress={() => void onSubmit()} disabled={busy}>
          <Text style={styles.buttonText}>{loading ? "Signing in…" : "Sign in"}</Text>
        </Pressable>

        <Pressable onPress={() => void Linking.openURL(website.forgotPassword)} style={styles.linkWrap}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
        <Pressable onPress={() => void Linking.openURL(website.enroll)} style={styles.linkWrap}>
          <Text style={styles.link}>Create account</Text>
        </Pressable>
        <Text style={styles.hint}>
          New members enroll on the website. Staff create the login after you join.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.black },
  wrap: {
    flexGrow: 1,
    backgroundColor: colors.black,
    justifyContent: "center",
    padding: 24,
  },
  kicker: {
    color: colors.gold,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: colors.gray,
    fontSize: 32,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  sub: {
    color: colors.muted,
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 20,
  },
  google: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#0D74D155",
    backgroundColor: colors.dark,
    borderRadius: 10,
    paddingVertical: 14,
  },
  googleMark: {
    color: colors.gray,
    fontWeight: "800",
    fontSize: 18,
  },
  googleText: {
    color: colors.gray,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 22,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#0D74D133" },
  or: { color: colors.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  input: {
    backgroundColor: colors.dark,
    borderColor: "#0D74D133",
    borderWidth: 1,
    borderRadius: 10,
    color: colors.gray,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  passwordWrap: {
    position: "relative",
    marginBottom: 12,
  },
  passwordInput: {
    backgroundColor: colors.dark,
    borderColor: "#0D74D133",
    borderWidth: 1,
    borderRadius: 10,
    color: colors.gray,
    paddingHorizontal: 14,
    paddingVertical: 14,
    paddingRight: 72,
    fontSize: 16,
  },
  showBtn: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  showText: { color: colors.blue, fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
  error: {
    color: colors.red,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: colors.black,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  disabled: { opacity: 0.6 },
  linkWrap: { marginTop: 16, alignItems: "center" },
  link: { color: colors.blue, fontWeight: "700" },
  hint: { color: colors.muted, marginTop: 16, textAlign: "center", fontSize: 12, lineHeight: 18 },
});
