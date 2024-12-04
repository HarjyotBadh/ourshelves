import { StyleSheet, Dimensions } from 'react-native';
import { styled, View, Dialog } from "tamagui";

const { width: screenWidth } = Dimensions.get('window');

// Constants
export const BOTTOM_BAR_HEIGHT = 20;

// Styled Components
export const RiddleView = styled(View, {
  width: screenWidth * 0.9,
  height: screenWidth * 0.9,
  backgroundColor: '#DEB887',
  borderTopRightRadius: 12,
  borderTopLeftRadius: 12,
  overflow: 'hidden',
  justifyContent: 'space-between',
});

export const ContentContainer = styled(View, {
  flex: 1,
  padding: 20,
  paddingBottom: 8,
});

export const BottomBar = styled(View, {
  width: "150%",
  height: BOTTOM_BAR_HEIGHT,
  backgroundColor: "#8B4513",
  position: "absolute",
  bottom: 0,
});

export const RiddleTextContainer = styled(View, {
  backgroundColor: '#8B4513',
  padding: 16,
  borderRadius: 8,
  marginVertical: 12,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
});

// StyleSheet styles
export const riddleStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  inactiveContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 8,
  },
  riddlePrompt: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  riddleInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
    fontSize: 16,
    color: '#333',
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  ownerNameContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  ownerNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  riddleSubtext: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    marginTop: 2,
  }
});