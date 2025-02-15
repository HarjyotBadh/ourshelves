import "../tamagui-web.css";

import React, { useEffect, useState, useRef, createContext } from "react";
import { useColorScheme, LogBox, Platform } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, SplashScreen, Stack, useRouter } from "expo-router";
import { Provider } from "./Provider";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { TamaguiProvider } from "@tamagui/core";
import { ToastProvider } from "@tamagui/toast";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import config from "tamagui.config";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { SafeAreaProvider } from "react-native-safe-area-context";

LogBox.ignoreLogs([
  /Warning:.*Support for defaultProps will be removed from function components in a future major release\. Use JavaScript default parameters instead\./,
  "No native ExpoFirebaseCore module found, are you sure the expo-firebase-core module is linked properly?",
]);

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(auth)/login",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log("Push token:", token);
    } catch (e) {
      console.error("Error getting push token:", e);
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}

// Create a context for the push token
export const PushTokenContext = createContext<string>("");

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });
  const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean | null>(null);
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserAuthenticated(!!user);

      if (user) {
        // User is signed in
        if (!user.displayName) {
          router.replace("/register-display-name");
        } else {
          router.replace("/(tabs)");
        }
      } else {
        // User is signed out - ensure they can only access auth screens
        router.replace("/(auth)/login");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => token && setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      // Handle notification
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      // Handle response
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    if (interLoaded || interError) {
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && !interError) {
    return null;
  }

  // Only render the app when we know the auth state
  if (isUserAuthenticated === null) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [expoPushToken] = useState("");
  const router = useRouter();
  const isAuthenticated = auth.currentUser !== null;

  // Prevent access to protected routes when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated]);

  return (
    <TamaguiProvider config={config}>
      <SafeAreaProvider>
        <ToastProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <PushTokenContext.Provider value={expoPushToken}>
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
                    <Stack.Screen
                      name="(tutorial)"
                      options={{
                        headerShown: false,
                      }}
                    />
                  </Stack>
                </ThemeProvider>
              </Provider>
            </PushTokenContext.Provider>
          </GestureHandlerRootView>
        </ToastProvider>
      </SafeAreaProvider>
    </TamaguiProvider>
  );
}
