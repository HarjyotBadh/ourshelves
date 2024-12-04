import React, { useRef } from "react";
import { TextInput, StyleSheet, View, Platform, Text } from "react-native";
import { XStack } from "tamagui";

interface VerificationInputProps {
  code: string;
  setCode: (code: string) => void;
}

const VerificationInput: React.FC<VerificationInputProps> = ({ code, setCode }) => {
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    // Remove any non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, "");
    // Limit to 6 digits
    const truncated = cleaned.slice(0, 6);
    setCode(truncated);
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.hiddenInput}
        caretHidden={true}
      />
      <XStack gap="$2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <View
            key={index}
            style={[styles.box, code[index] ? styles.boxFilled : null]}
            onTouchStart={() => inputRef.current?.focus()}
          >
            <Text style={styles.digit}>{code[index] || ""}</Text>
          </View>
        ))}
      </XStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    alignItems: "center",
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  box: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  boxFilled: {
    borderColor: "#000",
    backgroundColor: "#f0f0f0",
  },
  digit: {
    fontSize: 20,
  },
});

export default VerificationInput;
