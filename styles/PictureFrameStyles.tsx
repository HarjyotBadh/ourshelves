import { styled, Button, View } from "tamagui";
import { StyleSheet } from "react-native";

export const PictureFrameView = styled(View, {
  borderRadius: "$2",
  backgroundColor: "#DEB887",
  alignItems: "center",
  justifyContent: "center",
  padding: 10,
});

export const ImageContainer = styled(View, {
  backgroundColor: "white",
  borderWidth: 2,
  borderColor: "$pink4",
  borderRadius: 8,
  overflow: "hidden",
  marginVertical: 10,
});

export const ButtonContainer = styled(View, {
  flexDirection: "row",
  justifyContent: "center",
  marginVertical: 5,
});

export const BOTTOM_BAR_HEIGHT = 15;

export const BottomBar = styled(View, {
  width: "100%",
  height: BOTTOM_BAR_HEIGHT,
  backgroundColor: "#8B4513",
  position: "absolute",
  bottom: 0,
});

export const styles = StyleSheet.create({
  noImageText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    padding: 10,
  },
});