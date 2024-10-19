import { Dimensions, StyleSheet } from "react-native";
import { BOTTOM_BAR_HEIGHT } from "./WhiteboardStyles";
import { Toast } from "@tamagui/toast";
import { YStack, Text } from "tamagui";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const ROCK_SIZE = 100;
const CANVAS_PADDING = 20;
export const petRockStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalWrapper: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
    backgroundColor: "#DEB887",
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#F0E68C',
    borderWidth: 2,
    borderColor: '#8B4513',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
    height: screenHeight * 0.5 + CANVAS_PADDING,
  },
  rock: {
    width: ROCK_SIZE,
    height: ROCK_SIZE,
    position: 'absolute',
  },
  inactiveContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  outfitImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export const rockShopStyles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    height: "80%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollView: {
    width: "100%",
    marginBottom: 20,
  },
});
