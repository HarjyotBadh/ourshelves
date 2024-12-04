import { styled, YStack, View } from 'tamagui';

export const StorybookView = styled(YStack, {
    flex: 1,
    backgroundColor: '#F0E68C',
    borderRadius: 10,
    overflow: 'hidden',
});

export const PageContainer = styled(View, {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
});

export const PageContent = styled(View, {
    width: '90%',
    height: '90%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
});
