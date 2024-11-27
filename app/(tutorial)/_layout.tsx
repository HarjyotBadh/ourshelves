// app/tutorial/_layout.tsx
import { Stack } from "expo-router";

export default function TutorialLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="shop" />
      <Stack.Screen name="room" />
    </Stack>
  );
}