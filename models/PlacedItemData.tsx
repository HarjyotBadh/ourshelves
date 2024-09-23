export interface PlacedItemData {
    id: string;
    shelfId: string;
    itemId: string;
    position: number;
    createdAt: Date;
    updatedAt: Date;
    itemData: Record<string, any>;
}

export interface ItemData {
    itemId: string;
    cost: number;
    imageUri: string;
    name: string;
}