// app/tutorial/_layout.tsx
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TutorialLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="shop" />
        <Stack.Screen name="room" />
      </Stack>
    </SafeAreaView>
  );
}