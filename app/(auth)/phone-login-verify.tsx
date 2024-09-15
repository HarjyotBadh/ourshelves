import React, { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button, H1, Paragraph, Stack, YStack, useTheme, Form, XStack } from "tamagui";
import { SafeAreaView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { auth } from "firebaseConfig";
import { signInWithCredential, PhoneAuthProvider } from "firebase/auth";
import VerificationInput from "components/VerificationInput";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { Toast, useToast, useToastState } from "@tamagui/toast";

export default function PhoneLoginVerifyScreen() {
    const router = useRouter();
    const theme = useTheme();
    const params = useLocalSearchParams<{
        phoneNumber: string;
        verificationId: string;
        recaptchaVerifierOptions: string;
    }>();
    const verificationId = params.verificationId;
    const phoneNumber = params.phoneNumber;
    const [verificationCode, setVerificationCode] = useState("");
    const [timeLeft, setTimeLeft] = useState(60);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const recaptchaVerifierOptions = JSON.parse(params.recaptchaVerifierOptions || "{}");
    const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
    const toast = useToastState();
    const { show } = useToast();

    useEffect(() => {
        if (!verificationId) {
            setError("Invalid verification session. Please try again.");
            return;
        }

        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft, verificationId]);

    const handleVerify = async () => {
        if (!verificationId) {
            setError("Invalid verification session. Please try again.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
            await signInWithCredential(auth, credential);

            // Navigate to the main app
            router.replace("/(tabs)");
        } catch (err) {
            console.error("Error during verification:", err);
            setError("Invalid verification code. Please try again.");
            show("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!phoneNumber) {
            setError("Phone number is missing. Please go back and try again.");
            return;
        }

        if (!recaptchaVerifier.current) {
            setError("reCAPTCHA has not loaded yet. Please try again.");
            return;
        }

        setTimeLeft(60); // Reset the timer
        setError("");

        try {
            const phoneProvider = new PhoneAuthProvider(auth);
            const newVerificationId = await phoneProvider.verifyPhoneNumber(
                phoneNumber,
                recaptchaVerifier.current
            );
            // Update the verificationId state
            router.setParams({ verificationId: newVerificationId });
        } catch (err) {
            console.error("Error resending code:", err);
            setError("Failed to resend verification code. Please try again.");
        }
    };

    if (!verificationId || !phoneNumber) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.get() }}>
                <Stack f={1} ai="center" jc="center">
                    {/* <Text color="$red10">Invalid verification session. Please try again.</Text> */}
                    <Button onPress={() => router.back()} mt="$4">
                        Go Back
                    </Button>
                </Stack>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.get() }}>
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={auth.app.options}
                {...recaptchaVerifierOptions}
            />
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
                        onPress={() => router.back()}
                        unstyled
                    >
                        Back
                    </Button>
                </XStack>

                <YStack space="$4" maxWidth={600} width="100%" px="$4" py="$8" ai="center">
                    <H1 ta="center" mb="$4">
                        Verify Your Phone
                    </H1>

                    <Paragraph size="$2" ta="center">
                        Enter the 6-digit code sent to {phoneNumber}
                    </Paragraph>

                    <Form onSubmit={handleVerify} width="100%">
                        <YStack space="$4" width="100%" ai="center">
                            <VerificationInput
                                code={verificationCode}
                                setCode={setVerificationCode}
                            />
                            <Button
                                width="100%"
                                onPress={handleVerify}
                                disabled={verificationCode.length !== 6 || loading}
                            >
                                {loading ? "Verifying..." : "Verify"}
                            </Button>
                        </YStack>
                    </Form>

                    <XStack ai="center" mt="$4">
                        <Button onPress={handleResendCode} disabled={timeLeft > 0} unstyled>
                            Resend Code
                        </Button>
                        {timeLeft > 0 && <Paragraph ml="$2">({timeLeft}s)</Paragraph>}
                    </XStack>
                </YStack>
            </Stack>
            {toast?.message && ( // Check if toast message exists
                <Toast
                    key={toast.id}
                    duration={3000}
                    enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
                    exitStyle={{ opacity: 0, scale: 1, y: -20 }}
                    y={0}
                    opacity={1}
                    scale={1}
                    animation="quick"
                    viewportName="root"
                >
                    <YStack>
                        <Paragraph color="$color">{toast.message}</Paragraph>
                    </YStack>
                </Toast>
            )}
        </SafeAreaView>
    );
}
