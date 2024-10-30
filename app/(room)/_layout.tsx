import { AudioProvider } from "components/AudioContext";
import { Stack } from "expo-router";

export default function RoomLayout() {
    return (
        <AudioProvider>
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="room" />
        </Stack>
        </AudioProvider>
    );
}
