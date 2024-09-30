import React, { useState } from 'react';
import { View, styled, Button, YStack } from 'tamagui';
import { ColorSelectionDialog } from '../ColorSelectionDialog';

interface PlaceholderItemProps {
    itemData: {
        color: string;
        name: string;
        imageUri: string;
        clickCount?: number;
        [key: string]: any;
    };
    onDataUpdate: (newItemData: Record<string, any>) => void;
}

interface PlaceholderItemComponent extends React.FC<PlaceholderItemProps> {
    getInitialData: () => { color: string; clickCount: number };
}

const PlaceholderItemView = styled(View, {
    width: '100%',
    height: '100%',
    borderRadius: '$2',
});

const PlaceholderItem: PlaceholderItemComponent = ({ itemData, onDataUpdate }) => {
    const [color, setColor] = useState(itemData.color || 'red');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [clickCount, setClickCount] = useState(itemData.clickCount || 0);

    const handleColorSelect = (newColor: string) => {
        setColor(newColor);
        onDataUpdate({ ...itemData, color: newColor });
    };

    const handleClick = () => {
        const newClickCount = clickCount + 1;
        setClickCount(newClickCount);
        onDataUpdate({ ...itemData, clickCount: newClickCount });
        setDialogOpen(true);
    };

    return (
        <YStack flex={1}>
            <Button
                unstyled
                onPress={handleClick}
                flex={1}
                width="100%"
                height="100%"
                padding={0}
            >
                <PlaceholderItemView backgroundColor={color}>
                </PlaceholderItemView>
            </Button>
            <ColorSelectionDialog
                open={dialogOpen}
                onOpenChange={(isOpen) => {
                    console.log('Dialog open state changed:', isOpen);
                    setDialogOpen(isOpen);
                }}
                onColorSelect={(newColor) => {
                    console.log('New color selected:', newColor);
                    handleColorSelect(newColor);
                }}
            />
        </YStack>
    );
};

PlaceholderItem.getInitialData = () => ({ color: 'red', clickCount: 0 });

export default PlaceholderItem;