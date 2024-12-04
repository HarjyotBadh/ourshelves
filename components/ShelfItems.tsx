import React from "react";
import { XStack } from "tamagui";
import ShelfItemSpot from "./ShelfItemSpot";
import { ItemData, PlacedItemData, ShelfData } from "../models/RoomData";

interface ShelfItemsProps {
  items: (PlacedItemData | null)[];
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
  availableItems: ItemData[];
  shelf?: ShelfData;
}

const ShelfItems: React.FC<ShelfItemsProps> = ({
  items,
  showPlusSigns,
  onSpotPress,
  onItemRemove,
  onItemDataUpdate,
  users,
  roomInfo,
  availableItems,
  shelf,
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
          availableItems={availableItems as ItemData[]}
          shelf={shelf as ShelfData}
        />
      ))}
    </XStack>
  );
};

export default ShelfItems;
