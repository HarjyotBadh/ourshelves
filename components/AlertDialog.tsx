import React from 'react';
import {AlertDialog as TamaguiAlertDialog, Button, XStack} from 'tamagui';

interface AlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
                                                            open,
                                                            onOpenChange,
                                                            title,
                                                            description,
                                                            onConfirm,
                                                            onCancel,
                                                        }) => {
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
                <TamaguiAlertDialog.Content
                    bordered
                    elevate
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
                    <TamaguiAlertDialog.Title>{title}</TamaguiAlertDialog.Title>
                    <TamaguiAlertDialog.Description>{description}</TamaguiAlertDialog.Description>

                    <XStack gap="$3" justifyContent="flex-end">
                        <Button onPress={onCancel}>Cancel</Button>
                        <Button theme="active" onPress={onConfirm}>
                            Confirm
                        </Button>
                    </XStack>
                </TamaguiAlertDialog.Content>
            </TamaguiAlertDialog.Portal>
        </TamaguiAlertDialog>
    );
};