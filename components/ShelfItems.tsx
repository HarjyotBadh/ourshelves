import React from 'react';
import { XStack } from 'tamagui';
import ShelfItemSpot from './ShelfItemSpot';
import { PlacedItemData } from '../models/PlacedItemData';

interface ShelfItemsProps {
    items: (PlacedItemData | null)[];
    showPlusSigns: boolean;
    onSpotPress: (position: number) => void;
    onItemRemove: (position: number) => void;
    onItemDataUpdate: (position: number, newItemData: Record<string, any>) => void;
}

const ShelfItems: React.FC<ShelfItemsProps> = ({ items, showPlusSigns, onSpotPress, onItemRemove, onItemDataUpdate }) => {
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
                />
            ))}
        </XStack>
    );
};

export default ShelfItems;