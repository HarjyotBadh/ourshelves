import React from 'react';
import { XStack, YStack, Text } from 'tamagui';
import ShelfItems from './ShelfItems';
import { ItemData } from './item';

interface ShelfProps {
    shelfNumber: number;
    items: (ItemData | null)[];
    showPlusSigns: boolean;
    onSpotPress: (spotIndex: number) => void;
    onItemRemove: (shelfIndex: number, spotIndex: number) => void;
}

const Shelf: React.FC<ShelfProps> = ({ shelfNumber, items, showPlusSigns, onSpotPress, onItemRemove }) => {
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
                    onItemRemove={(spotIndex) => onItemRemove(shelfNumber - 1, spotIndex)}
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