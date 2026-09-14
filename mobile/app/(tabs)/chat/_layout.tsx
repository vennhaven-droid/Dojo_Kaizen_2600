import { Stack } from "expo-router";
import { colors } from "@/constants/Colors";

export default function ChatStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.black },
        headerTintColor: colors.gray,
        contentStyle: { backgroundColor: colors.black },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Chat" }} />
      <Stack.Screen name="[roomId]" options={{ title: "Room" }} />
    </Stack>
  );
}
