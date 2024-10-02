import "../tamagui-web.css";

import React, { useEffect, useState } from "react";
import { useColorScheme, LogBox } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter } from "expo-router";
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
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: "(auth)/login",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [interLoaded, interError] = useFonts({
        Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
        InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
    });
    const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (interLoaded || interError) {
            // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
            SplashScreen.hideAsync();
        }
    }, [interLoaded, interError]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsUserAuthenticated(!!user);
            setTimeout(() => {
                if (user) {
                    // if the user does not have a display name, route them to 'register-display-name'
                    if (!user.displayName) {
                        router.replace("/register-display-name");
                        return;
                    } else {
                        router.replace("/(tabs)");
                    }
                } else {
                    console.log("User is signed out");
                    router.replace("/(auth)/login");
                }
            }, 0);
        });

        return () => unsubscribe();
    }, []);

    if (!interLoaded && !interError) {
        return null;
    }

    if (isUserAuthenticated === null) {
        return null;
    }

    return <RootLayoutNav />;
}

function RootLayoutNav() {
    const colorScheme = useColorScheme();

    return (
        <TamaguiProvider config={config}>
            <ToastProvider>
                <Provider>
                    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                        <Stack>
                            <Stack.Screen
                                name="(auth)"
                                options={{
                                    headerShown: false,
                                }}
                            />
                            <Stack.Screen
                                name="(tabs)"
                                options={{
                                    headerShown: false,
                                }}
                            />
                            <Stack.Screen
                                name="profile-icons"
                                options={{
                                    headerShown: true,
                                }}
                            />
                            <Stack.Screen
                                name="other_user_page"
                                options={{
                                    headerShown: true,
                                }}
                            />
                            <Stack.Screen
                                name="(room)"
                                options={{
                                    headerShown: false,
                                }}
                            />
                        </Stack>
                    </ThemeProvider>
                </Provider>
            </ToastProvider>
        </TamaguiProvider>
    );
}