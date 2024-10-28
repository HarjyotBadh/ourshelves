import { StyleSheet, Dimensions } from 'react-native';
import { BOTTOM_BAR_HEIGHT } from './WhiteboardStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const calendarStyles = StyleSheet.create({
  previewContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  previewInner: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
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
    width: '100%',
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
    width: 300,
    height: 300,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  calendarContainer: {
    position: 'relative',
    width: 300,
    height: 300,
  },
  nextCalendarView: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  ripIndicator: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -15 }],
    zIndex: 3,
  },
  ripText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  ripButton: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
});
