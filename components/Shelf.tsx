import React from 'react';
import { XStack, YStack, Text } from 'tamagui';
import ShelfItems from './ShelfItems';

interface ShelfProps {
    shelfNumber: number;
}

const Shelf: React.FC<ShelfProps> = ({ shelfNumber }) => {
    return (
        <YStack>
            <XStack
                backgroundColor="#DEB887" // shelf background
                height={120}
                borderTopLeftRadius="$2"
                borderTopRightRadius="$2"
                padding="$2"
                paddingBottom="$0"
            >
                <ShelfItems />
            </XStack>
            <XStack
                backgroundColor="#8B4513" // shelf
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