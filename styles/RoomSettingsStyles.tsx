import { Accordion, AlertDialog, Button, Input, XStack, styled } from "tamagui";

export const BACKGROUND_COLOR = "$yellow2Light";
export const HEADER_BACKGROUND = "#8B4513";
export const USER_ITEM_BACKGROUND = "#DEB887";

export const StyledAccordionItem = styled(Accordion.Item, {
  backgroundColor: "$backgroundStrong",
  marginBottom: "$2",
  overflow: "hidden",
});

export const StyledAccordionTrigger = styled(Accordion.Trigger, {
  padding: "$3",
  backgroundColor: HEADER_BACKGROUND,
});

export const StyledAccordionContent = styled(Accordion.Content, {
  padding: "$3",
  backgroundColor: BACKGROUND_COLOR,
});

export const IconWrapper = styled(XStack, {
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: 16,
  marginRight: "$2",
});

export const UserItem = styled(XStack, {
  alignItems: "center",
  paddingVertical: "$2",
  paddingHorizontal: "$3",
  marginBottom: "$2",
  backgroundColor: USER_ITEM_BACKGROUND,
});

export const Header = styled(XStack, {
  height: 60,
  backgroundColor: HEADER_BACKGROUND,
  alignItems: "center",
  paddingHorizontal: "$4",
});

export const HeaderButton = styled(Button, {
  width: 50,
  height: 50,
  justifyContent: "center",
  alignItems: "center",
});

export const SearchInput = styled(Input, {
  marginBottom: "$3",
  backgroundColor: "white",
});

export const StyledAlertDialogContent = styled(AlertDialog.Content, {
  backgroundColor: BACKGROUND_COLOR,
  borderRadius: 10,
  borderColor: HEADER_BACKGROUND,
  borderWidth: 2,
  padding: 20,
  maxWidth: 340,
});

export const StyledAlertDialogTitle = styled(AlertDialog.Title, {
  color: HEADER_BACKGROUND,
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 10,
});

export const StyledAlertDialogDescription = styled(AlertDialog.Description, {
  color: "#5D4037",
  fontSize: 16,
  marginBottom: 20,
});

export const StyledAlertDialogButton = styled(Button, {
  backgroundColor: HEADER_BACKGROUND,
  color: "white",
  fontSize: 16,
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 5,
});
