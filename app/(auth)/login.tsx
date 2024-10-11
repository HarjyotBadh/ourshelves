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
import { SafeAreaView, Platform, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import validator from "validator";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function LoginScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [generalError, setGeneralError] = useState("");
    const [loginError, setLoginError] = useState("");

    const clearErrors = () => {
        setEmailError("");
        setPasswordError("");
        setGeneralError("");
        setLoginError("");
    };

    const handleForgotPassword = async () => {
        clearErrors();
        if (!email) {
            setEmailError("Please enter your email first");
            return;
        }

        if (!validator.isEmail(email)) {
            setEmailError("Please enter a valid email address");
            return;
        }

        try {
            // Check if the email exists
            console.log(auth);
            console.log(email);
            // const signInMethods = await fetchSignInMethodsForEmail(auth, email);

            // if (signInMethods.length === 0) {
            //     // Email doesn't exist in Firebase
            //     setGeneralError("No account found with this email address.");
            //     return;
            // }

            // Email exists, send password reset email
            await sendPasswordResetEmail(auth, email);
            setGeneralError("Password reset email sent. Please check your inbox.");
        } catch (error: any) {
            console.error("Error in password reset:", error);
            setGeneralError("An error occurred. Please try again later.");
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
        clearErrors();
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
            setLoginError("Incorrect username or password");
        }
    };

    const handlePhoneLogin = () => {
        clearErrors();
        router.push("/(auth)/phone-login");
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
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setPasswordError("");
                                    }}
                                    secureTextEntry
                                    style={{ marginBottom: 20 }}
                                />
                                {passwordError ? (
                                    <Text color="$red10" fontSize="$2">
                                        {passwordError}
                                    </Text>
                                ) : null}
                            </YStack>
                            {loginError ? (
                                <Text color="$red10" fontSize="$2">
                                    {loginError}
                                </Text>
                            ) : null}
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
                            color: "blue",
                            textDecorationLine: "underline",
                            fontSize: 14,
                            textAlign: "center",
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
                            onPress={() => {
                                clearErrors();
                                router.push("/(auth)/register");
                            }}
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
