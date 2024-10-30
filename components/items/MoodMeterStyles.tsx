import { styled, View } from "tamagui";
import { StyleSheet, Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export const MoodMeterView = styled(View, {
  borderRadius: "$2",
  backgroundColor: "#F5F5F5",
  alignItems: "center",
  justifyContent: "center",
  padding: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  width: screenWidth * 0.8,
  maxHeight: screenWidth * 1.2, // Added to ensure modal doesn't get too tall
});

export const MoodContainer = styled(View, {
  flexDirection: "row",
  flexWrap: "wrap", // Added to allow wrapping of mood options
  justifyContent: "space-around",
  alignItems: "center",
  width: "100%",
  padding: 10,
});

export const MoodOption = styled(View, {
  alignItems: "center",
  justifyContent: "center",
  padding: 15,
  borderRadius: 10,
  margin: 8, // Added spacing between options
  width: screenWidth * 0.25, // Set fixed width for consistent layout
});

export const BOTTOM_BAR_HEIGHT = 15;

export const BottomBar = styled(View, {
  width: "100%",
  height: BOTTOM_BAR_HEIGHT,
  backgroundColor: "#4A90E2",
  position: "absolute",
  bottom: 0,
});

export const styles = StyleSheet.create({
  moodText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 5,
  },
  selectedMood: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 10,
  },
  modalContent: {
    padding: 20,
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});