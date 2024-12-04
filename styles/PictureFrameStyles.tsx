import { StyleSheet } from "react-native";
import { styled, View } from "tamagui";

export const FRAME_HEIGHT = 100;

export const PictureFrameView = styled(View, {
  width: "95%",
  backgroundColor: "#DEB887",
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  overflow: "hidden",
  height: FRAME_HEIGHT,
});

export const ImageContainer = styled(View, {
  backgroundColor: "white",
  borderWidth: 2,
  borderColor: "$pink4",
  borderRadius: 8,
  overflow: "hidden",
  width: "100%",
  height: 400,
  marginVertical: 16,
  justifyContent: "center",
  alignItems: "center",
});

export const ButtonContainer = styled(View, {
  flexDirection: "row",
  justifyContent: "center",
  marginTop: 16,
  marginBottom: 16,
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 16,
  },
  noImageText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  iconContainer: {
    position: "relative",
    top: -15,
  },
  frameSubtext: {
    fontSize: 10,
    color: "#888",
    textAlign: "center",
    marginTop: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    width: "90%",
  },
  invalidInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -5,
    marginBottom: 10,
  },
});