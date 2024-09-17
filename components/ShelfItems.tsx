import React from 'react';
import { XStack } from 'tamagui';
import PlaceholderItem from './PlaceholderItem';

const ShelfItems: React.FC = () => {
    return (
        <XStack flex={1} justifyContent="space-between" alignItems="center">
            <PlaceholderItem />
            <PlaceholderItem />
            <PlaceholderItem />
        </XStack>
    );
};

export default ShelfItems;