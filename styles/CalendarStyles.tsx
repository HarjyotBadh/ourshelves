import { StyleSheet, Dimensions } from 'react-native';
import { BOTTOM_BAR_HEIGHT } from './WhiteboardStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const calendarStyles = StyleSheet.create({
  previewContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  eventContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  eventText: {
    fontSize: 12,
    color: '#666',
  },
  eventIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventIndicatorText: {
    color: 'white',
    fontSize: 10,
  },
  eventListContainer: {
    marginTop: 16,
    maxHeight: 150,
    width: '100%',
  },
  eventListText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333', // Ensure the text color contrasts with the background
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
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
});
