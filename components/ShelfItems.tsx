import React from "react";
import { XStack } from "tamagui";
import ShelfItemSpot from "./ShelfItemSpot";
import { PlacedItemData } from "../models/RoomData";

interface ShelfItemsProps {
  items: (PlacedItemData | null)[];
  showPlusSigns: boolean;
  onSpotPress: (position: number) => void;
  onItemRemove: (position: number) => void;
  onItemDataUpdate: (
    position: number,
    newItemData: Record<string, any>
  ) => void;
  users: Record<string, any>;
  roomInfo: {
    name: string;
    users: { id: string; displayName: string; profilePicture?: string; isAdmin: boolean }[];
    description: string;
  };
}

const ShelfItems: React.FC<ShelfItemsProps> = ({
  items,
  showPlusSigns,
  onSpotPress,
  onItemRemove,
  onItemDataUpdate,
  users,
  roomInfo,
}) => {
  return (
    <XStack flex={1} justifyContent="space-between" alignItems="center">
      {[0, 1, 2].map((position) => (
        <ShelfItemSpot
          key={position}
          item={items[position]}
          position={position}
          showPlusSigns={showPlusSigns}
          onSpotPress={onSpotPress}
          onItemRemove={onItemRemove}
          onItemDataUpdate={onItemDataUpdate}
          users={users}
          roomInfo={roomInfo}
        />
      ))}
    </XStack>
  );
};

export default ShelfItems;
