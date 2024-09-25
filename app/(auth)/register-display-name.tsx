import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Button, H1, Paragraph, Stack, YStack, XStack, Input, Text, useTheme } from "tamagui";
import { SafeAreaView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { auth, db } from "firebaseConfig";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

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
                    // Update the user's display name in the database
                    const userRef = doc(db, "Users", user.uid);
                    await setDoc(userRef, { displayName: displayName }, { merge: true });

                    // Update the displayName of the current user
                    await updateProfile(user, {
                        displayName: displayName,
                    });

                    router.replace("/(tabs)");
                } else {
                    setError("No user is signed in.");
                }
            } catch (err) {
                console.error("Error updating display name:", err);
                setError("Failed to update display name. Please try again.");
            }
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <Stack f={1} ai="center" jc="center">
                <XStack
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    p="$4"
                    jc="flex-start"
                    ai="center"
                >
                    <Button
                        icon={<Feather name="arrow-left" size={24} color={theme.color.get()} />}
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
                            This name will be visible to others in the app.
                            Only letters, numbers, and underscores are allowed.
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
