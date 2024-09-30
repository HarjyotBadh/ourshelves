import React, { useState, useEffect } from 'react';
import { View, styled, YStack } from 'tamagui';
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
    isActive: boolean;
    onClose: () => void;
}

interface PlaceholderItemComponent extends React.FC<PlaceholderItemProps> {
    getInitialData: () => { color: string; clickCount: number };
}

const PlaceholderItemView = styled(View, {
    width: '100%',
    height: '100%',
    borderRadius: '$2',
});

const PlaceholderItem: PlaceholderItemComponent = ({ itemData, onDataUpdate, isActive, onClose }) => {
    const [color, setColor] = useState(itemData.color || 'red');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [clickCount, setClickCount] = useState(itemData.clickCount || 0);

    useEffect(() => {
        if (isActive && !dialogOpen) {
            setDialogOpen(true);
        }
    }, [isActive]);

    const handleColorSelect = (newColor: string) => {
        setClickCount(clickCount + 1);
        setColor(newColor);
        onDataUpdate({ ...itemData, color: newColor, clickCount: clickCount });
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        onClose();
    };

    if (!isActive) {
        return (
            <PlaceholderItemView backgroundColor={color}>
            </PlaceholderItemView>
        );
    }

    return (
        <YStack flex={1}>
            <PlaceholderItemView backgroundColor={color} />
            <ColorSelectionDialog
                open={dialogOpen}
                onOpenChange={(isOpen) => {
                    console.log('Dialog open state changed:', isOpen);
                    setDialogOpen(isOpen);
                    if (!isOpen) {
                        handleDialogClose();
                    }
                }}
                onColorSelect={handleColorSelect}
            />
        </YStack>
    );
};

PlaceholderItem.getInitialData = () => ({ color: 'red', clickCount: 0 });

export default PlaceholderItem;