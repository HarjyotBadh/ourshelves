export interface PlacedItemData {
    id: string;
    roomId: string;
    shelfId: string;
    itemId: string;
    position: number;
    createdAt: Date;
    updatedAt: Date;
    shouldLock: boolean;
    itemData: Record<string, any>;
}

export interface ItemData {
    itemId: string;
    name: string;
    imageUri: string;
    cost: number;
    shouldLock: boolean;
    [key: string]: any;
}