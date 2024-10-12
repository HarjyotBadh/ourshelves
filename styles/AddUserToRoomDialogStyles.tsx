import { Dialog, Button, Text, Input, Card, YStack, styled } from "tamagui";
import { X } from "@tamagui/lucide-icons";

export const StyledDialogContent = styled(Dialog.Content, {
  width: "90%",
  maxWidth: 500,
  height: "80%",
  maxHeight: 600,
  padding: "$4",
  backgroundColor: "$background",
  borderRadius: "$4",
});

export const DialogTitle = styled(Text, {
  fontSize: "$6",
  fontWeight: "bold",
  color: "$color",
});

export const StyledButton = styled(Button, {
  animation: "quick",
  pressStyle: { scale: 0.97 },
});

export const RoomCard = styled(Card, {
  marginBottom: "$2",
  padding: "$3",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
});

export const CancelButton = styled(StyledButton, {
  backgroundColor: "$gray5",
  color: "$gray11",
});

export const CloseButton = styled(StyledButton, {
  position: "absolute",
  top: "$3",
  right: "$3",
  size: "$3",
  circular: true,
  icon: X,
  backgroundColor: "transparent",
  color: "$gray11",
});

export const LoadingContainer = styled(YStack, {
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
});

export const NoRoomsText = styled(Text, {
  fontSize: "$4",
  textAlign: "center",
  color: "$gray11",
});

export const SearchInput = styled(Input, {
  marginBottom: "$3",
});
