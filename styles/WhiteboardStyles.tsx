import { styled, Button, View } from "tamagui";
import { StyleSheet } from "react-native";
export const colors = ["black", "red", "blue", "green", "purple", "yellow"];

export const ColorButton = styled(Button, {
  width: 30,
  height: 30,
  borderRadius: 15,
  marginHorizontal: 5,
  variants: {
    selected: {
      true: {
        borderColor: "$pink4",
        borderWidth: 2,
      },
    },
  },
});

export const WhiteboardView = styled(View, {
  width: "100%",
  height: "100%",
  borderRadius: "$2",
  backgroundColor: "#DEB887",
});

export const CanvasContainer = styled(View, {
  backgroundColor: "white",
  borderWidth: 2,
  borderColor: "$pink4",
  borderRadius: 8,
  overflow: "hidden",
});

export const ButtonContainer = styled(View, {
  flexDirection: "row",
  justifyContent: "center",
  marginTop: "$4",
});

export const BOTTOM_BAR_HEIGHT = 20;

export const BottomBar = styled(View, {
  width: "150%",
  height: BOTTOM_BAR_HEIGHT,
  backgroundColor: "#8B4513",
  position: "absolute",
  bottom: 0,
});

export const styles = StyleSheet.create({
  previewStyle: {
    height: 55,
    borderRadius: 50,
    marginBottom: 30,
  },
  sliderStyle: {
    borderRadius: 15,
    marginBottom: 25,
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
  },
});