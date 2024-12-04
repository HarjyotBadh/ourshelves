import { styled, View } from "tamagui";
import { StyleSheet } from "react-native";

export const MoodMeterContainer = styled(View, {
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  padding: "$4",
});

export const MoodDisplay = styled(View, {
  alignItems: "center",
  justifyContent: "center",
  marginVertical: "$4",
  backgroundColor: "$blue2",
  padding: "$4",
  borderRadius: "$4",
  width: "100%",
});

export const UsersList = styled(View, {
  maxHeight: 200,
  width: "100%",
  backgroundColor: "$backgroundHover",
  borderRadius: "$4",
  padding: "$2",
  marginVertical: "$4",
});

export const UserMoodItem = styled(View, {
  flexDirection: "row",
  alignItems: "center",
  padding: "$2",
  borderRadius: "$2",
  marginVertical: "$1",
  backgroundColor: "$blue2",
});

export const EmojiInput = styled(View, {
  flexDirection: "row",
  gap: "$2",
  width: "100%",
  marginVertical: "$2",
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#DEB887',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  emojiDisplay: {
    fontSize: 48,
    textAlign: 'center',
    marginVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  userMoodText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  userEmoji: {
    fontSize: 24,
    marginLeft: 8,
  },
});