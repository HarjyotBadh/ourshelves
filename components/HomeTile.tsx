import { PlusCircle, X } from '@tamagui/lucide-icons';
import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, StyleSheet, Alert } from 'react-native';
import { Adapt, Button, Dialog, DialogDescription, Fieldset, Input, Label, Sheet, TextArea, Unspaced, XStack } from 'tamagui';

const HomeTile = ({ id, name, isAdmin, tags, enterRoom, homeLeaveRoom }) => {
    const [isOptionsDialogOpen, setOptionsDialogOpen] = useState(false)
    const [isTagsDialogOpen, setTagsDialogOpen] = useState(false)
    const [bgColor, setBgColor] = useState('');

    const colors = [
        '#ffbfd6',
        '#bfe0ff',
        '#b9f0e3',
        '#c7fcd6',
        '#f0ffbf',
        '#ffddbd',
        '#f0c2ff',
    ];
    useEffect(() => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setBgColor(randomColor);
    }, []);





    const openOptionsDialog = () => {
        setOptionsDialogOpen(true)
    }
    const closeOptionsDialog = () => {
        setOptionsDialogOpen(false)
    }

    const openTagsDialog = () => {
        setTagsDialogOpen(true)
    }
    const closeTagsDialog = () => {
        setTagsDialogOpen(false)
    }




    const roomOptions = (option: string, roomName: string, roomId: string) => {
        closeOptionsDialog();

        if (option === 'addtags') {
            console.log('Add tags');

            openTagsDialog();

        } else if (option === 'leaveroom') {
            console.log('Leave room option');

            Alert.alert(
                'Leave Room',
                `Are you sure you want to leave "${roomName}" room?`,
                [
                    {
                        text: 'No',
                        style: 'cancel',
                    },
                    {
                        text: 'Yes',
                        onPress: () => homeLeaveRoom(roomId, roomName),
                    }
                ]
            )
        } else if (option === 'deleteroom') {
            console.log('Delete room');
        }
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={enterRoom} onLongPress={openOptionsDialog} style={styles.pressable}>
                <View style={[styles.pressableSquare, { backgroundColor: bgColor }]} />
                <Text style={styles.pressableText}>{name}</Text>
            </Pressable>

            <Dialog modal open={isOptionsDialogOpen}>
                <Adapt when="sm" platform="touch">
                    <Sheet animation="medium" zIndex={200000} modal>
                        <Sheet.Frame padding="$4" gap="$4">
                            <Adapt.Contents />
                        </Sheet.Frame>
                        <Sheet.Overlay
                            animation="lazy"
                            enterStyle={{ opacity: 0 }}
                            exitStyle={{ opacity: 0 }}
                        />
                    </Sheet>
                </Adapt>

                <Dialog.Portal>
                    <Dialog.Overlay
                        key="overlay"
                        animation="slow"
                        opacity={0.5}
                        enterStyle={{ opacity: 0 }}
                        exitStyle={{ opacity: 0 }}
                    />

                    <Dialog.Content
                        bordered
                        elevate
                        key="content"
                        animateOnly={['transform', 'opacity']}
                        animation={[
                            'quicker',
                            {
                                opacity: {
                                    overshootClamping: true,
                                },
                            },
                        ]}
                        enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
                        exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
                        gap="$4"
                    >
                        <Dialog.Title>Options</Dialog.Title>

                        {isAdmin && (
                            <Button theme="active" onPress={() => roomOptions('addtags', name, id)}>
                                Add Tags
                            </Button>
                        )}
                        <Button theme="active" onPress={() => roomOptions('leaveroom', name, id)}>
                            Leave Room
                        </Button>
                        {isAdmin && (
                            <Button theme="active" onPress={() => roomOptions('deleteroom', name, id)}>
                                Delete Room
                            </Button>
                        )}

                        <XStack alignSelf="flex-end" gap="$4">
                            <Dialog.Close displayWhenAdapted asChild>
                                <Button theme="active" aria-label="Close" onPress={closeOptionsDialog}>
                                    Cancel
                                </Button>
                            </Dialog.Close>
                        </XStack>

                        <Unspaced>
                            <Dialog.Close asChild>
                                <Button
                                    position="absolute"
                                    top="$3"
                                    right="$3"
                                    size="$2"
                                    circular
                                    icon={X}
                                />
                            </Dialog.Close>
                        </Unspaced>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog>

            <Dialog modal open={isTagsDialogOpen}>
                <Adapt when="sm" platform="touch">
                    <Sheet animation="medium" zIndex={200000} modal>
                        <Sheet.Frame padding="$4" gap="$4">
                            <Adapt.Contents />
                        </Sheet.Frame>
                        <Sheet.Overlay
                            animation="lazy"
                            enterStyle={{ opacity: 0 }}
                            exitStyle={{ opacity: 0 }}
                        />
                    </Sheet>
                </Adapt>

                <Dialog.Portal>
                    <Dialog.Overlay
                        key="overlay"
                        animation="slow"
                        opacity={0.5}
                        enterStyle={{ opacity: 0 }}
                        exitStyle={{ opacity: 0 }}
                    />

                    <Dialog.Content
                        bordered
                        elevate
                        key="content"
                        animateOnly={['transform', 'opacity']}
                        animation={[
                            'quicker',
                            {
                                opacity: {
                                    overshootClamping: true,
                                },
                            },
                        ]}
                        enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
                        exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
                        gap="$4"
                    >
                        <Dialog.Title>Add Tags</Dialog.Title>

                        <Dialog.Description>
                            All tags: {tags.join(', ')}
                        </Dialog.Description>

                        

                        <XStack alignSelf="flex-end" gap="$4">
                            <Dialog.Close displayWhenAdapted asChild>
                                <Button theme="active" aria-label="Close" onPress={closeTagsDialog}>
                                    Cancel
                                </Button>
                            </Dialog.Close>
                        </XStack>

                        <Unspaced>
                            <Dialog.Close asChild>
                                <Button
                                    position="absolute"
                                    top="$3"
                                    right="$3"
                                    size="$2"
                                    circular
                                    icon={X}
                                />
                            </Dialog.Close>
                        </Unspaced>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog>
        </View>
    );
};

HomeTile.defaultProps = {
    isAdmin: false,
};

const styles = StyleSheet.create({
    container: {},
    pressable: {
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    pressableSquare: {
        width: 150,
        height: 150,
        borderRadius: 16,
    },
    pressableText: {
        color: '#000',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        margin: 20,
        padding: 20,
        backgroundColor: '#fff2cf',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 20,
    },
    optionButton: {
        padding: 10,
        backgroundColor: '#f2dca0',
        borderRadius: 8,
        marginVertical: 5,
        width: '100%',
        alignItems: 'center',
    },
    optionText: {
        color: 'black',
        fontSize: 16,
    },
    optionTextSerious: {
        color: '#ff0000',
    },
});

export default HomeTile;
