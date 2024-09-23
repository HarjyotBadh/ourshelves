import React from 'react';
import { AlertDialog as TamaguiAlertDialog, Button, XStack, YStack, styled, useTheme } from 'tamagui';

interface AlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const StyledContent = styled(TamaguiAlertDialog.Content, {
    backgroundColor: '$background',
    borderRadius: '$4',
    padding: '$4',
    maxWidth: 350,
    width: '90%',
    shadowColor: '$shadowColor',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
})

const StyledTitle = styled(TamaguiAlertDialog.Title, {
    color: '$color',
    fontSize: '$6',
    fontWeight: 'bold',
    marginBottom: '$2',
})

const StyledDescription = styled(TamaguiAlertDialog.Description, {
    color: '$color',
    fontSize: '$4',
    marginBottom: '$4',
})

const StyledButton = styled(Button, {
    paddingVertical: '$2',
    paddingHorizontal: '$3',
    borderRadius: '$2',
})

export const AlertDialog: React.FC<AlertDialogProps> = ({
                                                            open,
                                                            onOpenChange,
                                                            title,
                                                            description,
                                                            onConfirm,
                                                            onCancel,
                                                        }) => {
    const theme = useTheme();

    return (
        <TamaguiAlertDialog open={open} onOpenChange={onOpenChange}>
            <TamaguiAlertDialog.Portal>
                <TamaguiAlertDialog.Overlay
                    key="overlay"
                    animation="quick"
                    opacity={0.5}
                    enterStyle={{ opacity: 0 }}
                    exitStyle={{ opacity: 0 }}
                />
                <StyledContent
                    key="content"
                    animation={[
                        'quick',
                        {
                            opacity: {
                                overshootClamping: true,
                            },
                        },
                    ]}
                    enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
                    exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
                    x={0}
                    scale={1}
                    opacity={1}
                    y={0}
                >
                    <YStack gap="$2">
                        <StyledTitle>{title}</StyledTitle>
                        <StyledDescription>{description}</StyledDescription>

                        <XStack gap="$3" justifyContent="flex-end">
                            <StyledButton
                                themeInverse
                                onPress={onCancel}
                                backgroundColor="$gray5"
                                pressStyle={{ opacity: 0.8 }}
                            >
                                Cancel
                            </StyledButton>
                            <StyledButton
                                theme="active"
                                onPress={onConfirm}
                                backgroundColor={theme.blue10.get()}
                                color="white"
                                pressStyle={{ opacity: 0.8 }}
                            >
                                Confirm
                            </StyledButton>
                        </XStack>
                    </YStack>
                </StyledContent>
            </TamaguiAlertDialog.Portal>
        </TamaguiAlertDialog>
    );
};
