import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { Dialog, Button, XStack, YStack, Label, Switch, Select, Separator, Text, Adapt, Sheet, Input, Anchor } from 'tamagui';
import { Trash } from "@tamagui/lucide-icons";
import { Alert } from 'react-native';

interface NoteBoxOwnerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deleteNote: (sender: string, timestamp: Timestamp) => void;
    notes: { sender: string; body: string; timestamp: Timestamp }[]
}

export const NoteBoxOwnerDialog: React.FC<NoteBoxOwnerDialogProps> = ({
    open,
    onOpenChange,
    deleteNote,
    notes
}) => {

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
                    <Dialog.Title>Your Note Box</Dialog.Title>

                    <YStack marginTop="$3" marginBottom="$3">
                        {notes.length === 0 && (
                            <Text color="rgba(0,0,0,0.4)" textAlign="center">
                                No notes available.
                            </Text>
                        )}
                        {notes.map((note, index) => (
                            <XStack
                                key={index}
                                backgroundColor="rgba(252, 232, 204, 0.8)"
                                padding="$3"
                                marginBottom="$2"
                            >
                                <YStack>
                                    <Text color="rgba(0,0,0,0.4)">from: {note.sender} • {note.timestamp.toDate().toLocaleString().split(',')[0]}</Text>
                                    <Text style={{ maxWidth: 250, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                        {note.body}
                                    </Text>
                                </YStack>
                                <Button
                                    alignSelf="center"
                                    backgroundColor="rgba(240, 222, 200, 1)"
                                    icon={Trash}
                                    marginLeft="auto"
                                    size="$4"
                                    onPress={() => {
                                        Alert.alert(
                                            "Delete Note",
                                            `Are you sure you want to delete the note from ${note.sender}?`,
                                            [
                                                {
                                                    text: "No",
                                                    style: "cancel"
                                                },
                                                {
                                                    text: "Yes",
                                                    onPress: () => {deleteNote(note.sender, note.timestamp);}
                                                }
                                            ],
                                            { cancelable: false }
                                        );
                                    }}
                                />
                            </XStack>
                        ))}
                    </YStack>

                    <Dialog.Close displayWhenAdapted asChild>
                        <Button
                            onPress={() => {
                                onOpenChange(false);
                            }}
                            theme="alt1"
                            aria-label="Save">
                            Close
                        </Button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};