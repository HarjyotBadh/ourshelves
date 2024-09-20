import React, { useState } from 'react';
import { XStack, Button, View, Stack } from 'tamagui';
import { Plus, X } from '@tamagui/lucide-icons';
import PlaceholderItem from './PlaceholderItem';
import Item, { ItemData } from './item';
import { AlertDialog } from './AlertDialog';

interface ShelfItemsProps {
    items: (ItemData | null)[];
    showPlusSigns: boolean;
    onSpotPress: (spotIndex: number) => void;
    onItemRemove: (spotIndex: number) => void;
}

const ShelfItems: React.FC<ShelfItemsProps> = ({ items, showPlusSigns, onSpotPress, onItemRemove }) => {
    const [removeAlertOpen, setRemoveAlertOpen] = useState(false);
    const [spotToRemove, setSpotToRemove] = useState<number | null>(null);

    const handleRemovePress = (spotIndex: number) => {
        setSpotToRemove(spotIndex);
        setRemoveAlertOpen(true);
    };

    const handleConfirmRemove = () => {
        if (spotToRemove !== null) {
            onItemRemove(spotToRemove);
            setRemoveAlertOpen(false);
            setSpotToRemove(null);
        }
    };

    const RemoveButton = ({ onPress }: { onPress: () => void }) => (
        <Button
            unstyled
            onPress={onPress}
            position="absolute"
            top={5}
            right={5}
            width={24}
            height={24}
            justifyContent="center"
            alignItems="center"
            backgroundColor="$red10"
            borderRadius="$2"
            zIndex={10}
            elevate
        >
            <X color="white" size={16} />
        </Button>
    );

    return (
        <XStack flex={1} justifyContent="space-between" alignItems="center">
            {[0, 1, 2].map((spotIndex) => {
                const item = items[spotIndex];
                if (!item) {
                    return showPlusSigns ? (
                        <Button
                            key={spotIndex}
                            unstyled
                            onPress={() => onSpotPress(spotIndex)}
                            width="30%"
                            height="100%"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Plus color="black" size={24} />
                        </Button>
                    ) : (
                        <View key={spotIndex} width="30%" height="100%" />
                    );
                } else {
                    return (
                        <Stack key={spotIndex} width="30%" height="100%" position="relative">
                            {item.itemId === 'SoPRqkDt7BchhwihkqRN' ? (
                                <PlaceholderItem />
                            ) : (
                                <Item item={item} showName={false} showCost={false} />
                            )}
                            {showPlusSigns && (
                                <RemoveButton onPress={() => handleRemovePress(spotIndex)} />
                            )}
                        </Stack>
                    );
                }
            })}
            <AlertDialog
                open={removeAlertOpen}
                onOpenChange={setRemoveAlertOpen}
                title="Remove Item"
                description="Are you sure you want to remove this item?"
                onConfirm={handleConfirmRemove}
                onCancel={() => setRemoveAlertOpen(false)}
            />
        </XStack>
    );
};

export default ShelfItems;