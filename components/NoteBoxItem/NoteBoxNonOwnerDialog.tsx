import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { Dialog, Button, XStack, YStack, Label, Switch, Select, Separator, Text, Adapt, Sheet, Input, Anchor } from 'tamagui';
import { Trash } from "@tamagui/lucide-icons";
import { Alert } from 'react-native';

interface NoteBoxNonOwnerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    addNote: (body: string) => void;
}

export const NoteBoxNonOwnerDialog: React.FC<NoteBoxNonOwnerDialogProps> = ({
    open,
    onOpenChange,
    addNote
}) => {

    const [noteBody, setNoteBody] = React.useState('');

    return (
        <Dialog modal open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay key="overlay" />
                <Dialog.Content
                    bordered
                    elevate
                    width={380}
                    key="content"
                    animation={[
                        'quick',
                        {
                            opacity: {
                                overshootClamping: true,
                            },
                        },
                    ]}
                >
                    <Dialog.Title>Add a Note</Dialog.Title>

                    <YStack padding="$4" gap="$4">

                        <XStack width="100%" alignItems="center" gap="$4">
                            <Input
                                flex={1}
                                placeholder='Your note...'
                                value={noteBody}
                                onChangeText={setNoteBody}
                            />
                        </XStack>
                    </YStack>

                    <Dialog.Close displayWhenAdapted asChild>
                        <Button
                            onPress={() => {
                                addNote(noteBody);
                                onOpenChange(false);
                            }}
                            theme="alt1"
                            aria-label="Save">
                            Save
                        </Button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};