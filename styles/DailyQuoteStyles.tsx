import { StyleSheet, Dimensions } from 'react-native';
import { styled, View } from "tamagui";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Constants
export const BOTTOM_BAR_HEIGHT = 20;

// Styled Components
export const QuoteView = styled(View, {
  width: SCREEN_WIDTH * 0.9,
  height: SCREEN_HEIGHT * 0.5,
  backgroundColor: '#DEB887',
  borderTopRightRadius: 12,
  borderTopLeftRadius: 12,
  overflow: 'hidden',
  justifyContent: 'space-between',
});

export const BottomBar = styled(View, {
  width: "150%",
  height: BOTTOM_BAR_HEIGHT,
  backgroundColor: "#8B4513",
  position: "absolute",
  bottom: 0,
});

export const ContentContainer = styled(View, {
  flex: 1,
  padding: 20,
  paddingBottom: 8,
});

export const QuoteContainer = styled(View, {
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  padding: 8,
});

// StyleSheet for additional styles
export const dailyQuoteStyles = StyleSheet.create({
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
    padding: 12,
    backgroundColor: '#FCE8CC',
    borderRadius: 8,
  },
  inactiveQuoteText: {
    fontSize: 14,
    color: '#8B4513',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  inactiveAuthorText: {
    fontSize: 12,
    color: '#A0522D',
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  iconContainer: {
    position: 'relative',
    top: -15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  previewContainer: {
    backgroundColor: '#FCE8CC',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quoteText: {
    fontSize: 16,
    color: '#8B4513',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  authorText: {
    fontSize: 14,
    color: '#A0522D',
    textAlign: 'right',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#8B4513',
  },
  timerText: {
    fontSize: 14,
    color: '#A0522D',
    textAlign: 'center',
    marginVertical: 12,
  },
});