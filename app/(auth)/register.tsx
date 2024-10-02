import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
    Button,
    H1,
    Stack,
    YStack,
    useTheme,
    Separator,
    XStack,
    Input,
    Text,
} from "tamagui";
import { SafeAreaView, Platform } from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import validator from "validator";
import { auth, db } from "../../firebaseConfig"; 
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";


export default function RegisterScreen() {
    const router = useRouter();
    const theme = useTheme();
    const isIOS = Platform.OS === "ios";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const validateEmail = (text) => {
        setEmail(text);
        if (text && !validator.isEmail(text)) {
            setEmailError("Please enter a valid email address");
        } else {
            setEmailError("");
        }
    };

    const handleRegister = async () => {
        let errorMessage = "";
        
        if (!password || !confirmPassword) {
            errorMessage = "Please fill in both password fields.";
        } else if (password !== confirmPassword) {
            errorMessage = "Passwords do not match.";
        }

        setPasswordError(errorMessage);

        if (!errorMessage && !emailError) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await sendEmailVerification(user);
                // Store user data in Firestore
                await setDoc(doc(db, "Users", user.uid), {
                    email: user.email,
                    createdAt: new Date().toISOString(),
                    emailVerified: user.emailVerified,
                });

                console.log("Registration successful and data stored");
                onAuthStateChanged(auth, async (user) => {
                    if (user && user.emailVerified) {
                        router.push("/(tabs)");
                    } else {
                        console.log("Please verify your email to continue.");
                    }
                });
            } catch (error) {
                console.error("Registration failed", error);
                setPasswordError(error.message);
            }
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <Stack f={1} ai="center" jc="center">
                <YStack space="$4" maxWidth={600} width="100%" px="$4" py="$8" ai="center">
                    <H1 ta="center" mb="$4">
                        Register
                    </H1>

                    <YStack space="$4" width="100%">
                        <Input
                            placeholder="Email"
                            value={email}
                            onChangeText={validateEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={{ marginBottom: 20 }}
                        />
                        {emailError ? (
                            <Text color="$red10" fontSize="$2">
                                {emailError}
                            </Text>
                        ) : null}

                        <Input
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <Input
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            style={{ marginBottom: 20 }}
                        />
                        {passwordError ? (
                            <Text color="$red10" fontSize="$2">
                                {passwordError}
                            </Text>
                        ) : null}

                        <Button width="100%" onPress={handleRegister}>
                            Register
                        </Button>
                    </YStack>

                    <XStack ai="center" width="100%" my="$4">
                        <Separator flex={1} />
                        <Text mx="$2">OR</Text>
                        <Separator flex={1} />
                    </XStack>

                    <YStack space="$4" width="100%">
                        <Button
                            width="100%"
                            icon={<Feather name="phone" size={24} color={theme.color.get()} />}
                            onPress={() => console.log("Phone login pressed")}
                        >
                            Continue with Phone
                        </Button>

                        <Button
                            width="100%"
                            icon={<AntDesign name="google" size={24} color={theme.color.get()} />}
                            onPress={() => console.log("Google login pressed")}
                        >
                            Continue with Google
                        </Button>

                        {isIOS && (
                            <Button
                                width="100%"
                                icon={<AntDesign name="apple1" size={24} color={theme.color.get()} />}
                                onPress={() => console.log("Apple login pressed")}
                            >
                                Continue with Apple
                            </Button>
                        )}

                        <XStack ai="center" width="100%" my="$2">
                            <Separator flex={1} />
                            <Text mx="$2">OR</Text>
                            <Separator flex={1} />
                        </XStack>

                        <Button
                            width="100%"
                            variant="outlined"
                            onPress={() => router.push("/(auth)/login")}
                            borderColor={theme.color.get()}
                            borderWidth={1}
                        >
                            Back to Login
                        </Button>
                    </YStack>
                </YStack>
            </Stack>
        </SafeAreaView>
    );
}