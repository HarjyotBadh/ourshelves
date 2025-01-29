import React, { useState } from "react";
import { Href, useRouter } from "expo-router";
import { Button, H1, Paragraph, Stack, YStack, XStack, Input, Text, useTheme } from "tamagui";
import { Platform, SafeAreaView, StatusBar } from "react-native";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { auth, db } from "firebaseConfig";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { registerForPushNotificationsAsync } from "../_layout";

const MAX_NAME_LENGTH = 16;
const NAME_REGEX = /^[a-zA-Z0-9_]+$/;

export default function DisplayNameInputScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      // User should be auto rerouted to login screen by the onAuthStateChanged listener in root _layout.tsx
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const handleNext = async () => {
    if (displayName.trim() === "") {
      setError("Please enter a valid display name.");
    } else if (!NAME_REGEX.test(displayName)) {
      setError("Display name can only contain letters, numbers, and underscores.");
    } else {
      setError("");
      try {
        const user = auth.currentUser;

        if (user) {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

          // Get push token
          const pushToken = await registerForPushNotificationsAsync();

          // Generate default profile picture URL
          const defaultProfilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            displayName
          )}&background=random`;

          // Create a new user document with default values
          const userRef = doc(db, "Users", user.uid);
          await setDoc(userRef, {
            displayName: displayName,
            profilePicture: defaultProfilePicture,
            rooms: [],
            inventory: [],
            lastDailyGiftClaim: Timestamp.fromDate(oneWeekAgo),
            coins: 1000,
            shelfColors: [],
            wallpapers: [],
            pushToken: pushToken || null, // Store the push token
            blockedUsers: []
          });

          // Update the displayName and photoURL of the current user
          await updateProfile(user, {
            displayName: displayName,
            photoURL: defaultProfilePicture,
          });

          //router.replace("/(tabs)");
          // Redirect to tutorial instead of tabs
          router.replace("/(tutorial)/home" as Href);
        } else {
          setError("No user is signed in.");
        }
      } catch (err) {
        console.error("Error updating user data:", err);
        setError("Failed to update user data. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.background.get(),
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <Stack f={1} ai="center" jc="center">
        <XStack position="absolute" top={0} left={0} right={0} p="$4" jc="flex-start" ai="center">
          <Button
            icon={<ArrowLeft size={24} color={theme.color.get()} />}
            onPress={handleSignOut}
            unstyled
          >
            Back
          </Button>
        </XStack>

        <YStack gap="$4" maxWidth={600} width="100%" px="$4" py="$8" ai="center">
          <H1 ta="center" mb="$4">
            Set Your Display Name
          </H1>

          <Input
            placeholder="Enter your display name"
            value={displayName}
            onChangeText={(text) => {
              if (NAME_REGEX.test(text) || text === "") {
                setDisplayName(text);
                setError(""); // Clear error when user types
              }
            }}
            maxLength={MAX_NAME_LENGTH}
            width="100%"
            borderColor={theme.borderColor.get()}
            style={{
              color: theme.color.get(),
              borderRadius: 8,
              padding: 12,
            }}
          />

          {displayName.length === MAX_NAME_LENGTH && (
            <Text color="$orange10" ta="center">
              Maximum character limit reached
            </Text>
          )}

          {error ? (
            <Text color="$red10" ta="center">
              {error}
            </Text>
          ) : (
            <Paragraph size="$2" ta="center">
              This name will be visible to others in the app. Only letters, numbers, and underscores
              are allowed.
            </Paragraph>
          )}

          <Button width="100%" onPress={handleNext} disabled={!displayName.trim()}>
            Next
          </Button>
        </YStack>
      </Stack>
    </SafeAreaView>
  );
}
