import React, { useState, useEffect } from 'react';
import { View, Stack, Text, Image } from 'tamagui';
import { Pressable } from 'react-native';
import { ref as dbRef, onValue, remove, runTransaction, onDisconnect } from 'firebase/database';
import { auth, rtdb } from 'firebaseConfig';
import { PlacedItemData } from '../models/PlacedItemData';
import { Plus, X } from '@tamagui/lucide-icons';
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
}

const ShelfItemSpot: React.FC<ShelfItemSpotProps> = ({ item, position, showPlusSigns, onSpotPress, onItemRemove, onItemDataUpdate }) => {
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
                    setLockStatus({
                        lockedBy: data.userId,
                        userName: data.userName,
                        userProfilePicture: data.userProfilePicture
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
    }, [item]);

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

    const barrier = isLockedByAnotherUser ? (
        <View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10
            }}
        >
            {lockStatus.userProfilePicture ? (
                <Image
                    source={{ uri: lockStatus.userProfilePicture }}
                    style={{ width: 50, height: 50, borderRadius: 25 }}
                />
            ) : (
                <Text>{lockStatus.userName}</Text>
            )}
        </View>
    ) : null;

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
                {barrier}
                {showPlusSigns && (
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