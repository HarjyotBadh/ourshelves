import { styled, Button, View } from "tamagui";

export const colors = ['black', 'red', 'blue', 'green', 'purple', 'yellow'];

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
  backgroundColor: "$pink7",
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