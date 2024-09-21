import { DocumentReference } from 'firebase/firestore';

export interface PlacedItemData {
    id: string;
    shelfId: string;
    itemId: string;
    position: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ItemData {
    itemId: string;
    cost: number;
    imageUri: string;
    name: string;
}

export interface CreatePlacedItemData {
    shelfId: string;
    itemId: string;
    position: number;
    createdBy: DocumentReference;
}

export interface UpdatePlacedItemData {
    position?: number;
    updatedBy: DocumentReference;
}