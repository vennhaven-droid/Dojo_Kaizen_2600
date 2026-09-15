import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/auth";
import { colors } from "@/constants/Colors";

export default function AuthCallbackScreen() {
  const { session, ready } = useAuth();
  const params = useLocalSearchParams<{ error?: string }>();

  useEffect(() => {
    if (!ready) return;
    if (session) {
      router.replace("/(tabs)");
      return;
    }
    const timer = setTimeout(() => {
      router.replace("/(auth)/login");
    }, 4000);
    return () => clearTimeout(timer);
  }, [ready, session]);

  return (
    <View style={styles.page}>
      <ActivityIndicator color={colors.gold} />
      <Text style={styles.text}>
        {params.error ? "Google sign-in did not finish." : "Finishing sign-in…"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  text: { color: colors.muted, marginTop: 16, textAlign: "center" },
});
