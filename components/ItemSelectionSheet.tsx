import React from 'react';
import { Sheet, YStack, ScrollView } from 'tamagui';
import Item, { ItemData } from './item';

interface ItemSelectionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectItem: (item: ItemData) => void;
    items: ItemData[];
}

const ItemSelectionSheet: React.FC<ItemSelectionSheetProps> = ({ isOpen, onClose, onSelectItem, items }) => {
    return (
        <Sheet modal open={isOpen} onOpenChange={onClose} snapPoints={[90]}>
            <Sheet.Overlay />
            <Sheet.Frame>
                <Sheet.Handle />
                <ScrollView>
                    <YStack padding="$4" gap="$4">
                        {items.map((item) => (
                            <Item
                                key={item.itemId}
                                item={item}
                                onPress={() => {
                                    onSelectItem(item);
                                    onClose();
                                }}
                                showName
                                showCost={false}
                            />
                        ))}
                    </YStack>
                </ScrollView>
            </Sheet.Frame>
        </Sheet>
    );
};

export default ItemSelectionSheet;