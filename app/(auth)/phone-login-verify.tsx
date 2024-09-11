import React, { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button, H1, Paragraph, Stack, YStack, useTheme, Form, XStack, Input } from "tamagui";
import { SafeAreaView } from "react-native";
import { Feather } from "@expo/vector-icons";

const VerificationInput = ({ code, setCode }) => {
    const theme = useTheme();
    const inputRefs = useRef([]);

    const handleChangeText = (text, index) => {
        const newCode = code.split("");
        newCode[index] = text;
        setCode(newCode.join(""));

        if (text && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (event, index) => {
        if (event.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <XStack space="$2" justifyContent="center">
            {[0, 1, 2, 3, 4, 5].map((index) => (
                <Input
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    value={code[index] || ""}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onKeyPress={(event) => handleKeyPress(event, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    fontSize="$6"
                    width={50}
                    height={50}
                    borderRadius="$3"
                    borderColor={theme.borderColor.get()}
                    focusStyle={{ borderColor: theme.borderColorFocus.get() }}
                />
            ))}
        </XStack>
    );
};

export default function PhoneLoginVerifyScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
    const [verificationCode, setVerificationCode] = useState("");
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    const handleVerify = () => {
        console.log("Verification code submitted:", verificationCode);
        // If successful, navigate to the main app
        // router.replace('/(app)');
    };

    const handleResendCode = () => {
        console.log("Resending code to:", phoneNumber);
        // Implement resend code logic here
        setTimeLeft(60);
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
                                disabled={verificationCode.length !== 6}
                            >
                                Verify
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
        </SafeAreaView>
    );
}