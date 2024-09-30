import React from 'react';
import { XStack, YStack, Text } from 'tamagui';
import ShelfItems from './ShelfItems';
import { PlacedItemData } from '../models/PlacedItemData';

interface ShelfProps {
    shelfNumber: number;
    items: (PlacedItemData | null)[];
    showPlusSigns: boolean;
    onSpotPress: (position: number) => void;
    onItemRemove: (position: number) => void;
    onItemDataUpdate: (position: number, newItemData: Record<string, any>) => void;
    users: Record<string, any>;
}

const Shelf: React.FC<ShelfProps> = ({ shelfNumber, items, showPlusSigns, onSpotPress, onItemRemove, onItemDataUpdate, users }) => {
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
                />
            </XStack>
            <XStack
                backgroundColor="#8B4513"
                height={20}
                borderBottomLeftRadius="$2"
                borderBottomRightRadius="$2"
                justifyContent="flex-end"
                paddingRight="$2"
            >
                <Text fontSize="$2" color="white">Shelf {shelfNumber}</Text>
            </XStack>
        </YStack>
    );
};

export default Shelf;