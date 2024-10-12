import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { Dialog, Button, Text, YStack, XStack, ScrollView, Spinner } from 'tamagui';
import { X } from '@tamagui/lucide-icons';
import { getAdminRooms } from '../project-functions/profileFunctions';
import { auth, db } from '../firebaseConfig';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

interface Room {
    id: string;
    name: string;
}

interface AddUserToRoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    userName: string;
}

const AddUserToRoomDialog: React.FC<AddUserToRoomDialogProps> = ({ open, onOpenChange, userId, userName }) => {
    const [adminRooms, setAdminRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminRooms = async () => {
            if (auth.currentUser) {
                const rooms = await getAdminRooms(auth.currentUser.uid);
                setAdminRooms(rooms);
                setLoading(false);
            }
        };

        fetchAdminRooms();
    }, []);

    const handleAddUserToRoom = async (roomId: string, roomName: string) => {
        try {
            const userRef = doc(db, 'Users', userId);
            const roomRef = doc(db, 'Rooms', roomId);

            await updateDoc(userRef, {
                rooms: arrayUnion(roomRef)
            });

            await updateDoc(roomRef, {
                users: arrayUnion(userRef)
            });

            Alert.alert('Success', `${userName} has been added to ${roomName}`);
            onOpenChange(false);
        } catch (error) {
            console.error('Error adding user to room:', error);
            Alert.alert('Error', 'Failed to add user to room. Please try again.');
        }
    };

    return (
        <Dialog modal open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay
                    key="overlay"
                    animation="quick"
                    opacity={0.5}
                    enterStyle={{ opacity: 0 }}
                    exitStyle={{ opacity: 0 }}
                />
                <Dialog.Content
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
                    y={0}
                    opacity={1}
                    scale={1}
                    width="80%"
                    height="80%"
                >
                    <YStack gap="$2">
                        <Dialog.Title>Add {userName} to Room</Dialog.Title>
                        {loading ? (
                            <Spinner size="large" />
                        ) : adminRooms.length > 0 ? (
                            <ScrollView>
                                <YStack gap="$2">
                                    {adminRooms.map((room) => (
                                        <Button
                                            key={room.id}
                                            onPress={() => handleAddUserToRoom(room.id, room.name)}
                                        >
                                            {room.name}
                                        </Button>
                                    ))}
                                </YStack>
                            </ScrollView>
                        ) : (
                            <Text>You are not an admin of any rooms.</Text>
                        )}
                        <XStack gap="$2" justifyContent="flex-end">
                            <Dialog.Close asChild>
                                <Button>Cancel</Button>
                            </Dialog.Close>
                        </XStack>
                    </YStack>
                    <Dialog.Close asChild>
                        <Button position="absolute" top="$3" right="$3" size="$2" circular icon={X} />
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};

export default AddUserToRoomDialog;