import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
    Button,
    H1,
    Paragraph,
    Stack,
    YStack,
    useTheme,
    Separator,
    XStack,
    Input,
    Form,
    Text,
} from "tamagui";
import { SafeAreaView, Platform } from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import validator from "validator";
import db from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function LoginScreen() {
    const router = useRouter();
    const theme = useTheme();
    const isIOS = Platform.OS === "ios";
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const validateEmail = (text: string) => {
        setEmail(text);
        if (text && !validator.isEmail(text)) {
            setEmailError("Please enter a valid email address");
        } else {
            setEmailError("");
        }
    };

    const handleLogin = async () => {
        if (!validator.isEmail(email)) {
            setEmailError("Please enter a valid email address");
            return;
        }
    };

    const handlePhoneLogin = () => {
        // Navigate to phone login screen
        router.push("/(auth)/phone-login");
    };

    const handleGoogleLogin = () => {
        // Implement Google login logic
        console.log("Google login pressed");
    };

    const handleAppleLogin = () => {
        // Implement Apple login logic
        console.log("Apple login pressed");
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <Stack f={1} ai="center" jc="center">
                <YStack space="$4" maxWidth={600} width="100%" px="$4" py="$8" ai="center">
                    <H1 ta="center" mb="$4">
                        OurShelves
                    </H1>

                    <Form onSubmit={handleLogin} width="100%">
                        <YStack space="$4" width="100%">
                            <YStack space="$2">
                                <Input
                                    placeholder="Email"
                                    value={email}
                                    onChangeText={validateEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                {emailError ? (
                                    <Text color="$red10" fontSize="$2">
                                        {emailError}
                                    </Text>
                                ) : null}
                            </YStack>
                            <YStack space="$2">
                                <Input placeholder="Password" secureTextEntry />
                            </YStack>
                            <Button width="100%" onPress={handleLogin}>
                                Login
                            </Button>
                        </YStack>
                    </Form>

                    <XStack ai="center" width="100%" my="$4">
                        <Separator flex={1} />
                        <Paragraph mx="$2">OR</Paragraph>
                        <Separator flex={1} />
                    </XStack>

                    <YStack space="$4" width="100%">
                        <Button
                            width="100%"
                            onPress={handlePhoneLogin}
                            icon={<Feather name="phone" size={24} color={theme.color.get()} />}
                        >
                            Continue with Phone
                        </Button>

                        <Button
                            width="100%"
                            onPress={handleGoogleLogin}
                            icon={<AntDesign name="google" size={24} color={theme.color.get()} />}
                        >
                            Continue with Google
                        </Button>

                        {isIOS && (
                            <Button
                                width="100%"
                                onPress={handleAppleLogin}
                                icon={
                                    <AntDesign name="apple1" size={24} color={theme.color.get()} />
                                }
                            >
                                Continue with Apple
                            </Button>
                        )}

                        <XStack ai="center" width="100%" my="$2">
                            <Separator flex={1} />
                            <Paragraph mx="$2">OR</Paragraph>
                            <Separator flex={1} />
                        </XStack>

                        <Button
                            width="100%"
                            variant="outlined"
                            onPress={() => router.push("/(auth)/register")}
                            borderColor={theme.color.get()}
                            borderWidth={1}
                        >
                            Create an Account
                        </Button>
                    </YStack>
                </YStack>
            </Stack>
        </SafeAreaView>
    );
}
