import { X, Check, ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import { setRoomPublic } from 'project-functions/homeFunctions';
import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Adapt, Button, Dialog, Label, Select, Sheet, Switch, Unspaced, XStack, YStack } from 'tamagui';


const HomeTile = ({ id, name, isAdmin, tags, tagsList, isPublic, tagIdsList, enterRoom, homeLeaveRoom, homeAddTag, homeDeleteRoom }) => {
    const [isOptionsDialogOpen, setOptionsDialogOpen] = useState(false);
    const [isTagsDialogOpen, setTagsDialogOpen] = useState(false);
    const [items, setItems] = useState(tagsList);
    const [selectedTag, setSelectedTag] = useState('');
    const [bgColor, setBgColor] = useState('');
    const [roomIsPublic, setIsPublic] = useState(isPublic);

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

        setItems(tagsList);
    }, [tagsList]);

    const openOptionsDialog = () => setOptionsDialogOpen(true);
    
    // Close the options dialog and save "isPublic" option
    const closeOptionsDialog = (roomId) => {
        setRoomPublic(roomId, roomIsPublic);
        setOptionsDialogOpen(false);
    }

    const openTagsDialog = () => setTagsDialogOpen(true);
    const closeTagsDialog = () => setTagsDialogOpen(false);

    const addTag = () => {
        closeTagsDialog();

        if (selectedTag === '') {
            Alert.alert(
                'Error',
                'Please select a tag.',
            );
            return;
        }

        const tagId = tagIdsList[tagsList.indexOf(selectedTag)];
        homeAddTag(id, tagId, selectedTag);

        setSelectedTag('');
    };

    const roomOptions = (option, roomName, roomId) => {
        closeOptionsDialog(roomId);

        if (option === 'addtags') {
            openTagsDialog();

        } else if (option === 'leaveroom') {

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
            );
        } else if (option === 'deleteroom') {
            Alert.alert(
                'Leave Room',
                `Are you sure you want to delete "${roomName}" room? This action is PERMANENT.`,
                [
                    {
                        text: 'No',
                        style: 'cancel',
                    },
                    {
                        text: 'Yes',
                        onPress: () => homeDeleteRoom(roomId, roomName),
                    }
                ]
            );
        }
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={() => enterRoom(id)} onLongPress={openOptionsDialog} style={styles.pressable}>
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
                        {isAdmin && (
                            <XStack alignItems="center" gap="$5" marginTop="$4">
                                <Label size="$5">Room is Public:</Label>
                                <Switch
                                    size="$4"
                                    checked={roomIsPublic}
                                    onCheckedChange={(checked) => setIsPublic(checked)}
                                >
                                    <Switch.Thumb animation="quicker" />
                                </Switch>
                            </XStack>
                            
                        )}

                        <XStack alignSelf="flex-end" gap="$4">
                        <Dialog.Close displayWhenAdapted asChild>
                            <Button
                                theme="active"
                                aria-label="Close"
                                onPress={() => closeOptionsDialog(id)} // Pass the correct `id`
                            >
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
                            Current tags: {tags.join(', ')}
                        </Dialog.Description>

                        <XStack ai="center" gap="$4">
                            <Label htmlFor="select-demo-2" f={1} miw={80}>
                                Tag
                            </Label>

                            <Select
                                disablePreventBodyScroll
                                native
                                onValueChange={(value) => setSelectedTag(value)}
                            >
                                <Select.Trigger width={220} iconAfter={ChevronDown}>
                                    <Select.Value placeholder="Select a tag" />
                                </Select.Trigger>

                                <Adapt when="sm" platform="touch">
                                    <Sheet
                                        native={true}
                                        modal
                                        dismissOnSnapToBottom
                                        animationConfig={{
                                            type: 'spring',
                                            damping: 20,
                                            mass: 1.2,
                                            stiffness: 250,
                                        }}
                                    >
                                        <Sheet.Frame>
                                            <Sheet.ScrollView>
                                                <Adapt.Contents />
                                            </Sheet.ScrollView>
                                        </Sheet.Frame>
                                        <Sheet.Overlay
                                            animation="lazy"
                                            enterStyle={{ opacity: 0 }}
                                            exitStyle={{ opacity: 0 }}
                                        />
                                    </Sheet>
                                </Adapt>

                                <Select.Content zIndex={200000}>
                                    <Select.ScrollUpButton
                                        alignItems="center"
                                        justifyContent="center"
                                        position="relative"
                                        width="100%"
                                        height="$3"
                                    >
                                        <YStack zIndex={10}>
                                            <ChevronUp size={20} />
                                        </YStack>
                                    </Select.ScrollUpButton>

                                    <Select.Viewport minWidth={200}>
                                        <Select.Group>
                                            {React.useMemo(
                                                () =>
                                                    items.map((item, i) => {
                                                        return (
                                                            <Select.Item
                                                                index={i}
                                                                key={item}
                                                                value={item}
                                                            >
                                                                <Select.ItemText>{item}</Select.ItemText>
                                                                <Select.ItemIndicator marginLeft="auto">
                                                                    <Check size={16} />
                                                                </Select.ItemIndicator>
                                                            </Select.Item>
                                                        );
                                                    }),
                                                [items]
                                            )}
                                        </Select.Group>
                                    </Select.Viewport>

                                    <Select.ScrollDownButton
                                        alignItems="center"
                                        justifyContent="center"
                                        position="relative"
                                        width="100%"
                                        height="$3"
                                    >
                                        <YStack zIndex={10}>
                                            <ChevronDown size={20} />
                                        </YStack>
                                    </Select.ScrollDownButton>
                                </Select.Content>
                            </Select>
                        </XStack>

                        <XStack alignSelf="flex-end" gap="$4">
                            <Button theme="active" onPress={closeTagsDialog}>Cancel</Button>
                            <Button theme="active" onPress={addTag}>Add Tag</Button>
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
    container: {

    },
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
