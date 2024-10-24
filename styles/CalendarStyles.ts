import { StyleSheet, Dimensions } from 'react-native';
import { BOTTOM_BAR_HEIGHT } from './WhiteboardStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const calendarStyles = StyleSheet.create({
  // ... existing styles ...

  modalWrapper: {
    borderRadius: 8,
    padding: 16,
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalContent: {
    alignItems: 'center',
    paddingBottom: BOTTOM_BAR_HEIGHT,
  },
  bottomBar: {
    width: '100%',
    height: BOTTOM_BAR_HEIGHT,
    backgroundColor: '#8B4513',
    position: 'absolute',
    bottom: 0,
  },
  // ... other styles ...
});
