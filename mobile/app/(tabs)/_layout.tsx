import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useAuth } from "@/context/auth";
import { colors } from "@/constants/Colors";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

export default function TabLayout() {
  const { ready, session } = useAuth();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.black }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: useClientOnlyValue(false, true),
        headerStyle: { backgroundColor: colors.black },
        headerTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.black,
          borderTopColor: "#0D74D133",
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Train",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "figure.walk", android: "directions_walk", web: "directions_walk" }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: "Billing",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "creditcard", android: "credit_card", web: "credit_card" }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "bubble.left.and.bubble.right", android: "forum", web: "forum" }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "person.circle", android: "account_circle", web: "account_circle" }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
    </Tabs>
  );
}
