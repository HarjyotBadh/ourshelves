import React, { useState, Suspense } from 'react';
import { XStack, Button, View, Stack } from 'tamagui';
import { Plus, X } from '@tamagui/lucide-icons';
import Item from './item';
import { AlertDialog } from './AlertDialog';
import items from './items';
import {ItemData, PlacedItemData} from '../models/PlacedItemData';

interface ShelfItemsProps {
    items: (PlacedItemData | null)[];
    showPlusSigns: boolean;
    onSpotPress: (position: number) => void;
    onItemRemove: (position: number) => void;
    onItemDataUpdate: (position: number, newItemData: Record<string, any>) => void;
}

const ShelfItems: React.FC<ShelfItemsProps> = ({ items: shelfItems, showPlusSigns, onSpotPress, onItemRemove, onItemDataUpdate }) => {
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

    const renderItem = (item: PlacedItemData | null, position: number) => {
        if (!item) return null;

        const ItemComponent = items[item.itemId];
        if (ItemComponent) {
            return (
                <Suspense fallback={<View width="100%" height="100%" backgroundColor="$gray5" />}>
                    <ItemComponent
                        itemData={item.itemData}
                        onDataUpdate={(newItemData) => onItemDataUpdate(position, newItemData)}
                    />
                </Suspense>
            );
        } else {
            return <Item item={{
                itemId: item.itemId,
                cost: item.itemData.cost || 0,
                imageUri: item.itemData.imageUri || '',
                name: item.itemData.name || '',
                ...item.itemData
            } as ItemData} showName={false} showCost={false} />;
        }
    };

    return (
        <XStack flex={1} justifyContent="space-between" alignItems="center">
            {[0, 1, 2].map((position) => {
                const item = shelfItems[position];
                if (!item) {
                    return showPlusSigns ? (
                        <Button
                            key={position}
                            unstyled
                            onPress={() => onSpotPress(position)}
                            width="30%"
                            height="100%"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Plus color="black" size={24} />
                        </Button>
                    ) : (
                        <View key={position} width="30%" height="100%" />
                    );
                } else {
                    return (
                        <Stack key={position} width="30%" height="100%" position="relative">
                            {renderItem(item, position)}
                            {showPlusSigns && (
                                <Button
                                    unstyled
                                    onPress={() => handleRemovePress(position)}
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