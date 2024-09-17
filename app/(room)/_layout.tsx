import { Stack } from "expo-router";

export default function RoomLayout() {
    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen name="room" />
        </Stack>
    );
}
