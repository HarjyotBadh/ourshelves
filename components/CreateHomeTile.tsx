import { PlusCircle, X } from '@tamagui/lucide-icons'
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import {
    Adapt,
    Button,
    Dialog,
    Fieldset,
    Input,
    Label,
    Sheet,
    TextArea,
    Unspaced,
    View,
    XStack,
} from 'tamagui'

const CreateHomeTile = ({ handleCreateRoom }) => {
    const [roomName, setRoomName] = React.useState('')
    const [roomDescription, setRoomDescription] = React.useState('')

    const createRoom = () => {
        handleCreateRoom(roomName, roomDescription);
    }

    return (
        <Dialog modal>
            <Dialog.Trigger asChild>
                <Pressable style={styles.pressable}>
                    <View style={styles.pressableSquare}>
                        <PlusCircle size={75} color="rgba(0, 0, 0, 0.2)" />
                    </View>
                    <Text style={styles.pressableText}>Create Room</Text>
                </Pressable>
            </Dialog.Trigger>

            <Adapt when="sm" platform="touch">
                <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom>
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
                    <Dialog.Title>Create Room</Dialog.Title>
                    <Dialog.Description>
                        Create a room here.
                    </Dialog.Description>
                    <Fieldset gap="$4" horizontal>
                        <Label width={160} justifyContent="flex-end" htmlFor="name">
                            Name
                        </Label>
                        <Input
                            flex={1}
                            id="roomName"
                            placeholder='Room name'
                            value={roomName}
                            onChangeText={setRoomName}
                        />
                    </Fieldset>
                    <Fieldset gap="$4" horizontal>
                        <Label width={160} justifyContent="flex-end" htmlFor="description">
                            Description
                        </Label>
                        <TextArea
                            flex={1}
                            id="roomDescription"
                            placeholder='Room description'
                            value={roomDescription}
                            onChangeText={setRoomDescription}
                        />
                    </Fieldset>

                    <XStack alignSelf="flex-end" gap="$4">
                        <Dialog.Close displayWhenAdapted asChild>
                            <Button theme="active" aria-label="Close" onPress={createRoom}>
                                Create room
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
    )

    // <View style={styles.createHomeContainer}>
    //     <Pressable onPress={handlePress} style={styles.pressable}>
    //         <View style={styles.pressableSquare}>
    //             <PlusCircle size={75} color="rgba(0, 0, 0, 0.2)" />
    //         </View>
    //         <Text style={styles.pressableText}>Create Room</Text>
    //     </Pressable>
    // </View>
}

const styles = StyleSheet.create({
    createHomeContainer: {

    },
    pressable: {
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    pressableSquare: {
        width: 150,
        height: 150,
        borderWidth: 8,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 15,
        borderStyle: 'dashed',

        justifyContent: 'center',
        alignItems: 'center',
    },
    pressableText: {
        color: '#000',
        fontSize: 16,
    },
});

export default CreateHomeTile;