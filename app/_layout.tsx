import "../tamagui-web.css";

import React, { useEffect, useState } from "react";
import { useColorScheme, LogBox } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Slot, useRouter, useSegments } from "expo-router";
import { Provider } from "./Provider";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { TamaguiProvider } from "@tamagui/core";
import { ToastProvider } from "@tamagui/toast";
import config from "tamagui.config";

LogBox.ignoreLogs([
    "FirebaseRecaptcha: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.",
]);

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
    initialRouteName: "(auth)/login",
};

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const [user, setUser] = useState(auth.currentUser);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!user) {
            router.replace("/(auth)/login");
        } else if (user && !user.displayName) {
            router.replace("/register-display-name");
        } else if (user && segments[0] !== "(tabs)") {
            router.replace("/(tabs)");
        }
    }, [user, segments]);

    return <Slot />;
}

export default function RootLayout() {
    const [interLoaded, interError] = useFonts({
        Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
        InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
    });
    const colorScheme = useColorScheme();

    useEffect(() => {
        if (interLoaded || interError) {
            SplashScreen.hideAsync();
        }
    }, [interLoaded, interError]);

    if (!interLoaded && !interError) {
        return null;
    }

    return (
        <TamaguiProvider config={config}>
            <ToastProvider>
                <Provider>
                    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                        <RootLayoutNav />
                    </ThemeProvider>
                </Provider>
            </ToastProvider>
        </TamaguiProvider>
    );
}