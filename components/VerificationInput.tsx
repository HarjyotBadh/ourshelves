import React, { useRef } from "react";
import { TextInput, StyleSheet } from "react-native";
import { XStack, useTheme } from "tamagui";

interface VerificationInputProps {
    code: string;
    setCode: (code: string) => void;
}

const VerificationInput: React.FC<VerificationInputProps> = ({ code, setCode }) => {
    const theme = useTheme();
    const inputRefs = useRef<Array<TextInput | null>>([]);

    const handleChangeText = (text: string, index: number) => {
        const newCode = code.split("");
        newCode[index] = text;
        setCode(newCode.join(""));

        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (event: any, index: number) => {
        if (event.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const styles = StyleSheet.create({
        input: {
            width: 50,
            height: 50,
            borderRadius: 8,
            borderColor: theme.borderColor.get(),
            borderWidth: 1,
            textAlign: 'center',
            fontSize: 18,
            color: theme.color.get(), // Use the theme's text color
            backgroundColor: theme.background.get(), // Use the theme's background color
        },
    });

    return (
        <XStack space="$2" justifyContent="center">
            {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    value={code[index] || ""}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onKeyPress={(event) => handleKeyPress(event, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={styles.input}
                />
            ))}
        </XStack>
    );
};

export default VerificationInput;