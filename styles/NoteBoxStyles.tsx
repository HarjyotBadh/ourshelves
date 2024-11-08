import { StyleSheet, Dimensions } from 'react-native';
import { styled, View } from "tamagui";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Constants
export const BOTTOM_BAR_HEIGHT = 20;

// Styled Components
export const NoteBoxView = styled(View, {
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

// StyleSheet for additional styles
export const noteboxStyles = StyleSheet.create({
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
  noteCountContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  noteCountText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
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
  noteboxSubtext: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    marginTop: 2,
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
  noteList: {
    maxHeight: SCREEN_HEIGHT * 0.3,
    marginVertical: 16,
    paddingRight: 8, // Add padding for scrollbar
  },
  scrollViewContainer: {
    flex: 1,
    marginBottom: 16,
  },
  noteItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noteInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#8B4513',
  },
  noteSender: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#8B4513',
  },
  noteBody: {
    fontSize: 14,
    color: '#333',
  },
  noteTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
});