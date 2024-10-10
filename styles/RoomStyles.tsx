import { Button, styled, View, XStack, YStack } from "tamagui";
import { Platform, SafeAreaView, StatusBar } from "react-native";

export const BACKGROUND_COLOR = "$yellow2Light";
export const HEADER_BACKGROUND = "#8B4513";

export const Container = styled(YStack, {
  flex: 1,
  backgroundColor: BACKGROUND_COLOR,
});

export const Content = styled(View, {
  flex: 1,
});

export const Header = styled(XStack, {
  height: 60,
  backgroundColor: HEADER_BACKGROUND,
  alignItems: "center",
  paddingHorizontal: "$4",
});

export const SafeAreaWrapper = styled(SafeAreaView, {
  flex: 1,
  backgroundColor: HEADER_BACKGROUND,
  paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
});

export const HeaderButton = styled(Button, {
  width: 50,
  height: 50,
  justifyContent: "center",
  alignItems: "center",
});
