import { Dimensions, StyleSheet } from "react-native";
import { BOTTOM_BAR_HEIGHT } from "./WhiteboardStyles";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
export const petRockStyles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalWrapper: {
      width: screenWidth * 0.9,
      height: screenHeight * 0.5,
      backgroundColor: "#DEB887",
      borderRadius: 16,
      overflow: "hidden",
      justifyContent: "space-between",
    },
    modalContent: {
      flex: 1,
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    imageContainer: {
      width: 200,
      height: 200,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    rockImage: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    outfitImage: {
      width: "100%",
      height: "100%",
      position: "absolute",
    },
    inactiveContainer: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    inactiveRockImage: {
      width: "100%",
      height: "100%",
      position: "absolute",
    },
    inactiveOutfitImage: {
      width: "100%",
      height: "100%",
      position: "absolute",
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