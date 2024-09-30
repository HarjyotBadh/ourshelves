import React, { useState, useEffect } from 'react';
import {View, Stack, Text, XStack, YStack, Avatar, Circle} from 'tamagui';
import { Pressable } from 'react-native';
import { ref as dbRef, onValue, remove, runTransaction, onDisconnect } from 'firebase/database';
import { auth, rtdb } from 'firebaseConfig';
import { PlacedItemData } from '../models/PlacedItemData';
import { Plus, X, Lock } from '@tamagui/lucide-icons';
import { Button } from 'tamagui';
import items from './items';
import { AlertDialog } from './AlertDialog';

interface ShelfItemSpotProps {
    item: PlacedItemData | null;
    position: number;
    showPlusSigns: boolean;
    onSpotPress: (position: number) => void;
    onItemRemove: (position: number) => void;
    onItemDataUpdate: (position: number, newItemData: Record<string, any>) => void;
    users: Record<string, any>;
}

const ShelfItemSpot: React.FC<ShelfItemSpotProps> = ({ item, position, showPlusSigns, onSpotPress, onItemRemove, onItemDataUpdate, users }) => {
    const [lockStatus, setLockStatus] = useState<{
        lockedBy: string | null;
        userName: string | null;
        userProfilePicture: string | null;
    }>({ lockedBy: null, userName: null, userProfilePicture: null });

    const [hasLock, setHasLock] = useState<boolean>(false);
    const [removeAlertOpen, setRemoveAlertOpen] = useState(false);
    const [isItemActive, setIsItemActive] = useState(false);

    useEffect(() => {
        if (item && item.shouldLock) {
            const lockRef = dbRef(rtdb, `locks/${item.id}`);

            const listener = onValue(lockRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const lockingUser = Object.values(users).find(user => user.id === data.userId);

                    setLockStatus({
                        lockedBy: data.userId,
                        userName: lockingUser?.displayName || data.userName || 'Unknown User',
                        userProfilePicture: lockingUser?.profilePicture || null
                    });

                } else {
                    setLockStatus({
                        lockedBy: null,
                        userName: null,
                        userProfilePicture: null
                    });
                }
            });

            return () => {
                listener();
            };
        }
    }, [item, users]);

    const handleItemPress = async () => {
        if (item && item.shouldLock) {
            const lockRef = dbRef(rtdb, `locks/${item.id}`);
            const user = auth.currentUser;
            if (user) {
                try {
                    const result = await runTransaction(lockRef, (currentData) => {
                        if (currentData === null) {
                            return {
                                userId: user.uid,
                                userName: user.displayName || 'Unknown User',
                                userProfilePicture: user.photoURL || null,
                                timestamp: Date.now()
                            };
                        } else if (currentData.userId === user.uid) {
                            return currentData;
                        } else {
                            return;
                        }
                    });

                    if (result.committed && result.snapshot.val().userId === user.uid) {
                        const onDisconnectRef = onDisconnect(lockRef);
                        onDisconnectRef.remove();

                        setHasLock(true);
                        setIsItemActive(true);
                    }
                } catch (error) {
                    console.error('Failed to acquire lock:', error);
                }
            }
        } else {
            setHasLock(true);
            setIsItemActive(true);
        }
    };

    const handleItemClose = async () => {
        if (item && item.shouldLock && hasLock) {
            const lockRef = dbRef(rtdb, `locks/${item.id}`);
            try {
                await remove(lockRef);
                setHasLock(false);
                setIsItemActive(false);
            } catch (error) {
                console.error('Failed to release lock:', error);
            }
        } else {
            setIsItemActive(false);
        }
    };

    useEffect(() => {
        return () => {
            if (item && item.shouldLock && hasLock) {
                const lockRef = dbRef(rtdb, `locks/${item.id}`);
                remove(lockRef).catch((error) => {
                    console.error('Failed to release lock on unmount:', error);
                });
            }
        };
    }, [item, hasLock]);

    const isLockedByAnotherUser = Boolean(lockStatus.lockedBy && lockStatus.lockedBy !== auth.currentUser?.uid);

    const handleRemovePress = () => {
        setRemoveAlertOpen(true);
    };

    const handleConfirmRemove = () => {
        onItemRemove(position);
        setRemoveAlertOpen(false);
    };

    const renderItem = (item: PlacedItemData | null, position: number) => {
        if (!item) return null;

        const ItemComponent = items[item.itemId];
        if (ItemComponent) {
            return (
                <ItemComponent
                    itemData={item.itemData}
                    onDataUpdate={(newItemData) => onItemDataUpdate(position, newItemData)}
                    isActive={isItemActive}
                    onClose={handleItemClose}
                />
            );
        } else {
            return <Text>Unknown Item</Text>;
        }
    };


    const LockOverlay = () => (
        <View
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="rgba(0,0,0,0.7)"
            justifyContent="center"
            alignItems="center"
            zIndex={10}
        >
            <YStack alignItems="center" gap="$3">
                <XStack
                    backgroundColor="$gray1"
                    borderRadius="$4"
                    padding="$2"
                    alignItems="center"
                    gap="$2"
                    elevation={4}
                >
                    <Avatar circular size="$4">
                        <Avatar.Image src={lockStatus.userProfilePicture || undefined} />
                        <Avatar.Fallback backgroundColor="$blue5">
                            <Text color="$blue11" fontSize="$3" fontWeight="bold">
                                {lockStatus.userName?.[0]?.toUpperCase()}
                            </Text>
                        </Avatar.Fallback>
                    </Avatar>
                    <Circle size="$3" backgroundColor="$red10">
                        <Lock size={16} color="white" />
                    </Circle>
                </XStack>
                <Text
                    color="white"
                    fontSize="$3"
                    fontWeight="bold"
                    textAlign="center"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {lockStatus.userName || 'Unknown User'}
                </Text>
            </YStack>
        </View>
    );


    if (!item) {
        if (showPlusSigns) {
            return (
                <Button
                    unstyled
                    onPress={() => onSpotPress(position)}
                    width="30%"
                    height="100%"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Plus color="black" size={24} />
                </Button>
            );
        } else {
            return <View width="30%" height="100%" />;
        }
    } else {
        return (
            <Stack key={position} width="30%" height="100%" position="relative">
                <Pressable
                    onPress={handleItemPress}
                    disabled={isLockedByAnotherUser}
                    style={{ flex: 1 }}
                >
                    {renderItem(item, position)}
                </Pressable>
                {isLockedByAnotherUser && <LockOverlay />}
                {showPlusSigns && !isLockedByAnotherUser && (
                    <Button
                        unstyled
                        onPress={handleRemovePress}
                        position="absolute"
                        top={5}
                        right={5}
                        width={24}
                        height={24}
                        justifyContent="center"
                        alignItems="center"
                        backgroundColor="$red10"
                        borderRadius="$2"
                        zIndex={20}
                        elevate
                    >
                        <X color="white" size={16} />
                    </Button>
                )}
                <AlertDialog
                    open={removeAlertOpen}
                    onOpenChange={setRemoveAlertOpen}
                    title="Remove Item"
                    description="Are you sure you want to remove this item?"
                    onConfirm={handleConfirmRemove}
                    onCancel={() => setRemoveAlertOpen(false)}
                />
            </Stack>
        );
    }
};

export default ShelfItemSpot;