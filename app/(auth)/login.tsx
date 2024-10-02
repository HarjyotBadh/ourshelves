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
import {SafeAreaView, Platform, StatusBar} from "react-native";
import { Feather } from "@expo/vector-icons";
import validator from "validator";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function LoginScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [generalError, setGeneralError] = useState("");

    const handleForgotPassword = async () => {
        if (!email) {
            setEmailError("Please enter your email first");
            return;
        }
    
        try {
            await sendPasswordResetEmail(auth, email);
            setGeneralError("Password reset email sent. Please check your inbox.");
        } catch (error: any) {
            if (error.code === "auth/user-not-found") {
                setGeneralError("No account found with this email address.");
            } else {
                setGeneralError("Error: " + error.message);
            }
        }
    };    

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
        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            router.replace("/(tabs)");
        } catch (error: any) {
            setGeneralError(error.message);
        }
    };

    const handlePhoneLogin = () => {
        router.push("/(auth)/phone-login");
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.get(), paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}>
            <Stack f={1} ai="center" jc="center">
                <YStack gap="$4" maxWidth={600} width="100%" px="$4" py="$8" ai="center">
                    <H1 ta="center" mb="$4">
                        OurShelves
                    </H1>

                    <Form onSubmit={handleLogin} width="100%">
                        <YStack gap="$4" width="100%">
                            <YStack gap="$2">
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
                            <YStack gap="$2">
                                <Input
                                    placeholder="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    style={{ marginBottom: 20 }}
                                />
                                {passwordError ? (
                                    <Text color="$red10" fontSize="$2">
                                        {passwordError}
                                    </Text>
                                ) : null}
                            </YStack>
                            {generalError ? (
                                <Text color="$red10" fontSize="$2">
                                    {generalError}
                                </Text>
                            ) : null}
                            <Button width="100%" onPress={handleLogin}>
                                Login
                            </Button>
                        </YStack>
                    </Form>

                    <Text
                        onPress={handleForgotPassword} 
                        style={{
                        color: 'blue',
                        textDecorationLine: 'underline', 
                        fontSize: 14, 
                        textAlign: 'center', 
                        marginTop: 10, 
                        }}
                    >
                        Forgot Password?
                    </Text>


                    <XStack ai="center" width="100%" my="$4">
                        <Separator flex={1} />
                        <Paragraph mx="$2">OR</Paragraph>
                        <Separator flex={1} />
                    </XStack>

                    <YStack gap="$4" width="100%">
                        <Button
                            width="100%"
                            onPress={handlePhoneLogin}
                            icon={<Feather name="phone" size={24} color={theme.color.get()} />}
                        >
                            Continue with Phone
                        </Button>

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
