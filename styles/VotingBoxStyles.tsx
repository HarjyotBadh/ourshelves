import { StyleSheet } from 'react-native';
import { styled, View, Dialog, Text } from "tamagui";

// Container Styles
export const VotingBoxContainer = styled(View, {
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  padding: 8,
});

// Base Dialog Styles
export const DialogContent = styled(Dialog.Content, {
  backgroundColor: '#DEB887',
  width: '90%',
  maxWidth: 800,
  padding: 0,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  overflow: 'hidden',
});

export const DialogTitle = styled(Dialog.Title, {
  color: 'white',
  backgroundColor: '#8B4513',
  padding: '$5',
  fontSize: 24,
  textAlign: 'center',
});

// Input and Form Styles
export const InputGroup = styled(View, {
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$4',
  padding: '$4',
  marginVertical: '$2',
});

// Results Styles
export const ResultRow = styled(View, {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$3',
  borderRadius: 8,
});

export const VoteItem = styled(View, {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$2',
  backgroundColor: 'rgba(252, 232, 204, 0.8)',
  borderRadius: 8,
  marginVertical: '$1',
});

export const WinnerRow = styled(ResultRow, {
  backgroundColor: 'rgba(255, 246, 201, 0.7)',
});

// StyleSheet styles
export const votingStyles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    top: -15,
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
  voteSubtext: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    marginTop: 2,
  },
  bottomBar: {
    height: 20,
    backgroundColor: '#8B4513',
    marginTop: 'auto',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  dialogContent: {
    padding: 16,
  },
  topic: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'white',
    color: 'black',
    borderWidth: 1,
    borderColor: '#ccc',
    height: 40,
    fontSize: 16,
    padding: 8,
    borderRadius: 8,
  },
  select: {
    minWidth: 200,
  },
});