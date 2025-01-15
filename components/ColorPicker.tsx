import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ColorPicker = ({ initialColor = "#ffffff", onColorChange }) => {
  const [red, setRed] = useState(parseInt(initialColor.slice(1, 3), 16));
  const [green, setGreen] = useState(parseInt(initialColor.slice(3, 5), 16));
  const [blue, setBlue] = useState(parseInt(initialColor.slice(5, 7), 16));

  const adjustColor = (color, setColor, adjustment) => {
    const newValue = Math.min(255, Math.max(0, color + adjustment));
    setColor(newValue);
    handleColorChange();
  };

  const handleColorChange = () => {
    const hexColor = `#${[red, green, blue]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")}`;
    if (onColorChange) {
      onColorChange(hexColor);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.colorPreview, { backgroundColor: `rgb(${red}, ${green}, ${blue})` }]} />
      <Text style={styles.label}>R: {red}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => adjustColor(red, setRed, -10)}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => adjustColor(red, setRed, 10)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>G: {green}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => adjustColor(green, setGreen, -10)}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => adjustColor(green, setGreen, 10)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>B: {blue}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => adjustColor(blue, setBlue, -10)}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => adjustColor(blue, setBlue, 10)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.finalButton} onPress={handleColorChange}>
        <Text style={styles.finalButtonText}>Set Color</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    width: 250,
  },
  colorPreview: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 5,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  finalButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  finalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ColorPicker;
