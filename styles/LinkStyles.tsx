import { StyleSheet } from 'react-native';
import { styled, View, Text, Dialog } from "tamagui";

// Container Styles
export const LinkContainer = styled(View, {
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  padding: 8,
});

export const LinkGraphicContainer = styled(View, {
  alignItems: 'center',
  justifyContent: 'center',
  width: 100,
  height: 100,
  padding: 10,
});

// Dialog Styles
export const DialogContent = styled(Dialog.Content, {
  backgroundColor: '#DEB887',
  width: '90%',
  maxWidth: 800,
  padding: 0,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  overflow: 'hidden',
})

export const DialogTitle = styled(Dialog.Title, {
  color: 'white',
  backgroundColor: '#8B4513',
  padding: '$4',
  fontSize: 20,
  textAlign: 'center',
})

export const InputGroup = styled(View, {
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$4',
  padding: '$2',
})

export const StyledInput = styled(View, {
  backgroundColor: 'white',
  borderWidth: 1,
  borderColor: '$gray8',
  flex: 1,
})

export const LinkText = styled(Text, {
  fontSize: 16,
  color: 'white',
  fontWeight: 'bold',
  textAlign: 'center',
  backgroundColor: '#8B4513',
  padding: '$2',
  borderRadius: 8,
  minWidth: 80,
  maxWidth: 120,
  overflow: 'hidden',
  variants: {
    interactive: {
      true: {
        backgroundColor: '#64b5f6',
      },
    },
    owner: {
      true: {
        backgroundColor: '#FFB74D',
      },
    },
  },
});

// StyleSheet styles
export const linkStyles = StyleSheet.create({
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
  linkSubtext: {
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
});