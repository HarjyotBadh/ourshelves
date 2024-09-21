import { DocumentReference } from 'firebase/firestore';
import { PlacedItemData } from './PlacedItemData';

export interface ShelfData {
    id: string;
    roomId: string;
    position: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    itemList: DocumentReference[];
    placedItems?: PlacedItemData[];
}

export interface CreateShelfData {
    roomId: string;
    position: number;
    name: string;
    itemList: DocumentReference[];
}

export interface UpdateShelfData {
    name?: string;
    position?: number;
    itemList?: DocumentReference[];
}