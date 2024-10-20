import React, { useState } from "react";
import { XStack, YStack, Text, Input } from "tamagui";
import ShelfItems from "./ShelfItems";
import { PlacedItemData } from "../models/RoomData";

interface ShelfProps {
  shelfId: string;
  shelfNumber: number;
  shelfName: string;
  items: (PlacedItemData | null)[];
  showPlusSigns: boolean;
  onSpotPress: (position: number) => void;
  onItemRemove: (position: number) => void;
  onItemDataUpdate: (
    position: number,
    newItemData: Record<string, any>
  ) => void;
  onShelfNameChange: (shelfId: string, newName: string) => void;
  users: Record<string, any>;
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
    roomId: string;
  };
}

const Shelf: React.FC<ShelfProps> = ({
  shelfId,
  shelfNumber,
  shelfName,
  items,
  showPlusSigns,
  onSpotPress,
  onItemRemove,
  onItemDataUpdate,
  onShelfNameChange,
  users,
  roomInfo,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(shelfName);

  const handleNameClick = () => {
    if (showPlusSigns) {
      setIsEditing(true);
    }
  };

  const handleNameChange = (text: string) => {
    setEditedName(text);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    if (editedName !== shelfName) {
      onShelfNameChange(shelfId, editedName);
    }
  };

  return (
    <YStack>
      <XStack
        backgroundColor="#DEB887"
        height={120}
        borderTopLeftRadius="$2"
        borderTopRightRadius="$2"
        padding="$2"
        paddingBottom="$0"
      >
        <ShelfItems
          items={items}
          showPlusSigns={showPlusSigns}
          onSpotPress={onSpotPress}
          onItemRemove={onItemRemove}
          onItemDataUpdate={onItemDataUpdate}
          users={users}
          roomInfo={roomInfo}
        />
      </XStack>
      <XStack
        backgroundColor="#8B4513"
        height={20}
        justifyContent="flex-end"
        paddingRight="$2"
        alignItems="center"
      >
        {isEditing ? (
          <Input
            flex={1}
            value={editedName}
            onChangeText={handleNameChange}
            onBlur={handleNameBlur}
            autoFocus
            color="white"
            fontSize="$2"
          />
        ) : (
          <Text fontSize="$2" color="white" onPress={handleNameClick}>
            {shelfName || `Shelf ${shelfNumber}`}
          </Text>
        )}
      </XStack>
    </YStack>
  );
};

export default Shelf;
