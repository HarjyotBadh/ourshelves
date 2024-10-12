import { Dialog, Button, Text, Input, Card, YStack, styled, AlertDialog, XStack } from "tamagui";
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

export const StyledAlertDialogContent = styled(AlertDialog.Content, {
  width: "90%",
  maxWidth: 340,
  backgroundColor: "$background",
  borderRadius: "$4",
  padding: "$4",
});

export const StyledAlertDialogTitle = styled(AlertDialog.Title, {
  fontSize: "$6",
  fontWeight: "bold",
  color: "$color",
  textAlign: "center",
});

export const StyledAlertDialogDescription = styled(AlertDialog.Description, {
  fontSize: "$4",
  color: "$color",
  textAlign: "center",
  marginTop: "$2",
  marginBottom: "$4",
});

export const AlertDialogIconContainer = styled(YStack, {
  alignItems: "center",
  marginBottom: "$3",
});

export const AlertDialogButtonContainer = styled(XStack, {
  justifyContent: "center",
  width: "100%",
  gap: "$3",
});

export const AlertDialogButton = styled(StyledButton, {
  flex: 1,
});
