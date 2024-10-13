import { styled, Button, View } from "tamagui";

export const colors = ['black', 'red', 'blue', 'green', 'purple', 'yellow'];

export const ColorButton = styled(Button, {
  width: 30,
  height: 30,
  borderRadius: 15,
  marginHorizontal: 5,
});

export const WhiteboardView = styled(View, {
  width: "100%",
  height: "100%",
  borderRadius: "$2",
});