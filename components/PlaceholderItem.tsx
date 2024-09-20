import React, { useState } from 'react';
import { View, styled, Button } from 'tamagui';
import { ColorSelectionDialog } from './ColorSelectionDialog';

interface PlaceholderItemProps {
    onColorChange?: (color: string) => void;
}

const PlaceholderItemView = styled(View, {
    width: '100%',
    height: '100%',
    borderRadius: '$2',
});

const PlaceholderItem: React.FC<PlaceholderItemProps> = ({ onColorChange }) => {
    const [color, setColor] = useState('$blue6');
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleColorSelect = (newColor: string) => {
        setColor(newColor);
        if (onColorChange) {
            onColorChange(newColor);
        }
    };

    return (
        <>
            <Button
                unstyled
                onPress={() => setDialogOpen(true)}
                width="100%"
                height="100%"
                padding={0}
            >
                <PlaceholderItemView backgroundColor={color} />
            </Button>
            <ColorSelectionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onColorSelect={handleColorSelect}
            />
        </>
    );
};

export default PlaceholderItem;