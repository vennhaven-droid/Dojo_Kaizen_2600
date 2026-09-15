import { Stack } from "expo-router";
import { colors } from "@/constants/Colors";

export default function AdminStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.black },
        headerTintColor: colors.gray,
        contentStyle: { backgroundColor: colors.black },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Admin" }} />
      <Stack.Screen name="[section]" options={{ title: "Admin" }} />
    </Stack>
  );
}
