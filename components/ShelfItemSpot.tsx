import React, { useState, useEffect } from "react";
import { View, Stack, Text, XStack, YStack, Avatar, Circle } from "tamagui";
import { Pressable } from "react-native";
import { ref as dbRef, onValue, remove, runTransaction, onDisconnect } from "firebase/database";
import { auth, rtdb } from "firebaseConfig";
import { PlacedItemData } from "../models/RoomData";
import { Plus, X, Lock } from "@tamagui/lucide-icons";
import { Button } from "tamagui";
import items from "./items";
import { AlertDialog } from "./AlertDialog";

interface ShelfItemSpotProps {
  item: PlacedItemData | null;
  position: number;
  showPlusSigns: boolean;
  onSpotPress: (position: number) => void;
  onItemRemove: (position: number) => void;
  onItemDataUpdate: (position: number, newItemData: Record<string, any>) => void;
  users: Record<string, any>;
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
    roomId: string;
  };
}

const ShelfItemSpot: React.FC<ShelfItemSpotProps> = ({
  item,
  position,
  showPlusSigns,
  onSpotPress,
  onItemRemove,
  onItemDataUpdate,
  users,
  roomInfo,
}) => {
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
          const lockingUser = Object.values(users).find((user) => user.id === data.userId);

          setLockStatus({
            lockedBy: data.userId,
            userName: lockingUser?.displayName || data.userName || "Unknown User",
            userProfilePicture: lockingUser?.profilePicture || null,
          });
        } else {
          setLockStatus({
            lockedBy: null,
            userName: null,
            userProfilePicture: null,
          });
        }
      });

      return () => {
        listener();
      };
    }
  }, [item, users]);

  /**
   * Handles the press event on an item in the shelf.
   *
   * This function performs the following actions:
   * 1. If the item requires locking:
   *    a. Attempts to acquire a lock on the item in the real-time database.
   *    b. If successful, sets up an onDisconnect handler to release the lock when the user disconnects.
   *    c. Updates the local state to reflect that the user has the lock and the item is active.
   * 2. If the item doesn't require locking:
   *    a. Simply sets the item as active in the local state.
   *
   * @async
   * @throws Will log an error to the console if acquiring the lock fails.
   */
  const handleItemPress = async () => {
    if (showPlusSigns) return;

    if (item && item.shouldLock) {
      const lockRef = dbRef(rtdb, `locks/${item.id}`);
      const user = auth.currentUser;
      if (user) {
        try {
          const result = await runTransaction(lockRef, (currentData) => {
            if (currentData === null) {
              return {
                userId: user.uid,
                userName: user.displayName || "Unknown User",
                userProfilePicture: user.photoURL || null,
                timestamp: Date.now(),
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
          console.error("Failed to acquire lock:", error);
        }
      }
    } else {
      setHasLock(true);
      setIsItemActive(true);
    }
  };

  /**
   * Handles the closing of an active item.
   *
   * This function performs the following actions:
   * 1. If the item requires locking and the user has the lock:
   *    a. Attempts to remove the lock from the real-time database.
   *    b. If successful, updates the local state to reflect that the user no longer has the lock and the item is inactive.
   * 2. If the item doesn't require locking:
   *    a. Simply sets the item as inactive in the local state.
   *
   * @async
   * @throws Will log an error to the console if releasing the lock fails.
   */
  const handleItemClose = async () => {
    if (item && item.shouldLock && hasLock) {
      const lockRef = dbRef(rtdb, `locks/${item.id}`);
      try {
        await remove(lockRef);
        setHasLock(false);
        setIsItemActive(false);
      } catch (error) {
        console.error("Failed to release lock:", error);
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
          console.error("Failed to release lock on unmount:", error);
        });
      }
    };
  }, [item, hasLock]);

  const isLockedByAnotherUser = Boolean(
    lockStatus.lockedBy && lockStatus.lockedBy !== auth.currentUser?.uid
  );

  const handleRemovePress = () => {
    setRemoveAlertOpen(true);
  };

  const handleConfirmRemove = () => {
    onItemRemove(position);
    setRemoveAlertOpen(false);
  };

  /**
   * Renders the item component for a given placed item.
   *
   * @param item - The PlacedItemData object representing the item to be rendered, or null if no item.
   * @param position - The position of the item on the shelf.
   * @returns A React element representing the rendered item, or null if no item or unknown item type.
   *
   * This function performs the following actions:
   * 1. If the item is null, it returns null (no rendering).
   * 2. Retrieves the appropriate ItemComponent based on the item's ID.
   * 3. If a valid ItemComponent is found:
   *    a. Generates a unique key based on the item's last update timestamp.
   *    b. Renders the ItemComponent with necessary props including item data, update handlers, and room info.
   * 4. If no valid ItemComponent is found, it renders a fallback "Unknown Item" text.
   *
   * The function handles different date formats for the updatedAt field, ensuring a consistent key generation.
   */
  const renderItem = (item: PlacedItemData | null, position: number) => {
    if (!item) return null;

    const ItemComponent = items[item.itemId];
    if (ItemComponent) {
      return (
        <ItemComponent
          key={item.id}
          itemData={{
            ...item.itemData,
            itemId: item.itemId,
            placedUserId: item.placedUserId,
            id: item.id,
          }}
          onDataUpdate={(newItemData) => onItemDataUpdate(position, newItemData)}
          isActive={isItemActive}
          onClose={handleItemClose}
          roomInfo={{
            ...roomInfo,
            roomId: roomInfo.roomId,
          }}
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
          {lockStatus.userName || "Unknown User"}
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
          disabled={showPlusSigns || isLockedByAnotherUser} 
          style={{ flex: 1 }}
        >
          {renderItem(item, position)}
        </Pressable>
        {isLockedByAnotherUser && <LockOverlay />}
        {showPlusSigns && item && (
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
