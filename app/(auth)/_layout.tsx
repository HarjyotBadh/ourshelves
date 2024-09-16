import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="phone-login" />
            <Stack.Screen name="phone-login-verify" />
            <Stack.Screen name="register-display-name" />
        </Stack>
    );
}
