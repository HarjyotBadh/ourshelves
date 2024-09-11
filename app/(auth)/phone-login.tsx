import React, { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { Button, H1, Paragraph, Stack, YStack, useTheme, Form, XStack, Text } from "tamagui";
import { SafeAreaView, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import PhoneInput from "react-native-phone-number-input";

export default function PhoneLoginScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [formattedValue, setFormattedValue] = useState("");
    const [error, setError] = useState("");
    const phoneInput = useRef<PhoneInput>(null);

    const handleNext = () => {
        const checkValid = phoneInput.current?.isValidNumber(phoneNumber);
        console.log("Phone number submitted:", formattedValue, "Valid:", checkValid);

        if (checkValid) {
            setError(""); // Clear any existing error
            router.push({
                pathname: "/(auth)/phone-login-verify",
                params: { phoneNumber: formattedValue },
            });
        } else {
            setError("Please enter a valid phone number.");
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
                        onPress={() => router.back()}
                        unstyled
                    >
                        Back
                    </Button>
                </XStack>

                <YStack space="$4" maxWidth={600} width="100%" px="$4" py="$8" ai="center">
                    <H1 ta="center" mb="$4">
                        Sign in with Phone
                    </H1>

                    <Form onSubmit={handleNext} width="100%">
                        <YStack space="$4" width="100%">
                            <PhoneInput
                                ref={phoneInput}
                                defaultValue={phoneNumber}
                                defaultCode="US"
                                layout="first"
                                onChangeText={(text) => {
                                    setPhoneNumber(text);
                                    setError(""); // Clear error when user types
                                }}
                                onChangeFormattedText={(text) => {
                                    setFormattedValue(text);
                                }}
                                withDarkTheme
                                withShadow
                                autoFocus
                                containerStyle={[
                                    styles.phoneInputContainer,
                                    {
                                        backgroundColor: theme.background.get(),
                                        borderColor: theme.borderColor.get(),
                                        borderWidth: 1,
                                    },
                                ]}
                                textContainerStyle={[
                                    styles.phoneInputTextContainer,
                                    {
                                        backgroundColor: theme.background.get(),
                                        borderLeftWidth: 1,
                                        borderLeftColor: theme.borderColor.get(),
                                    },
                                ]}
                                textInputStyle={{
                                    color: theme.color.get(),
                                }}
                                codeTextStyle={{
                                    color: theme.color.get(),
                                }}
                                flagButtonStyle={{
                                    borderRightWidth: 1,
                                    borderRightColor: theme.borderColor.get(),
                                }}
                            />
                            {error ? (
                                <Text color="$red10" ta="center">
                                    {error}
                                </Text>
                            ) : (
                                <Paragraph size="$2" ta="center">
                                    We'll send you a verification code to this number.
                                </Paragraph>
                            )}
                            <Button width="100%" onPress={handleNext} disabled={!phoneNumber}>
                                Next
                            </Button>
                        </YStack>
                    </Form>
                </YStack>
            </Stack>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    phoneInputContainer: {
        width: "100%",
        borderRadius: 8,
    },
    phoneInputTextContainer: {
        borderRadius: 8,
    },
});
