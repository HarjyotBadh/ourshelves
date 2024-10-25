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
    top: -12,
    right: -20,
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
    // backgroundColor: '#f0f0f0', // Light gray background for visibility
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
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 400,
    overflow: 'hidden',
    backgroundColor: '#DEB887',
  },
  modalContent: {
    alignItems: 'center',
    paddingBottom: BOTTOM_BAR_HEIGHT,
    marginTop: 16,
  },
  bottomBar: {
    width: '100%',
    height: BOTTOM_BAR_HEIGHT,
    backgroundColor: '#8B4513',
    // position: 'absolute',
    bottom: 0,
  },
  calendarView: {
    backgroundColor: 'white',
    padding: 16,
    width: 300, // Set a fixed width
    height: 300, // Set the same fixed height to make it a square
    alignSelf: 'center', // Center the view horizontally
    borderRadius: 10, // Add some border radius for better aesthetics
    elevation: 3, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
